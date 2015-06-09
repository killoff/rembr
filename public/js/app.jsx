/*jshint quotmark:false */
/*jshint white:false */
/*jshint trailing:false */
/*jshint newcap:false */
/*global React, Router*/
var NoteApp = NoteApp || {};

(function () {
    'use strict';
    var ENTER_KEY = 13;
    var MAIN_INPUT_ID = 'mainInput';

    var filterTags = [];

    var Main = React.createClass({
        getInitialState: function () {
            return {
                editing: null
            };
        },

        componentDidMount: function () {
            this.props.storage.serverPull();
            this.initInputField($('#' + MAIN_INPUT_ID));
        },

        initInputField: function(textarea) {
            $(textarea).focus();
            $(textarea).textcomplete([
                {
                    match: /\B!([^\n\r\s]*)$/,
                    search: function (term, callback) {
                        // todo: simplify tagsCollection structure
                        callback($.map(this.props.storage.tagsCollection(), function (tag) {
                            return tag.name.indexOf(term) === 0 ? tag.name : null;
                        }.bind(this)));
                    }.bind(this),
                    template: function (value) {
                        return value;
                    },
                    replace: function (value) {
                        return '!' + value + ' ';
                    },
                    index: 1
                }
            ], { maxCount: 20});
        },

        handleKeyboardSubmit: function (event) {
            if (!event.ctrlKey || event.keyCode !== ENTER_KEY) {
                return;
            }
            event.preventDefault();
            var $inputField = $(event.target);
            var noteText = $inputField.val().trim();
            if (noteText) {
                $inputField.val('');
                var note = new NoteApp.NoteObject(noteText);
                this.props.storage.post(note);
            }
        },

        edit: function (note, callback, editDomNode) {
            // refer to todoItem.js `handleEdit` for the reasoning behind the
            // callback
            this.setState({editing: note.uuid}, function () {
                this.initInputField(editDomNode);
                callback();
            });
        },

        save: function (note, text, callback) {

            var noteObject = new NoteApp.NoteObject(text.trim());
            var tags = [];
            var tagInStorage;
            for (var i = 0; i < noteObject.tags.length; i++) {
                tagInStorage = this.props.storage.getTagByName(noteObject.tags[i].name);
                if (tagInStorage) {
                    tags.push(tagInStorage);
                } else {
                    tags.push(noteObject.tags[i]);
                }
            }
            console.log(tags);
            note.text = noteObject.text;
            note.tags = tags;
            this.props.storage.put(note);
            this.setState({editing: null});
            callback();
        },

        cancel: function () {
            this.setState({editing: null});
        },

        destroy: function(note)
        {
            // @todo check perms
            this.props.storage.delete(note.uuid);
        },

        addTagToFilter: function(tag)
        {
            var index = filterTags.indexOf(tag);
            if (index === -1) {
                filterTags.push(tag);
            } else {
                filterTags.splice(index, 1);
            }
        },

        clickTag: function(tag)
        {
            event.preventDefault();
            console.log(tag);
            if (tag.available) {
                this.props.storage.toggleTagFilter(tag);
                this.props.storage.serverPull();
            }
        },

        render: function () {
            var NoteComponent = NoteApp.Note;
            var notesHtml = this.props.storage.collection().map(function (note) {
                //console.log(note);
                return <NoteComponent
                    key={note.uuid}
                    note={note}
                    onDestroy={this.destroy.bind(this, note)}
                    onEdit={this.edit.bind(this, note)}
                    onSave={this.save.bind(this, note)}
                    onCancel={this.cancel}
                    editing={this.state.editing === note.uuid}
                    onClickTag={this.clickTag.bind(this)}
                />
            }, this);

            var TagComponent = NoteApp.Tag;
            var availableTags = this.props.storage.tagsCollection().filter(function(tag) {
                return tag.available;
            });
            var tagsHtml = availableTags.map(function (tag) {
                return (
                    <TagComponent
                        tag={tag}
                        onClick={this.clickTag.bind(this, tag)}
                    />
                );
            }, this);

            return (
                <div>
                    <div className="row">
                        <div className="input-field col s6 offset-s2">
                            <textarea
                                id="mainInput"
                                ref="mainInput"
                                className="materialize-textarea"
                                onKeyDown={this.handleKeyboardSubmit}
                                autoFocus={true}
                            />
                            <label htmlFor="mainInput">New Note</label>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col s6 offset-s2 ">
                            <ul className="collection" id="notes-list">{notesHtml}</ul>
                        </div>
                        <div className="col s2 fixed">
                            <div className="row">
                            {tagsHtml.length > 0 ? <div className="collection">{tagsHtml}</div> : ''}
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
    });

    var Storage = new NoteApp.Storage('999notes');

    function render(user, tags) {
        React.render(
            <Main storage={Storage} />,
            document.getElementById('main')
        );
    }

    render();

    Storage.onChange(render);

})();
//<div className="row">
//    <a className="btn btn-small waves-effect waves-light red">
//        <i className="icon-sort-by-alphabet"></i>
//    </a>
//    <i className="icon-sort-by-attributes"></i>
//    <i className="icon-sort-by-order-alt"></i>
//</div>
