<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\AuthenticateUser;
use Socialite;
use Auth;

class SocialiteController extends Controller
{
    public function auth(AuthenticateUser $authenticateUser, Request $request, $provider = null)
    {
        return $authenticateUser->execute($request->all(), $this, $provider);
    }

    public function userHasLoggedIn($user)
    {
        return redirect('/');
    }

    public function logout()
    {
        Auth::logout();
        return redirect('/');
    }
}
