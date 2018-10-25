import React from 'react';
import { StatusBar, AsyncStorage } from 'react-native';
import { Scene, Router, Lightbox } from 'react-native-router-flux';
import { LoginScreen } from '../components/Login';
import { MainScreen, ConversationList } from '../components/MainScreen';
import {
    BotChat,
    PeopleChat,
    FavoriteMessages,
    ChannelChat
} from '../components/ChatBotScreen';
import { InfoPopup } from '../components/InfoPopup';
import { ContactsPicker } from '../components/ContactsPicker';
import { Slider } from '../components/Slider';
import { Launch } from '../components/Launch';
import I18n from '../config/i18n/i18n';
import WebViewScreen from '../components/WebViewScreen/WebViewScreen';
import { BotListScreen } from '../components/BotListScreen';
import { BotStoreScreen } from '../components/BotStoreScreen';
import { BotFilter } from '../components/BotFilter';
import { BarcodeScanner } from '../components/BarcodeScanner';
import { MapView } from '../components/MapView';
import { ImageViewer } from '../components/ImageViewer';
import { SNRChart } from '../components/SNRChart';
import { LocationPicker } from '../components/LocationPicker';
import { VideoRecorder } from '../components/VideoRecorder';
import { FormPopup } from '../components/FormPopup';
import { ChannelsList } from '../components/ChannelsList';
import ROUTER_SCENE_KEYS from './RouterSceneKeyConstants';
import { Phone } from '../components/Phone';
import { Dialler } from '../components/Dialler';
import Config from './config';
import { SignupScreen } from '../components/Signup';
import { SwiperScreen } from '../components/Swiper';
import ConfirmationScreen from '../components/ConfirmationScreen/ConfirmationScreen';
import { ResendCodeScreen } from '../components/ResendCodeScreen';
import { TabIcon } from '../components/TabIcon';

const MainRouter = () => {
    // We want white network bar
    StatusBar.setBarStyle('light-content', true);

    return (
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
                                component={LoginScreen}
                                hideNavBar
                            />
                            <Scene
                                key={ROUTER_SCENE_KEYS.signupScreen}
                                component={SignupScreen}
                                hideNavBar
                            />
                            <Scene
                                key={ROUTER_SCENE_KEYS.confirmationScreen}
                                component={ConfirmationScreen}
                                hideNavBar
                            />
                            <Scene
                                key={ROUTER_SCENE_KEYS.resendCodeScreen}
                                component={ResendCodeScreen}
                                hideNavBar
                            />
                            <Scene
                                key={ROUTER_SCENE_KEYS.tabBar}
                                tabs={true}
                                tabBarStyle={{
                                    backgroundColor: '#ffffff',
                                    height: 60
                                }}
                                hideNavBar
                            >
                                <Scene
                                    key={ROUTER_SCENE_KEYS.homeMain}
                                    title={I18n.t('Home')}
                                    imageSource={require('../images/tabbar-home/tabbar-home.png')}
                                    icon={TabIcon}
                                >
                                    <Scene
                                        key={ROUTER_SCENE_KEYS.timeline}
                                        component={MainScreen}
                                        title={I18n.t('FrontM')}
                                    />
                                </Scene>

                                <Scene
                                    key={ROUTER_SCENE_KEYS.contactsMain}
                                    title={I18n.t('Contacts')}
                                    imageSource={require('../images/tabbar-contacts/tabbar-contacts.png')}
                                    icon={TabIcon}
                                >
                                    <Scene
                                        key={ROUTER_SCENE_KEYS.addContacts}
                                        headerStyle={
                                            Config.navBar.borderlessHeaderStyle
                                        }
                                        component={ContactsPicker}
                                        title={I18n.t('Contacts')}
                                        back
                                    />
                                </Scene>
                                <Scene
                                    key={ROUTER_SCENE_KEYS.channelsMenu}
                                    title={I18n.t('Channels')}
                                    imageSource={require('../images/tabbar-channels/tabbar-channels.png')}
                                    icon={TabIcon}
                                >
                                    <Scene
                                        key={ROUTER_SCENE_KEYS.channelsList}
                                        component={ChannelsList}
                                        title={I18n.t('Channels')}
                                        back
                                    />
                                </Scene>

                                <Scene
                                    key={ROUTER_SCENE_KEYS.marketplaceMenu}
                                    title={I18n.t('Bot_Store')}
                                    imageSource={require('../images/tabbar-marketplace/tabbar-marketplace.png')}
                                    icon={TabIcon}
                                >
                                    <Scene
                                        key={ROUTER_SCENE_KEYS.botStore}
                                        component={BotStoreScreen}
                                        title={I18n.t('Bot_Store')}
                                    />
                                </Scene>
                            </Scene>
                            <Scene
                                key={ROUTER_SCENE_KEYS.botChat}
                                component={BotChat}
                            />
                            <Scene
                                key={ROUTER_SCENE_KEYS.peopleChat}
                                component={PeopleChat}
                            />
                            <Scene
                                key={ROUTER_SCENE_KEYS.channelChat}
                                component={ChannelChat}
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
                                key={ROUTER_SCENE_KEYS.botStore}
                                component={BotStoreScreen}
                                title={I18n.t('Bot_Store')}
                            />
                            <Scene
                                key={ROUTER_SCENE_KEYS.botList}
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
                            key={ROUTER_SCENE_KEYS.mapView}
                            component={MapView}
                            hideNavBar
                        />
                        <Scene
                            key={ROUTER_SCENE_KEYS.locationPicker}
                            component={LocationPicker}
                            hideNavBar
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
            </Lightbox>
        </Router>
    );
};

export default MainRouter;
