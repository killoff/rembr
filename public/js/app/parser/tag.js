
var RembrServiceContainer = RembrServiceContainer || {};

(function () {
    'use strict';

    RembrServiceContainer.TagParser = {
        parse: function(text)
        {
            var tags = [],
                match,
                regExp = /(?:^|\s)\!([^\n\r\s]+)/gi;
            while ((match = regExp.exec(text)) !== null) {
                tags.push(match[1]);
            }

            var newText = text.replace(/\![^\n\r\s]+/gi, '');

            return {
                result: tags,
                new_text: newText
            };
        }
    }
})();
//
//var note = {
//    text: 'this is simple note',
//    tags: [{uuid: '11-22-33', name: 'tag one'}, {uuid: '11-22-33', name: 'tag two'}],
//    moments: [{m: 12, d:1, y:2015}]
//};
//||
//\/
//var note = {
//    text: 'this is simple note',
//    tags: [
//        {uuid: '11-22-33', name: 'tag one'},
//        {uuid: '11-22-33', name: 'tag two'},
//        {uuid: '__date20151201', name: '__date20151201'},
//        {uuid: '__date201512', name: '__date201512'},
//        {uuid: '__date2015W35', name: '__date2015W35'},
//        {uuid: '__date20151005', name: '__date20151005'},
//        {uuid: '__date201510', name: '__date201510'},
//        {uuid: '__date2015W28', name: '__date2015W28'},
//    ],
//    moments: [{m: 12, d:1, y:2015}]
//};
