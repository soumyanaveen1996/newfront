import React from 'react';
import config from './config';
import HeaderLeftIcon from './HeaderLeftIcon';

export default class HeaderBack extends React.Component {
    render() {
        return <HeaderLeftIcon style={this.props.style} config={config.backArrowConfig} onPress={this.props.onPress} />;
    }
}
