var NoteApp = NoteApp || {};

(function () {
    'use strict';
    var Utils = NoteApp.Utils;

    NoteApp.NoteObject = function (text) {
        var tags = [],
            match,
            regExp = /\!([^\n\r\s]+)/gi,
            schedule = [];
        while ((match = regExp.exec(text)) !== null) {
            tags.push(match[1]);
        }
        if (tags.length > 0) {
            tags = tags.map(function(tag) {
                return {
                    uuid: Utils.uuid(),
                    name: tag
                };
            });
        }
        for (var i = 0; i < tags.length; i++) {
            text = text.replace('!'+tags[i].name, '');
        }

        var parsedResults = chrono.parse(text);
        if (parsedResults.length > 0) {
            schedule = parsedResults.map(function(parsedResult) {
                return {
                    minute: parsedResult.start.knownValues.minute ? parsedResult.start.knownValues.minute : parsedResult.start.impliedValues.minute,
                    hour:   parsedResult.start.knownValues.hour   ? parsedResult.start.knownValues.hour   : parsedResult.start.impliedValues.hour,
                    day:    parsedResult.start.knownValues.day    ? parsedResult.start.knownValues.day    : parsedResult.start.impliedValues.day,
                    month:  parsedResult.start.knownValues.month  ? parsedResult.start.knownValues.month  : parsedResult.start.impliedValues.month,
                    year:   parsedResult.start.knownValues.year   ? parsedResult.start.knownValues.year   : parsedResult.start.impliedValues.year
                };
            });
        }
        return {
            uuid: Utils.uuid(),
            text: text.trim(),
            tags: tags,
            schedule: schedule
        };
    };
})();