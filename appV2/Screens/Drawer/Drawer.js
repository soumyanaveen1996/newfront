import React, { useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    ActivityIndicator
} from 'react-native';
import { connect } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    logout,
    reInitUserData,
    setCurrentDomain
} from '../../redux/actions/UserActions';
import _ from 'lodash';
import GlobalColors from '../../config/styles';
import {
    Auth,
    CallQuota,
    DeviceStorage,
    Network,
    Utils
} from '../../lib/capability';
import NavigationAction from '../../navigation/NavigationAction';
import AsyncStorage from '@react-native-community/async-storage';
import reduxStore from '../../redux/store/configureStore';
import DomainEvents from '../../lib/events/DomainEvents';
import EventEmitter from '../../lib/events';
import { Icon } from '@rneui/themed';
import { useState } from 'react';
import DomainNotificationsManager from '../../lib/DomainNotificationsManager/DomainNotificationsManager';
import { setAllChatsData } from '../../redux/actions/TimeLineActions';
import { FAVOURITE_BOTS } from '../Home/HomeTab/BotList';
import { NewProviderPopup } from '../Home/AppsTab/NewProviderPopup';
import UserDomainsManager from '../../lib/UserDomainsManager/UserDomainsManager';
import DomainLogo from '../../widgets/DomainLogo/DomainLogo';
import i18n from '../../config/i18n/i18n';
import { NetworkHandler, NetworkPoller } from '../../lib/network';
import { MessageQueue } from '../../lib/message';
import configToUse from '../../config/config';
import AlertDialog from '../../lib/utils/AlertDialog';
import { Toast } from 'react-native-toast-message/lib/src/Toast';
import AppFonts from '../../config/fontConfig';
import SimpleLoader from '../../widgets/SimpleLoader';

function DomainSelector({ currentDomain, domains }) {
    const [showNewDomainPopup, setShowNewDomainPopup] = useState(false);
    const [loadingDomain, setLoadingDomain] = useState(undefined);
    const handleDomainSelection = async (domain) => {
        const connection = await Network.isConnected();
        if (!connection) {
            AlertDialog.show(i18n.t('No_Network_domian_swich'));
            return;
        }
        if (domain.userDomain === currentDomain) {
            NavigationAction.toggleDrawer();
            return;
        }
        const selectedDomain = domain;
        setLoadingDomain(selectedDomain.userDomain);

        await Auth.cleanDomainData();
        await AsyncStorage.removeItem('BOT_UPDATE_TIMELINE');
        await AsyncStorage.setItem(
            'currentDomain',
            JSON.stringify(selectedDomain.userDomain)
        );
        await DeviceStorage.removeAllArrayValues(FAVOURITE_BOTS);
        await DeviceStorage.deleteItems([
            'timeline',
            'timeline_data',
            'catalog'
        ]);
        DomainNotificationsManager.markNotificationRead(domain.userDomain);
        NetworkHandler.setCheckTime(Date.now());
        NetworkPoller.stopPolling();
        reduxStore.dispatch(reInitUserData());
        reduxStore.dispatch(setAllChatsData([]));
        NavigationAction.toggleDrawer();
        NetworkHandler.clearTime();
        MessageQueue.clear();

        setLoadingDomain(undefined);
        reduxStore.dispatch(setCurrentDomain(domain.userDomain));
        EventEmitter.emit(DomainEvents.domainChanged);
        NetworkPoller.startPolling();
    };

    const renderDomainItem = ({ item: domain }) => {
        const isSelected = domain.userDomain === currentDomain;
        const hasNotification =
            (DomainNotificationsManager.domainNotificationCount(
                domain.userDomain
            ) || 0) > 0;

        return (
            <TouchableOpacity
                disabled={!configToUse.app.multiDomainSupport}
                onPress={() => handleDomainSelection(domain)}
            >
                <View style={styles.domainLogoView}>
                    <DomainLogo
                        selected={isSelected}
                        domain={domain}
                        size={50}
                        hasNotification={false}
                    />

                    <Text
                        style={
                            isSelected
                                ? styles.selectedMenuText
                                : styles.menuText
                        }
                    >
                        {domain.name}
                    </Text>
                    {hasNotification ? (
                        <View style={styles.notificationBadge} />
                    ) : null}
                    {loadingDomain === domain.userDomain && (
                        <ActivityIndicator
                            style={{ marginRight: 4 }}
                            size="small"
                        />
                    )}
                </View>
            </TouchableOpacity>
        );
    };
    const showDomainPopup = () => {
        NavigationAction.toggleDrawer();
        setShowNewDomainPopup(true);
    };

    const onCancelNewProvider = () => {
        setShowNewDomainPopup(false);
    };

    const onQRCodeSubmit = () => {};

    const onSubmit = async (newDomains) => {
        await UserDomainsManager.updateDomains(newDomains);
        handleDomainSelection(UserDomainsManager.lastDomain());
        setShowNewDomainPopup(false);
    };

    return (
        <View style={styles.drawerContainer}>
            {showNewDomainPopup ? (
                <NewProviderPopup
                    cancelNewProvider={onCancelNewProvider}
                    onSubmittingCode={onQRCodeSubmit}
                    onSubmit={onSubmit}
                />
            ) : null}

            <FlatList
                style={styles.flatlist}
                renderItem={renderDomainItem}
                data={domains}
                ListHeaderComponent={
                    <View style={styles.AccountsTitleContainer}>
                        <Text style={styles.menuTitle}>Accounts</Text>
                    </View>
                }
                ListFooterComponent={
                    configToUse.app.multiDomainSupport && (
                        <TouchableOpacity onPress={() => showDomainPopup()}>
                            <View style={styles.AddAccountLayout}>
                                <View style={styles.addAccountContainer}>
                                    <Icon
                                        type="material-community"
                                        size={25}
                                        containerStyle={styles.plusIcon}
                                        color={GlobalColors.primaryButtonColor}
                                        name="plus-circle"
                                    />
                                </View>

                                <Text style={styles.addText}>Add account</Text>
                            </View>
                        </TouchableOpacity>
                    )
                }
            />
        </View>
    );
}

