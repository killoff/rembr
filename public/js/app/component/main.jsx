
var RembrContainer = RembrContainer || {};

(function () {
    'use strict';
    var ENTER_KEY = 13;
    var TAGS_EXPAND_STEP = 5;

    var Main = React.createClass({
        getInitialState: function ()
        {
            return {
                editing: null,
                tags_limit: 10
            };
        },

        componentDidMount: function ()
        {
            this.props.storage.pull(function() {
                this.initTextarea(React.findDOMNode(this.refs.mainInput));

                var q = React.findDOMNode(this.refs.search);
                $(q).keyup(function() {
                    delay(function(){
                        $('#notes-list').removeHighlight();
                        this.props.storage.setSearchQuery($(q).val());
                        this.props.storage.pull(function () {
                            $('#notes-list').highlight($(q).val());
                            $(".highlight").css({ backgroundColor: "#FFFF88" });
                        });
                    }.bind(this), 300 );
                }.bind(this));

            }.bind(this));
        },

        addNoteFromInputField: function(field)
        {
            var $field = $(field);
            var text = $field.val().trim();

            if (!text) {
                return false;
            }

            var data = this.createNoteData(text);
            this.props.storage.addNote(data);
            this.props.storage.push();
        },

        updateNote: function (note, text, callback)
        {
            if (!text) {
                return false;
            }
            try {
                var data = this.createNoteData(text);
                this.props.storage.updateNote(note.uuid, data);
                this.props.storage.push();
                this.setState({editing: null});
                callback();
            } catch (e) {
                console.log(e);
                // todo: error handling
                if (e instanceof StorageServerException) {
                }
            }
        },

        editNote: function (note, callback, textarea)
        {
            this.setState({editing: note.uuid}, function () {
                this.initTextarea(textarea);
                callback();
            });
        },

        deleteNote: function(note)
        {
            try {
                var trashTag = this.props.storage.addTagAsObject({
                    name: '__trash',
                    uuid: '__trash',
                    system: 1,
                    priority: -100
                });
                note.tags.push(trashTag);
                this.props.storage.updateNote(note.uuid, note);
                this.props.storage.push();
                this.props.storage.deleteNote(note.uuid);
                Materialize.toast('<span>' + note.text.substring(0, 10) + '... deleted</span>&nbsp;&nbsp;<a class=&quot;btn-flat yellow-text&quot; href=&quot;#!&quot;>Undo<a>', 3000);
            } catch (e) {
                console.log(e);
                // todo: error handling
                if (e instanceof StorageServerException) {
                }
            }
        },

        cancelEditing: function ()
        {
            this.setState({editing: null});
        },

        // return < 0 to have one comes first.
        // return > 0 to have two comes first.
        // todo: sort only if tags list changed
        sortTags: function (one, two)
        {
            if (one.priority > two.priority) {
                return -1;
            }
            if (one.priority < two.priority) {
                return 1;
            }
            if (one.order > two.order) {
                return 1;
            }
            if (one.order < two.order) {
                return -1;
            }
            if (one.total > two.total) {
                return -1;
            }
            if (one.total < two.total) {
                return 1;
            }
            return 0;
        },

        sortTagsAlphabetically: function (one, two)
        {
            return one.name.localeCompare(two.name);
        },

        clickTag: function(tag)
        {
            event.preventDefault();
            this.props.storage.toggleTagFilter(tag);
            this.props.storage.pull();
        },

        pinTag: function(tag)
        {
            if (tag.available) {
                this.props.storage.toggleTagPinned(tag);
                this.props.storage.serverPull();
            }
        },

        expandTags: function()
        {
            this.setState({tags_limit: this.state.tags_limit + TAGS_EXPAND_STEP});
        },

        createNoteData: function(text)
        {
            var parsers = [
                {parser: RembrContainer.TagParser, field: 'tags'},
                {parser: RembrContainer.MomentParser, field: 'moments'}
            ];
            var data = {},
                i, c = parsers.length,
                propertyName,
                parserResult;
            for (i = 0; i < c; i++) {
                parserResult = parsers[i].parser.parse(text);
                propertyName = parsers[i].field;
                data[propertyName] = parserResult.result;
                text = parserResult.new_text;
            }
            data.text = text;

            var refiners = [
                {refiner: RembrContainer.TagRefiner},
                {refiner: RembrContainer.MomentRefiner}
            ];
            c = refiners.length
            for (i = 0; i < c; i++) {
                refiners[i].refiner.refine(data, this.props.storage);
            }
            return data;
        },

        handleHotKeySubmit: function (event)
        {
            if (!event.ctrlKey || event.keyCode !== ENTER_KEY) {
                return;
            }
            event.preventDefault();

            try {
                this.addNoteFromInputField(event.target);
                $(event.target).val('');
            } catch (e) {
                console.log(e.message);
                // todo: error handling
                if (e instanceof StorageServerException) {
                }
            }
        },

        initTextarea: function(textarea)
        {
            $(textarea).focus();
            $(textarea).textcomplete([
                {
                    match: /\B!([^\n\r\s]*)$/,
                    search: function (term, callback) {
                        // todo: simplify tagsCollection structure
                        callback($.map(this.props.storage.tags, function (tag) {
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
            ], { maxCount: 10});
        },

        render: function () {
            console.log('MAIN COMPONENT RENDER');
            var NoteComponent = RembrContainer.Note;
            var availableNotes = this.props.storage.getNotes().filter(function(note) {
                if (!note.tags) return true;
                if (note.tags.length == 0) return true;
                for (var i =0; i < note.tags.length; i++) {
                    if (note.tags[i].uuid == '__trash') {
                        return false;
                    }
                }
                return true;
            });
            var notesHtml = availableNotes.reverse().map(function (note) {
                return <NoteComponent
                    key={note.uuid}
                    note={note}
                    onDelete={this.deleteNote.bind(this, note)}
                    onEdit={this.editNote.bind(this, note)}
                    onSave={this.updateNote.bind(this, note)}
                    onCancel={this.cancelEditing}
                    editing={this.state.editing === note.uuid}
                    onClickTag={this.clickTag.bind(this)}
                />
            }, this);

            var availableTags = this.props.storage.getTags().filter(function(tag) {
                return tag.total > 0;
            });
            availableTags.sort(this.sortTags);
            availableTags = availableTags.slice(0, this.state.tags_limit);
            //availableTags.sort(this.sortTagsAlphabetically);

            var TagComponent = RembrContainer.Tag;
            var tagsHtml = availableTags.map(function (tag) {
                return (
                    <TagComponent
                        tag={tag}
                        onClick={this.clickTag.bind(this, tag)}
                        onPinTag={this.pinTag.bind(this, tag)}
                    />
                );
            }, this);
            var tagsActionsStyle = {
                bottom: '45px',
                right: '10px'
                //backgroundImage: 'url(' + imgUrl + ')',
            };
            return (
                <div>
                    <div className="row">
                        <div className="input-field col s6 offset-s2">
                            <textarea
                                id="mainInput"
                                ref="mainInput"
                                className="materialize-textarea"
                                onKeyDown={this.handleHotKeySubmit}
                                autoFocus={true}
                            />
                            <label htmlFor="mainInput">New Note</label>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col s2 hide-on-med-and-down">&nbsp;
                        </div>
                        <div className="col s6">
                            <ul className="collection" id="notes-list">{notesHtml}</ul>
                        </div>
                        <div className="col s2 hide-on-med-and-down tags-list">
                            {tagsHtml.length > 0 ? <div className="collection" id="tags-list">{tagsHtml}</div> : ''}
                            <a className="waves-effect waves-teal btn-flat center" onClick={this.expandTags}><i className="material-icons">expand_more</i></a>
                            <div className="fixed-action-btn" style={tagsActionsStyle}>
                                <a className="btn-floating btn-large red">
                                    <i className="large material-icons">menu</i>
                                </a>
                                <ul>
                                    <li><a className="btn-floating red"><i className="material-icons">insert_chart</i></a></li>
                                    <li><a className="btn-floating yellow darken-1"><i className="material-icons">format_quote</i></a></li>
                                    <li><a className="btn-floating green"><i className="material-icons">publish</i></a></li>
                                    <li><a className="btn-floating blue"><i className="material-icons">attach_file</i></a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
    });

    var Storage = new RembrContainer.Storage('Rembr');

    function render() {
        React.render(
            <Main storage={Storage} />,
            document.getElementById('main')
        );
    }

    render();

    Storage.onPull(render);
    Storage.onAdd(render);
    Storage.onDelete(render);

})();
//<div className="row">
//    <a className="btn btn-small waves-effect waves-light red">
//        <i className="icon-sort-by-alphabet"></i>
//    </a>
//    <i className="icon-sort-by-attributes"></i>
//    <i className="icon-sort-by-order-alt"></i>
//</div>
