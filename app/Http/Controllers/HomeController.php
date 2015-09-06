<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;

class HomeController extends Controller
{
    public function splash()
    {
//        if (Auth::check()) {
//            return View::make('page', array(
//                'user' => Auth::getUser()
//            ));
//        } else {
            return view('landing');
//        }
    }
}