function DrawerActions(props) {
    const { user } = props;
    const [balance, setBalance] = useState(null);
    const [loading, showLoader] = useState(false);

    useEffect(() => {
        UserServices.getUserBalance().then(({ callQuota, error }) => {
            setBalance(callQuota);
            if (error === 0) {
                DeviceStorage.save(
                    CallQuota.CURRENT_BALANCE_LOCAL_KEY,
                    callQuota
                );
            }
        });
    }, []);

    return (
        <View style={styles.drawerView}>
            <View style={styles.devider} />
            <TouchableOpacity
                style={styles.drawerItmeContainer}
                onPress={() => {
                    NavigationAction.toggleDrawer();
                    NavigationAction.push(
                        configToUse.app.newProfileScreen
                            ? NavigationAction.SCREENS.myProfileScreenOnship
                            : NavigationAction.SCREENS.myProfileScreen,

                        {
                            userId: user.userId
                        }
                    );
                }}
            >
                <Icon
                    type="material-community"
                    size={25}
                    containerStyle={{
                        padding: 0,
                        alignContent: 'center'
                    }}
                    color={GlobalColors.headerGreyBtn}
                    name="account-circle-outline"
                />
                <Text style={[styles.menuText]}>My Profile</Text>
            </TouchableOpacity>
            {configToUse.showPSTNCalls && (
                <TouchableOpacity
                    style={styles.drawerItmeContainer}
                    onPress={() => {
                        NavigationAction.toggleDrawer();
                        NavigationAction.push(
                            NavigationAction.SCREENS.getCredit,
                            {
                                currentBalance: balance,
                                updateCallBack: (newBalance) =>
                                    setBalance(newBalance)
                            }
                        );
                    }}
                >
                    <Icon
                        type="material-community"
                        size={25}
                        containerStyle={{
                            padding: 0,
                            alignContent: 'center'
                        }}
                        color={GlobalColors.headerGreyBtn}
                        name="wallet-outline"
                    />
                    <Text style={[styles.menuText]}>Balance</Text>
                    <Text
                        style={[
                            styles.menuText,
                            {
                                alignSelf: 'flex-end',
                                color: GlobalColors.primaryColor
                            }
                        ]}
                    >
                        ${balance != null ? balance : '-'}
                    </Text>
                </TouchableOpacity>
            )}
            <TouchableOpacity
                style={styles.drawerItmeContainer}
                onPress={() => {
                    NavigationAction.toggleDrawer();
                    NavigationAction.push(NavigationAction.SCREENS.settings);
                }}
            >
                <Icon
                    type="simple-line-icon"
                    size={25}
                    containerStyle={{
                        padding: 0,
                        alignContent: 'center'
                    }}
                    color={GlobalColors.headerGreyBtn}
                    name="settings"
                />
                <Text style={[styles.menuText]}>Settings</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.drawerItmeContainer}
                disabled={loading}
                onPress={() => {
                    showLoader(true);

                    Auth.logout()
                        .then(() => {
                            reduxStore.dispatch(setCurrentDomain(null));
                            UserDomainsManager.reset();
                        })
                        .catch((e) => {
                            Utils.addLogEntry(e, 'Logout Error');
                            Toast.show({
                                text1: 'Something went wrong. Please try agin.'
                            });
                        })
                        .finally(() => {
                            showLoader(false);
                        });
                }}
            >
                <Icon
                    type="simple-line-icon"
                    size={25}
                    containerStyle={{
                        padding: 0,
                        alignContent: 'center'
                    }}
                    style={{ transform: [{ rotateY: '180deg' }] }}
                    color={GlobalColors.formDelete}
                    name="logout"
                />
                <Text
                    style={[
                        styles.menuText,
                        { color: GlobalColors.formDelete }
                    ]}
                >
                    Logout
                </Text>
                {loading && (
                    <SimpleLoader style={{ marginRight: 12 }} size="small" />
                )}
            </TouchableOpacity>
        </View>
    );
}

