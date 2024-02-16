import React, { useState, useEffect } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

import GlobalColors from '../../../config/styles';
import I18n from '../../../config/i18n/i18n';
import { Divider, Icon } from '@rneui/themed';
import { Auth } from '../../../lib/capability';
import { useNetInfo } from '@react-native-community/netinfo';
import NavigationAction from '../../../navigation/NavigationAction';
import { SwitchControll } from '../../../widgets/Switch';
import { Toast } from 'react-native-toast-message/lib/src/Toast';

const SecuritySettings = (props) => {
    const [searchToggle, setSearchToggle] = useState(false);
    const [shareProfile, setShareProfile] = useState(false);
    const [userInfo, setUserInfo] = useState([]);
    const netInfo = useNetInfo();

    useEffect(() => {
        getUserProfile();
    }, []);

    const getUserProfile = () => {
        const userDetails = Auth.getUserData();
        const {
            info: { searchable, visible }
        } = userDetails;
        setUserInfo(userDetails);
        setShareProfile(visible);
        setSearchToggle(searchable);
    };

    const saveProfile = async (searchFlag, shareFlag) => {
        try {
            const {
                info: {
                    emailAddress,
                    userName,
                    phoneNumbers,
                    address,
                    userCompanyName,
                    userTimezone,
                    rank,
                    role
                }
            } = userInfo;

            const detailObj = {
                emailAddress: emailAddress,
                searchable: searchFlag,
                visible: shareFlag,
                userName: userName,
                phoneNumbers,
                userCompanyName: userCompanyName,
                address: address,
                userTimezone: userTimezone
            };

            const userDetails = {
                userName: userName,
                searchable: searchFlag,
                visible: shareFlag,
                phoneNumbers,
                userCompanyName: userCompanyName,
                address: address,
                userTimezone: userTimezone
            };
            if (rank) {
                userDetails.rank = rank;
                detailObj.rank = rank;
            }
            if (role) {
                userDetails.role = role;
                detailObj.role = role;
            }
            const updatedUserInfo = await Auth.updatingUserProfile(detailObj);

            if (!updatedUserInfo) {
                console.log('error');
                showAlert('something went wrong');
            }
            if (updatedUserInfo && !updatedUserInfo[0]) {
                console.log('error');
                showAlert('something went wrong');
            } else {
                Auth.updateUserDetails(userDetails)
                    .then((data) => {})
                    .catch((err) => {
                        console.log(err);
                        showAlert(err);
                    });
            }
        } catch (e) {
            console.log(e);
            showAlert(e.toString());
        }
    };

    const showAlert = (msg) => {
        Toast.show({ text1: msg });
    };

    const isNetworkConnected =
        netInfo && (netInfo.isConnected || netInfo.isInternetReachable);

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
                        <Text
                            style={{
                                ...styles.toggleTitle
                            }}
                        >
                            {I18n.t('Search_my_info_text')}
                        </Text>
                    </View>

                    <SwitchControll
                        disabled={!isNetworkConnected}
                        value={searchToggle}
                        onValueChange={async () => {
                            setSearchToggle(!searchToggle);
                            await saveProfile(!searchToggle, shareProfile);
                        }}
                    />
                </View>

                <Divider style={styles.divider} />

                <View style={styles.switchContainer}>
                    <View style={{ flex: 1 }}>
                        <Text
                            style={{
                                ...styles.toggleTitle
                            }}
                        >
                            {I18n.t('Share_my_info_text')}
                        </Text>
                    </View>

                    <SwitchControll
                        disabled={!isNetworkConnected}
                        value={shareProfile}
                        onValueChange={async () => {
                            setShareProfile(!shareProfile);
                            await saveProfile(searchToggle, !shareProfile);
                        }}
                    />
                </View>

                <Divider style={styles.divider} />

                <TouchableOpacity
                    style={styles.switchContainer}
                    onPress={() => {
                        if (isNetworkConnected) {
                            NavigationAction.push(
                                NavigationAction.SCREENS.changePassword
                            );
                        }
                    }}
                >
                    <View style={{ flex: 1 }}>
                        <Text
                            style={{
                                ...styles.toggleTitle
                            }}
                        >
                            Update password
                        </Text>
                    </View>

                    <Icon
                        name="keyboard-arrow-right"
                        type="material"
                        size={23}
                        color={'#9C9EA7'}
                        style={{ alignSelf: 'flex-end' }}
                    />
                </TouchableOpacity>

                <Divider style={styles.divider} />

                <TouchableOpacity
                    style={styles.switchContainer}
                    onPress={() => {
                        if (isNetworkConnected) {
                            NavigationAction.push(
                                NavigationAction.SCREENS.twoFactorAuth
                            );
                        }
                    }}
                >
                    <View style={{ flex: 1 }}>
                        <Text
                            style={{
                                ...styles.toggleTitle
                            }}
                        >
                            Two-factor authentication
                        </Text>
                    </View>

                    <Icon
                        name="keyboard-arrow-right"
                        type="material"
                        size={23}
                        color={'#9C9EA7'}
                        style={{ alignSelf: 'flex-end' }}
                    />
                </TouchableOpacity>

                <Divider style={styles.divider} />
            </ScrollView>
        </SafeAreaView>
    );
};

export default SecuritySettings;

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: GlobalColors.white
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
        fontSize: 14,
        color: GlobalColors.primaryTextColor,
        paddingRight: 7,
        lineHeight: 20
    },
    divider: {
        backgroundColor: GlobalColors.itemDevider,
        height: 1,
        marginVertical: 20
    }
});
