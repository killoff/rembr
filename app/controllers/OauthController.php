<?php
class OauthController extends BaseController
{
    public function google()
    {
        try {
            $code = Input::get('code');
            $service = OAuth::consumer('Google');
            if (!empty($code)) {
                $service->requestAccessToken($code);
                $result = json_decode($service->request('https://www.googleapis.com/oauth2/v1/userinfo'), true);
                if (isset($result['id'])
                    && !empty($result['id'])
                    && isset($result['email'])
                    && !empty($result['email']))
                {
                    $externalId = 'google' . $result['id'];
                    $user = User::where('external_id', '=', $externalId)->first();
                    if (!$user) {
                        $user = new User();
                        $user->email = $result['email'];
                        $user->name = isset($result['name']) ? $result['name'] : '';
                        $user->external_id = $externalId;
                        $user->external_info = json_encode($result);
                        $user->save();
                    }
                    if (is_object($user) && $user->id) {
                        Auth::loginUsingId($user->id, true);
                    }
                    return Redirect::route('splash');
                }
            } else {
                return Redirect::to( (string)$service->getAuthorizationUri() );
            }
        } catch (\Exception $e) {
            return Redirect::route('splash')->with('message', 'Login Failed'.$e->getMessage());
        }
    }

    public function facebook()
    {
        try {
            $code = Input::get('code');
            $service = OAuth::consumer('Facebook');
            if (!empty($code)) {
                $service->requestAccessToken($code);
                $result = json_decode($service->request('/me'), true);
                if (isset($result['id'])
                    && !empty($result['id'])
                    && isset($result['email'])
                    && !empty($result['email']))
                {
                    $externalId = 'fb' . $result['id'];
                    $user = User::where('external_id', '=', $externalId)->first();
                    if (!$user) {
                        $user = new User();
                        $user->email = $result['email'];
                        $user->name = isset($result['name']) ? $result['name'] : '';
                        $user->external_id = $externalId;
                        $user->external_info = json_encode($result);
                        $user->save();
                    }
                    if (is_object($user) && $user->id) {
                        Auth::loginUsingId($user->id, true);
                    }
                    return Redirect::route('splash');
                }
            } else {
                return Redirect::to( (string)$service->getAuthorizationUri() );
            }
        } catch (\Exception $e) {
            return Redirect::route('splash')->with('message', 'Login Failed');
        }
    }
}
