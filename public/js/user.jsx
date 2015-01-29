/*jshint quotmark: false */
/*jshint white: false */
/*jshint trailing: false */
/*jshint newcap: false */
/*global React */
var app = app || {};

(function () {
    'use strict';

    app.TodoUser = React.createClass({
        getInitialState: function () {
            return {};
        },

        /**
         * This is a completely optional performance enhancement that you can
         * implement on any React component. If you were to delete this method
         * the app would still work correctly (and still be very performant!), we
         * just use it as an example of how little code it takes to get an order
         * of magnitude performance improvement.
         */
        shouldComponentUpdate: function (nextProps, nextState) {
        },

        render: function () {
            return (
                <div>
                {this.props.user.name}
                    <a>log out</a>
                </div>
            );
        }
    });
})();
