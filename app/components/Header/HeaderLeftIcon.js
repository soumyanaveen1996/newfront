import React from 'react';
import styles from './styles';
import Icons from '../../config/icons';
import { TouchableOpacity } from 'react-native';

export default class HeaderLeftIcon extends React.Component {
    render() {
        var { config } = this.props;
        return (
            <TouchableOpacity accessibilityLabel="Header Left Icon" testID="header-left-icon" style={[styles.defaultHeaderLeftIcon, this.props.style]} onPress={this.props.onPress}>
                {Icons.renderIcon(config.name, config.type, config.size, config.color, config.underlayColor, config.fontWeight)}
            </TouchableOpacity>
        );
    }
}
