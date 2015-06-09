var NoteApp = NoteApp || {};

(function () {
    'use strict';

    var POST_URI = '/note';
    var PUT_URI = '/note';
    var DELETE_URI = '/delete';
    var LIST_URI = '/all';

    var EVENT_CHANGE = 'change';

    NoteApp.Storage = function (key) {
        this.key = key;
        this.notes = [];
        this.tags = [];
        this.filters = {tags: [], query: []};
        this.subscribers = {};
    };

    NoteApp.Storage.prototype.subscribe = function (eventName, handler) {
        eventName = eventName.toString();
        if (!this.subscribers.hasOwnProperty(eventName)) {
            this.subscribers[eventName] = [];
        }
        this.subscribers[eventName].push(handler);
    };

    NoteApp.Storage.prototype.onChange = function (handler) {
        return this.subscribe(EVENT_CHANGE, handler);
    };

    NoteApp.Storage.prototype.inform = function (eventName) {
        if (!this.subscribers.hasOwnProperty(eventName)) {
            return false;
        }
        this.subscribers[eventName].forEach(function (cb) { cb(); });
    };

    NoteApp.Storage.prototype.post = function(note)
    {
        var uuid = note.uuid;
        if (this.has(uuid)) {
            throw 'Cannot post note, UUID already exists.';
        }

        // put new note on the top
        this.notes.unshift(note);

        for (var i = 0; i < note.tags.length; i++) {
            this.addTag(note.tags[i]);
        }

        this.sortTags();

        this.inform(EVENT_CHANGE);

        $.ajax({
            method: 'POST',
            url: POST_URI,
            data: JSON.stringify(note),
            success: function (data) {
                // todo: update new note with server data?
            }.bind(this),
            error: function(xhr, status, err) {
                // todo: remove note with error message
                console.error(xhr, status, err.toString());
            }.bind(this)
        });
    };

    NoteApp.Storage.prototype.put = function(note)
    {
        // @todo: skip updating not changed info
        var uuid = note.uuid;
        var index = this.indexOf(uuid);
        if (index === null) {
            throw 'Cannot put note, UUID not found.';
        }
        this.notes[index] = note;

        for (var i = 0; i < note.tags.length; i++) {
            this.addTag(note.tags[i]);
        }

        // @todo: skip sorting if tags not changed
        this.sortTags();

        this.inform(EVENT_CHANGE);

        $.ajax({
            method: 'POST',
            url: PUT_URI,
            data: JSON.stringify(note),
            success: function (data) {

            }.bind(this),
            error: function(xhr, status, err) {
                console.error(xhr, status, err.toString());
            }.bind(this)
        });
    };

    NoteApp.Storage.prototype.get = function(uuid)
    {
        var index = this.indexOf(uuid);
        return index === null ? null : this.notes[index];
    };

    NoteApp.Storage.prototype.indexOf = function(uuid)
    {
        var c = this.notes.length;
        for (var i = 0; i < c; i++) {
            if (this.notes[i].uuid === uuid) {
                return i;
            }
        }
        return null;
    };

    NoteApp.Storage.prototype.has = function(uuid)
    {
        return this.indexOf(uuid) !== null;
    };

    NoteApp.Storage.prototype.delete = function(uuid)
    {
        // @todo delete tags from filter
        var index = this.indexOf(uuid);
        if (index !== null) {
            this.notes.splice(index, 1);

            this.inform(EVENT_CHANGE);

            $.ajax({
                method: 'POST',
                url: DELETE_URI,
                data: {uuid: uuid},
                success: function (data) {

                }.bind(this),
                error: function(xhr, status, err) {
                    console.error(xhr, status, err.toString());
                }
            });
            return true;
        } else {
            return false;
        }
    };

    NoteApp.Storage.prototype.collection = function()
    {
        return this.notes;
    };

    NoteApp.Storage.prototype.tagsCollection = function()
    {
        return this.tags;
    };

    NoteApp.Storage.prototype.addTagToFilter = function(tag)
    {
        this.filters.tags.push(tag.uuid);
    };

    NoteApp.Storage.prototype.toggleTagFilter = function(tag)
    {
        var index = this.filters.tags.indexOf(tag.uuid);
        if (index === -1) {
            this.filters.tags.push(tag.uuid);
        } else {
            this.filters.tags.splice(index, 1);
        }
    };


    NoteApp.Storage.prototype.addQueryToFilter = function(searchString)
    {
        if (this.filters.query.indexOf(searchString) === -1) {
            this.filters.query.push(searchString);
        }
    };


    NoteApp.Storage.prototype.serverPull = function()
    {
        $.ajax({
            type: 'get',
            url: LIST_URI,
            data: {filter: JSON.stringify(this.filters)},
            success: function (data) {

                this.notes = [];
                this.tags = [];

                var responseJson = $.parseJSON(data)

                var i, j, c;

                var isTagsFilterEmpty = this.filters.tags.length === 0;

                var tag,
                    tagsAssoc = {};
                c = responseJson.tags.length;
                for (i = 0; i < c; i++) {
                    tag = responseJson.tags[i];
                    tag.selected = this.filters.tags.indexOf(tag.uuid) !== -1;
                    // @todo: isTagsFilterEmpty || tag.selected ? true : false
                    tag.available = tag.selected ? true : false;
                    tagsAssoc[tag.id] = tag;
                    this.tags.push(tag);
                }

                var note;
                var tagIds;
                c = responseJson.notes.length;
                for (i = 0; i < c; i++) {
                    note = responseJson.notes[i];
                    note.tags = note.tags || [];
                    if (note.tag_ids) {
                        tagIds = note.tag_ids.split(',');
                        for (j = 0; j < tagIds.length; j++) {
                            note.tags.push(tagsAssoc[ tagIds[j] ]);
                            tagsAssoc[ tagIds[j] ].available = true;
                        }
                    }
                    delete note.tag_ids;
                    this.notes.push(note);
                }

                this.sortTags();
                this.inform(EVENT_CHANGE);

            }.bind(this),
            // todo: error handling
            error: function(xhr, status, err) {
                console.error(xhr, status, err.toString());
            }
        });
    };

    NoteApp.Storage.prototype.getTagByName = function (name)
    {
        var result = this.tags.filter( function(tag) { return tag.name === name; } );
        return result.length > 0 ? result[0] : null;
    };

    NoteApp.Storage.prototype.addTag = function (tag)
    {
        // @todo: update tags qty, available, selected...
        if (this.getTagByName(tag.name)) {
            return false;
        }
        tag.available = true;
        this.tags.push(tag);
    };

    // @todo compare strategy: most used, name, user defined
    NoteApp.Storage.prototype.sortTags = function ()
    {
        this.tags.sort(function (one, two) {
            //return one.name.localeCompare(two.name);
            if (one.total < two.total) {
                return 1;
            }
            if (one.total > two.total) {
                return -1;
            }
            return 0;
        });
    };

    NoteApp.Storage.prototype.tagsShit = function()
    {
        var tagExists = function(newTag)
        {
            // todo
            for(var i=0; i < this.state.tags.length; i++) {
                if (this.state.tags[i].name == newTag.name) {
                    return true;
                }
            }
            return false;
        };
        var _stateTags = this.state.tags;
        if (tags.length > 0) {
            $.map(tags, function (tag) {
                if (!this.tagExists(tag)) {
                    _stateTags.push(tag);
                }
            }.bind(this));
        }
        _stateTags.sort(function (a, b) {
            if (a.name > b.name) {
                return 1;
            }
            if (a.name < b.name) {
                return -1;
            }
            return 0;
        });
    };
})();
