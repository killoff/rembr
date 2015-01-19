<?php

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It's a breeze. Simply tell Laravel the URIs it should respond to
| and give it the Closure to execute when that URI is requested.
|
*/
Route::get('/', array('as' => 'splash', 'uses' => 'HomeController@splash'));
Route::get('/google-oauth', array('as' => 'googleLogin', 'uses' => 'OauthController@google'));
Route::get('/facebook-oauth', array('as' => 'facebookLogin', 'uses' => 'OauthController@facebook'));
Route::post('/note', array('as' => 'notePost', 'uses' => 'NoteController@add'));
Route::get('/notes', array('as' => 'noteList', 'uses' => 'NoteController@listing'));
