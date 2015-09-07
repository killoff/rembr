<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class Initial extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('users', function (Blueprint $table) {
            $table->engine = 'InnoDB';
            $table->increments('id');
            $table->string('name');
            $table->string('username')->nullable();
            $table->string('email')->nullable();
            $table->string('avatar');
            $table->string('provider');
            $table->string('provider_id')->unique();
            $table->rememberToken();
            $table->timestamps();
        });

        Schema::create('note', function (Blueprint $table) {
            $table->engine = 'InnoDB';
            $table->increments('note_id');
            $table->text('text');
            $table->string('uuid', 50)->index();
            $table->integer('user_id')->unsigned();
            $table->foreign('user_id')->references('id')->on('users');
            $table->timestamps();
            $table->index('updated_at');
        });

        Schema::create('note_dates', function (Blueprint $table) {
            $table->engine = 'InnoDB';
            $table->increments('date_id');
            $table->integer('note_id')->unsigned();
            $table->foreign('note_id')->references('note_id')->on('note')->onDelete('cascade');
            $table->datetime('moment');
        });

        Schema::create('tag', function (Blueprint $table) {
            $table->engine = 'InnoDB';
            $table->increments('tag_id');
            $table->string('name', 50)->index();
            $table->string('uuid', 50)->index();
            $table->integer('user_id')->unsigned();
            $table->foreign('user_id')->references('id')->on('users');
            $table->tinyInteger('type')->unsigned();
            $table->tinyInteger('pinned')->unsigned();
            $table->tinyInteger('system')->unsigned();
        });

        Schema::create('note_tag', function (Blueprint $table) {
            $table->engine = 'InnoDB';
            $table->integer('note_id')->unsigned();
            $table->foreign('note_id')->references('note_id')->on('note')->onDelete('cascade');
            $table->integer('user_id')->unsigned();
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });

        Schema::create('search_index', function (Blueprint $table) {
            $table->engine = 'MyISAM';
            $table->integer('note_id')->unsigned();
            $table->foreign('note_id')->references('note_id')->on('note')->onDelete('cascade');
            $table->text('text');
        });

        DB::statement('ALTER TABLE search_index ADD FULLTEXT SEARCH_FULLTEXT(text)');
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        //
    }
}
