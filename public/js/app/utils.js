var RembrContainer = RembrContainer || {};

(function () {
    'use strict';

    RembrContainer.Utils = {
        uuid: function () {
            /*jshint bitwise:false */
            var i, random;
            var uuid = '';

            for (i = 0; i < 32; i++) {
                random = Math.random() * 16 | 0;
                if (i === 8 || i === 12 || i === 16 || i === 20) {
                    uuid += '-';
                }
                uuid += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random))
                    .toString(16);
            }

            return uuid;
        },

        clone: function (obj) {
            var newObj = {};
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    newObj[key] = obj[key];
                }
            }
            return newObj;
        },

        // aka php boolean
        toBoolean: function(value) {
            if (value === false || value === 0 || value === '0' || typeof value === 'undefined') {
                return false;
            }
            if (value === '' || value === null || value === [] || value === {}) {
                return false;
            }
            return true;
        }
    };
})();


var delay = (function(){
    var timer = 0;
    return function(callback, ms){
        clearTimeout (timer);
        timer = setTimeout(callback, ms);
    };
})();
