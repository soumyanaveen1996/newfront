import React from 'react';
import styles from './styles';
import { Text, TouchableOpacity } from 'react-native';
import I18n from '../../config/i18n/i18n';

export default class HeaderRightButton extends React.Component {
    render() {
        return (
            <TouchableOpacity onPress={this.props.onPress}>
                <Text style={styles.defaultHeaderRightButton}>
                    {this.props.buttonTitle || I18n.t('Button')}
                </Text>
            </TouchableOpacity>
        );
    }
}
