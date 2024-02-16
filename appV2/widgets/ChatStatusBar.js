import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Icons } from '../config/icons';
import I18n from '../config/i18n/i18n';
import { NETWORK_STATE } from '../lib/network';

export default class ChatStatusBar extends React.Component {
    UNSAFE_componentWillMount() {}

    closeStatus() {
        this.props.onChatStatusBarClose?.();
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
                {this.props.onChatStatusBarClose && (
                    <TouchableOpacity
                        style={ChatStatusBarStyles.closeButton}
                        onPress={this.closeStatus.bind(this)}
                    >
                        {this.icon()}
                    </TouchableOpacity>
                )}
            </View>
        );
    }
}

const ChatStatusBarStyles = StyleSheet.create({
    chatStatusBar: {
        height: 25,
        flexDirection: 'row',
        backgroundColor: 'rgb(192, 201, 208)',
        alignItems: 'center',
        justifyContent: 'center'
    },
    chatStatusBarSatellite: {
        backgroundColor: 'rgb(254, 214, 203)'
    },
    closeButton: {
        height: 24,
        width: 24,
        position: 'absolute',
        top: 2,
        right: 3
    },
    statusMessage: {
        textAlign: 'center',
        color: 'rgb(122, 127, 135)'
    },
    statusMessageSatellite: {
        color: 'rgb(243, 115, 78)'
    }
});
const networkStatusBarStyle = (network) => {
    if (network === 'none') {
        return [ChatStatusBarStyles.chatStatusBar];
    }
    if (network === 'satellite') {
        return [
            ChatStatusBarStyles.chatStatusBar,
            ChatStatusBarStyles.chatStatusBarSatellite
        ];
    }
};

const networkStatusBarTextStyle = (network) => {
    if (network === 'none') {
        return [ChatStatusBarStyles.statusMessage];
    }
    if (network === 'satellite') {
        return [
            ChatStatusBarStyles.statusMessage,
            ChatStatusBarStyles.statusMessageSatellite
        ];
    }
};
