import React from 'react';
import { View, Text } from 'react-native';
import { showAlert, closeAlert } from 'react-native-customisable-alert';
import GlobalColors from '../../config/styles';
import { PrimaryButton } from '../../widgets/PrimaryButton';
import { SecondaryButton } from '../../widgets/SecondaryButton';
import { Icon } from '@rneui/themed';
import AppFonts from '../../config/fontConfig';

export default class AlertDialog {
    /**
     * Shows alert with title and subtitle.
     * Cancel button only when posive callback is passed.
     * @param {*} title  title
     * @param {*} message text message
     * @param {*} buttons  array of two buttons, +ve last, single entry will be treated as positive.
     *                    Not passing this will display single confirmation button
     * 
     *  AlertDialog.show('title', 'message', [
            {
                text: 'nope',
                onPress: () => {
                    console.log('cancel');
                }
            },
            {
                text: 'yes please',
                onPress: () => {
                    console.log('conform');
                }
            }
        ]);
     */
    static show = (title, message, buttons = null) => {
        let positiveCallback = null;
        let negativeCallback = null;
        let positiveText = null;
        let negativeText = null;
        if (buttons && buttons.length > 2)
            throw new Error('Supports only two buttons');
        if (buttons && buttons.length == 2) {
            positiveCallback = buttons[1].onPress;
            positiveText = buttons[1].text || 'OK';
            negativeCallback = buttons[0].onPress;
            negativeText = buttons[0].text || 'Cancel';
        } else if (buttons && buttons.length == 1) {
            positiveCallback = buttons[0].onPress;
            positiveText = buttons[0].text || 'OK';
        }
        let singleButton = true;
        if (positiveCallback && negativeText) singleButton = false;
        showAlert({
            alertType: 'custom',
            customAlert: (
                <View
                    style={{
                        width: '90%',
                        backgroundColor: GlobalColors.appBackground,
                        borderRadius: 10,
                        paddingHorizontal: 21,
                        paddingVertical: 41
                    }}
                >
                    <Icon
                        name="close"
                        size={28}
                        containerStyle={{
                            position: 'absolute',
                            top: 6,
                            right: 6
                        }}
                        onPress={closeAlert}
                        color={GlobalColors.actionButtons}
                    />
                    {title && (
                        <Text
                            style={{
                                width: '100%',
                                marginBottom: 32,
                                textAlign: 'center',
                                fontSize: 16,
                                fontWeight: AppFonts.BOLD,
                                color: GlobalColors.primaryTextColor
                            }}
                        >
                            {title}
                        </Text>
                    )}
                    {message && (
                        <Text
                            style={{
                                width: '100%',
                                marginBottom: 26,
                                fontSize: 14,
                                textAlign: 'center',
                                color: GlobalColors.primaryTextColor
                            }}
                        >
                            {message}
                        </Text>
                    )}
                    <View
                        style={{
                            width: '100%',
                            flexDirection: 'row',
                            justifyContent: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        {!singleButton && ( //Show cancel button only if positive button has some actions.
                            <SecondaryButton
                                text={negativeText ? negativeText : 'cancel'}
                                style={{ flex: 0.5, flexGrow: undefined }}
                                onPress={() => {
                                    closeAlert();
                                    negativeCallback?.();
                                }}
                            />
                        )}
                        {!singleButton && <View style={{ width: 16 }} />}
                        <PrimaryButton
                            style={{
                                flex: singleButton ? 1 : 0.5,
                                flexGrow: singleButton ? 1 : undefined
                            }}
                            text={positiveText ? positiveText : 'OK'}
                            onPress={() => {
                                closeAlert();
                                positiveCallback?.();
                            }}
                        />
                    </View>
                </View>
            )
        });
    };

    /**
     * Shows critical alert with title and subtitle.
     * Cancel button only when posive callback is passed.
     * @param {*} title  title
     * @param {*} message text message
     * @param {*} buttons  array of two buttons, +ve last, single entry will be treated as positive.
     *                    Not passing this will display single confirmation button
     */
    static showCritical = (title, message, buttons = null) => {
        let positiveCallback = null;
        let negativeCallback = null;
        let positiveText = null;
        let negativeText = null;
        if (buttons && buttons.length > 2)
            throw new Error('Supports only two buttons');
        if (buttons && buttons.length == 2) {
            positiveCallback = buttons[1].onPress;
            positiveText = buttons[1].text || 'OK';
            negativeCallback = buttons[0].onPress;
            negativeText = buttons[0].text || 'Cancel';
        } else if (buttons && buttons.length == 1) {
            positiveCallback = buttons[0].onPress;
            positiveText = buttons[0].text || 'OK';
        }
        let singleButton = true;
        if (positiveCallback && negativeText) singleButton = false;
        showAlert({
            alertType: 'custom',
            customAlert: (
                <View
                    style={{
                        width: '90%',
                        backgroundColor: GlobalColors.appBackground,
                        borderRadius: 10,
                        paddingHorizontal: 21,
                        paddingVertical: 41
                    }}
                >
                    <Icon
                        name="close"
                        size={28}
                        containerStyle={{
                            position: 'absolute',
                            top: 6,
                            right: 6
                        }}
                        onPress={closeAlert}
                        color={GlobalColors.actionButtons}
                    />
                    {title && (
                        <Text
                            style={{
                                width: '100%',
                                marginBottom: 32,
                                textAlign: 'center',
                                fontSize: 16,
                                fontWeight: AppFonts.BOLD,
                                color: GlobalColors.primaryTextColor
                            }}
                        >
                            {title}
                        </Text>
                    )}
                    {message && (
                        <Text
                            style={{
                                width: '100%',
                                marginBottom: 26,
                                fontSize: 14,
                                textAlign: 'center',
                                color: GlobalColors.red
                            }}
                        >
                            {message}
                        </Text>
                    )}
                    <View
                        style={{
                            width: '100%',
                            flexDirection: 'row',
                            justifyContent: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        {!singleButton && ( //Show cancel button only if positive button has some actions.
                            <SecondaryButton
                                text={negativeText ? negativeText : 'cancel'}
                                style={{ flex: 0.5, flexGrow: undefined }}
                                onPress={() => {
                                    closeAlert();
                                    negativeCallback?.();
                                }}
                            />
                        )}
                        {!singleButton && <View style={{ width: 16 }} />}
                        <PrimaryButton
                            color={GlobalColors.red}
                            textColor={GlobalColors.white}
                            style={{
                                flex: singleButton ? 1 : 0.5,
                                flexGrow: singleButton ? 1 : undefined
                            }}
                            text={positiveText ? positiveText : 'OK'}
                            onPress={() => {
                                closeAlert();
                                positiveCallback?.();
                            }}
                        />
                    </View>
                </View>
            )
        });
    };
}
