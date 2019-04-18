import React from 'react';
import { View, Image, StatusBar } from 'react-native';
import {
    Scene,
    Router,
    Lightbox,
    ActionConst,
    Actions,
    Tabs,
    Stack,
    Text
} from 'react-native-router-flux';
import { LoginScreen } from '../components/Login';
import { MainScreen, ConversationList } from '../components/MainScreen';
import {
    BotChat,
    PeopleChat,
    FavoriteMessages,
    ChannelChat
} from '../components/ChatBotScreen';
import { InfoPopup } from '../components/InfoPopup';
import {
    ContactsPicker,
    ContactDetailsScreen,
    SearchUsers
} from '../components/ContactsPicker';
import NewChatContacts from '../components/NewChat/NewChatContacts';
import NewChatChannels from '../components/NewChat/NewChatChannels';
import NewChatBots from '../components/NewChat/NewChatBots';
import NewCallContacts from '../components/NewChat/NewCallContacts';
import NewCallDialler from '../components/NewChat/NewCallDialler';
import { Slider } from '../components/Slider';
import { Launch } from '../components/Launch';
import I18n from '../config/i18n/i18n';
import WebViewScreen from '../components/WebViewScreen/WebViewScreen';
import { BotListScreen } from '../components/BotListScreen';
import { BotStoreScreen } from '../components/BotStoreScreen';
import { BotFilter } from '../components/BotFilter';
import { BarcodeScanner } from '../components/BarcodeScanner';
import { MapView } from '../components/MapView';
import { Form2 } from '../components/Form2Message';
import { ImageViewer } from '../components/ImageViewer';
import { SNRChart } from '../components/SNRChart';
import { LocationPicker } from '../components/LocationPicker';
import { VideoRecorder } from '../components/VideoRecorder';
import { FormPopup } from '../components/FormPopup';
import { ChannelsList } from '../components/ChannelsList';
import ChannelsFilter from '../components/ChannelsList/ChannelsFilter';
import NewChannels from '../components/ChannelsList/NewChannels';
import AddContacts from '../components/ChannelsList/AddContacts';
import ManageContacts from '../components/ChannelsList/ManageContacts';
import RequestsScreen from '../components/ChannelsList/RequestsScreen';
import SelectTeam from '../components/ChannelsList/SelectTeam';
import ChannelAdminScreen from '../components/ChannelsList/ChannelAdminScreen';
import ROUTER_SCENE_KEYS from './RouterSceneKeyConstants';
import { Phone } from '../components/Phone';
import { Dialler } from '../components/Dialler';
import Config from './config';
import { SignupScreen } from '../components/Signup';
import { SwiperScreen } from '../components/Swiper';
import ConfirmationScreen from '../components/ConfirmationScreen/ConfirmationScreen';
import { ResendCodeScreen } from '../components/ResendCodeScreen';
import { TabIcon, TabIconTop } from '../components/TabIcon';
import EventEmitter, { AuthEvents } from '../lib/events';
import { Network } from '../lib/capability';
import NavHandler from '../components/NavigationHandler/NavHandler';
import CallSummary from '../components/CallSummary/CallSummary';
import CustomTab from '../components/CustomTab/CustomTab';
import GlobalColors from '../config/styles';
import BotInfoScreen from '../components/BotStoreScreen/BotInfoScreen/BotInfoScreen';
import AddressBookScreen from '../components/ContactsPicker/AddressBookScreen';
import { Multiselection } from '../components/Multiselection';
import MyProfileScreen from '../components/ContactsPicker/MyProfileScreen';
import SetChannelOwner from '../components/ChannelsList/SetChannelOwner';
import NewPhoneBookContacts from '../components/NewChat/NewPhoneBookContacts';
import DialPadButton from '../components/NewChat/DialPadButton';
import NewContactScreen from '../components/ContactsPicker/NewContactScreen';
import ResetPassword from '../components/ResetPassword/ResetPassword';
import SendCodePassword from '../components/ResetPassword/SendCodePassword';

StatusBar.setBarStyle('light-content', true);

