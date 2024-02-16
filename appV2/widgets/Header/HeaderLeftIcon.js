import React from 'react';
import styles from './styles';
import Icons from '../../config/icons';
import { TouchableOpacity, Platform } from 'react-native';

export default class HeaderLeftIcon extends React.Component {
    render() {
        const { config, color } = this.props;
        return (
            <TouchableOpacity
                accessibilityLabel="Header Left Icon"
                testID="header-left-icon"
                style={[
                    styles.defaultHeaderLeftIcon,
                    Platform.OS === 'ios' ? { marginLeft: -8 } : {}
                ]}
                onPress={this.props.onPress}
            >
                {Platform.OS === 'ios'
                    ? Icons.backArrow({ color: color ? color : 'white' })
                    : Icons.back({ color: color ? color : 'white' })}
            </TouchableOpacity>
        );
    }
}
