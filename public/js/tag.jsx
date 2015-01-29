/*jshint quotmark: false */
/*jshint white: false */
/*jshint trailing: false */
/*jshint newcap: false */
/*global React */
var app = app || {};

(function () {
    'use strict';

    var ESCAPE_KEY = 27;
    var ENTER_KEY = 13;

    app.TodoTag = React.createClass({
        handleClick: function (event) {
            console.log(this.props.tag);
        },

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
                <li className={React.addons.classSet({
                    enabled: this.props.tag.enabled,
                    disabled: this.props.tag.disabled,
                    active: this.props.tag.active
                })} onClick={this.handleClick}>
                    {this.props.tag.name}
                </li>
                );
        }
    });
})();
