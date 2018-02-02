import React from 'react';
import { StatusBar } from 'react-native';
import { Scene, Router, Lightbox, Modal } from 'react-native-router-flux';
import { MainScreen, ConversationList } from '../components/MainScreen';
import { BotChat, PeopleChat, FavoriteMessages, VideoPlayer } from '../components/ChatBotScreen';
import { InfoPopup } from '../components/InfoPopup';
import { ContactsPicker } from '../components/ContactsPicker';
import { Slider } from '../components/Slider';
import { Launch } from '../components/Launch';
import I18n from '../config/i18n/i18n';
import WebViewScreen from '../components/WebViewScreen/WebViewScreen';
import { BotListScreen } from '../components/BotListScreen';
import { BotStoreScreen }  from '../components/BotStoreScreen';
import { BotFilter }  from '../components/BotFilter';
import { InstalledBotsScreen } from  '../components/InstalledBotsScreen';
import { BarcodeScanner } from  '../components/BarcodeScanner';
import { MapView } from  '../components/MapView';
import { ImageViewer } from  '../components/ImageViewer';
import { SNRChart } from  '../components/SNRChart';
import { LocationPicker } from  '../components/LocationPicker';
import { VideoRecorder } from  '../components/VideoRecorder';
import { FormPopup } from  '../components/FormPopup';
import ROUTER_SCENE_KEYS from './RouterSceneKeyConstants';
import Config from './config';

const MainRouter = () => {
    // We want white network bar
    StatusBar.setBarStyle('light-content', true);

    return (
        <Router>
            <Modal>
                <Scene>
                    <Scene key={ROUTER_SCENE_KEYS.launch} component={Launch} initial hideNavBar/>
                    <Scene key={ROUTER_SCENE_KEYS.lightbox} inital hideNavBar>
                        <Scene key={ROUTER_SCENE_KEYS.main}
                            headerStyle={Config.navBar.headerStyle}
                            headerTintColor={Config.navBar.navigationBarTintColor}>
                            <Scene key={ROUTER_SCENE_KEYS.timeline} component={MainScreen} initial title={I18n.t('FrontM')}/>
                            <Scene key={ROUTER_SCENE_KEYS.botChat} component={BotChat} inital/>
                            <Scene key={ROUTER_SCENE_KEYS.peopleChat} component={PeopleChat}/>
                            <Scene key={ROUTER_SCENE_KEYS.slider} component={Slider} />
                            <Scene key={ROUTER_SCENE_KEYS.webview} component={WebViewScreen} hideNavBar/>
                            <Scene key={ROUTER_SCENE_KEYS.botStore} component = {BotStoreScreen} title={I18n.t('Bot_Store')}/>
                            <Scene key={ROUTER_SCENE_KEYS.botList} component = {BotListScreen} title={I18n.t('Bots')}/>
                            <Scene key={ROUTER_SCENE_KEYS.favoriteMessage} component = {FavoriteMessages} title={I18n.t('Favorites')}/>
                            <Scene key={ROUTER_SCENE_KEYS.videoPlayer} component = {VideoPlayer} title={I18n.t('Chat_Input_Video')}/>
                            <Scene key={ROUTER_SCENE_KEYS.videoRecorder} component = {VideoRecorder} hideNavBar/>
                            <Scene key={ROUTER_SCENE_KEYS.barCodeScanner} component={BarcodeScanner} hideNavBar/>
                            <Scene key={ROUTER_SCENE_KEYS.addContacts} headerStyle={Config.navBar.borderlessHeaderStyle} component={ContactsPicker} title={I18n.t('My_Contacts')} back/>
                            <Scene key={ROUTER_SCENE_KEYS.conversations} component={ConversationList} title={I18n.t('Conversations')} back/>
                            <Scene key={ROUTER_SCENE_KEYS.installedBots} headerStyle={Config.navBar.borderlessHeaderStyle} component={InstalledBotsScreen} title={I18n.t('Installed_bots')} />
                            <Scene key={ROUTER_SCENE_KEYS.imageViewer} component={ImageViewer} />
                            <Scene key={ROUTER_SCENE_KEYS.SNRChart} component={SNRChart}/>
                        </Scene>
                        
                        <Scene key={ROUTER_SCENE_KEYS.botFilter} component={BotFilter} hideNavBar/>
                        <Scene key={ROUTER_SCENE_KEYS.mapView} component={MapView} hideNavBar/>
                        <Scene key={ROUTER_SCENE_KEYS.locationPicker} component={LocationPicker} hideNavBar/>
                        <Scene key={ROUTER_SCENE_KEYS.onboarding} component={BotChat}
                            headerStyle={Config.navBar.headerStyle}
                            headerTintColor={Config.navBar.navigationBarTintColor} intial title={I18n.t('FrontM')} />
                    </Scene>
                </Scene>
                <Lightbox key={ROUTER_SCENE_KEYS.info} component={InfoPopup} hideNavBar/>
                <Lightbox lightbox key={ROUTER_SCENE_KEYS.form} component={FormPopup} hideNavBar/>
            </Modal>
        </Router>
    );
};

export default MainRouter;
