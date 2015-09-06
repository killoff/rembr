<?php
class NoteController extends Controller
{
    const TAG_ENCLOSURE = ':';
    const INITIAL_LIMIT = 50;

    public function all()
    {
        try {
//    Auth::loginUsingId(5);
            $userId = Auth::id();
            $response = [
                'notes' => [],
                'tags' => []
            ];

            if (!Auth::check()) {
                return json_encode($response);
            }

            $filters = json_decode(Input::get('filter'), true);
            $periods = Input::get('periods', []);

            $pinnedTagUuids = isset($filters['pinned']) ? (array)$filters['pinned'] : [];
            if (isset($filters['pinned'])) {
                unset($filters['pinned']);
            }
            $pinnedTagUuids = array_merge($this->getPinnedTagUuids($userId), $pinnedTagUuids);
            $pinnedTagUuids = array_unique($pinnedTagUuids);

            $searchStrings = $this->convertToSearchStrings($filters);
            //print_r($searchStrings);
            $filterNoteIds = [];
            if (count($searchStrings) > 0) {
                // create search string like '+"tag1" +"tag2" +"tag3"'
                $searchString = '+' . implode('* +', $searchStrings) . '*';

                $filterNoteIds = DB::table('search_index')
                    ->select('search_index.note_id')
                    ->join('note', 'search_index.note_id', '=', 'note.note_id')
                    ->where('note.user_id', $userId)
                    ->whereRaw('MATCH(search_index.text) AGAINST (? IN BOOLEAN MODE)', [$searchString])
                    ->lists('note_id');
                $this->debug(DB::getQueryLog());

                // for searches that don't return any results
                if (empty($filterNoteIds)) {
                    $filterNoteIds = [-1];
                }
            }

            $notesSql = DB::table('note')
                ->select(DB::raw("note.text, note.uuid, GROUP_CONCAT(tag.uuid,'\\n', tag.name SEPARATOR '\\n\\n') AS tags_grouped"))
                ->leftJoin('note_tag', 'note.note_id', '=', 'note_tag.note_id')
                ->leftJoin('tag', 'note_tag.tag_id', '=', 'tag.tag_id')
                ->where('note.user_id', $userId)
                ->groupBy('note.note_id')
                ->orderBy('note.created_at', 'asc');

            $notes = clone $notesSql;

            if ($filterNoteIds) {
                $notes->whereIn('note.note_id', $filterNoteIds);
            }

//            $pinnedNotes = [];
//            $pinnedNoteIds = $this->getPinnedNoteIds($pinnedTagUuids, $userId);
//            if ($pinnedNoteIds) {
//                $pinnedNotes = clone $notesSql;
//                $pinnedNotes->whereIn('note.note_id', $pinnedNoteIds);
//
//                $notes->whereNotIn('note.note_id', $pinnedNoteIds);
//            }

            $tags = DB::table('tag')
                ->select('name', 'tag.uuid', 'tag.pinned', DB::raw('count(note_tag.note_id) as total'))
                ->join('note_tag', function($join) use ($filterNoteIds)
                {
                    $join->on('note_tag.tag_id', '=', 'tag.tag_id');
                    if (!empty($filterNoteIds)) {
                        $join->on('note_tag.note_id', 'in', DB::raw('('.implode(',', $filterNoteIds).')')); // joins don't support whereIn()
                    }
                })
                ->groupBy('tag.tag_id')
                ->where('system', 0)
                ->whereUserId($userId);

            $allNotes = $notes->get(); //array_merge($pinnedNotes->get(), $notes->get());

            foreach($allNotes as $noteObject) {
                $noteObject->tags = [];
                $noteTags = explode("\n\n", $noteObject->tags_grouped);
                unset($noteObject->tags_grouped);
                if (empty($noteTags)) {
                    continue;
                }
                foreach ($noteTags as $noteTag) {
                    $tagInfo = explode("\n", $noteTag);
                    if (empty($tagInfo) || !is_array($tagInfo) || count($tagInfo) < 2) {
                        continue;
                    }
                    $tagUuid = $tagInfo[0];
                    $tagName = $tagInfo[1];
                    if ($tagUuid && $tagName) {
                        $noteObject->tags[] = ['uuid' => $tagUuid, 'name' => $tagName];
                    }
                }
            }

            $response['notes'] = $allNotes;
            $response['tags'] = $tags->get();
            $response['filter_note_ids'] = $filterNoteIds;
            $response['debug'] = $this->_debug;
            if (!empty($periods)) {
                $response['periods'] = DB::table('tag')
                    ->select('uuid')
                    ->where('user_id', $userId)
                    ->whereIn('uuid', $periods)
                    ->lists('uuid');
            }

            return json_encode($response);

        } catch (Exception $e) {
            return $e->getTraceAsString();
        }
    }

