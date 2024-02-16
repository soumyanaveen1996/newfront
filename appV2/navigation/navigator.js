import * as React from 'react';
import { Image, View } from 'react-native';

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Icon } from '@rneui/themed';
import NavigationAction from './NavigationAction';
import Launch from '../Screens/Launch/Launch';
import { SwiperScreen } from '../Screens/Auth/Swiper';
import ConfirmOtp from '../Screens/Auth/Login/ConfirmOtp';
import SignupScreen from '../Screens/Auth/Signup/SignupScreen';
import { ConfirmationScreen } from '../Screens/Auth/ConfirmationScreen';
import { SendCodePassword } from '../Screens/Auth/ResetPassword';
import ResetPassword from '../Screens/Auth/ResetPassword/ResetPassword';
import { ResendCodeScreen } from '../Screens/Auth/ResendCodeScreen';
import {
    MainScreenTabs,
    BotChatScreenDrawer,
    PeopleChatScreenDrawer,
    ChannelChatScreenDrawer,
    MainScreenChat,
    MainScreenDrawer
} from './homenavigator';
import MeetingRoom from '../Screens/Calls/MeetingRoom/MeetingRoom';
import { NonConversationalChat } from '../Screens/Chat/ChatComponents/NonConversationalControl';
import WebViewScreen from '../Screens/WebViewScreen/WebViewScreen';
import BotInfoScreen from '../Screens/BotInfoScreen/BotInfoScreen';
import i18n from '../config/i18n/i18n';
import CallSummary from '../Screens/Calls/CallSummary/CallSummary';
import Dialler from '../Screens/Calls/Dialler/Dialler';
import GetCredit from '../Screens/GetCredit/GetCredit';
import SettingsScreen from '../Screens/Profile/Settings';
import MyProfileScreen from '../Screens/Profile/MyProfileScreen';
import MyProfileScreenOnship from '../Screens/Profile/MyProfileScreenOnship';
import AddRoleScreen from '../Screens/Profile/AddRoleScreen';
import AddressScreen from '../Screens/Profile/AddressScreen';
import ChangePassword from '../Screens/Profile/SecuritySettings/ChangePassword';
import ConfirmPassword from '../Screens/Profile/SecuritySettings/ConfirmPassword';
import TwoFactorAuth from '../Screens/Profile/SecuritySettings/TwoFactor';
import TwoFactorScan from '../Screens/Profile/SecuritySettings/TwoFactorScan';
import SecuritySettings from '../Screens/Profile/SecuritySettings/Settings';
import TimeZoneSettings from '../Screens/Profile/TimeZoneSettings';
import FullScreenMessageScreen from '../Screens/Chat/ChatComponents/FullScreenMessage/FullScreenMessageScreen';
import SearchAndSelect from '../Screens/Chat/ChatComponents/Widgets/SearchAndSelect';
import JitsiRoom from '../Screens/Calls/JitsiRoom/JitsiRoom';
import ContactDetailsScreen from '../Screens/Contacts/ContactDetailsScreen';
import NewContactScreen from '../Screens/Contacts/NewContactScreen';
import ContactPendingNewReqScreen from '../Screens/Contacts/ContactComponents/ContactPendingNewReqScreen';

