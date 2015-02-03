<?php
class NoteController extends BaseController
{
    const TAG_ENCLOSURE = ':';
    const INITIAL_LIMIT = 50;

    public function all()
    {
        $userId = Auth::id();
        $response = [
            'notes' => [],
            'tags' => []
        ];

        if (!Auth::check()) {
            return json_encode($response);
        }

        $notes = DB::select('select note_id as id, text, uuid from note where user_id=? order by updated_at desc limit ?',
            [$userId, self::INITIAL_LIMIT]
        );
        $tags = DB::select('select tag_id as id, name from tag where user_id=? order by name', [$userId]);
        if (count($notes) > 0 && count($tags) > 0) {
            $tagsAssoc = [];
            foreach ($tags as $row) {
                $tagsAssoc[$row->id] = $row;
            }

            $noteIds = [];
            foreach ($notes as $note) {
                $noteIds[] = $note->id;
            }
//            $noteTag = DB::select('select note_id, tag_id from note_tag where note_id IN(?)',
//                [implode(',', $noteIds)]
//            );
            $noteTag = DB::table('note_tag')
                ->whereIn('note_id', $noteIds)->get();
            $noteTagIds = [];
            foreach ($noteTag as $row) {
                $noteTagIds[$row->note_id][] = $row->tag_id;
            }
            foreach ($notes as &$note) {
                $note->tags = [];
                if (!isset($noteTagIds[$note->id])) {
                    continue;
                }
                foreach ($noteTagIds[$note->id] as $tagId) {
                    $note->tags[] = [
                        'id' => $tagId,
                        'name' => $tagsAssoc[$tagId]->name
                    ];
                }
            }
        }

        $response['notes'] = $notes;
        $response['tags'] = $tags;
        $response['user'] = Auth::user();
        return json_encode($response);
    }

    public function add()
    {
        try {
//            if (!Request::isJson()) {
//                throw new \Exception('Json required.');
//            }
            if (!Auth::check()) {
                throw new \LogicException('Authorization failed');
            }

            $note = json_decode(Request::instance()->getContent());
            if (empty($note->text)) {
                throw new \LogicException('Empty text');
            }
            //  extract tags
            $tagsRegexp = str_replace(':', self::TAG_ENCLOSURE, '/\:([^\:\n\r\s]{1}[^\:\n\r]*)\:/');
            preg_match_all($tagsRegexp, $note->text, $matches);
            if (isset($matches[1]) && count($matches[1]) > 0) {
                foreach ($matches[0] as $tagWithEnclosure) {
                    $note->text = str_replace($tagWithEnclosure, '', $note->text);
                }
            }
            $now = $date = date('Y-m-d H:i:s', time());
            $noteId = DB::table('note')->insertGetId(
                array(
                    'user_id' => Auth::id(),
                    'text' => $note->text,
                    'uuid' => $note->uuid,
                    'created_at' => $now,
                    'updated_at' => $now
                )
            );

            $this->saveTags($noteId, $matches[1]);
            $this->createSearchIndex($noteId, $note->text, $matches[1]);
            $response = array('id' => $noteId, 'uuid' => $note->uuid);
            return json_encode($response);
        } catch (\Exception $e) {
            $response = array('error' => $e->getMessage());
            return json_encode($response);
        }
    }

    private function createSearchIndex($noteId, $text, $tags)
    {
        $searchText = $text;
        if (is_array($tags)) {
            foreach ($tags as $tag) {
//                $searchText .= $tag['uuid'] . ' ' . $tags['name'];
                $searchText .= ' ' . $tag;
            }
        }
        // todo: delete?
//        DB::table('search_index')->where('note_id', '=', $noteId)->delete();
        DB::table('search_index')->insert(
            array('note_id' => $noteId, 'text' => $searchText)
        );
    }

    public function listing()
    {
        $notes = array();
        $userId = Auth::id();
        if ($userId) {
            $tags = Request::get('tag_ids');
            if ($tags) {
                $notes = DB::table('note')->select(DB::raw('note.*, count(*) total'))
                    ->join('tag', 'note.user_id', '=', 'tag.user_id')
                    ->join('note_tag', 'note.note_id', '=', DB::raw('note_tag.note_id'))
                    ->where('note.user_id', $userId)
                    ->where('note_tag.tag_id', '=', DB::raw('tag.tag_id'))
                    ->whereIn('tag.name', $tags)
                    ->groupBy('note.note_id')
                    ->having('total', '=', count($tags))
                    ->get();
//                echo DB::table('note')->select(DB::raw('*, count(*) total'))
//                    ->join('tag', 'note.user_id', '=', 'tag.user_id')
//                    ->join('note_tag', 'note.note_id', '=', 'note_tag.note_id')
//                    ->where('note.user_id', $userId)
//                    ->where('note_tag.tag_id', '=', 'tag.tag_id')
//                    ->whereIn('tag.name', $tags)
//                    ->groupBy('note.note_isd')
//                    ->having('total', '=', count($tags));
//                $notes = DB::select("SELECT n.*, count(*) total
//                                FROM note n, note_tag nt, tag t
//                                WHERE AND t.name IN(?) nt.tag_id=t.tag_id
//                                GROUP BY n.note_id having total=?", array($userId, $userId, $$tags, count($tags)));
//                $notes = DB::select("SELECT n.*, count(*) total
//                                FROM note n, note_tag nt, tag t
//                                WHERE n.user_id=? AND t.user_id=? AND t.name IN(?) AND n.note_id=nt.note_id AND nt.tag_id=t.tag_id
//                                GROUP BY n.note_id having total=?", array($userId, $userId, $$tags, count($tags)));
            } else {
                $notes = DB::table('note')
                    ->select(DB::raw('uuid AS id, note_id AS numeric_id, text'))
                    ->where('user_id', $userId)
                    ->limit(50)
                    ->get();
            }
        }
        return json_encode($notes);

    }

    protected function saveTags($noteId, $tags)
    {
        $noteTagIds = DB::table('note_tag')->where('note_id', $noteId)->lists('tag_id');
        // delete old tags
        if (count($noteTagIds) > 0) {
            DB::table('note_tag')->where('note_id', $noteId)->delete();
        }

        $result = array();
        $newTagIds = array();
        foreach ($tags as $tag) {
            $tagId = DB::table('tag')->where('user_id', Auth::id())
                ->where('name', $tag)
                ->pluck('tag_id');
            if (!$tagId) {
                $tagId = DB::table('tag')->insertGetId(
                    array('user_id' => Auth::id(), 'name' => $tag)
                );
            }
            $newTagIds[] = $tagId;
            $result[] = $tag;
        }

        // save new tags
        if (count($newTagIds)) {
            $insertData = array();
            foreach ($newTagIds as $tagId) {
                $insertData[] =  array('note_id' => $noteId, 'tag_id' => $tagId);
            }
            DB::table('note_tag')->insert($insertData);
        }
        return $result;
    }


}
