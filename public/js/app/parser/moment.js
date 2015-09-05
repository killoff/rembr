
var RembrContainer = RembrContainer || {};

(function () {
    'use strict';

    RembrContainer.MomentParser = {
        parse: function(text)
        {
            var moments = [];
            var parsedResults = chrono.parse(text);
            if (parsedResults.length > 0) {
                moments = parsedResults.map(function(p) {
                    return {
                        minute: p.start.knownValues.minute ? p.start.knownValues.minute : p.start.impliedValues.minute,
                        hour:   p.start.knownValues.hour   ? p.start.knownValues.hour   : p.start.impliedValues.hour,
                        day:    p.start.knownValues.day    ? p.start.knownValues.day    : p.start.impliedValues.day,
                        month:  p.start.knownValues.month  ? p.start.knownValues.month  : p.start.impliedValues.month,
                        year:   p.start.knownValues.year   ? p.start.knownValues.year   : p.start.impliedValues.year
                    };
                });
            }
            return {
                result: moments,
                new_text: text
            };
        }
    }
})();
