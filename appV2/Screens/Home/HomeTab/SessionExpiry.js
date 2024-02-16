import React from 'react';
import { View, Text, TouchableOpacity, Image, BackHandler } from 'react-native';
import GlobalColors from '../../../config/styles';
import { Auth } from '../../../lib/capability';
import Images from '../../../images';
import AppFonts from '../../../config/fontConfig';

export default class SessionExpiry extends React.Component {
    logout = () => {
        Auth.logout();
    };

    componentDidMount() {
        this.BackHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            this.handleBackButton
        );
    }

    componentWillUnmount = () => {
        this.BackHandler?.remove();
    };

    handleBackButton = () => {
        return true;
    };

    render() {
        return (
            <View
                style={{
                    flex: 1,
                    alignItems: 'center',
                    backgroundColor: GlobalColors.appBackground,
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <View
                    style={{
                        flex: 1,
                        padding: 40,
                        alignItems: 'center',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 140
                    }}
                >
                    <Image source={Images.alert_large} />
                    <Text
                        style={{
                            textAlign: 'center',
                            fontSize: 24,
                            marginTop: 24,
                            fontWeight: AppFonts.BOLD,
                            color: GlobalColors.primaryTextColor
                        }}
                    >
                        Ooops!
                    </Text>
                    <Text
                        style={{
                            textAlign: 'center',
                            fontSize: 12,
                            marginTop: 16,
                            color: GlobalColors.primaryTextColor
                        }}
                    >
                        That wasn't meant to happen. The network failed. Let's
                        log you back in
                    </Text>
                </View>
                <TouchableOpacity
                    onPress={this.logout}
                    style={{
                        height: 40,
                        width: '75%',
                        position: 'absolute',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 100,
                        bottom: 0,
                        borderRadius: 24,
                        backgroundColor: GlobalColors.primaryButtonColor
                    }}
                >
                    <Text
                        style={{
                            textAlign: 'center',
                            fontSize: 14,
                            fontWeight: AppFonts.BOLD,
                            color: GlobalColors.primaryButtonText
                        }}
                    >
                        Sign in
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }
}
