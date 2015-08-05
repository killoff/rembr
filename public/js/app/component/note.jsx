
var RembrServiceContainer = RembrServiceContainer || {};

(function () {
    'use strict';

    var ESCAPE_KEY = 27;
    var ENTER_KEY = 13;

    var LABEL_LENGTH = 200;

    RembrServiceContainer.Note = React.createClass(
    {
        handledChange: false,

        handleEdit: function () {
            this.handledChange = false;
            var editField = this.refs.editField.getDOMNode();
            this.props.onEdit(function () {

            }, editField);
        },

        handleBlur: function () {
            console.log('onBlur');

            if (!this.handledChange) {
                this.registerChange();
            }
        },

        handleKeyDown: function (event) {
            if (event.which === ESCAPE_KEY) {
                this.props.onCancel(event);
            }
            if (event.ctrlKey && event.keyCode === ENTER_KEY) {
                this.handledChange = true;
                console.log('onCTRL_ENTER');
                this.registerChange();
            }
        },

        registerChange: function() {
            var text = this.refs.editField.getDOMNode().value;
            this.props.onSave(text, function() {
            });
        },

        getEditText: function () {
            var text = this.props.note.text;
            for (var i = 0; i < this.props.note.tags.length; i++) {
                text += (i == 0 ? "\n" : " ") + "!" + this.props.note.tags[i].name;
            }
            return text;
        },

        getLabel: function () {
            var label = this.props.note.text.replace(/(?:\r\n|\r|\n)/gm, " ");
            if (label.length > LABEL_LENGTH) {
                label = label.substr(0, LABEL_LENGTH) + '...';
            }
            return label;
        },

        shouldComponentUpdate: function (nextProps, nextState) {
            return (
                JSON.stringify(nextProps.note) !==  JSON.stringify(this.props.note) ||
                this.props.editing !== nextProps.editing
            );
        },

        componentDidMount: function()
        {
            // @todo too many calls on edit
            this.decorateNote(React.findDOMNode(this));
        },

        componentDidUpdate: function()
        {
            // @todo too many calls on edit
            this.decorateNote(React.findDOMNode(this));
        },

        decorateNote: function(domNode)
        {
            var $label = $(domNode).find('label');
            var autolinker = new Autolinker( [] );
            $label.html(autolinker.link( $label.html() ));
        },

        clickTag: function(tag)
        {
            this.props.onClickTag(tag);
        },

        delete: function(event)
        {
            event.preventDefault();
            this.props.onDelete();
        },

        render: function () {
            //console.log('render note ' + this.props.note.uuid);
            var tagsHtml = this.props.note.tags.map(function(tag) {
                var className = React.addons.classSet({
                    'note-tag': true,
                    'note-tag-selected': tag.selected
                });
                return <a href="#" className={className} onClick={this.clickTag.bind(this, tag)}>{tag.name}</a>
            }.bind(this));
            var className = React.addons.classSet({
                'note-collection-item': true,
                'editing': this.props.editing,
                'pinned-note': this.props.note.pinned
            });
            return (
                <div className={className}>
                    <div className="view">
                        <a onClick={this.delete} className="action action-delete">
                            <i className="tiny mdi-action-highlight-remove"></i>
                        </a>
                        <label onDoubleClick={this.handleEdit} className="truncate">
                            {this.getLabel()}
                        </label>
                        <div className="note-tags">
                            {tagsHtml}
                        </div>
                    </div>
                    <textarea
                        ref="editField"
                        className="edit materialize-textarea"
                        defaultValue={this.getEditText()}
                        onBlur={this.handleBlur}
                        onKeyDown={this.handleKeyDown}
                    />
                </div>
            );
        }
    });
})();
