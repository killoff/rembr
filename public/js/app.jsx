/*jshint quotmark:false */
/*jshint white:false */
/*jshint trailing:false */
/*jshint newcap:false */
/*global React, Router*/
var NoteApp = NoteApp || {};

var emojies = ['first', 'second', 'go go notes'];

(function () {
    'use strict';
    var ENTER_KEY = 13;
    var MAIN_INPUT_ID = 'mainInput';

    var NoteComponent = NoteApp.Note;
    var TagComponent = NoteApp.Tag;
    var Utils = NoteApp.Utils;

    var $mainInput;

    var filterTags = [];

    var Main = React.createClass({
        getInitialState: function () {
            return {
                notes: [],
                tags: []
            };
        },

        componentDidMount: function () {
            this.syncWithServer();
            this.initNoteForm();
        },

        syncWithServer: function()
        {
            $.ajax({
                type: 'get',
                url: this.props.loadAllUrl,
                success: function (data) {
                    var responseJson = $.parseJSON(data);
                    this.setState({
                        notes: responseJson.notes,
                        tags: responseJson.tags
                    });
                    console.log(this.state);

                }.bind(this),
                // todo: error handling
                error: function(xhr, status, err) {
                    console.error(xhr, this.props.addUrl, status, err.toString());
                }
            });
        },

        initNoteForm: function()
        {
            $mainInput = $('#' + MAIN_INPUT_ID);
            $mainInput.textcomplete([
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

        updateState: function(key, value)
        {
            var state = this.state;
            state[key] = value;
            this.setState(state);
        },

        handleNewNoteKeyDown: function (event) {
            if (!event.ctrlKey || event.keyCode !== ENTER_KEY) {
                return;
            }

            event.preventDefault();
            var noteText = $mainInput.val().trim();
            if (noteText) {
                var tags = noteText.match(/\:([^\:\n\r\s]{1}[^\:\n\r]*)\:/gi) || [];
                if (tags.length > 0) {
                    tags = tags.map(function(tag) {
                        return {
                            'uuid': Utils.uuid(),
                            'name': tag.replace(/:/g, '')
                        };
                    });
                }

                var note = {
                    uuid: Utils.uuid(),
                    text: noteText,
                    tags: tags
                }
                var _stateNotes = this.state.notes;
                _stateNotes.unshift(note);
                this.updateState('notes', _stateNotes);
//                this.props.model.addNote(todo);
                $mainInput.val('');

                $.ajax({
                    type: 'post',
                    url: '/note',
                    data: JSON.stringify(note),
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

        destroy: function()
        {

        },

        addTagToFilter: function(tag)
        {
            if (filterTags.indexOf(tag) === -1) {
                filterTags.push(tag);
            }
        },

        clickTag: function(tag)
        {
            event.preventDefault();
            this.addTagToFilter(tag)
            $.ajax({
                type: 'get',
                data: {tags: ['1111','2222']},
                url: this.props.loadAllUrl,
                success: function (data) {
                    var responseJson = $.parseJSON(data);
//                    this.setState({
//                        notes: responseJson.notes,
//                        tags: responseJson.tags
//                    });
                    console.log(this.state);

                }.bind(this),
                // todo: error handling
                error: function(xhr, status, err) {
                    console.error(xhr, this.props.addUrl, status, err.toString());
                }
            });
        },

        render: function () {
            console.log('current state notes:');
            console.log(this.state.notes);
            var notesHtml = this.state.notes.map(function (note) {
                return (
                    <NoteComponent
                        key={note.id}
                        note={note}
                        onDestroy={this.destroy.bind(this, note)}
                        onEdit={this.edit.bind(this, note)}
                        onSave={this.save.bind(this, note)}
                        onCancel={this.cancel}
                    />
                );
            }, this);

            var tagsHtml = this.state.tags.map(function (tag) {
                return (
                    <TagComponent
                        tag={tag}
                        handleClick={this.clickTag.bind(this, tag)}
                    />
                );
            }, this);
//var state = {"notes":{"aaa-bbb-111":{"note_id":1,"text":"note 1"},"aaa-bbb-222":{"note_id":2,"text":"note 2"},"aaa-bbb-333":{"note_id":3,"text":"note 3"}},"tags":{"ttt-bbb-111":{"tag_id":1,"name":"tag 1"},"ttt-bbb-222":{"tag_id":2,"name":"tag 2"},"ttt-bbb-333":{"tag_id":3,"name":"tag 3"}}};
//var state = {"notes":[{"note_id":1,"text":"note 1"},{"note_id":2,"text":"note 2"},{"note_id":3,"text":"note 3"}],"tags":{"ttt-bbb-111":{"tag_id":1,"name":"tag 1"},"ttt-bbb-222":{"tag_id":2,"name":"tag 2"},"ttt-bbb-333":{"tag_id":3,"name":"tag 3"}}};
//            console.log(state);
//            var newNote = {"note_id":4,"text":"note 4"};
//
//            state.notes.unshift(newNote);
//var noteId = 'note 2';
//            state.notes = state.notes.filter(function (candidate) {
//                return candidate.text !== noteId;
//            });
//
//            console.log(state);


            return (
                <div>
                    <div className="row">
                        <div className="input-field col s6 offset-s2">
                            <textarea
                                id="mainInput"
                                ref="mainInput"
                                className="materialize-textarea"
                                onKeyDown={this.handleNewNoteKeyDown}
                                autoFocus={true}
                            />
                            <label for="main-input">New Note</label>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col s6 offset-s2 ">
                            <ul className="collection">
                                {notesHtml}
                            </ul>
                        </div>
                        <div className="col s2">
                            <div className="collection">
                                {tagsHtml}
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
    });

//    var model = new NoteApp.NoteModel('react-todos');
    // model.initialize();


    function render(user, tags) {
        React.render(
            <Main loadAllUrl='/all' />,
            document.getElementById('main')
        );
    }

    render();
//    model.subscribe('add', render);
//    model.subscribe('save', render);
//    model.subscribe('destroy', render);

})();
