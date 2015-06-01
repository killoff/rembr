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
Route::post('/note', array('as' => 'notePost', 'uses' => 'NoteController@save'));
Route::post('/delete', array('as' => 'delete_note', 'uses' => 'NoteController@delete'));
Route::get('/notes', array('as' => 'noteList', 'uses' => 'NoteController@listing'));
Route::get('/all', array('as' => 'all', 'uses' => 'NoteController@all'));
Route::get('/test', array('as' => 'test', 'uses' => 'NoteController@test'));
Route::get('/update_uuids', array('as' => 'update_uuids', 'uses' => 'NoteController@updateUuids'));
