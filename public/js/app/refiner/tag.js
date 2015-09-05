
var RembrContainer = RembrContainer || {};

(function () {
    'use strict';

    RembrContainer.TagRefiner = {
        refine: function(data, storage)
        {
            var c = data.tags.length;
            for (var i = 0; i < c; i++) {
                if (typeof data.tags[i] === 'string') {
                    data.tags[i] = storage.addTag(data.tags[i]);
                }
            }
        }
    }
})();
