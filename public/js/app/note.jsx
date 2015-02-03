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

    NoteApp.Note = React.createClass({
        handleSubmit: function (event) {
            var val = this.state.editText;
            if (val) {
                this.props.onSave(val);
                this.setState({editText: val});
            } else {
                this.props.onDestroy();
            }
        },

        handleEdit: function () {
            // react optimizes renders by batching them. This means you can't call
            // parent's `onEdit` (which in this case triggeres a re-render), and
            // immediately manipulate the DOM as if the rendering's over. Put it as a
            // callback. Refer to app.jsx' `edit` method
            this.props.onEdit(function () {
                var node = this.refs.editField.getDOMNode();
                node.focus();
                node.setSelectionRange(node.value.length, node.value.length);
            }.bind(this));
            this.setState({editText: this.props.note.text});
        },

        handleKeyDown: function (event) {
            if (event.which === ESCAPE_KEY) {
                this.setState({editText: this.props.note.text});
                this.props.onCancel(event);
            } else if (event.which === ENTER_KEY) {
                this.handleSubmit(event);
            }
        },

        handleChange: function (event) {
            this.setState({editText: event.target.value});
        },

        getInitialState: function () {
            return {editText: this.props.note.text};
        },

        shouldComponentUpdate: function (nextProps, nextState) {
            // todo ?
            return true;
//            return (
//                nextProps.todo !== this.props.todo ||
//                nextProps.editing !== this.props.editing ||
//                nextState.editText !== this.state.editText
//            );
        },

        render: function () {
            var tagsHtml = this.props.note.tags.map(function(noteTag) {
                return <a href="" className="note-tag">{noteTag.name}</a>
            });
            return (
                <div className="collection-item">
                    {this.props.note.text}
                    {tagsHtml}
                </div>
            );
        }
    });
})();