    private function convertToSearchStrings($filters)
    {
        if (!is_array($filters)) {
            return [];
        }
        $result = [];
        foreach ($filters as $key => $values) {
            if (!is_array($values)) {
                continue;
            }
            $result = array_merge($result, $values);
        }
        $result = array_unique($result);

        // avoid empty values
        return array_filter(
            $result,
            function($value) {
                return !empty(trim($value));
            }
        );
    }

    private function getPinnedNoteIds($tagUuids, $userId)
    {
        $pinnedNoteIds = [];
        if (count($tagUuids) > 0) {
            // create search string like '"tag1" "tag2" "tag3"' => notes with at least one pinned tag
            $searchString = ' "' . implode('" "', $tagUuids) . '"';

            $pinnedNoteIds = DB::table('search_index')
                ->select('search_index.note_id')
                ->join('note', 'search_index.note_id', '=', 'note.note_id')
                ->where('note.user_id', $userId)
                ->whereRaw('MATCH(search_index.text) AGAINST (? IN BOOLEAN MODE)', [$searchString])
                ->lists('note_id');

            // for searches that don't return any results
            if (empty($pinnedNoteIds)) {
                $pinnedNoteIds = [-1];
            }
        }
        return $pinnedNoteIds;
    }

    private function getPinnedTagUuids($userId)
    {
        $pinnedTagUuids = DB::table('tag')
            ->select('uuid')
            ->where('user_id', $userId)
            ->where('pinned', 1)
            ->lists('uuid');
        return $pinnedTagUuids;
    }

    public function save()
    {
        try {

            if (!Auth::check()) {
                throw new \LogicException('Authorization failed.');
            }

            $notes = json_decode(Request::instance()->getContent());

            if (!is_array($notes)) {
                throw new \DomainException('notes must be a collection.');
            }
            foreach ($notes as $note) {
                if (! $note instanceof \stdClass) {
                    throw new \DomainException('note must be an object.');
                }
                if (empty($note->uuid)) {
                    throw new \DomainException('note.uuid not found, unable to save.');
                }
                if (empty($note->text) && empty($note->tags)) {
                    throw new \DomainException('note.text and note.tags are empty, unable to save.');
                }

                $now = date('Y-m-d H:i:s', time());

                $existing = DB::table('note')->whereUuid($note->uuid)->whereUserId(Auth::id())->first();

                if ($existing === null) {
                    $noteId = DB::table('note')->insertGetId(
                        array(
                            'user_id' => Auth::id(),
                            'text' => $note->text,
                            'uuid' => $note->uuid,
                            'created_at' => $now,
                            'updated_at' => $now
                        )
                    );
                } else {
                    $noteId = $existing->note_id;
                    DB::table('note')->whereNoteId($noteId)
                        ->update(['text' => $note->text, 'updated_at' => $now]);
                }

                if ($noteId) {
                    if (!empty($note->tags)) {
                        $this->saveTags($noteId, $note->tags);
                    }
                    if (!empty($note->moments)) {
                        $this->saveDates($noteId, $note->moments);
                    }
                    $this->updateSearchIndex($noteId);
                    $response = array('uuid' => $note->uuid);
                    $response['debug'] = $this->_debug;
                    return json_encode($response);
                } else {
                    throw new \Exception('note.id not generated, unable to save.');
                }
            }

        } catch (\Exception $e) {
            $response = array('error' => $e->getMessage());
            return json_encode($response);
        }
    }

    public function delete()
    {
        $uuid = Input::get('uuid');
        if (!Auth::check()) {
            return;
        }
        $note = DB::table('note')->whereUserId(Auth::id())->whereUuid($uuid)->first();
        if ($note !== null) {
            DB::table('note')->whereNoteId($note->note_id)->delete();
            DB::table('note_tag')->whereNoteId($note->note_id)->delete();
            DB::table('search_index')->whereNoteId($note->note_id)->delete();
        }
    }

    private $_debug = [];
    private function debug($data)
    {
        $data = is_array($data) ? $data : [$data];
        $this->_debug = array_merge($this->_debug, $data);
    }

