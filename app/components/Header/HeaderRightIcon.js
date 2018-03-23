import React from 'react';
import styles from './styles';
import { TouchableOpacity } from 'react-native';
import Icons from '../../config/icons';

export default class HeaderRightIcon extends React.Component {
    render() {
        var { config, icon } = this.props;
        if (config) {
            return (
                <TouchableOpacity style={styles.defaultHeaderRightIcon} onPress={this.props.onPress}>
                    {Icons.renderIcon(config.name, config.type, config.size, config.color, config.underlayColor, config.fontWeight)}
                </TouchableOpacity>
            );
        } else if (icon) {
            return (
                <TouchableOpacity style={styles.defaultHeaderRightIcon} onPress={this.props.onPress}>
                    {icon}
                </TouchableOpacity>
            );
        } else {
            throw new Error('Either config or icon prop needs to be present');
        }
    }
}
