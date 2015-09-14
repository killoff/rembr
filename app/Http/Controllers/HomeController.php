<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Auth;

class HomeController extends Controller
{
    public function splash()
    {
        if (Auth::check()) {
            return view('page', array(
                'user' => Auth::getUser()
            ));
        } else {
            return view('landing');
        }
    }
}
