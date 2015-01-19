<?php
// @TODO: add transaction to adding note

class BaseController extends Controller {

    /**
     * Setup the layout used by the controller.
     *
     * @return void
     */
    protected function setupLayout()
    {
        if (!is_null($this->layout)) {
            $this->layout = View::make($this->layout);
        }
    }

    public function index()
    {
        $user = new stdClass();
        $authUrl = '';
        $client = $this->getGoogleClient();
        if (Session::get('access_token')) {
            $client->setAccessToken(Session::get('access_token'));
            if($client->isAccessTokenExpired()) {
                $authUrl = $client->createAuthUrl();
                return Redirect::to(filter_var($authUrl, FILTER_SANITIZE_URL));
            }
            $oauthService = new Google_Service_Oauth2($client);
            $userInfo = $oauthService->userinfo->get();
            $user = $this->getUserByGoogleUser($userInfo);
            Session::put('access_token', $client->getAccessToken());
            Session::put('user_id', $user->id);
        } else {
            $authUrl = $client->createAuthUrl();
        }

        $tagsList =  DB::table('tag')->select('tag.tag_id', 'tag.name', DB::raw('note_tag.note_id as is_assigned'))
            ->leftJoin('note_tag', 'tag.tag_id', '=', DB::raw('note_tag.tag_id'))
            ->where('tag.user_id', $this->getSessionUserId())
            ->groupBy('tag.tag_id')
            ->get();
        $tags = array();
        foreach ($tagsList as $tag) {
            $tags[$tag->tag_id] = array('name' => $tag->name,'is_assigned' => $tag->is_assigned);
        }

        return View::make('page', array(
                'user' => $user,
                'authUrl' => $authUrl,
                'tagsJson' => json_encode($tags)
            ));
    }

    public function loadNotes()
    {
        $notes = array();
        $userId = $this->getSessionUserId();
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
                $notes = DB::table('note')->where('user_id', $userId)->get();
            }
            foreach ($notes as &$note) {
                $note->text = htmlspecialchars($note->text);
            }
        }
        return json_encode($notes);
    }

    public function addNote()
    {
        try {
            $noteId = Request::get('id');
            $text = Request::get('text');
            $tagString = Request::get('tags');
            if (empty($text)) {
                throw new \LogicException('Empty text');
            }
            if (!$this->getSessionUserId()) {
                throw new \LogicException('Authorization failed');
            }
            if ($noteId) {
                DB::table('note')
                    ->where('note_id', $noteId)
                    ->update(array('text' => $text));
            } else {
                $noteId = DB::table('note')->insertGetId(
                    array('user_id' => $this->getSessionUserId(), 'text' => $text)
                );
            }

            $tagString = implode(',', $this->saveTags($noteId, $tagString));
            if (!empty($tagString)) {
                DB::table('note')
                    ->where('note_id', $noteId)
                    ->update(array('tags_string' => $tagString));
            }

            $response = array('noteId' => $noteId, 'text' => htmlspecialchars($text), 'tags_string' => $tagString);
            return json_encode($response);
        } catch (\Exception $e) {
            $response = array('error' => $e->getMessage());
            return json_encode($response);
        }
    }

    public function deleteNote()
    {
        $noteId = Request::get('id');
        DB::table('note')->where('note_id', $noteId)->delete();
        DB::table('note_tag')->where('note_id', $noteId)->delete();
        $response = array('noteId' => $noteId);
        return json_encode($response);
    }

    public function getNote()
    {
        $noteId = Request::get('id');
        $note = DB::table('note')
            ->where('user_id', $this->getSessionUserId())
            ->where('note_id', $noteId)
            ->first();
        if ($note === null) {
            throw new \InvalidArgumentException('Note not found');
        }
        $response = array('text' => $note->text);
        $tags = DB::table('tag as t')->select(array('name'))
            ->join('note_tag as nt', 't.tag_id', '=', 'nt.tag_id')
            ->where('nt.note_id', $noteId)
            ->lists('name');
        $response['tags_string'] = empty($tags) ? '' : implode(',', $tags);
        return json_encode($response);

    }

    protected function saveTags($noteId, $tagString)
    {
        $tags = preg_split('/\s*,\s*/', $tagString, 0, PREG_SPLIT_NO_EMPTY);
        // something went wrong :)
        if (!is_array($tags)) {
            return false;
        }

        $noteTagIds = DB::table('note_tag')->where('note_id', $noteId)->lists('tag_id');
        // delete old tags
        if (count($noteTagIds) > 0) {
            DB::table('note_tag')->where('note_id', $noteId)->delete();
        }

        $result = array();
        $newTagIds = array();
        foreach ($tags as $tag) {
            $tagId = DB::table('tag')->where('user_id', $this->getSessionUserId())
                ->where('name', $tag)
                ->pluck('tag_id');
            if (!$tagId) {
                $tagId = DB::table('tag')->insertGetId(
                    array('user_id' => $this->getSessionUserId(), 'name' => $tag)
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


    public function googleOauth()
    {
        if (Request::get('code')) {
            $client = $this->getGoogleClient();
            $client->authenticate(Request::get('code'));
            Session::put('access_token', $client->getAccessToken());
            return Redirect::to('/');
        }
    }

    public function logout()
    {
        $this->getGoogleClient()->revokeToken();
        Session::forget('access_token');
        Session::forget('user_id');
        return Redirect::to('/');
    }

    protected function getSessionUserId()
    {
        return Session::get('user_id');
    }


    protected function getGoogleClient()
    {
        $client = new Google_Client();
        $client->setApplicationName("Login to 999 notes.");
        $client->setClientId('791211372009-pae9foidjct3n1anmjh5vlm59ebktb2n.apps.googleusercontent.com');
        $client->setClientSecret('DnTiuKpJ9qEu0QbZdgO1h4iE');
        $client->setRedirectUri('http://znachok.kiev.ua/google_oauth2');
        $client->addScope("profile email");
        return $client;
    }


    protected function getUserByGoogleUser(Google_Service_Oauth2_Userinfoplus $info)
    {
        if (!isset($info->id) || empty($info->id)) {
            return null;
        }
        $user = DB::table('user')->where('google_id', $info->id)->first();
        if ($user === null) {
            // create new
            $name = isset($info->name) && !empty($info->name) ? $info->name : '';
            $email = isset($info->email) && !empty($info->email) ? $info->email : '';
            DB::table('user')->insert(
                array('name' => $name, 'email' => $email, 'google_id' => $info->id)
            );
            $user = DB::table('user')->where('google_id', $info->id)->first();
        }
        $user = isset($user->user_id) ? $user : new stdClass();
        $user->id = isset($user->user_id) ? $user->user_id : false;
        $user->link = $info->link;
        $user->picture = $info->picture;
        return $user;
    }


    public function test()
    {
        $data = DB::table('user')->where('user_id', '23')->lists('user_id');
        var_dump($data);
    }

    public function ping()
    {

    }

}
