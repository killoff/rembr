<?php

class HomeController extends Controller
{
    public function splash()
    {
        if (Auth::check()) {
            return View::make('page', array(
                'user' => Auth::getUser()
            ));
        } else {
            return View::make('landing');
        }
    }
}