import BotChat from '../Screens/Chat/BotChat';
import PeopleChat from '../Screens/Chat/PeopleChat';
import { ChannelChat } from '../Screens/Chat';
import NewChat from '../Screens/Chat/GroupChat/newChat';
import NewGroup from '../Screens/Chat/GroupChat/newGroup';
import CreateNewGroup from '../Screens/Chat/GroupChat/createNewGroup';
import PermissionRequest from '../Screens/Home/HomeTab/PermissionRequest';
import { TouchableOpacity } from 'react-native';
import { Text } from 'react-native';
import Icons from '../config/icons';
import {
    useChatHeaderTitle,
    userChatRightHeader,
    userBotRightHeader
} from './HeaderButtons';
import images from '../config/images';
import GlobalColors from '../config/styles';
import { NetworkDetails } from '../Screens/Profile/NetworkDetails';
import AddressBookScreen from '../Screens/Contacts/AddressBookScreen';
import LocationPicker from '../Screens/Chat/LocationPicker/LocationPicker';
import { MapView } from '../Screens/Chat/ChatComponents/MapView';
import LocationViewer from '../Screens/Chat/ChatComponents/LocationViewer/LocationViewer';
import ManageContacts from '../Screens/Contacts/ManageContacts';
import EmailInviteScreen from '../Screens/Contacts/EmailInviteScreen';
import SessionExpiry from '../Screens/Home/HomeTab/SessionExpiry';
import { StackActions } from 'react-navigation';
import BotListScreen from '../Screens/Home/AppsTab/BotListScreen/BotListScreen';
import { Form2 } from '../Screens/Chat/ChatComponents/Form2Message';
import Form2MessageScreen from '../Screens/Chat/ChatComponents/Form2Message/Form2MessageScreen';
import ImageViewer from '../Screens/Chat/ChatComponents/ImageViewer/ImageViewer';
import BarcodeScanner from '../Screens/BarcodeScanner/BarcodeScanner';
import VideoRecorder from '../Screens/VideoRecorder/VideoRecorder';
import configToUse from '../config/config';
import HomeTab from '../Screens/Home/HomeTab/HomeTab';
import SearchAndSelectForLookup from '../Screens/Chat/ChatComponents/Widgets/SearchAndSelectForLookup';
import { HeaderLeftIcon } from '../widgets/Header';
import GalleryImageViewer from '../Screens/ImageViewer/GalleryImageViewer';
import AppFonts from '../config/fontConfig';

const AppStack = createNativeStackNavigator();

