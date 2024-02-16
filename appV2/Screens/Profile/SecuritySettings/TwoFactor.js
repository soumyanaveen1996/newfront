import React, { useEffect, useState } from 'react';
import {
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ScrollView
} from 'react-native';
import { Divider } from '@rneui/themed';
import moment from 'moment';
import DeviceInfo from 'react-native-device-info';

import GlobalColors from '../../../config/styles';
import { Auth } from '../../../lib/capability';
import NavigationAction from '../../../navigation/NavigationAction';
import { SwitchControll } from '../../../widgets/Switch';
import AppFonts from '../../../config/fontConfig';

const TwoFactorAuth = ({
    route: {
        params: { scanned = false }
    }
}) => {
    const [twoFactor, setTwoFactor] = useState(false);
    const [deviceName, setDeviceName] = useState('');

    useEffect(() => {
        if (scanned) {
            setTwoFactor(true);
            const model = DeviceInfo.getModel();
            setDeviceName(model);
        }
    }, [scanned]);

    useEffect(() => {
        const {
            info: { softwareMfaEnabled }
        } = Auth.getUserData();
        setTwoFactor(softwareMfaEnabled);
        const model = DeviceInfo.getModel();
        setDeviceName(model);
    }, []);

    const onTwoFactorChange = () => {
        NavigationAction.push(NavigationAction.SCREENS.confirmPassword, {
            softwareMfaEnabled: twoFactor
        });
        setTwoFactor(!twoFactor);
        const model = DeviceInfo.getModel();
        setDeviceName(model);
    };

    return (
        <SafeAreaView
            style={styles.mainContainer}
            keyboardShouldPersistTaps="handled"
        >
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollViewContainer}
            >
                <View style={styles.switchContainer}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.toggleTitle}>
                            Two-factor authentication
                        </Text>
                    </View>

                    <Text
                        style={{
                            ...styles.toggleTitle,
                            color: GlobalColors.formLable
                        }}
                    >
                        {twoFactor ? 'Active' : 'Disable'}
                    </Text>

                    <SwitchControll
                        value={twoFactor}
                        onValueChange={() => onTwoFactorChange()}
                    />
                </View>

                <Divider style={styles.divider} />

                {twoFactor ? (
                    <View>
                        <Text style={styles.toggleTitle}>Device</Text>

                        <View style={styles.deviceInfoContainer}>
                            <View style={{ paddingHorizontal: 20 }}>
                                <Text
                                    style={{
                                        ...styles.toggleTitle,
                                        fontWeight: AppFonts.BOLD,
                                        paddingBottom: 15
                                    }}
                                >
                                    {deviceName}
                                </Text>
                                <Text
                                    style={{
                                        ...styles.dateText,
                                        color: GlobalColors.menuSubLable
                                    }}
                                >
                                    London, United Kingdom
                                </Text>
                                <Text style={styles.dateText}>
                                    {moment().format('DD MMMM YYYY')}
                                </Text>
                            </View>

                            <Divider
                                style={{
                                    ...styles.divider,
                                    marginBottom: 10
                                }}
                            />

                            <TouchableOpacity style={{ alignSelf: 'center' }}>
                                <Text style={styles.buttonText}>
                                    Change device
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : null}
            </ScrollView>
        </SafeAreaView>
    );
};

export default TwoFactorAuth;

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: GlobalColors.appBackground
    },
    scrollViewContainer: {
        paddingHorizontal: 20,
        paddingVertical: 20
    },
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        textAlign: 'left'
    },
    toggleTitle: {
        fontSize: 15,
        color: GlobalColors.primaryTextColor,
        paddingRight: 7,
        lineHeight: 20
    },
    divider: {
        backgroundColor: GlobalColors.itemDevider,
        height: 1,
        marginVertical: 20
    },
    deviceInfoContainer: {
        // height: 150,
        borderWidth: 1,
        borderColor: GlobalColors.itemDevider,
        borderRadius: 10,
        marginTop: 30,
        paddingTop: 20,
        paddingBottom: 15
    },
    dateText: {
        fontSize: 12,
        color: GlobalColors.formNonSelectedItem,
        lineHeight: 20
    },
    buttonText: {
        color: GlobalColors.primaryButtonColor,
        fontSize: 16
        // fontWeight: 'bold'
    }
});
