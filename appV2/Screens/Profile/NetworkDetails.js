import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CheckBox, Divider } from '@rneui/themed';
import { TouchableOpacity } from 'react-native-gesture-handler';

import GlobalColors from '../../config/styles';
import { PollingStrategyTypes, Settings } from '../../lib/capability';
import { SwitchControll } from '../../widgets/Switch';
import AppFonts from '../../config/fontConfig';

const options = ['gsm', 'satellite', 'automatic', 'manual'];
export const optionMapping = {
    gsm: 'Terrestrial',
    satellite: 'Satellite',
    automatic: 'Automatic',
    manual: 'Manual'
};

export const NetworkDetails = () => {
    const [pollingStatergy, setPollingStrategy] = useState(
        PollingStrategyTypes.automatic
    );
    const [lowNetworkMode, setLownetworkMode] = useState(false);

    useEffect(() => {
        Settings.getPollingStrategy().then((val) => {
            setPollingStrategy(val);
            if (val === PollingStrategyTypes.satellite) {
                setLownetworkMode(true);
            }
        });
    }, []);

    return (
        <SafeAreaView
            style={styles.safeAreaStyle}
            keyboardShouldPersistTaps="handled"
        >
            <ScrollView style={styles.scrollContainer}>
                {/* for the ticket CORE-2252 commented out low network */}
                {/* <TouchableOpacity
                    style={styles.actionButtonContaner}
                    onPress={() => {}}
                >
                    <Text style={styles.menuText}>Low network traffic</Text>
                    <View style={styles.statusContainer}>
                        <Text style={styles.statusText}>Active</Text>
                        <SwitchControll
                            value={lowNetworkMode}
                            onValueChange={() => {
                                if (lowNetworkMode) {
                                    setLownetworkMode(false);
                                    setPollingStrategy(
                                        PollingStrategyTypes.automatic
                                    );
                                    Settings.setPollingStrategy(
                                        PollingStrategyTypes.automatic
                                    );
                                } else {
                                    setPollingStrategy(
                                        PollingStrategyTypes.satellite
                                    );
                                    Settings.setPollingStrategy(
                                        PollingStrategyTypes.satellite
                                    );
                                    setLownetworkMode(true);
                                }
                            }}
                        />
                    </View>
                </TouchableOpacity> */}

                <Divider
                    style={{ backgroundColor: GlobalColors.itemDevider }}
                />
                <View style={styles.actionButtonContaner}>
                    <Text style={styles.menuText}>Network settings</Text>
                </View>

                {options.map((item) => (
                    <CheckBox
                        key={item}
                        title={optionMapping[item]}
                        onPress={() => {
                            setPollingStrategy(item);
                            Settings.setPollingStrategy(item);
                        }}
                        checked={item === pollingStatergy}
                        textStyle={styles.checkbox}
                        containerStyle={styles.chekboxContainer}
                        size={20}
                        iconType="ionicon"
                        checkedIcon="ios-radio-button-on"
                        uncheckedIcon="ios-radio-button-off"
                        checkedColor={GlobalColors.primaryButtonColor}
                        uncheckedColor={GlobalColors.grey}
                        activeOpacity={1}
                    />
                ))}
            </ScrollView>
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
        color: GlobalColors.descriptionText
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
    }
});