    protected function saveTags($noteId, $tags)
    {
        $noteTagIds = DB::table('note_tag')->whereNoteId($noteId)->lists('tag_id');
        $newTagIds = [];
        foreach ($tags as $tag) {
            $tagId = DB::table('tag')
                ->whereUserId(Auth::id())
                ->whereUuid($tag->uuid)
                ->pluck('tag_id');
            if (!$tagId) {
                $this->debug('tag not found by uuid: '.$tag->uuid);
                $tagId = DB::table('tag')
                    ->whereUserId(Auth::id())
                    ->whereName($tag->name)
                    ->pluck('tag_id');
            }
            if (!$tagId) {
                $tagId = DB::table('tag')->insertGetId(
                    [
                        'user_id' => Auth::id(),
                        'name' => $tag->name,
                        'uuid' => $tag->uuid ? $tag->uuid : $this->generateUuid(),
                        'system' => isset($tag->system) ? $tag->system : 0
                    ]
                );
                $this->debug('new tag inserted: '.$tagId);
            }
            $newTagIds[] = $tagId;
        }

        $noteTagIds = array_unique($noteTagIds);
        $newTagIds = array_unique($newTagIds);

        $tagIdsToDelete = array_diff($noteTagIds, $newTagIds);
        if (count($tagIdsToDelete) > 0) {
            $this->debug('tagIdsToDelete: '.implode(',', $tagIdsToDelete));
            DB::table('note_tag')->whereIn('tag_id', $tagIdsToDelete)->delete();
        }

        $tagIdsToInsert = array_diff($newTagIds, $noteTagIds);
        if (count($tagIdsToInsert) > 0) {
            $this->debug('tagIdsToInsert: '.implode(',', $tagIdsToInsert));
            $insertData = [];
            foreach ($tagIdsToInsert as $tagId) {
                $insertData[] =  array('note_id' => $noteId, 'tag_id' => $tagId);
            }
            //$this->debug($insertData, 'insert data');
            DB::table('note_tag')->insert($insertData);
        }

        return $newTagIds;
    }

    private function saveDates($noteId, $moments)
    {
        if (!is_array($moments)) {
            return false;
        }
        DB::table('note_dates')->whereNoteId($noteId)->delete();

        foreach ($moments as $moment) {
            $momentDateTime = new DateTime();
            $momentDateTime->setDate($moment->year, $moment->month, $moment->day);
            $momentDateTime->setTime($moment->hour, $moment->minute, 0);
            DB::table('note_dates')->insert(
                array(
                    'note_id' => $noteId,
                    'moment' => $momentDateTime->format('Y-m-d H:i:s')
                )
            );
        }
    }

    private function updateSearchIndex($noteId)
    {
        // @todo: insert on dublicate key update
        DB::transaction(function() use ($noteId)
        {
            DB::table('search_index')->whereNoteId($noteId)->delete();
            DB::statement(
                "INSERT INTO search_index
                    SELECT n.note_id, CONCAT_WS(',', n.text, GROUP_CONCAT(t.uuid), GROUP_CONCAT(t.name))
                    FROM note n
                        LEFT JOIN note_tag nt ON n.note_id=nt.note_id
                        LEFT JOIN tag t ON nt.tag_id=t.tag_id
                    WHERE n.note_id=:note_id
                    GROUP BY n.note_id",
                ['note_id' => $noteId]
            );
        });
    }

    public function pinTag()
    {
        // todo: validation code is duplicated
        if (!Auth::check()) {
            throw new \LogicException('Authorization failed.');
        }

        $tag = json_decode(Request::instance()->getContent());

        if (! $tag instanceof \stdClass) {
            throw new \DomainException('tag must be an object.');
        }
        if (empty($tag->uuid)) {
            throw new \DomainException('tag.uuid not found, unable to pin.');
        }
        $pinned = $tag->pinned ? 1 : 0;
        DB::table('tag')->whereUuid($tag->uuid)
            ->whereUserId(Auth::id())
            ->update(['pinned' => $pinned]);
    }

