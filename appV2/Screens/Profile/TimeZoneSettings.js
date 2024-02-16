import React, { useEffect, useState, useRef } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-community/async-storage';
import { Divider } from '@rneui/themed';
import { getTimeZones } from '../../lib/utils';
import * as RNLocalize from 'react-native-localize';
import GlobalColors from '../../config/styles';
import { Auth } from '../../lib/capability';
import { SwitchControll } from '../../widgets/Switch';
import { Toast } from 'react-native-toast-message/lib/src/Toast';
import AppFonts from '../../config/fontConfig';

const TimeZoneSettings = (props) => {
    const [timeZoneSettingsLocal, setTimeZoneSettings] = useState(false);
    const [currentTimeZone, setCurrentTimeZone] = useState(false);
    const [listOfTimeZone, setListOfTimezone] = useState(getTimeZones());
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        fetchLocalTimeZoneSettings();
    }, []);

    useEffect(() => {
        findCurrenttimeZone();
    }, [listOfTimeZone]);

    const findCurrenttimeZone = async () => {
        let currTimezone = await RNLocalize.getTimeZone();
        let deviceTimezone = listOfTimeZone.find(
            (zone) => zone.code === currTimezone
        )?.code;
        if (deviceTimezone) {
            setCurrentTimeZone(currTimezone);
        } else {
            setCurrentTimeZone(false);
        }
    };

    const setLocalTimeZoneSettings = async () => {
        if (currentTimeZone) {
            const user = Auth.getUserData();
            if (
                user.info.userTimezone &&
                user.info.userTimezone == currentTimeZone
            ) {
                AsyncStorage.setItem(
                    '@TIME_ZONE_SETTINGS',
                    JSON.stringify({
                        settingsTimezone: true,
                        timeZone: currentTimeZone
                    })
                );
                updateSuccess();
            } else {
                Auth.updateUserDetailsForTimeZone(currentTimeZone)
                    .then(async (res) => {
                        Auth.saveAndUpdateProfile('userSession', res)
                            .then(async (res2) => {
                                await AsyncStorage.setItem(
                                    '@TIME_ZONE_SETTINGS',
                                    JSON.stringify({
                                        settingsTimezone: true,
                                        timeZone: currentTimeZone
                                    })
                                );
                                updateSuccess();
                            })
                            .catch((err) => {
                                updateFaliure();
                            });
                    })
                    .catch((err) => {
                        updateFaliure();
                    });
            }
        } else {
            updateFaliure();
        }
    };

    const updateSuccess = () => {
        setTimeZoneSettings(true);
        setLoading(false);
        Toast.show({ text1: 'Timezone settings updated!', type: 'success' });
    };
    const updateFaliure = () => {
        setTimeZoneSettings(false);
        setLoading(false);
        Toast.show({ text1: 'Some error occured. Retry!' });
    };

    const fetchLocalTimeZoneSettings = async () => {
        await AsyncStorage.getItem('@TIME_ZONE_SETTINGS')
            .then(async (res) => {
                if (!res) {
                    setTimeZoneSettings(false);
                } else {
                    let newData = JSON.parse(res);
                    if (newData.settingsTimezone) {
                        setTimeZoneSettings(true);
                    } else {
                        setTimeZoneSettings(false);
                    }
                }
            })
            .catch((err) => {
                setTimeZoneSettings(false);
            });
    };
    const updateTimeZoneSettings = async () => {
        setLoading(true);
        if (timeZoneSettingsLocal) {
            setTimeZoneSettings(false);
            await AsyncStorage.removeItem('@TIME_ZONE_SETTINGS');
            setLoading(false);
        } else {
            setLocalTimeZoneSettings();
        }
    };

    return (
        <SafeAreaView
            style={styles.safeAreaStyle}
            keyboardShouldPersistTaps="handled"
        >
            <ScrollView style={styles.scrollContainer}>
                <View style={styles.actionButtonContaner}>
                    <Text style={styles.menuText}>
                        Automatic detect timezone
                    </Text>
                    <View style={styles.statusContainer}>
                        <Text style={styles.statusText}>
                            {timeZoneSettingsLocal ? 'On' : 'Off'}
                        </Text>
                        <SwitchControll
                            value={timeZoneSettingsLocal ? true : false}
                            onValueChange={() => {
                                updateTimeZoneSettings();
                            }}
                        />
                    </View>
                </View>

                <Divider
                    style={{ backgroundColor: GlobalColors.itemDevider }}
                />
            </ScrollView>
            {loading && (
                <ActivityIndicator style={styles.loader} size="large" />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    scrollContainer: { flex: 1, margin: 18, marginTop: 0 },
    chekboxContainer: {
        backgroundColor: 'transparent',
        borderWidth: 0,
        marginLeft: 16,
        paddingVertical: 4
    },
    checkbox: {
        fontSize: 14,
        fontWeight: AppFonts.NORMAL,
        letterSpacing: -0.36,
        color: GlobalColors.menuSubLable
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    statusText: {
        marginRight: 14,
        fontSize: 14,
        letterSpacing: -0.36,
        color: GlobalColors.descriptionText
    },
    actionButtonContaner: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 60,
        marginLeft: 22
    },
    descriptions: {
        opacity: 0.5,
        fontSize: 12,
        letterSpacing: -0.31,
        color: GlobalColors.menuSubLableDescription
    },
    name: {
        fontSize: 18,
        letterSpacing: -0.46,
        color: GlobalColors.menuSubLable
    },
    nameArea: { flexDirection: 'column', marginLeft: 20, flex: 1 },
    profileImage: { width: 60, height: 60, borderRadius: 30 },
    userAreaContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginLeft: 12,
        marginBottom: 25,
        marginTop: 16
    },
    safeAreaStyle: {
        flex: 1,
        backgroundColor: GlobalColors.appBackground
    },
    menuText: {
        fontSize: 14,
        flex: 1,
        letterSpacing: -0.36,
        color: GlobalColors.primaryTextColor
    },
    loader: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#00000044'
    }
});
export default TimeZoneSettings;
