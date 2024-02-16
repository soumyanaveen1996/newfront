import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Linking,
    Alert
} from 'react-native';
import { Divider, Icon } from '@rneui/themed';
import { useSelector } from 'react-redux';
import images from '../../config/images';
import config from '../../config/config';
import { MyProfileImage } from '../../widgets/ProfileImage';

import GlobalColors from '../../config/styles';
import SystemBot from '../../lib/bot/SystemBot';
import {
    Auth,
    CallQuota,
    DeviceStorage,
    Notification,
    PollingStrategyTypes,
    Settings
} from '../../lib/capability';
import EventEmitter, { PollingStrategyEvents } from '../../lib/events';
import { optionMapping } from './NetworkDetails';
import Utils from '../../lib/capability/Utils';
import Icons from '../../config/icons';
import UserServices from '../../apiV2/UserServices';
import Modal from 'react-native-modal';
import { useNetInfo } from '@react-native-community/netinfo';
import NavigationAction from '../../navigation/NavigationAction';
import { SafeAreaView } from 'react-native-safe-area-context';
import TimelineBuilder from '../../lib/TimelineBuilder/TimelineBuilder';
import Bot from '../../lib/bot';
import configToUse from '../../config/config';
import { SwitchControll } from '../../widgets/Switch';
import { Toast } from 'react-native-toast-message/lib/src/Toast';
import AlertDialog from '../../lib/utils/AlertDialog';
import { FileLogger } from 'react-native-file-logger';
import Store from '../../redux/store/configureStore';
import { logToFile } from '../../lib/utils/Logging';
import Mailer from 'react-native-mail';
import AppFonts from '../../config/fontConfig';
export default SettingsScreen = (props) => {
    const [notificationStatus, setNotificationStatus] = useState(false);
    const [loading, setLoading] = useState(false);
    const [logoutLoader, setLogoutLoader] = useState(false);
    const [deleteLoader, setDeleteLoader] = useState(false);
    const [isCorporate, setCorporateUser] = useState(false);
    const [isPrepaiduser, setPrepaidUserUser] = useState(false);
    const [balance, setBalance] = useState(null);
    const [userData, setUserData] = useState(Auth.getUserData());
    const profileImage = useRef(null);
    const netInfo = useNetInfo();
    const isNetworkConnected =
        netInfo && (netInfo.isConnected || netInfo.isInternetReachable);

    const session = useSelector((state) => state.session);
    const [pollingStatergy, setPollingStrategy] = useState(
        optionMapping[PollingStrategyTypes.automatic]
    );

    useEffect(() => {
        Notification.deviceInfo().then((info) => {
            setNotificationStatus(info?.isRegistered || false);
        });
        readPollingStrategy();
    }, []);

    useEffect(() => {
        getBalance();
        logToFile('Current network state:' + Store.getState().user.network);
        Auth.isPostPaidUser().then((isPostPaidUser) => {
            setPrepaidUserUser({ prepaidUser: !isPostPaidUser });
        });
        this.pollingListener = EventEmitter.addListener(
            PollingStrategyEvents.changed,
            readPollingStrategy
        );

        return () => {
            unregister();
        };
    }, []);

    const getBalance = () => {
        UserServices.getUserBalance().then(({ callQuota, error }) => {
            setBalance(callQuota);
            if (error === 0) {
                DeviceStorage.save(
                    CallQuota.CURRENT_BALANCE_LOCAL_KEY,
                    callQuota
                );
            }
        });
    };

    const unregister = () => {
        this.pollingListener?.remove();
    };

    const readPollingStrategy = () => {
        Settings.getPollingStrategy()
            .then((val) => {
                setPollingStrategy(optionMapping[val]);
            })
            .catch((e) => {});
    };

    const onNotificationChange = () => {
        if (notificationStatus) {
            setLoading(true);
            Notification.deregister()
                .then(() => {
                    // todo
                    setNotificationStatus(false);
                    setLoading(false);
                })
                .catch(() => {
                    // todo
                    setLoading(false);
                });
        } else {
            Notification.requestPermission();
            setLoading(false);
            setNotificationStatus(true);
            Toast.show({
                text1: 'Notification will be enabled, check back later to confirm your settings.',
                type: 'success'
            });
        }
    };

    const onProfileImageUpdate = () => {
        profileImage?.current.refreshImage();
        props.updateMyProfile?.();
    };

    const onUserDeleteAccount = async () => {
        setDeleteLoader(true);
        // await Auth.deleteUser()
        //     .then(() => {
        //         setDeleteLoader(false);
        //     })
        //     .catch((e) => {
        //         Utils.addLogEntry(e, 'Delete account Error');
        //         Toast.show({
        //             text1: 'Something went wrong. Please try again later'
        //         });
        //     });
    };

    useEffect(() => {
        if (deleteLoader) {
            setLoading(true);
        }
    }, [deleteLoader]);

    const renderTopArea = () => (
        <TouchableOpacity
            style={styles.userAreaContainer}
            onPress={() => {
                NavigationAction.push(
                    config.app.newProfileScreen
                        ? NavigationAction.SCREENS.myProfileScreenOnship
                        : NavigationAction.SCREENS.myProfileScreen,
                    {
                        userId: session.user.userId,
                        updateContactScreen: props.updateContactScreen,
                        updateMyProfile: onProfileImageUpdate
                    }
                );
            }}
        >
            <MyProfileImage
                ref={profileImage}
                uuid={session?.user?.userId}
                placeholder={images.user_image}
                style={styles.profileImage}
                placeholderStyle={styles.profileImage}
                resizeMode="cover"
                changeProfileImageBack={() => {
                    // this.changeProfileStatuBack.bind(this);
                }}
            />
            <View style={styles.nameArea}>
                <Text style={styles.name}>{session?.user?.info?.userName}</Text>
                <Text style={styles.descriptions}>My profile</Text>
            </View>
            <Icon
                name="keyboard-arrow-right"
                type="material"
                size={30}
                color={'#9C9EA7'}
                style={{ alignSelf: 'flex-end' }}
            />
        </TouchableOpacity>
    );

    const renderBalanceBar = () => {
        return (
            <View style={styles.balanceView}>
                <View>
                    <Text style={styles.balanceLable}>Balance</Text>
                </View>

                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center'
                    }}
                >
                    <Text style={styles.balanceText}>
                        ${balance != null ? balance : '-'}
                    </Text>

                    <View style={{ marginLeft: 5 }}>
                        <Icon
                            name="add"
                            type="material"
                            size={20}
                            color={balance != null ? '#0095f2' : '#0095f255'}
                            style={{ alignSelf: 'flex-end' }}
                            disabled={balance === null ? true : false}
                            disabledStyle={{ backgroundColor: '#00000000' }}
                            onPress={() => {
                                if (isNetworkConnected) {
                                    NavigationAction.push(
                                        NavigationAction.SCREENS.getCredit,
                                        {
                                            currentBalance: balance,
                                            updateCallBack: (newBalance) =>
                                                setBalance(newBalance)
                                        }
                                    );
                                }
                            }}
                        />
                    </View>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView
            style={styles.safeAreaStyle}
            keyboardShouldPersistTaps="handled"
            edges={['bottom']}
        >
            <ScrollView
                style={{
                    flex: 1,
                    margin: 18
                }}
            >
                {renderTopArea()}

                {isPrepaiduser && config.showTopUp && renderBalanceBar()}

                <Divider
                    style={{ backgroundColor: GlobalColors.itemDevider }}
                />

                <TouchableOpacity
                    style={styles.actionButtonContaner}
                    onPress={() => {
                        if (configToUse.assistandBotId) {
                            Bot.getInstalledBots().then((bots) => {
                                const targetBot = bots.find(
                                    (bot) =>
                                        bot.botId === configToUse.assistandBotId
                                );
                                if (targetBot)
                                    NavigationAction.goToBotChat({
                                        bot: targetBot,
                                        botName: targetBot?.botName,
                                        otherUserId: false,
                                        botLogoUrl: targetBot?.logoUrl,
                                        comingFromNotif: {
                                            notificationFor: 'bot',
                                            isFavorite: 0,
                                            conversationId: targetBot?.botId,
                                            botId: targetBot?.botId,
                                            userDomain: targetBot?.userDomain,
                                            onRefresh: () =>
                                                TimelineBuilder.buildTiimeline()
                                        }
                                    });
                            });
                        } else {
                            SystemBot.get(SystemBot.assistant).then(
                                (onboardingBot) => {
                                    console.log(
                                        'the onboarding bot 00',
                                        onboardingBot
                                    );
                                    NavigationAction.goToBotChat({
                                        bot: onboardingBot,
                                        botName: onboardingBot?.botName,
                                        otherUserId: false,
                                        botLogoUrl: onboardingBot?.logoUrl,
                                        comingFromNotif: {
                                            notificationFor: 'bot',
                                            isFavorite: 0,
                                            conversationId:
                                                onboardingBot?.botId,
                                            botId: onboardingBot?.botId,
                                            userDomain:
                                                onboardingBot?.userDomain,
                                            onRefresh: () =>
                                                TimelineBuilder.buildTiimeline()
                                        }
                                    });
                                }
                            );
                        }
                    }}
                >
                    <Text style={styles.menuText}>Assistant</Text>
                    <Icon
                        name="keyboard-arrow-right"
                        type="material"
                        size={30}
                        color={GlobalColors.secondaryButtonColor}
                        style={{ alignSelf: 'flex-end' }}
                    />
                </TouchableOpacity>

                <Divider
                    style={{ backgroundColor: GlobalColors.itemDevider }}
                />

                <View style={styles.actionButtonContaner}>
                    <Text style={styles.menuText}>Notifications</Text>
                    <View style={styles.statusContainer}>
                        <Text style={styles.statusText}>
                            {notificationStatus ? 'Active' : 'Disabled'}
                        </Text>
                        <SwitchControll
                            value={notificationStatus}
                            onValueChange={onNotificationChange}
                        />
                    </View>
                </View>

                <Divider
                    style={{ backgroundColor: GlobalColors.itemDevider }}
                />

                <TouchableOpacity
                    style={styles.actionButtonContaner}
                    onPress={() => {
                        NavigationAction.push(
                            NavigationAction.SCREENS.networkDetails
                        );
                    }}
                >
                    <Text style={styles.menuText}>Network</Text>
                    <View style={styles.statusContainer}>
                        <Text style={styles.statusText}>{pollingStatergy}</Text>
                        <Icon
                            name="keyboard-arrow-right"
                            type="material"
                            size={30}
                            color={GlobalColors.secondaryButtonColor}
                            style={{ alignSelf: 'flex-end' }}
                        />
                    </View>
                </TouchableOpacity>

                <Divider
                    style={{ backgroundColor: GlobalColors.itemDevider }}
                />

                <TouchableOpacity
                    style={styles.actionButtonContaner}
                    onPress={() => {
                        NavigationAction.push(
                            NavigationAction.SCREENS.securitySettings
                        );
                    }}
                >
                    <Text style={styles.menuText}>Security settings</Text>
                    <Icon
                        name="keyboard-arrow-right"
                        type="material"
                        size={30}
                        color={GlobalColors.secondaryButtonColor}
                        style={{ alignSelf: 'flex-end' }}
                    />
                </TouchableOpacity>

                <Divider
                    style={{ backgroundColor: GlobalColors.itemDevider }}
                />

                <TouchableOpacity
                    style={styles.actionButtonContaner}
                    onPress={() => {
                        NavigationAction.push(
                            NavigationAction.SCREENS.contactPendingNewReqScreen,
                            {
                                title: 'Ignored Contacts',
                                type: 'blocked_contact',
                                newRquestsAndRejectedObj: {}
                            }
                        );
                    }}
                >
                    <Text style={styles.menuText}>Ignored contacts</Text>
                    <Icon
                        name="keyboard-arrow-right"
                        type="material"
                        size={30}
                        color={GlobalColors.secondaryButtonColor}
                        style={{ alignSelf: 'flex-end' }}
                    />
                </TouchableOpacity>

                <Divider
                    style={{ backgroundColor: GlobalColors.itemDevider }}
                />

                <TouchableOpacity
                    style={styles.actionButtonContaner}
                    onPress={() => {
                        NavigationAction.push(
                            NavigationAction.SCREENS.timeZoneSettings
                        );
                    }}
                >
                    <Text style={styles.menuText}>Timezones settings</Text>
                    <Icon
                        name="keyboard-arrow-right"
                        type="material"
                        size={30}
                        color={GlobalColors.secondaryButtonColor}
                        style={{ alignSelf: 'flex-end' }}
                    />
                </TouchableOpacity>

                <Divider
                    style={{ backgroundColor: GlobalColors.itemDevider }}
                />

                <TouchableOpacity
                    style={styles.actionButtonContaner}
                    onPress={() => {
                        setLogoutLoader(true);
                        Auth.logout()
                            .catch((e) => {
                                Utils.addLogEntry(e, 'Logout Error');
                                Toast.show({
                                    text1: 'Something went wrong. Please try again later'
                                });
                            })
                            .finally(() => {
                                setLogoutLoader(false);
                            });
                    }}
                >
                    <Text
                        style={[styles.menuText, { color: GlobalColors.red }]}
                    >
                        Logout
                    </Text>
                    {logoutLoader && <ActivityIndicator size="small" />}
                </TouchableOpacity>

                <Divider
                    style={{ backgroundColor: GlobalColors.itemDevider }}
                />
            </ScrollView>
            {/* {userData?.info?.emailAddress?.includes('@frontm.com') && (
                <TouchableOpacity
                    style={[
                        styles.actionButtonContaner,
                        { paddingVertical: 0 }
                    ]}
                    onPress={() => {
                        FileLogger.getLogFilePaths().then((paths) => {
                            console.log('file paths', paths);

                            Mailer.mail(
                                {
                                    subject:
                                        'Log file ' +
                                        userData?.info?.emailAddress,
                                    recipients: ['akshaya@frontm.com'],
                                    attachments: [{ path: paths[0] }]
                                },
                                (error, event) => {
                                    console.log('file paths', error, event);
                                }
                            );
                        });
                    }}
                >
                    <Text
                        style={{
                            marginRight: 8,
                            fontSize: 10,
                            letterSpacing: -0.36,
                            color: GlobalColors.descriptionText
                        }}
                    >
                        {'Help us make the app better, Send logs >'}
                    </Text>
                </TouchableOpacity>
            )} */}
            {config.app.allowAccountDeletion && (
                <TouchableOpacity
                    disabled={isCorporate}
                    style={styles.deleteAccountButton}
                    onPress={() => {
                        AlertDialog.showCritical(
                            'Are you sure you want to delete your account?',
                            'This action cannot be undone',
                            [
                                { text: 'No' },
                                { text: 'Yes', onPress: onUserDeleteAccount }
                            ]
                        );
                    }}
                >
                    {Icons.deleteAcc({
                        color: GlobalColors.red,
                        size: 22,
                        opacity: isCorporate ? 0.5 : 1
                    })}
                    <View style={{ alignSelf: 'center', paddingLeft: 8 }}>
                        <Text
                            style={{
                                fontSize: 14,
                                color: GlobalColors.red,
                                opacity: isCorporate ? 0.5 : 1
                            }}
                        >
                            Delete your account
                        </Text>
                        {isCorporate && (
                            <Text
                                style={{
                                    color: GlobalColors.secondaryButtonColor
                                }}
                            >
                                You are not able to delete a corporate account
                            </Text>
                        )}
                    </View>
                </TouchableOpacity>
            )}
            {loading && (
                <ActivityIndicator style={styles.loader} size="large" />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    balanceLable: { color: GlobalColors.primaryColor, fontSize: 14 },
    loader: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#00000044'
    },
    deleteAccountButton: {
        backgroundColor: GlobalColors.tableItemBackground,
        paddingVertical: 18,
        paddingHorizontal: 20,
        flexDirection: 'row'
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    statusText: {
        marginRight: 8,
        fontSize: 14,
        letterSpacing: -0.36,
        color: GlobalColors.descriptionText
    },
    actionButtonContaner: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 20,
        marginLeft: 22
    },
    descriptions: {
        opacity: 0.5,
        fontSize: 12,
        letterSpacing: -0.31,
        color: GlobalColors.descriptionText
    },
    name: {
        fontSize: 18,
        letterSpacing: -0.46,
        color: GlobalColors.primaryTextColor
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
        fontSize: 15,
        flex: 1,
        letterSpacing: -0.36,
        color: GlobalColors.primaryTextColor
    },
    balanceView: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 40,
        width: '100%',
        backgroundColor: '#0095f220',
        borderRadius: 10,
        paddingLeft: 20,
        paddingRight: 12
    },
    balanceText: {
        color: GlobalColors.primaryTextColor,
        fontSize: 14
    },
    groupConfirm: {
        backgroundColor: '#ffffff',
        borderRadius: 10
    },
    groupModalInnerContainer: {
        paddingTop: 10,
        paddingBottom: 30,
        paddingHorizontal: 30
    },
    groupConfirmText: {
        fontWeight: AppFonts.BOLD,
        fontSize: 18,
        color: '#2a2d3c',
        textAlign: 'center'
    },
    closeModalContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingTop: 10,
        paddingRight: 10
    },
    confirmBtnContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 30
    },
    title: {
        fontSize: 16,
        fontWeight: AppFonts.BOLD,
        fontStyle: 'normal',
        lineHeight: 20,
        letterSpacing: 0,
        textAlign: 'center',
        color: '#44485a',
        marginTop: 5
    },
    confirmBtn: {
        backgroundColor: '#0096fb',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 5,
        marginHorizontal: 10
    },
    confirmText: {
        color: '#ffffff',
        fontSize: 14,
        textAlign: 'center'
    }
});
