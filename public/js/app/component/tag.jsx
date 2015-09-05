
var RembrContainer = RembrContainer || {};

(function () {
    'use strict';

    RembrContainer.Tag = React.createClass({
        getInitialState: function() {
            return {pinned: this.props.tag.pinned ? true : false};
        },

        togglePinned: function (event) {
            event.stopPropagation();
            this.setState({pinned: !this.state.pinned}/*, this.pinCallback*/);
        },

        render: function () {
            /*var color = this.props.tag.selected || this.props.tag.available ? 'light-green lighten-5' : 'white';*/
            var className = React.addons.classSet({
                'material-icons': true,
                'action-pin': true,
                'invisible': !this.state.pinned,
                'visible': this.state.pinned
            });
            var iconName = this.state.pinned ? 'star' : 'star_border';
            return (
                <div href="#" className="collection-item white cursor-hand" onClick={this.props.onClick}>
                    <i className={className} onClick={this.togglePinned}>{iconName}</i>
                    {this.props.tag.name}
                    {/*t:{this.props.tag.total},p:{this.props.tag.priority},o:{this.props.tag.order}*/}
                    {this.props.tag.selected ? <i className="tiny material-icons right">filter_list</i> : ''}
                    {this.props.tag.type=='period' ? <i className="tiny material-icons right">schedule</i> : ''}
                </div>
            );
        }
    });
})();