    private function generateUuid()
    {
        return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',

            // 32 bits for "time_low"
            mt_rand(0, 0xffff), mt_rand(0, 0xffff),

            // 16 bits for "time_mid"
            mt_rand(0, 0xffff),

            // 16 bits for "time_hi_and_version",
            // four most significant bits holds version number 4
            mt_rand(0, 0x0fff) | 0x4000,

            // 16 bits, 8 bits for "clk_seq_hi_res",
            // 8 bits for "clk_seq_low",
            // two most significant bits holds zero and one for variant DCE1.1
            mt_rand(0, 0x3fff) | 0x8000,

            // 48 bits for "node"
            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
        );
    }

    public function test()
    {
    return;
DB::connection()->enableQueryLog();
$userId=1;

        $notes = DB::table('note')
            ->select(DB::raw('note.note_id AS id, note.text, note.uuid, GROUP_CONCAT(tag.uuid) AS tag_uuids'))
            ->leftJoin('note_tag', 'note.note_id', '=', 'note_tag.note_id')
            ->leftJoin('tag', 'note_tag.tag_id', '=', 'tag.tag_id')
            ->where('note.user_id', $userId)
            ->groupBy('note.note_id')
            ->orderBy('note.updated_at', 'desc');
print_R($notes->get());
return;

$tags = ["848ecde8-52d3-4829-8b9d-adaa246fc7f9"];
$userId=1;
 $searchString = '+"' . implode('" +"', $tags) . '"';
print_r($res);
             $sql = "SELECT si.note_id
                     FROM search_index si, note n
                     WHERE
                         si.note_id=n.note_id
                         AND n.user_id=?
                         AND MATCH(si.text) AGAINST (? IN BOOLEAN MODE)
                     LIMIT 1000";
             // create search string like '+"tag1" +"tag2" +"tag3"'
  //           $foundNotes = DB::select($sql, [$userId, $searchString])->lists('note_id');
//print_r($foundNotes);
       print_r(DB::getQueryLog());
return;
     $res =  DB::select('select concat(n.text, group_concat(t.uuid)) from note n left join note_tag nt on n.note_id=nt.note_id left join tag t on nt.tag_id=t.tag_id where n.note_id=86 group by n.note_id');
     var_dump($res);
     return;
    $tags = [];
    $tag = new stdClass();
    $tag->name = 'one';
    $tag->uuid = '111';
    $tags[] = $tag;
    $tag = new stdClass();
    $tag->name = 'two';
    $tag->uuid = '222';
    $tags[] = $tag;
    $tag = new stdClass();
    $tag->name = 'three';
    $tag->uuid = '333';
    $tags[] = $tag;
    var_dump($tags);
    $this->saveTags(86, $tags);
    //var_dump(DB::table('note_tag')->whereNoteId(3333333333)->lists('tag_id'));
    //$noteTags = [7,5,3,1];
    //$newTags = [2,3,4,7];

    //echo 'tags to delete: '.implode(',',array_diff($noteTags, $newTags));
    //echo 'tags to insert: '.implode(',',array_diff($newTags, $noteTags));
    //    echo $this->generateUuid();
//        $user = DB::table('note')->whereNoteId(86)->whereUserId(3)->first();
  //      var_dump($user);


    }

    public function updateUuids()
    {
    return;

        $notes = DB::table('note')->where('uuid', '')->get();
        $tags = DB::table('tag')->where('uuid', '')->get();
        //print_R($notes);
        //print_R($tags);
        //exit;
        foreach ($notes as $note) {
            DB::table('note')
                ->where('note_id', $note->note_id)
                ->update(['uuid' => $this->generateUuid()]);
        }

        foreach ($tags as $tag) {
            DB::table('tag')
                ->where('tag_id', $tag->tag_id)
                ->update(['uuid' => $this->generateUuid()]);
        }

        $notes = DB::table('note')->get();
        foreach ($notes as $note) {
            $this->updateSearchIndex($note->note_id);
        }

        return;
        $oldnotes = DB::table('noteold')->where('user_id', '8')->get();
        foreach($oldnotes as $note) {
            $newnote = DB::table('note')->where('text', $note->text)->where('user_id', 5)->first();
            $oldnotetags = DB::table('note_tagold')->where('note_id', $note->note_id)->get();
            foreach ($oldnotetags as $oldNoteTag) {
                $oldTag = DB::table('tagold')->where('tag_id', $oldNoteTag->tag_id)->first();
                $newTag = DB::table('tag')->where('name', $oldTag->name)->where('user_id', '5')->first();
                echo $newnote->note_id.' => '.$newTag->tag_id.'<br>';
                DB::table('note_tag')->insert(['note_id' => $newnote->note_id, 'tag_id' => $newTag->tag_id]);
            }
        }
//            print_R($newnote);
            exit;


    }

    public function refreshIndex()
    {
         $noteIds = DB::table('note')
             ->select('note_id')
             ->orderBy('note_id')
             ->lists('note_id');
         foreach ($noteIds as $noteId) {
            $this->updateSearchIndex($noteId);
         }
   }

    private function debug_file($data, $key = '')
    {
        $log = "\n\n[".date('d.m.Y H:i:s').'] ' . $key . ': ';
        $log .= is_string($data) ? $data : "\n".print_r($data,1);
        $log .= "\n";
        $file = '/var/nginx/laravel/app/storage/debug.log';
        $log = is_file($file) ? file_get_contents($file) . $log : $log;
        file_put_contents($file, $log);
    }

}
