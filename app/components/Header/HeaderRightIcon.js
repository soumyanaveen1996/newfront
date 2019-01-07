import React from 'react';
import styles from './styles';
import { TouchableOpacity, Image } from 'react-native';
import Icons from '../../config/icons';

export default class HeaderRightIcon extends React.Component {
    render() {
        var { config, icon, image } = this.props;
        if (config) {
            return (
                <TouchableOpacity
                    accessibilityLabel="Header Right Icon Config"
                    testID="header-right-icon-config"
                    style={styles.defaultHeaderRightIcon}
                    onPress={this.props.onPress}
                >
                    {Icons.renderIcon(
                        config.name,
                        config.type,
                        config.size,
                        config.color,
                        config.underlayColor,
                        config.fontWeight
                    )}
                </TouchableOpacity>
            );
        } else if (icon) {
            return (
                <TouchableOpacity
                    accessibilityLabel="Header Right Icon Icon"
                    testID="header-right-icon-icon"
                    style={[styles.defaultHeaderRightIcon, this.props.style]}
                    onPress={this.props.onPress}
                >
                    {icon}
                </TouchableOpacity>
            );
        } else if (image) {
            return (
                <TouchableOpacity
                    accessibilityLabel="Header Right Icon Image"
                    testID="header-right-icon-image"
                    style={styles.defaultHeaderRightIconImage}
                    onPress={this.props.onPress}
                >
                    <Image source={image} />
                </TouchableOpacity>
            );
        } else {
            throw new Error('Either config or icon prop needs to be present');
        }
    }
}
