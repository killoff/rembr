
var RembrServiceContainer = RembrServiceContainer || {};

function StorageEntityExistsException(message) {
    this.message = message;
    this.name = "StorageEntityExistsException";
}

function StorageEntityNotFoundException(message) {
    this.message = message;
    this.name = "StorageEntityNotFoundException";
}

function StorageInvalidObjectException(message) {
    this.message = message;
    this.name = "StorageInvalidObjectException";
}

function StorageServerException(message) {
    this.message = message;
    this.name = "StorageServerException";
}

function StorageGenericException(message) {
    this.message = message;
    this.name = "StorageGenericException";
}


(function () {
    'use strict';

    var Utils = RembrServiceContainer.Utils;

    var PUSH_URI    = '/note';
    var DELETE_URI  = '/delete';
    var PULL_URI    = '/all';

    var EVENT_ADD           = 'storage_add';
    var EVENT_UPDATE        = 'storage_update';
    var EVENT_PULL          = 'storage_pull';
    var EVENT_TAGS_CHANGED  = 'tags_change';


    var TAG_TYPE_WORD = 1;
    var TAG_TYPE_PERIOD = 2;


    var Storage = function (key)
    {
        this.key = key;
        this.notes = [];
        this.tags = [];
        this.filters = {tags: [], pinned: [], query: []};
        this.subscribers = {};
        this.flags = {};
        this.currentDatePeriods = {};
        this.staging = {updated: [], deleted: []};
    };

    Storage.prototype.getNotes = function()
    {
        return this.notes.concat();
    };

    Storage.prototype.getTags = function()
    {
        return this.tags.concat();
    };

    Storage.prototype.addNote = function (data)
    {
        if (this.isEmptyNote(data)) {
            throw new StorageInvalidObjectException('missing required fields to add note');
        }

        var dummyNote = {uuid: data.uuid ? data.uuid : Utils.uuid()};

        this.notes.push(dummyNote);
        var index = this.indexOfNote(dummyNote.uuid);
        var replacement = this.replaceNoteData(index, data);
        this.staging.updated.push(replacement.new_data);

        this.inform(EVENT_ADD);

        return replacement.new_data;
    };

    Storage.prototype.updateNote = function (uuid, data)
    {
        var index = this.indexOfNote(uuid);
        if (-1 === index) {
            throw new StorageEntityNotFoundException('update: note with uuid ' + uuid + ' not found in storage');
        }
        if (this.isEmptyNote(data)) {
            throw new StorageInvalidObjectException('missing required fields to update note');
        }

        var replacement = this.replaceNoteData(index, data);
        this.staging.updated.push(replacement.new_data);

        this.inform(EVENT_UPDATE);

        return replacement.orig_data;
    };

    Storage.prototype.replaceNoteData = function (index, data)
    {
        var origData = this.notes[index];
        this.notes[index] = data;
        this.notes[index].uuid = origData.uuid;

        var c = data.tags.length;
        for (var i = 0; i < c; i++) {
            data.tags[i] = this.addTag(data.tags[i]);
        }

        return {orig_data: origData, new_data: this.notes[index]};
    };

    Storage.prototype.deleteNote = function (uuid)
    {
        var index = this.indexOfNote(uuid);
        if (-1 === index) {
            throw new StorageEntityNotFoundException('delete: note with uuid ' + uuid + ' not found in storage');
        }
        this.notes.splice(index, 1);
        this.staging.deleted.push(uuid);
    };

    Storage.prototype.addTag = function (name)
    {
        var tag,
            tagIndex = this.indexOfTagName(name);

        if (tagIndex === -1) {
            tag = this.addTagAsObject({
                name: name,
                uuid: Utils.uuid()
            });
        } else {
            tag = this.tags[tagIndex];
            tag.total++;
        }

        return tag;
    };

    Storage.prototype.addTagAsObject = function (tag)
    {
        if (!tag.uuid || !tag.name) {
            throw new StorageInvalidObjectException('tag object must have uuid and name to be added');
        }
        var tagIndex = this.indexOfTag(tag.uuid);

        if (tagIndex === -1) {
            this.pushTagAsObject(tag);
        } else {
            tag = this.accomplishTagData(tag);
            tag.total++;
            this.tags[tagIndex] = tag;
        }

        return tag;
    };

    Storage.prototype.pushTagAsObject = function (tag)
    {
        if (!tag.uuid || !tag.name) {
            throw new StorageInvalidObjectException('tag object must have uuid and name to be added');
        }

        tag = this.accomplishTagData(tag);
        this.tags.push(tag);

        return tag;
    };

    Storage.prototype.accomplishTagData = function(data)
    {
        var result = RembrServiceContainer.Utils.clone(data);

        if (!result.hasOwnProperty('type')) {
            result.type = TAG_TYPE_WORD;
        }
        if (!result.hasOwnProperty('total')) {
            result.total = 0;
        }
        if (!result.hasOwnProperty('available')) {
            result.available = result.total > 0;
        }
        if (!result.hasOwnProperty('priority')) {
            result.priority = 0;
        }
        if (!result.hasOwnProperty('order')) {
            result.order = 0;
        }
        if (!result.hasOwnProperty('pinned')) {
            result.pinned = false;
        }

        result.selected = this.filters.tags.indexOf(data.uuid) !== -1;

        return result;
    };

    Storage.prototype.push = function ()
    {
        if (this.staging.updated.length > 0) {
            console.log('storage.push');
            console.log(this.staging.updated);

            $.ajax({
                method: 'POST',
                url: PUSH_URI,
                data: JSON.stringify(this.staging.updated),
                success: function (data) {
                    // todo: unset only uuids returned from server
                    this.staging.updated = [];
                }.bind(this),
                error: function(xhr, status, err) {
                    throw new StorageServerException('error occurred while pushing updates to server');
                }.bind(this)
            });
        }

        if (this.staging.deleted.length > 0) {
            $.ajax({
                method: 'POST',
                url: DELETE_URI,
                data: this.staging.deleted,
                success: function (data) {
                    // todo: unset only uuids returned from server
                    this.staging.deleted = [];
                }.bind(this),
                error: function(xhr, status, err) {
                    throw new StorageServerException('error occurred while pushing deletes to server');
                }
            });
        }
    };

    Storage.prototype.pull = function (callback)
    {
        $.ajax({
            type: 'get',
            url: PULL_URI, data: {filter: JSON.stringify(this.filters)/*, periods: currentDatePeriodsUuid*/},
            success: function (data) {
                this.notes = [];
                this.tags = [];

                var responseJson = $.parseJSON(data)

                var i, c;

                c = responseJson.tags.length;
                for (i = 0; i < c; i++) {
                    this.pushTagAsObject(responseJson.tags[i]);
                }

                c = responseJson.notes.length;
                for (i = 0; i < c; i++) {
                    // put note directly when pulling
                    this.notes.push(responseJson.notes[i]);
                }
                //c = responseJson.periods.length;
                //var currentDatePeriods = this.getCurrentDatePeriods();
                //for (i = 0; i < c; i++) {
                //    for (var j = 0; j < currentDatePeriods.length; j++) {
                //        if (responseJson.periods[i] === currentDatePeriods[j].uuid) {
                //            this.addTag({
                //                name: currentDatePeriods[j].name,
                //                uuid: currentDatePeriods[j].uuid,
                //                priority: 1,
                //                available: true,
                //                order: currentDatePeriods[j].order,
                //                type: 'period'
                //            });
                //        }
                //    }
                //}

                this.inform(EVENT_PULL);

                if (callback !== undefined) {
                    callback();
                }

            }.bind(this),
            // todo: error handling
            error: function(xhr, status, err) {
                console.error(xhr, status, err.toString());
            }
        });
    };

    Storage.prototype.toggleTagFilter = function(tag)
    {
        var index = this.filters.tags.indexOf(tag.uuid);
        if (index === -1) {
            this.filters.tags.push(tag.uuid);
        } else {
            this.filters.tags.splice(index, 1);
        }
    };

    Storage.prototype.setSearchQuery = function(query)
    {
        this.filters.query = [query]
    };

    Storage.prototype.isEmptyNote = function(data)
    {
        return data.text === '';
    };

    Storage.prototype.indexOfTagName = function(name)
    {
        var i,
            c = this.tags.length;
        for (i = 0; i < c; i++) {
            if (this.tags[i].name === name) {
                return i;
            }
        }
        return -1;
    };

    Storage.prototype.indexOfNote = function(uuid)
    {
        // check edge values first
        var lastIndex = this.notes.length - 1;
        if (lastIndex >= 0) {
            if (this.notes[lastIndex].uuid === uuid) {
                return lastIndex;
            } else if (this.notes[0].uuid === uuid) {
                return 0;
            }
        }
        return this.indexOfCollection(uuid, this.notes);
    };

    Storage.prototype.indexOfTag = function(uuid)
    {
        return this.indexOfCollection(uuid, this.tags);
    };

    Storage.prototype.indexOfCollection = function(uuid, collection)
    {
        var c = collection.length;
        for (var i = 0; i < c; i++) {
            if (collection[i].uuid === uuid) {
                return i;
            }
        }
        return -1;
    };

    Storage.prototype.subscribe = function (eventName, handler)
    {
        eventName = eventName.toString();
        if (!this.subscribers.hasOwnProperty(eventName)) {
            this.subscribers[eventName] = [];
        }
        this.subscribers[eventName].push(handler);
    };

    Storage.prototype.inform = function (eventName)
    {
        if (!this.subscribers.hasOwnProperty(eventName)) {
            return false;
        }
        this.subscribers[eventName].forEach(function (cb) { cb(); });
    };

    Storage.prototype.onAdd = function (handler)
    {
        return this.subscribe(EVENT_ADD, handler);
    };

    Storage.prototype.onUpdate = function (handler)
    {
        return this.subscribe(EVENT_UPDATE, handler);
    };

    Storage.prototype.onPull = function (handler)
    {
        return this.subscribe(EVENT_PULL, handler);
    };

    Storage.prototype.onTagsChange = function (handler)
    {
        return this.subscribe(EVENT_TAGS_CHANGED, handler);
    };

    RembrServiceContainer.Storage = Storage;

})();