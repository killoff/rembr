<?php
Route::get('/oauth/{provider}', ['as' => 'socialite.auth',  'uses' => 'SocialiteController@auth']);
Route::get('/logout',           ['as' => 'logout',          'uses' => 'SocialiteController@logout']);

Route::get('/',             ['as' => 'splash',                              'uses' => 'HomeController@splash']);
Route::get('/notes',        ['as' => 'noteList',    'middleware' => 'auth', 'uses' => 'NoteController@listing']);
Route::get('/all',          ['as' => 'all',         'middleware' => 'auth', 'uses' => 'NoteController@all']);

Route::post('/note',        ['as' => 'note_post',    'middleware' => 'auth', 'uses' => 'NoteController@save']);
Route::post('/delete',      ['as' => 'delete_note',  'middleware' => 'auth', 'uses' => 'NoteController@delete']);

Route::post('/pintags',     ['as' => 'pin_tags',     'middleware' => 'auth', 'uses' => 'NoteController@pinTags']);
Route::post('/unpintags',   ['as' => 'unpin_tags',   'middleware' => 'auth', 'uses' => 'NoteController@unpinTags']);

Route::get('/test',         ['as' => 'test',         'middleware' => 'auth', 'uses' => 'NoteController@test']);
Route::get('/update_uuids', ['as' => 'update_uuids', 'middleware' => 'auth', 'uses' => 'NoteController@updateUuids']);



//Route::get('/refresh_index', ['as' => 'refresh_index', 'uses' => 'NoteController@refreshIndex'));