function Drawer({ domain, user, domains }) {
    const insets = useSafeAreaInsets();
    return (
        <View
            style={{
                width: '100%',
                height: '100%',
                paddingTop: insets.top,
                paddingBottom: insets.bottom
            }}
        >
            <View style={styles.DrawerViewContainer1}>
                <View style={styles.DrawerViewContainer2}>
                    <DomainSelector
                        user={user}
                        domains={domains}
                        currentDomain={domain}
                    />
                </View>
                <View style={styles.DrawerViewContainer3}>
                    <DrawerActions user={user} />
                </View>
            </View>
        </View>
    );
}

const mapStateToProps = (state) => ({
    user: state.session.user,
    domain: state.user.currentDomain,
    domains: state.user.userDomains,
    notificationCount: state.user.notificationCount,
    userState: state.user
});

const mapDispatchToProps = (dispatch) => ({
    logout: () => dispatch(logout())
});

export default connect(mapStateToProps, mapDispatchToProps, null, {
    forwardRef: true
})(Drawer);

const styles = StyleSheet.create({
    DrawerViewContainer3: {
        width: '100%',
        height: 245,
        flexDirection: 'column-reverse'
    },
    DrawerViewContainer2: {
        width: '100%',
        flex: 1
    },
    DrawerViewContainer1: {
        flex: 1,
        flexDirection: 'column'
    },
    domainLogoView: {
        height: 60,
        width: '100%',
        paddingHorizontal: 26,
        paddingVertical: 5,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center'
    },
    notificationBadge: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: 'red',
        position: 'absolute',
        top: 25,
        left: 15
    },
    drawerContainer: {
        height: '100%',
        width: '100%'
    },
    flatlist: {
        paddingTop: 40,
        flex: 1
    },
    AccountsTitleContainer: {
        width: '100%',
        paddingHorizontal: 32,
        paddingVertical: 5,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center'
    },
    AddAccountLayout: {
        height: 150,
        width: '100%',
        paddingHorizontal: 26,
        paddingVertical: 5,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'flex-start'
    },
    addAccountContainer: {
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center'
    },
    plusIcon: {
        padding: 0,
        alignContent: 'center'
    },
    devider: {
        with: '100%',
        height: 2,
        backgroundColor: GlobalColors.itemDevider
    },
    drawerView: {
        flexDirection: 'column',
        paddingLeft: 40,
        paddingBottom: 28
    },
    drawerItmeContainer: {
        flexDirection: 'row',
        width: '100%',
        marginTop: 28,
        alignItems: 'center'
    },
    balanceLable: { color: '#44485a', fontSize: 14 },
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
        backgroundColor: '#f4f4f4',
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
        color: GlobalColors.menuSubLableDescription
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
    menuTitle: {
        fontSize: 17,
        flex: 1,
        letterSpacing: -0.36,
        color: GlobalColors.chatTitle,
        fontWeight: AppFonts.BOLD,
        marginLeft: 0
    },
    selectedMenuText: {
        fontSize: 14,
        flex: 1,
        letterSpacing: -0.36,
        color: GlobalColors.chatTitle,
        fontWeight: AppFonts.BOLD,
        marginLeft: 28
    },
    menuText: {
        fontSize: 14,
        flex: 1,
        letterSpacing: -0.36,
        color: GlobalColors.chatTitle,
        marginLeft: 28
    },
    addText: {
        height: 50,
        lineHeight: 50,
        fontSize: 15,
        flex: 1,
        letterSpacing: -0.36,
        marginLeft: 28,
        color: GlobalColors.primaryButtonColor
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
        color: '#0095f2',
        fontSize: 14
    },
    domainTitle: {
        color: 'gray',
        fontSize: 18
    },
    selectedDomainTitle: {
        color: '#0095f2',
        fontSize: 18
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
    },
    domainImage: {
        width: 50,
        height: 50,
        borderRadius: 15
    },
    selectedDomainImage: {
        width: 50,
        height: 50,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: 'rgb(99, 141, 255)',
        shadowColor: 'rgb(99, 141, 255)',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 10
    }
});