export default Navigator = ({ initialProps }) => {
    console.log('Navigatore : ', initialProps);
    return (
        <AppStack.Navigator
            initialRouteName={NavigationAction.SCREENS.launch}
            screenOptions={({ route, navigation }) => ({
                headerBackTitleVisible: false,
                headerTitleAlign: 'center',
                headerTintColor: GlobalColors.white,
                title: route.params?.title,

                animation: 'slide_from_right',
                headerStyle: {
                    backgroundColor: GlobalColors.toolbarBackground
                },
                headerTitleStyle: {
                    color: GlobalColors.white,
                    fontWeight: AppFonts.BOLD,
                    fontSize: 14
                }
            })}
        >
            <AppStack.Screen
                options={{ headerShown: false }}
                name={NavigationAction.SCREENS.launch}
                component={Launch}
            />
            <AppStack.Screen
                options={{ headerShown: false }}
                name={NavigationAction.SCREENS.drawer}
                initialParams={{ initialProps: initialProps }}
                component={MainScreenDrawer}
            />

            {/* ---------- login related screens ----------- */}
            <AppStack.Screen
                name={NavigationAction.SCREENS.swiperScreen}
                component={SwiperScreen}
                options={{ headerShown: false }}
            />
            <AppStack.Screen
                name={NavigationAction.SCREENS.confirmOtp}
                component={ConfirmOtp}
                options={{ title: 'Confirm OTP' }}
            />

            <AppStack.Screen
                name={NavigationAction.SCREENS.signupScreen}
                component={SignupScreen}
                options={{ headerShown: false }}
            />
            <AppStack.Screen
                name={NavigationAction.SCREENS.confirmationScreen}
                component={ConfirmationScreen}
                options={{ title: 'Confirm Code' }}
            />
            <AppStack.Screen
                name={NavigationAction.SCREENS.resetPassword}
                component={ResetPassword}
                options={{ headerShown: false }}
            />
            <AppStack.Screen
                name={NavigationAction.SCREENS.sendCodePassword}
                component={SendCodePassword}
                options={{ headerShown: false }}
            />
            <AppStack.Screen
                name={NavigationAction.SCREENS.resendCodeScreen}
                component={ResendCodeScreen}
                options={{ title: 'Resend Code' }}
            />

            <AppStack.Group
                screenOptions={({ route, navigation }) => ({
                    animation: 'slide_from_right'
                })}
            >
                <AppStack.Screen
                    name={NavigationAction.SCREENS.bot}
                    component={BotChat}
                    options={({ route }) => ({
                        // title: route.params.bot?.botName,
                        animation: 'slide_from_right',
                        headerTitle: () => useChatHeaderTitle(route.params),
                        headerTitleAlign: 'left',
                        headerRight: () => userBotRightHeader(route.params)
                    })}
                />
                <AppStack.Screen
                    name={NavigationAction.SCREENS.nonConversationalChat}
                    component={NonConversationalChat}
                />
                <AppStack.Screen
                    name={NavigationAction.SCREENS.fullScreenMessage}
                    options={({ route }) => ({
                        animation: 'slide_from_right',
                        headerTitle: () => useChatHeaderTitle(route.params),
                        headerTitleAlign: 'left'
                    })}
                    component={FullScreenMessageScreen}
                />
                <AppStack.Screen
                    name={NavigationAction.SCREENS.form2}
                    component={Form2MessageScreen}
                />
                <AppStack.Screen
                    name={NavigationAction.SCREENS.imageViewer}
                    component={ImageViewer}
                    options={{ title: 'Image' }}
                />
            </AppStack.Group>

            <AppStack.Screen
                name={NavigationAction.SCREENS.peopleChat}
                component={PeopleChat}
                options={({ route }) => ({
                    headerRight: () => userChatRightHeader(route.params),
                    headerTitle: () => useChatHeaderTitle(route.params),
                    headerTitleAlign: 'left'
                })}
            />
            <AppStack.Screen
                name={NavigationAction.SCREENS.channelChat}
                component={ChannelChat}
                options={({ route }) => ({
                    headerRight: () => userBotRightHeader(route.params),
                    headerTitle: () => useChatHeaderTitle(route.params),
                    headerTitleAlign: 'left'
                })}
            />

            <AppStack.Screen
                name={NavigationAction.SCREENS.meetingRoom}
                component={MeetingRoom}
                options={{ headerShown: false }}
            />

            <AppStack.Screen
                name={NavigationAction.SCREENS.webview}
                component={WebViewScreen}
                options={{ headerShown: false }}
            />

            <AppStack.Screen
                name={NavigationAction.SCREENS.botInfoScreen}
                component={BotInfoScreen}
                options={{
                    title: i18n.t('Bot_Store'),
                    animation: 'slide_from_right'
                }}
            />
            <AppStack.Screen
                name={NavigationAction.SCREENS.callSummary}
                component={CallSummary}
                options={{ title: 'Call Summary' }}
            />
            <AppStack.Screen
                name={NavigationAction.SCREENS.dialler}
                component={Dialler}
                options={{ headerShown: false }}
            />
            <AppStack.Screen
                name={NavigationAction.SCREENS.getCredit}
                component={GetCredit}
                options={{ title: i18n.t('Top_Up') }}
            />
            <AppStack.Screen
                name={NavigationAction.SCREENS.myProfileScreen}
                component={MyProfileScreen}
                options={{ title: null, headerShadowVisible: false }}
            />
            <AppStack.Screen
                name={NavigationAction.SCREENS.myProfileScreenOnship}
                component={MyProfileScreenOnship}
                options={({ route }) => ({
                    title: '',
                    headerTintColor: GlobalColors.primaryTextColor,
                    headerStyle: {
                        backgroundColor: GlobalColors.appBackground
                    },
                    headerShadowVisible: false,

                    headerRight: () => {},
                    headerLeft: () => (
                        <View style={{ alignContent: 'center' }}>
                            <HeaderLeftIcon
                                color={GlobalColors.primaryColor}
                                onPress={route.params?.onBack}
                            />
                        </View>
                    )
                })}
            />
            <AppStack.Screen
                name={NavigationAction.SCREENS.addRoleScreen}
                component={AddRoleScreen}
                options={({ route }) => ({
                    title: 'Add your position or role',
                    headerRight: () => {},
                    headerLeft: () => (
                        <View style={{ alignContent: 'center' }}>
                            <HeaderLeftIcon onPress={route.params?.onBack} />
                        </View>
                    )
                })}
            />
            <AppStack.Screen
                name={NavigationAction.SCREENS.addressScreen}
                component={AddressScreen}
                options={({ route }) => ({
                    title: 'Address',
                    headerRight: () => {},
                    headerLeft: () => (
                        <View style={{ alignContent: 'center' }}>
                            <HeaderLeftIcon onPress={route.params?.onBack} />
                        </View>
                    )
                })}
            />
            <AppStack.Screen
                name={NavigationAction.SCREENS.settings}
                component={SettingsScreen}
                options={{ title: i18n.t('settings') }}
            />
            <AppStack.Screen
                name={NavigationAction.SCREENS.securitySettings}
                component={SecuritySettings}
                options={{ title: 'Security settings' }}
            />
            <AppStack.Screen
                name={NavigationAction.SCREENS.timeZoneSettings}
                component={TimeZoneSettings}
                options={{ title: 'Timezone settings' }}
            />
            <AppStack.Screen
                name={NavigationAction.SCREENS.changePassword}
                component={ChangePassword}
                options={{ title: 'Change password' }}
            />
            <AppStack.Screen
                name={NavigationAction.SCREENS.confirmPassword}
                component={ConfirmPassword}
                options={{ title: 'Confirm password' }}
            />
            <AppStack.Screen
                name={NavigationAction.SCREENS.twoFactorAuth}
                component={TwoFactorAuth}
                options={{ title: 'Two-factor authentication' }}
            />
            <AppStack.Screen
                name={NavigationAction.SCREENS.twoFactorScan}
                component={TwoFactorScan}
                options={{ title: i18n.t('Two-factor authentication') }}
            />

            <AppStack.Screen
                name={NavigationAction.SCREENS.searchAndSelect}
                component={SearchAndSelect}
            />
            <AppStack.Screen
                name={NavigationAction.SCREENS.searchAndSelectForLookup}
                component={SearchAndSelectForLookup}
            />
            <AppStack.Screen
                options={{ headerShown: false }}
                name={NavigationAction.SCREENS.jitsi}
                component={JitsiRoom}
            />
            <AppStack.Screen
                name={NavigationAction.SCREENS.contactDetailsScreen}
                options={({ route }) => ({
                    title: null,
                    headerTintColor: GlobalColors.primaryTextColor,
                    headerStyle: {
                        backgroundColor: GlobalColors.appBackground
                    },
                    headerShadowVisible: false,
                    headerRight: () =>
                        route.params.contact.contactType === 'local' ? (
                            <Icon
                                name="edit"
                                color={GlobalColors.frontmLightBlue}
                                onPress={route.params.onEditClick}
                            />
                        ) : null
                })}
                component={ContactDetailsScreen}
            />
            <AppStack.Screen
                name={NavigationAction.SCREENS.newContactScreen}
                component={NewContactScreen}
            />
            <AppStack.Screen
                name={NavigationAction.SCREENS.contactPendingNewReqScreen}
                options={({ route }) => ({
                    title: route.params?.title
                        ? route.params.title
                        : i18n.t('Contacts')
                })}
                component={ContactPendingNewReqScreen}
            />

            <AppStack.Screen
                options={{ title: i18n.t('New_chat') }}
                name={NavigationAction.SCREENS.newChat}
                component={NewChat}
            />
            <AppStack.Screen
                name={NavigationAction.SCREENS.newGroup}
                component={NewGroup}
                options={({ route }) => ({
                    title: 'New Group',
                    headerRight: () => (
                        <TouchableOpacity
                            accessibilityLabel="new group Icon"
                            testID="new-group-icon"
                            onPress={route.params?.createNewGroup}
                        >
                            <Text
                                style={{
                                    fontWeight: AppFonts.BOLD,
                                    fontSize: 14,
                                    color: route.params.isGroupCreate
                                        ? GlobalColors.white
                                        : '#c0c3cf'
                                }}
                            >
                                Done
                            </Text>
                        </TouchableOpacity>
                    ),
                    headerLeft: () => (
                        <View style={{ alignContent: 'center' }}>
                            <HeaderLeftIcon onPress={route.params?.onBack} />
                        </View>
                    )
                })}
            />
            <AppStack.Screen
                name={NavigationAction.SCREENS.createNewGroup}
                component={CreateNewGroup}
                options={({ route }) => ({
                    title:
                        route.params?.isFromInfo || route.params?.isGroupEdit
                            ? null
                            : 'New Group',
                    headerRight: () =>
                        route.params?.isOwner || !route.params?.isFromInfo ? (
                            <TouchableOpacity
                                accessibilityLabel="Call Icon"
                                testID="call-icon"
                                onPress={
                                    route.params?.isGroupCreate
                                        ? route.params?.isGroupEdit
                                            ? route.params?.saveGroup
                                            : route.params?.createNewGroup
                                        : null
                                }
                            >
                                <Text
                                    style={{
                                        fontWeight: AppFonts.BOLD,
                                        fontSize: 14,
                                        color: route.params.isGroupCreate
                                            ? GlobalColors.white
                                            : '#c0c3cf'
                                    }}
                                >
                                    {route.params?.isGroupEdit
                                        ? 'Save'
                                        : 'Create'}
                                </Text>
                            </TouchableOpacity>
                        ) : null,
                    headerLeft: () => (
                        <View style={{ alignContent: 'center' }}>
                            <HeaderLeftIcon onPress={route.params?.onBack} />
                        </View>
                    )
                })}
            />
            <AppStack.Screen
                options={({ route }) => ({
                    headerBackVisible: false,
                    headerLeft: () => null,
                    headerShown: route.params.showToolbar,
                    headerTitle: () => {
                        return (
                            <View style={{ alignSelf: 'center' }}>
                                <Image
                                    source={images.frontm_header_logo}
                                    style={{ alignSelf: 'center' }}
                                    resizeMode="contain"
                                />
                            </View>
                        );
                    }
                })}
                name={NavigationAction.SCREENS.PermissionRequest}
                component={PermissionRequest}
            />
            <AppStack.Screen
                name={NavigationAction.SCREENS.networkDetails}
                component={NetworkDetails}
                options={{ title: 'Network' }}
            />
            <AppStack.Screen
                options={({ route }) => ({
                    title: route.params.title,
                    headerRight: () => (
                        <TouchableOpacity
                            accessibilityLabel="Call Icon"
                            testID="call-icon"
                            // eslint-disable-next-line max-len
                            onPress={
                                route.params.isContactSelected &&
                                route.params.importContact
                            }
                        >
                            <Text
                                style={[
                                    {
                                        fontWeight: AppFonts.BOLD,
                                        fontSize: 14
                                    },
                                    {
                                        color: route.params.isContactSelected
                                            ? GlobalColors.white
                                            : '#c0c3cf'
                                    }
                                ]}
                            >
                                Done
                            </Text>
                        </TouchableOpacity>
                    )
                })}
                name={NavigationAction.SCREENS.addressBookScreen}
                component={AddressBookScreen}
            />
            <AppStack.Screen
                name={NavigationAction.SCREENS.locationPicker}
                component={LocationPicker}
            />
            <AppStack.Screen
                name={NavigationAction.SCREENS.locationViewr}
                component={LocationViewer}
            />
            <AppStack.Screen
                options={({ route }) => ({
                    title:
                        route.params && route.params.title
                            ? route.params.title
                            : i18n.t('New_chat')
                })}
                name={NavigationAction.SCREENS.manageContacts}
                component={ManageContacts}
            />
            <AppStack.Screen
                name={NavigationAction.SCREENS.contactEmailInviteScreen}
                component={EmailInviteScreen}
            />
            <AppStack.Screen
                name={NavigationAction.SCREENS.sessionExpiry}
                component={SessionExpiry}
                options={{ headerShown: false }}
            />
            <AppStack.Screen
                name={NavigationAction.SCREENS.botListScreen}
                options={{ title: 'Catalog' }}
                component={BotListScreen}
            />
            <AppStack.Screen
                options={{ title: '' }}
                name={NavigationAction.SCREENS.barCodeScanner}
                component={BarcodeScanner}
            />
            <AppStack.Screen
                name={NavigationAction.SCREENS.videoRecorder}
                component={VideoRecorder}
            />
            <AppStack.Screen
                options={{ title: '' }}
                name={NavigationAction.SCREENS.GalleryImageViewer}
                component={GalleryImageViewer}
            />
        </AppStack.Navigator>
    );
};
