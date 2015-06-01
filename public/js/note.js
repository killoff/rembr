var NoteApp = NoteApp || {};

(function () {
    'use strict';
    var Utils = NoteApp.Utils;

    NoteApp.NoteObject = function (text) {
        var tags = [],
            match,
            regExp = /\!([^\n\r\s]+)/gi;
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

        return {
            uuid: Utils.uuid(),
            text: text.trim(),
            tags: tags
        };
    };
})();