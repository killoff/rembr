
var RembrContainer = RembrContainer || {};

(function () {
    'use strict';

    RembrContainer.Config = function ()
    {
        this.data = {
            tag_prefix: '!'
        };

        this.setData = function(data)
        {
            var origData = this.data;
            this.data = data;
            return origData;
        };

        this.setValue = function(key, value)
        {
            var origData = this.getValue(key);
            this.data[key] = value;
            return origData;
        };

        this.getValue = function(key)
        {
            return this.hasOwnProperty(key) ? this.data[key] : null;
        }
    }
})();
