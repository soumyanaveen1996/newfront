import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import {
    ChatStatusBarStyles,
    networkStatusBarStyle,
    networkStatusBarTextStyle
} from './styles';
import { Icons } from '../../config/icons';
import I18n from '../../config/i18n/i18n';
import { NETWORK_STATE } from '../../lib/network';

export default class ChatStatusBar extends React.Component {
    componentWillMount() {}

    closeStatus() {
        this.props.onChatStatusBarClose();
    }

    message() {
        const { network } = this.props;
        if (network === NETWORK_STATE.none) {
            return I18n.t('No_Network');
        } else if (network === NETWORK_STATE.satellite) {
            return I18n.t('Satellite_connection');
        }
    }

    icon() {
        const { network } = this.props;
        if (network === NETWORK_STATE.none) {
            return Icons.nonetworkChatStatusClose();
        } else if (network === NETWORK_STATE.satellite) {
            return Icons.satelliteChatStatusClose();
        }
    }

    render() {
        const { network } = this.props;
        return (
            <View style={networkStatusBarStyle(network)}>
                <Text style={networkStatusBarTextStyle(network)}>
                    {this.message()}
                </Text>
                <TouchableOpacity
                    style={ChatStatusBarStyles.closeButton}
                    onPress={this.closeStatus.bind(this)}
                >
                    {this.icon()}
                </TouchableOpacity>
            </View>
        );
    }
}
