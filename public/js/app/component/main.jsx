
var RembrServiceContainer = RembrServiceContainer || {};

(function () {
    'use strict';
    var ENTER_KEY = 13;

    var Main = React.createClass({
        getInitialState: function ()
        {
            return {
                editing: null
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
                this.props.storage.deleteNote(note.uuid);
                this.props.storage.push();
            } catch (e) {
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

        createNoteData: function(text)
        {
            var parsers = [
                {parser: RembrServiceContainer.TagParser, field: 'tags'},
                {parser: RembrServiceContainer.MomentParser, field: 'moments'}
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
                {refiner: RembrServiceContainer.TagParser, field: 'tags'},
                {refiner: RembrServiceContainer.MomentParser, field: 'moments'}
            ];

            return data;
        },


        getCurrentDatePeriods: function(forMoment)
        {
            var todayKey = moment().format('YYYYMMDD');
            if (!this.currentDatePeriods.hasOwnProperty(todayKey)) {
                console.log('periods calculated');
                this.currentDatePeriods[todayKey] = [
                    {
                        name: 'today',
                        start: moment().startOf('day'),
                        end: moment().endOf('day'),
                        format: 'YYYY-MM-DD',
                        uuid: moment().startOf('day').format('[__date]YYYY-MM-DD'),
                        order: 1
                    },
                    {
                        name: 'tomorrow',
                        start: moment().add(1, 'days').startOf('day'),
                        end: moment().add(1, 'days').endOf('day'),
                        format: 'YYYY-MM-DD',
                        uuid: moment().add(1, 'days').format('[__date]YYYY-MM-DD'),
                        order: 2
                    },
                    {
                        name: 'this week',
                        start: moment().startOf('isoWeek'),
                        end: moment().endOf('isoWeek'),
                        format: 'YYYY-[W]WW',
                        uuid: moment().startOf('isoWeek').format('[__date]YYYY-[W]WW'),
                        order: 3
                    },
                    {
                        name: 'next week',
                        start: moment().add(1, 'week').startOf('isoWeek'),
                        end: moment().add(1, 'week').endOf('isoWeek'),
                        format: 'YYYY-[W]WW',
                        uuid: moment().add(1, 'week').format('[__date]YYYY-[W]WW'),
                        order: 4
                    },
                    {
                        name: 'this month',
                        start: moment().startOf('month'),
                        end: moment().endOf('month'),
                        format: 'YYYY-MM',
                        uuid: moment().startOf('month').format('[__date]YYYY-MM'),
                        order: 5
                    },
                    {
                        name: 'next month',
                        start: moment().add(1, 'months').startOf('month'),
                        end:moment().add(1, 'months').endOf('month'),
                        format: 'YYYY-MM',
                        uuid: moment().add(1, 'months').startOf('month').format('[__date]YYYY-MM'),
                        order: 6
                    }
                ];
            }

            // if moment specified, return its periods
            if (forMoment) {
                return this.currentDatePeriods[todayKey].filter(function (period) {
                    return period.uuid === '__date' + forMoment.format(period.format);
                });
            }

            // otherwise return all current periods
            return this.currentDatePeriods[todayKey];
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
            ], { maxCount: 20});
        },

        render: function () {
            console.log('MAIN COMPONENT RENDER');
            var NoteComponent = RembrServiceContainer.Note;
            var notesHtml = this.props.storage.getNotes().reverse().map(function (note) {
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
                return tag.available;
            });
            availableTags.sort(this.sortTags);
            var TagComponent = RembrServiceContainer.Tag;
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

    var Storage = new RembrServiceContainer.Storage('Rembr');

    function render() {
        React.render(
            <Main storage={Storage} />,
            document.getElementById('main')
        );
    }

    render();

    Storage.onPull(render);
    Storage.onAdd(render);

})();
//<div className="row">
//    <a className="btn btn-small waves-effect waves-light red">
//        <i className="icon-sort-by-alphabet"></i>
//    </a>
//    <i className="icon-sort-by-attributes"></i>
//    <i className="icon-sort-by-order-alt"></i>
//</div>
