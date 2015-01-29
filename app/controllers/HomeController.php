<?php

class HomeController extends BaseController
{
    public function splash()
    {
        if (Auth::check()) {
            return View::make('page');
        } else {
            return View::make('login');
        }
    }

    public function login()
    {
        //Auth::attempt(array('email' => 'killoff@gmail.com'), true);
        //Redirect::to('/');
    }


}
