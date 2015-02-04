/*jshint quotmark: false */
/*jshint white: false */
/*jshint trailing: false */
/*jshint newcap: false */
/*global React */
var NoteApp = NoteApp || {};

(function () {
    'use strict';

    var ESCAPE_KEY = 27;
    var ENTER_KEY = 13;

    NoteApp.Tag = React.createClass({
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
//        shouldComponentUpdate: function (nextProps, nextState) {
//        },

        render: function () {
            return (
                <a href="#" className={this.props.tag.available ? 'collection-item green lighten-5' : 'collection-item grey lighten-5'} onClick={this.props.handleClick}>
                    {this.props.tag.name}
                    {this.props.inFilter ? <i className="mdi-content-filter-list right" /> : ''}
                </a>
            );
        }
    });
})();
