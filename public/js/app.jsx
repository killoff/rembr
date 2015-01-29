/*jshint quotmark:false */
/*jshint white:false */
/*jshint trailing:false */
/*jshint newcap:false */
/*global React, Router*/
var app = app || {};

var emojies = ['first', 'second', 'go go notes'];

(function () {
    'use strict';
    var Utils = app.Utils;

    app.ALL_TODOS = 'all';
    app.ACTIVE_TODOS = 'active';
    app.COMPLETED_TODOS = 'completed';
    var TodoFooter = app.TodoFooter;
    var TodoItem = app.TodoItem;
    var TodoTag = app.TodoTag;
    var TodoUser = app.TodoUser;

    var ENTER_KEY = 13;

    var TodoApp = React.createClass({
        getInitialState: function () {
            return {
                nowShowing: app.ALL_TODOS,
                editing: null
            };
        },

        componentDidMount: function () {
            var setState = this.setState;
            var router = Router({
                '/': setState.bind(this, {nowShowing: app.ALL_TODOS}),
                '/active': setState.bind(this, {nowShowing: app.ACTIVE_TODOS}),
                '/completed': setState.bind(this, {nowShowing: app.COMPLETED_TODOS})
            });
            router.init('/');

            $('#new-todo').textcomplete([
                {
                    match: /\B:([\-+\w]*)$/,
                    search: function (term, callback) {
                        callback($.map(emojies, function (emoji) {

                            return emoji.indexOf(term) === 0 ? emoji : null;
                        }));
                    },
                    template: function (value) {
                        return value;
                    },
                    replace: function (value) {
                        return ':' + value + ': ';
                    },
                    index: 1
                },
                {
                    words: ['apple', 'google', 'facebook', 'facesssbook', 'github'],
                    match: /\b(\w{2,})$/,
                    search: function (term, callback) {
                        callback($.map(this.words, function (word) {
                            return word.indexOf(term) === 0 ? word : null;
                        }));
                    },
                    index: 1,
                    replace: function (word) {
                        return word + ' ';
                    }
                }
            ]);
        },

        handleNewTodoKeyDown: function (event) {
            if (!event.ctrlKey || event.keyCode !== ENTER_KEY) {
                return;
            }

            event.preventDefault();
            var textField = this.refs.newField.getDOMNode();

            if (textField.value.trim()) {

                var todo = {
                    id: Utils.uuid(),
                    text: textField.value.trim(),
                    completed: false
                }
                this.props.model.addTodo(todo);
                textField.value = '';

                $.ajax({
                    type: 'post',
                    url: '/note',
                    data: JSON.stringify(todo),
                    success: function (data) {
                        console.log('note added');
                        console.log(data);
                    }.bind(this),
                    error: function(xhr, status, err) {
                        console.error(xhr, this.props.addUrl, status, err.toString());
                    }.bind(this)
                });
            }
        },

        toggleAll: function (event) {
            var checked = event.target.checked;
            this.props.model.toggleAll(checked);
        },

        toggle: function (todoToToggle) {
            this.props.model.toggle(todoToToggle);
        },

        destroy: function (todo) {
            this.props.model.destroy(todo);
        },

        edit: function (todo, callback) {
            // refer to todoItem.js `handleEdit` for the reasoning behind the
            // callback
            this.setState({editing: todo.id}, function () {
                callback();
            });
        },

        save: function (todoToSave, text) {
            this.props.model.save(todoToSave, text);
            this.setState({editing: null});
        },

        cancel: function () {
            this.setState({editing: null});
        },

        clearCompleted: function () {
            this.props.model.clearCompleted();
        },

        render: function () {
            var footer;
            var main;
            var todos = this.props.model.todos;

            var shownTodos = todos.filter(function (todo) {
                switch (this.state.nowShowing) {
                case app.ACTIVE_TODOS:
                    return !todo.completed;
                case app.COMPLETED_TODOS:
                    return todo.completed;
                default:
                    return true;
                }
            }, this);

            var todoItems = shownTodos.map(function (todo) {
                return (
                    <TodoItem
                        key={todo.id}
                        todo={todo}
                        onToggle={this.toggle.bind(this, todo)}
                        onDestroy={this.destroy.bind(this, todo)}
                        onEdit={this.edit.bind(this, todo)}
                        editing={this.state.editing === todo.id}
                        onSave={this.save.bind(this, todo)}
                        onCancel={this.cancel}
                    />
                );
            }, this);
console.log('1');
            var todoTags = this.props.tags.map(function (tag) {
                return (
                    <TodoTag
                        tag={tag}
                    />
                );
            }, this);
            console.log('2');

            var todoUser = <TodoUser
                        user={this.props.user}
                    />;
            console.log('3');

            var activeTodoCount = todos.reduce(function (accum, todo) {
                return todo.completed ? accum : accum + 1;
            }, 0);

            var completedCount = todos.length - activeTodoCount;

            if (activeTodoCount || completedCount) {
                footer =
                    <TodoFooter
                        count={activeTodoCount}
                        completedCount={completedCount}
                        nowShowing={this.state.nowShowing}
                        onClearCompleted={this.clearCompleted}
                    />;
            }

            if (todos.length) {
                main = (
                    <section id="main">

                        <input
                            id="toggle-all"
                            type="checkbox"
                            onChange={this.toggleAll}
                            checked={activeTodoCount === 0}
                        />

                        <ul id="todo-list">
                            {todoItems}
                        </ul>
                    </section>
                );
            }

            return (
                <div>
                    <header id="header">
                        <div id="user">
                            {todoUser}
                        </div>
                        <ul id="todo-tags">
                            {todoTags}
                        </ul>
                        <h1>todos</h1>
                        <textarea
                            ref="newField"
                            id="new-todo"
                            placeholder="What needs to be done?"
                            onKeyDown={this.handleNewTodoKeyDown}
                            autoFocus={true}
                        />
                    </header>
                    {main}
                    {footer}
                </div>
            );
        }
    });

    var model = new app.TodoModel('react-todos');
    // model.initialize();

    var user = {};
    var tags = {};

    function render(user, tags) {
        console.log(user);
        console.log(tags);
        React.render(
            <TodoApp model={model} user={user} tags={tags} />,
            document.getElementById('todoapp')
        );
    }

    model.subscribe('add', render);
    model.subscribe('save', render);
    model.subscribe('destroy', render);

    $.get('/all', {}, function (response) {
        var responseJson = $.parseJSON(response);
        user = responseJson.user;
        tags = responseJson.tags;
        model.todos = responseJson.notes;
        render(user, tags);
    });

})();
