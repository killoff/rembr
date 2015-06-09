/*jshint quotmark: false */
/*jshint white: false */
/*jshint trailing: false */
/*jshint newcap: false */
/*global React */
var NoteApp = NoteApp || {};

(function () {
    'use strict';

    NoteApp.Tag = React.createClass({
        render: function () {
            /*var color = this.props.tag.selected || this.props.tag.available ? 'light-green lighten-5' : 'white';*/
            return (
                <a href="#" className="collection-item white" onClick={this.props.onClick}>
                    {this.props.tag.name}
                    {this.props.tag.selected ? <i className="mdi-content-filter-list right" /> : ''}
                </a>
            );
        }
    });
})();
