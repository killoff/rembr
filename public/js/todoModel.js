/*jshint quotmark:false */
/*jshint white:false */
/*jshint trailing:false */
/*jshint newcap:false */
var app = app || {};

(function () {
	'use strict';

	var EVENT_ADD = 'add';
	var EVENT_SAVE = 'save';
	var EVENT_DESTROY = 'destroy';
	var EVENT_TOGGLE = 'toggle';
	var EVENT_TOGGLE_ALL = 'toggle_all';


	var Utils = app.Utils;
	// Generic "model" object. You can use whatever
	// framework you want. For this application it
	// may not even be worth separating this logic
	// out, but we do this to demonstrate one way to
	// separate out parts of your application.
	app.TodoModel = function (key) {
		this.key = key;
		this.todos = [];
		this.onChanges = {};
	};

	app.TodoModel.prototype.initialize = function () {
		//this.todos = Utils.store(key);

        $.get('/notes', {}, function (response) {
        	console.log('response');
            var result = $.parseJSON(response);
			this.todos = result;
        }.bind(this));
	};

	app.TodoModel.prototype.subscribe = function (eventName, handler) {
		eventName = eventName.toString();
		if (!this.onChanges.hasOwnProperty(eventName)) {
			this.onChanges[eventName] = [];
		}
		this.onChanges[eventName].push(handler);
	};

	app.TodoModel.prototype.inform = function (eventName) {
		if (!this.onChanges.hasOwnProperty(eventName)) {
			return false;
		}
		Utils.store(this.key, this.todos);
		this.onChanges[eventName].forEach(function (cb) { cb(); });
	};

	/*
		todo object:
		{
			id: Utils.uuid(),
			title: title,
			completed: false
		}
	*/
	app.TodoModel.prototype.addTodo = function (todo) {

		this.todos = this.todos.concat(todo);
		this.inform(EVENT_ADD);
	};

	app.TodoModel.prototype.toggleAll = function (checked) {
		// Note: it's usually better to use immutable data structures since they're
		// easier to reason about and React works very well with them. That's why
		// we use map() and filter() everywhere instead of mutating the array or
		// todo items themselves.
		this.todos = this.todos.map(function (todo) {
			return Utils.extend({}, todo, {completed: checked});
		});

		this.inform(EVENT_TOGGLE_ALL);
	};

	app.TodoModel.prototype.toggle = function (todoToToggle) {
		this.todos = this.todos.map(function (todo) {
			return todo !== todoToToggle ?
				todo :
				Utils.extend({}, todo, {completed: !todo.completed});
		});

		this.inform(EVENT_TOGGLE);
	};

	app.TodoModel.prototype.destroy = function (todo) {
		this.todos = this.todos.filter(function (candidate) {
			return candidate !== todo;
		}); //ddd


		this.inform(EVENT_DESTROY);
	};

	app.TodoModel.prototype.save = function (todoToSave, text) {
		this.todos = this.todos.map(function (todo) {
			return todo !== todoToSave ? todo : Utils.extend({}, todo, {title: text});
		});

		this.inform();
	};

	app.TodoModel.prototype.clearCompleted = function () {
		this.todos = this.todos.filter(function (todo) {
			return !todo.completed;
		});

		this.inform();
	};

})();
