var NoteApp = NoteApp || {};

(function () {
    'use strict';

    var ESCAPE_KEY = 27;
    var ENTER_KEY = 13;

    NoteApp.Note = React.createClass(
    {
        handleEdit: function () {
            var editField = this.refs.editField.getDOMNode();
            this.props.onEdit(function () {

            }, editField);
            //this.setState({editText: this.props.note.text});
        },

        handleSubmit: function () {
            var newText = this.refs.editField.getDOMNode().value;
            this.props.onSave(newText, function() {
            });
        },

        handleKeyDown: function (event) {
            if (event.which === ESCAPE_KEY) {
                this.props.onCancel(event);
            }
            if (event.ctrlKey && event.keyCode === ENTER_KEY) {
                this.handleSubmit();
            }
        },

        getEditText: function () {
            var text = this.props.note.text;
            for (var i = 0; i < this.props.note.tags.length; i++) {
                text += (i == 0 ? "\n" : " ") + "!" + this.props.note.tags[i].name;
            }
            return text;
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

        clickTag: function(tag)
        {
            this.props.onClickTag(tag);
        },

        delete: function(event)
        {
            event.preventDefault();
            this.props.onDestroy();
        },

        render: function () {
            var tagsHtml = this.props.note.tags.map(function(tag) {
                var className = React.addons.classSet({
                    'note-tag': true,
                    'note-tag-selected': tag.selected
                });
                return <a href="#" className={className} onClick={this.clickTag.bind(this, tag)}>{tag.name}</a>
            }.bind(this));
            
            var className = React.addons.classSet({
                'collection-item': true,
                editing: this.props.editing
            });
            return (
                <div className={className}>
                    <div className="view">
                        <a onClick={this.delete} className="action action-delete">
                            <i className="tiny mdi-action-highlight-remove"></i>
                        </a>
                        <label onDoubleClick={this.handleEdit}>
                            {this.props.note.text?this.props.note.text:''}
                        </label>
                        {tagsHtml}
                    </div>
                    <textarea
                        ref="editField"
                        className="edit materialize-textarea"
                        defaultValue={this.getEditText()}
                        onBlur={this.handleSubmit}
                        onKeyDown={this.handleKeyDown}
                    />
                </div>
            );
        }
    });
})();
