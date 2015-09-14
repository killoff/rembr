<?php
Route::get('/oauth/{provider}', ['as' => 'socialite.auth', 'uses' => 'SocialiteController@auth']);

Route::get('/', array('as' => 'splash', 'uses' => 'HomeController@splash'));
Route::get('/google-oauth', array('as' => 'googleLogin', 'uses' => 'OauthController@google'));
Route::get('/facebook-oauth', array('as' => 'facebookLogin', 'uses' => 'OauthController@facebook'));
Route::get('/notes', array('as' => 'noteList', 'uses' => 'NoteController@listing'));
Route::get('/all', array('as' => 'all', 'uses' => 'NoteController@all'));

Route::post('/note', array('as' => 'notePost', 'uses' => 'NoteController@save'));
Route::post('/delete', array('as' => 'delete_note', 'uses' => 'NoteController@delete'));
Route::post('/pin_tag', array('as' => 'pinTag', 'uses' => 'NoteController@pinTag'));

Route::get('/test', array('as' => 'test', 'uses' => 'NoteController@test'));
Route::get('/update_uuids', array('as' => 'update_uuids', 'uses' => 'NoteController@updateUuids'));



//Route::get('/refresh_index', array('as' => 'refresh_index', 'uses' => 'NoteController@refreshIndex'));