class MainRouter extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            network: null,
            networkStyle: Config.navBar.headerStyle
        };
    }

    render() {
        return (
            <NavHandler>
                <Router>
                    <Lightbox>
                        <Scene>
                            <Scene
                                key={ROUTER_SCENE_KEYS.launch}
                                component={Launch}
                                hideNavBar
                                initial
                            />
                            <Scene key={ROUTER_SCENE_KEYS.lightbox} hideNavBar>
                                <Scene
                                    key={ROUTER_SCENE_KEYS.main}
                                    headerStyle={Config.navBar.headerStyle}
                                    headerTintColor={
                                        Config.navBar.navigationBarTintColor
                                    }
                                    headerTitleStyle={Config.navBar.titleStyle}
                                >
                                    <Scene
                                        key={ROUTER_SCENE_KEYS.swiperScreen}
                                        component={SwiperScreen}
                                        hideNavBar
                                    />
                                    <Scene
                                        key={ROUTER_SCENE_KEYS.loginScreen}
                                        title={I18n.t('FrontM')}
                                        component={LoginScreen}
                                        hideNavBar
                                    />
                                    <Scene
                                        key={ROUTER_SCENE_KEYS.signupScreen}
                                        component={SignupScreen}
                                        hideNavBar
                                    />
                                    <Scene
                                        key={
                                            ROUTER_SCENE_KEYS.confirmationScreen
                                        }
                                        component={ConfirmationScreen}
                                        hideNavBar
                                    />
                                    <Scene
                                        key={ROUTER_SCENE_KEYS.resetPassword}
                                        component={ResetPassword}
                                        hideNavBar
                                    />
                                    <Scene
                                        key={ROUTER_SCENE_KEYS.sendCodePassword}
                                        component={SendCodePassword}
                                        hideNavBar
                                    />
                                    <Scene
                                        key={ROUTER_SCENE_KEYS.resendCodeScreen}
                                        component={ResendCodeScreen}
                                        hideNavBar
                                    />
                                    <Tabs
                                        key={ROUTER_SCENE_KEYS.tabBar}
                                        tabBarStyle={{
                                            backgroundColor: '#ffffff',
                                            height: 60
                                        }}
                                        swipeEnabled={true}
                                        animationEnabled={true}
                                        showLabel={false}
                                        hideNavBar
                                    >
                                        <Scene
                                            key={ROUTER_SCENE_KEYS.homeMain}
                                            titleScreen={I18n.t('Home')}
                                            imageSource={require('../images/tabbar-home/tabbar-home.png')}
                                            imageSelected={require('../images/tabbar-home-active/tabbar-home-active.png')}
                                            icon={TabIcon}
                                            initial={true}
                                        >
                                            <Scene
                                                key={ROUTER_SCENE_KEYS.timeline}
                                                component={MainScreen}
                                                title={I18n.t('FrontM')}
                                                type="reset"
                                            />
                                        </Scene>
                                        <Scene
                                            key={ROUTER_SCENE_KEYS.contactsMain}
                                            titleScreen={I18n.t('Contacts')}
                                            imageSource={require('../images/tabbar-contacts/tabbar-contacts.png')}
                                            imageSelected={require('../images/tabbar-contacts-active/tabbar-contacts-active.png')}
                                            icon={TabIcon}
                                        >
                                            <Scene
                                                key={
                                                    ROUTER_SCENE_KEYS.addContacts
                                                }
                                                component={ContactsPicker}
                                                title={I18n.t('Contacts')}
                                                type="push"
                                                back
                                            />
                                        </Scene>
                                        <Scene
                                            key={ROUTER_SCENE_KEYS.channelsMenu}
                                            titleScreen={I18n.t('Channels')}
                                            imageSource={require('../images/tabbar-channels/tabbar-channels.png')}
                                            imageSelected={require('../images/tabbar-channels-active/tabbar-channels-active.png')}
                                            icon={TabIcon}
                                        >
                                            <Scene
                                                key={
                                                    ROUTER_SCENE_KEYS.channelsList
                                                }
                                                component={ChannelsList}
                                                title={I18n.t('Channels')}
                                                type="push"
                                                back
                                            />
                                        </Scene>

                                        <Scene
                                            key={
                                                ROUTER_SCENE_KEYS.marketplaceMenu
                                            }
                                            titleScreen={I18n.t('Bot_Store')}
                                            imageSource={require('../images/tabbar-marketplace/tabbar-marketplace.png')}
                                            imageSelected={require('../images/tabbar-marketplace-active/tabbar-marketplace-active.png')}
                                            icon={TabIcon}
                                        >
                                            <Scene
                                                key={ROUTER_SCENE_KEYS.botStore}
                                                component={BotStoreScreen}
                                                title={I18n.t('Bot_Store')}
                                                type="push"
                                            />
                                        </Scene>
                                    </Tabs>
                                    <Tabs
                                        key={ROUTER_SCENE_KEYS.tabBarChat}
                                        tabBarStyle={{
                                            backgroundColor: 'rgb(0,189,242)',
                                            height: 50
                                        }}
                                        swipeEnabled={true}
                                        animationEnabled={true}
                                        showLabel={false}
                                        tabBarPosition="top"
                                        showIcon={true}
                                        title="New Chat"
                                        navBarButtonColor="rgba(22, 175, 239, 1)"
                                        titleStyle={{ color: 'black' }}
                                        // hideNavBar
                                    >
                                        <Scene
                                            key={
                                                ROUTER_SCENE_KEYS.contactsMainChat
                                            }
                                            titleScreen={I18n.t('Contacts')}
                                            imageSource={require('../images/tabbar-contacts/tabbar-contacts.png')}
                                            imageSelected={require('../images/tabbar-contacts-active/tabbar-contacts-active.png')}
                                            icon={TabIconTop}
                                        >
                                            <Scene
                                                key={
                                                    ROUTER_SCENE_KEYS.addContactsChat
                                                }
                                                component={NewChatContacts}
                                                // title={I18n.t('Contacts')}
                                                hideNavBar={true}
                                                type="push"
                                                // back
                                            />
                                        </Scene>
                                        <Scene
                                            key={ROUTER_SCENE_KEYS.botsMenuChat}
                                            titleScreen={I18n.t('Bots')}
                                            imageSource={require('../images/tabbar-marketplace/tabbar-marketplace.png')}
                                            imageSelected={require('../images/tabbar-marketplace-active/tabbar-marketplace-active.png')}
                                            icon={TabIconTop}
                                        >
                                            <Scene
                                                key={
                                                    ROUTER_SCENE_KEYS.botsListChat
                                                }
                                                component={NewChatBots}
                                                // title={I18n.t('Channels')}
                                                type="push"
                                                hideNavBar={true}
                                                // back
                                            />
                                        </Scene>
                                        <Scene
                                            key={
                                                ROUTER_SCENE_KEYS.channelsMenuChat
                                            }
                                            titleScreen={I18n.t('Channels')}
                                            imageSource={require('../images/tabbar-channels/tabbar-channels.png')}
                                            imageSelected={require('../images/tabbar-channels-active/tabbar-channels-active.png')}
                                            icon={TabIconTop}
                                        >
                                            <Scene
                                                key={
                                                    ROUTER_SCENE_KEYS.channelsListChat
                                                }
                                                component={NewChatChannels}
                                                // title={I18n.t('Channels')}
                                                type="push"
                                                hideNavBar={true}
                                                // back
                                            />
                                        </Scene>
                                    </Tabs>
                                    <Tabs
                                        key={ROUTER_SCENE_KEYS.tabBarCall}
                                        tabBarStyle={{
                                            backgroundColor:
                                                'rgba(0,189,242,1)',
                                            underlayColor:
                                                GlobalColors.transparent,
                                            height: 50
                                        }}
                                        swipeEnabled={true}
                                        animationEnabled={true}
                                        showLabel={false}
                                        tabBarPosition="top"
                                        showIcon={true}
                                        title="New Call"
                                        navBarButtonColor="rgb(22,175,239)"
                                        titleStyle={{
                                            color: 'black'
                                        }}

                                        // hideNavBar
                                    >
                                        <Scene
                                            key={
                                                ROUTER_SCENE_KEYS.contactsCallMenu
                                            }
                                            titleScreen={I18n.t(
                                                'FrontM_Contacts'
                                            )}
                                            imageSource={require('../images/fm/fm-iso.png')}
                                            imageSelected={require('../images/fm/fm-iso.png')}
                                            icon={TabIconTop}
                                        >
                                            <Scene
                                                key={
                                                    ROUTER_SCENE_KEYS.contactsCall
                                                }
                                                component={NewCallContacts}
                                                hideNavBar={true}
                                                type="push"
                                            />
                                        </Scene>
                                        <Scene
                                            key={
                                                ROUTER_SCENE_KEYS.phoneContactsCallMenu
                                            }
                                            titleScreen={I18n.t(
                                                'Addr_Contacts'
                                            )}
                                            imageSource={require('../images/tabbar-contacts/tabbar-contacts.png')}
                                            imageSelected={require('../images/tabbar-contacts-active/tabbar-contacts-active.png')}
                                            icon={TabIconTop}
                                        >
                                            <Scene
                                                key={
                                                    ROUTER_SCENE_KEYS.phoneContactsCall
                                                }
                                                component={NewPhoneBookContacts}
                                                type="push"
                                                hideNavBar={true}
                                            />
                                        </Scene>
                                    </Tabs>
                                    <Scene
                                        key={ROUTER_SCENE_KEYS.botChat}
                                        component={BotChat}
                                    />
                                    <Scene
                                        key={ROUTER_SCENE_KEYS.dialCall}
                                        component={NewCallDialler}
                                    />
                                    <Scene
                                        key={ROUTER_SCENE_KEYS.peopleChat}
                                        component={PeopleChat}
                                    />
                                    <Scene
                                        key={
                                            ROUTER_SCENE_KEYS.contactDetailsScreen
                                        }
                                        title="Contact Details"
                                        component={ContactDetailsScreen}
                                    />
                                    <Scene
                                        key={ROUTER_SCENE_KEYS.searchUsers}
                                        title="Add Contacts"
                                        component={SearchUsers}
                                    />
                                    <Scene
                                        key={ROUTER_SCENE_KEYS.myProfileScreen}
                                        title="My Profile"
                                        component={MyProfileScreen}
                                    />
                                    <Scene
                                        key={ROUTER_SCENE_KEYS.newContactScreen}
                                        title="Add new contact"
                                        component={NewContactScreen}
                                    />
                                    <Scene
                                        key={ROUTER_SCENE_KEYS.channelChat}
                                        component={ChannelChat}
                                    />
                                    <Scene
                                        key={ROUTER_SCENE_KEYS.botInfoScreen}
                                        title={I18n.t('Bot_Store')}
                                        component={BotInfoScreen}
                                    />
                                    <Scene
                                        key={ROUTER_SCENE_KEYS.channelsFilter}
                                        title="Filter"
                                        component={ChannelsFilter}
                                    />
                                    <Scene
                                        key={
                                            ROUTER_SCENE_KEYS.channelAdminScreen
                                        }
                                        title="Edit Channel"
                                        component={ChannelAdminScreen}
                                    />
                                    <Scene
                                        key={ROUTER_SCENE_KEYS.newChannels}
                                        title="New Channel"
                                        component={NewChannels}
                                    />

                                    <Scene
                                        key={
                                            ROUTER_SCENE_KEYS.addressBookScreen
                                        }
                                        title={I18n.t('Add_new_contacts')}
                                        component={AddressBookScreen}
                                    />
                                    <Scene
                                        key={ROUTER_SCENE_KEYS.addParticipants}
                                        title={I18n.t('Add_participants')}
                                        component={AddContacts}
                                    />
                                    <Scene
                                        key={ROUTER_SCENE_KEYS.manageContacts}
                                        title="Manage contacts"
                                        component={ManageContacts}
                                    />
                                    <Scene
                                        key={ROUTER_SCENE_KEYS.requestsScreen}
                                        title={I18n.t('Awaiting authorization')}
                                        component={RequestsScreen}
                                    />
                                    <Scene
                                        key={ROUTER_SCENE_KEYS.setChannelOwner}
                                        title={I18n.t('Transfer ownership')}
                                        component={SetChannelOwner}
                                    />
                                    <Scene
                                        key={ROUTER_SCENE_KEYS.selectTeam}
                                        title={I18n.t('Select_team')}
                                        component={SelectTeam}
                                        type="push"
                                        duration={0}
                                    />
                                    <Scene
                                        key={ROUTER_SCENE_KEYS.slider}
                                        component={Slider}
                                    />
                                    <Scene
                                        key={ROUTER_SCENE_KEYS.webview}
                                        component={WebViewScreen}
                                        hideNavBar
                                    />
                                    <Scene
                                        key={ROUTER_SCENE_KEYS.mapView}
                                        component={MapView}
                                        title="Map"
                                    />
                                    <Scene
                                        key={ROUTER_SCENE_KEYS.botStore}
                                        component={BotStoreScreen}
                                        title={I18n.t('Bot_Store')}
                                    />
                                    <Scene
                                        key={ROUTER_SCENE_KEYS.botListScreen}
                                        component={BotListScreen}
                                        title={I18n.t('Bots')}
                                    />
                                    <Scene
                                        key={ROUTER_SCENE_KEYS.favoriteMessage}
                                        component={FavoriteMessages}
                                        title={I18n.t('Favorites')}
                                    />
                                    <Scene
                                        key={ROUTER_SCENE_KEYS.videoRecorder}
                                        component={VideoRecorder}
                                        hideNavBar
                                    />
                                    <Scene
                                        key={ROUTER_SCENE_KEYS.barCodeScanner}
                                        component={BarcodeScanner}
                                        hideNavBar
                                    />

                                    <Scene
                                        key={ROUTER_SCENE_KEYS.conversations}
                                        component={ConversationList}
                                        title={I18n.t('Conversations')}
                                        back
                                    />
                                    <Scene
                                        key={ROUTER_SCENE_KEYS.imageViewer}
                                        component={ImageViewer}
                                    />

                                    <Scene
                                        key={ROUTER_SCENE_KEYS.SNRChart}
                                        component={SNRChart}
                                    />
                                </Scene>
                                <Scene
                                    key={ROUTER_SCENE_KEYS.botFilter}
                                    component={BotFilter}
                                    hideNavBar
                                />

                                <Scene
                                    key={ROUTER_SCENE_KEYS.form2}
                                    title="Form"
                                    component={Form2}
                                />
                                <Scene
                                    key={ROUTER_SCENE_KEYS.multiselection}
                                    title="Multiple selection"
                                    component={Multiselection}
                                />
                                <Scene
                                    key={ROUTER_SCENE_KEYS.locationPicker}
                                    component={LocationPicker}
                                    title="Map"
                                />
                                <Scene
                                    key={ROUTER_SCENE_KEYS.onboarding}
                                    component={BotChat}
                                    headerStyle={Config.navBar.headerStyle}
                                    headerTintColor={
                                        Config.navBar.navigationBarTintColor
                                    }
                                    intial
                                    title={I18n.t('FrontM')}
                                />
                            </Scene>
                        </Scene>
                        <Scene
                            key={ROUTER_SCENE_KEYS.form}
                            component={FormPopup}
                            hideNavBar
                        />
                        <Scene
                            key={ROUTER_SCENE_KEYS.info}
                            component={InfoPopup}
                            hideNavBar
                        />
                        <Scene
                            key={ROUTER_SCENE_KEYS.phone}
                            component={Phone}
                            hideNavBar
                        />
                        <Scene
                            key={ROUTER_SCENE_KEYS.dialler}
                            component={Dialler}
                            hideNavBar
                        />
                        <Scene
                            key={ROUTER_SCENE_KEYS.callSummary}
                            component={CallSummary}
                            hideNavBar
                        />
                    </Lightbox>
                </Router>
            </NavHandler>
        );
    }
}

export default MainRouter;
