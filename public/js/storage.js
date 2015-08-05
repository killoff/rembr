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

var NoteApp = NoteApp || {};

(function () {
    'use strict';

    var POST_URI = '/note';
    var PUT_URI = '/note';
    var DELETE_URI = '/delete';
    var LIST_URI = '/all';
    var PIN_TAG_URI = '/pin_tag';

    var EVENT_CHANGE = 'change';

    var TAG_TYPE_WORD = 1;
    var TAG_TYPE_PERIOD = 2;


    NoteApp.Storage = function (key) {
        this.key = key;
        this.notes = [];
        this.tags = [];
        this.filters = {tags: [], pinned: [], query: []};
        this.subscribers = {};
        this.flags = {};
        this.currentDatePeriods = {};
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

    NoteApp.Storage.prototype.inform = function (eventName)
    {
        if (!this.subscribers.hasOwnProperty(eventName)) {
            return false;
        }
        this.subscribers[eventName].forEach(function (cb) { cb(); });
    };

    NoteApp.Storage.prototype.insert = function(note, where)
    {
        if (-1 !== this.indexOf(note.uuid)) {
            throw new StorageEntityExistsException('note with uuid ' + note.uuid + ' is already in storage');
        }

        this.prepareNote(note);

        if (!note.uuid || (!note.text && !note.tags)) {
            throw new StorageInvalidObjectException('note object must have uuid and (text or tags) to be added');
        }

        var index;
        if (where === 'top') {
            this.notes.unshift(note);
            index = 0;
        } else if (where === 'bottom') {
            this.notes.push(note);
            index = this.notes.length - 1;
        } else {
            throw new StorageGenericException('insert note on top or bottom');
        }

        return index;
    };

    NoteApp.Storage.prototype.update = function(note)
    {
        var index = this.indexOf(note.uuid);
        if (-1 === index) {
            throw new StorageEntityNotFoundException('note with uuid ' + note.uuid + ' not found in storage');
        }
        this.prepareNote(note);

        if (!note.uuid || (!note.text && !note.tags)) {
            throw new StorageInvalidObjectException('note object must have uuid and (text or tags) to be added');
        }

        this.notes[index] = note;

        return index;
    };

    NoteApp.Storage.prototype.post = function(note)
    {
        this.insert(note, 'top');

        // add tags
        var i,
            c = note.tags.length;
        for (i = 0; i < c; i++) {
            this.addTag(note.tags[i]);
        }

        this.sortTags();
        this.inform(EVENT_CHANGE);

        $.ajax({
            method: 'POST',
            url: POST_URI,
            data: JSON.stringify(note),
            error: function(xhr, status, err) {
                throw new StorageServerException('error occurred while sending note to server');
            }.bind(this)
        });

    };

    NoteApp.Storage.prototype.put = function(note)
    {
        this.update(note);

        // add tags
        var i,
            c = note.tags.length;
        for (i = 0; i < c; i++) {
            this.addTag(note.tags[i]);
        }

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

    NoteApp.Storage.prototype.delete = function(uuid)
    {
        // @todo delete tags from filter
        var index = this.indexOf(uuid);
        if (index !== -1) {
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

    NoteApp.Storage.prototype.toggleTagPinned = function(tag)
    {
        // todo: can we work with tag instantly?
        var index = this.indexOfTag(tag.uuid);
        if (index !== -1) {
            var pinned = this.tags[index].pinned;
            this.tags[index].pinned = pinned == 1 ? 0 : 1;
            this.pinTag(tag);
        }
        var index = this.filters.pinned.indexOf(tag.uuid);
        if (index === -1) {
            this.filters.pinned.push(tag.uuid);
        } else {
            this.filters.pinned.splice(index, 1);
        }
    };

    NoteApp.Storage.prototype.pinTag = function(tag)
    {
        $.ajax({
            method: 'POST',
            url: PIN_TAG_URI,
            data: JSON.stringify(tag),
            success: function (data) {
                // todo: update new note with server data?
            }.bind(this),
            error: function(xhr, status, err) {
                // todo: remove note with error message
                console.error(xhr, status, err.toString());
            }.bind(this)
        });
    };


    NoteApp.Storage.prototype.addQueryToFilter = function(searchString)
    {
        if (this.filters.query.indexOf(searchString) === -1) {
            this.filters.query.push(searchString);
        }
    };


    NoteApp.Storage.prototype.serverPull = function()
    {
        var currentDatePeriodsUuid = this.getCurrentDatePeriods().map(function(period) {
            return period.uuid;
        });

        $.ajax({
            type: 'get',
            url: LIST_URI,
            data: {filter: JSON.stringify(this.filters), periods: currentDatePeriodsUuid},
            success: function (data) {
                this.notes = [];
                this.tags = [];

                var responseJson = $.parseJSON(data)

                var i, c;

                c = responseJson.tags.length;
                for (i = 0; i < c; i++) {
                    this.addTag(responseJson.tags[i]);
                }

                c = responseJson.notes.length;
                for (i = 0; i < c; i++) {
                    this.insert(responseJson.notes[i], 'bottom');
                }
                c = responseJson.periods.length;
                var currentDatePeriods = this.getCurrentDatePeriods();
                for (i = 0; i < c; i++) {
                    for (var j = 0; j < currentDatePeriods.length; j++) {
                        if (responseJson.periods[i] === currentDatePeriods[j].uuid) {
                            this.addTag({
                                name: currentDatePeriods[j].name,
                                uuid: currentDatePeriods[j].uuid,
                                priority: 1,
                                available: true,
                                order: currentDatePeriods[j].order,
                                type: 'period'
                            });
                        }
                    }
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

    NoteApp.Storage.prototype.getTag = function (uuid)
    {
        var index = this.indexOfTag(uuid);
        if (-1 !== index) {
            return this.tags[index];
        }
        return null;
    };

    NoteApp.Storage.prototype.prepareNote = function (note)
    {
        var i, c, existingTag;

        note.tags = note.tags || [];
        note.schedule = note.schedule || [];

        // add tags from array of uuids
        if (note.tag_uuids) {
            c = note.tag_uuids.length;
            for (i = 0; i < c; i++) {
                existingTag = this.getTag(note.tag_uuids[i]);
                if (existingTag) {
                    note.tags.push(existingTag);
                }
            }
            delete note.tag_uuids;
        }

        note.pinned = 0;
        c = note.tags.length;
        for (i = 0; i < c; i++) {
            if (note.tags[i].pinned) {
                note.pinned = 1;
                break;
            }
        }

        var scheduleMoment;
        c = note.schedule.length;
        for (i = 0; i < c; i++) {
            scheduleMoment = moment([
                note.schedule[i].year,
                note.schedule[i].month - 1,
                note.schedule[i].day,
                note.schedule[i].hour,
                note.schedule[i].minute
            ]);
            note.tags.push({
                name: 'month'+scheduleMoment.format('YYYY-MM'),
                uuid: scheduleMoment.format('[__date]YYYY-MM'),
                system: 1,
                type: 'period'
            });
            note.tags.push({
                name: 'week'+scheduleMoment.format('YYYY-[W]WW'),
                uuid: scheduleMoment.format('[__date]YYYY-[W]WW'),
                system: 1,
                type: 'period'
            });
            note.tags.push({
                name: 'day'+scheduleMoment.format('YYYY-MM-DD'),
                uuid: scheduleMoment.format('[__date]YYYY-MM-DD'),
                system: 1,
                type: 'period'
            });
        }
    };

    NoteApp.Storage.prototype.addTag = function (tag)
    {
        if (!tag.uuid || !tag.name) {
            throw new StorageInvalidObjectException('tag object must have uuid and name to be added');
        }
        if (-1 !== this.indexOfTag(tag.uuid)) {
            console.log('tag with   uuid ' + tag.uuid + ' is already in storage');
            // update properties?
            return;
            //throw new StorageEntityExistsException('tag with uuid ' + tag.uuid + ' is already in storage');
        }
        // define defaults
        tag.selected = this.filters.tags.indexOf(tag.uuid) !== -1;
        if (!tag.hasOwnProperty('type')) {
            tag.type = TAG_TYPE_WORD;
        }

        if (!tag.hasOwnProperty('total')) {
            tag.total = 0;
        }
        if (!tag.hasOwnProperty('available')) {
            tag.available = tag.total > 0;
        }
        if (!tag.hasOwnProperty('priority')) {
            tag.priority = 0;
        }
        if (!tag.hasOwnProperty('order')) {
            tag.order = 99999;
        }
        if (!tag.hasOwnProperty('pinned')) {
            tag.pinned = false;
        }

        if (tag.pinned) {
            this.filters.pinned.push(tag.uuid);
        }

        if (tag.type === 'period') {
            var datePeriods = this.getCurrentDatePeriods();
            for (var i = 0; i < datePeriods.length; i++) {
                console.log(datePeriods[i].uuid +'==='+ tag.uuid);
                if (datePeriods[i].uuid === tag.uuid) {
                    console.log('found: '+tag.uuid);
                    tag.name = datePeriods[i].name;
                    tag.available = true;
                    tag.priority = 1;
                    tag.order = datePeriods[i].order;
                    break;
                }
                //datePeriodsUuids.push(datePeriods[i].uuid);
            }
            //tag.available = datePeriodsUuids.indexOf(tag.uuid) !== -1;
        }

        //console.log('adding tag');
        //console.log(tag);

        this.tags.push(tag);
    };

    NoteApp.Storage.prototype.getCurrentDatePeriods = function(forMoment)
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
    };

    // return < 0 to have one comes first.
    // return > 0 to have two comes first.
    // @todo compare strategy: most used, name, user defined
    NoteApp.Storage.prototype.sortTags = function ()
    {
        this.tags.sort(function (one, two) {
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
        });
    };

    NoteApp.Storage.prototype.indexOf = function(uuid)
    {
        return this.indexOfCollection(uuid, this.notes);
    };

    NoteApp.Storage.prototype.indexOfTag = function(uuid)
    {
         return this.indexOfCollection(uuid, this.tags);
    };

    NoteApp.Storage.prototype.indexOfCollection = function(uuid, collection)
    {
        var c = collection.length;
        for (var i = 0; i < c; i++) {
            if (collection[i].uuid === uuid) {
                return i;
            }
        }
        return -1;
    };
})();
