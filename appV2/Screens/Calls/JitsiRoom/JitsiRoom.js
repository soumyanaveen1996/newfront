import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Platform,
    ActivityIndicator,
    AppState,
    TouchableWithoutFeedback
} from 'react-native';
import JitsiMeet, { JitsiMeetView } from 'react-native-jitsi-meet';
import { connect } from 'react-redux';
import _ from 'lodash';
import { Message } from '../../../lib/capability';
import BackgroundMessageSender from '../../../lib/BackgroundTask/BackgroundMessageSender';
import styles from './styles';
import { WebView } from 'react-native-webview';
import VIForegroundService from '@voximplant/react-native-foreground-service';
import { StatusBar } from 'react-native';
import RNCallKeep from 'react-native-callkeep';
import UserServices from '../../../apiV2/UserServices';
import queryString from 'query-string';
import NavigationAction from '../../../navigation/NavigationAction';
import Store from '../../../redux/store/configureStore';
import EventEmitter from '../../../lib/events';
import { useDispatch } from 'react-redux';
import { setCallState } from '../../../redux/actions/UserActions';
import AlertDialog from '../../../lib/utils/AlertDialog';
//const MEDIA_SOUP_HOST = Config.proxy.defaultMediasoupServer;
const JitsiRoom = (props) => {
    const {
        sendMessage,
        peerId,
        botId,
        roomId,
        roomName,
        displayName,
        codec,
        hostname,
        iAmHost = false,
        startWithVideoMuted = false,
        startWithAudioMuted = false,
        fullUrl,
        callUUID,
        preConnectCallCheck = false,
        userId,
        brand = 'actual'
    } = props.route.params;
    const [closed, setClosed] = useState(false);
    const [canConnect, setCanConnect] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const urlData = useRef(null);
    const currentState = useRef('unknown');
    const dispatch = useDispatch();
    useEffect(() => {
        startForegroundService();
        dispatch(setCallState(true));
        StatusBar.setHidden(false, 'none');
        if (Platform.OS === 'android') StatusBar.setTranslucent(false);
        urlData.current = processRoomUrl();
        performPreConnectCallCheck();
        return stopForegroundService();
    }, []);
    const processRoomUrl = () => {
        let tempUrlData = {};
        if (fullUrl) {
            const parsedUrl = new URL(fullUrl);
            const qs = queryString.parse(parsedUrl.search);
            console.log('qs', qs);
            tempUrlData.roomname = qs.rn;
            tempUrlData.iAmHost = qs.imhst;
            tempUrlData.meetingid = qs.id;
            tempUrlData.password = qs.ur;
            tempUrlData.displayname = qs.dn;
            tempUrlData.startvideomute = qs.stvideo;
            tempUrlData.startaudiomute = qs.staudio;
            tempUrlData.emailid = qs.uid;
            tempUrlData.host = parsedUrl.hostname;
            tempUrlData.brand = qs.brand ? qs.brand : 'actual';
        } else {
            tempUrlData.roomname = roomName;
            tempUrlData.iAmHost = iAmHost;
            tempUrlData.meetingid = roomId;
            tempUrlData.displayname = displayName;
            tempUrlData.startvideomute = startWithVideoMuted;
            tempUrlData.startaudiomute = startWithAudioMuted;
            tempUrlData.host = hostname;
            tempUrlData.brand = brand;
        }
        let hoststatus = '#config.hosts.iamhost=false';
        if (tempUrlData.iAmHost === true || tempUrlData.iAmHost === 'true')
            hoststatus = '#config.hosts.iamhost=true';

        const meetingDetals = tempUrlData.roomname
            ? tempUrlData.meetingid + '/' + tempUrlData.roomname
            : tempUrlData.meetingid;
        var extracommand =
            hoststatus +
            '&userInfo.displayName="' +
            tempUrlData.displayname +
            '"&config.startWithVideoMuted=' +
            tempUrlData.startvideomute +
            '&config.startWithAudioMuted=' +
            tempUrlData.startaudiomute;
        if (tempUrlData.brand) {
            extracommand =
                extracommand +
                '&config.closePage="close-' +
                tempUrlData.brand +
                '.html"';
        }
        tempUrlData.baseConnectUrl = encodeURI(
            'https://' + tempUrlData.host + '/' + String(meetingDetals)
        );
        let connectUrl =
            'https://' +
            tempUrlData.host +
            '/' +
            String(meetingDetals) +
            extracommand;
        return { url: encodeURI(connectUrl), data: tempUrlData };
    };

    useEffect(() => {
        const appStateListener = AppState.addEventListener(
            'change',
            handleAppStateChange
        );
        return () => {
            appStateListener.remove();
        };
    }, []);
    const sendMessageToBot = (msg) => {
        try {
            const message = new Message();
            message.messageByBot(false);
            message.videoResponseMessage(msg);
            message.setCreatedBy(peerId);
            console.log('Send Message To Bot : ', message, sendMessage);
            //if the bot is active, send even, it will be handled in chatbot screen.
            //if not, send in gacground.
            if (Store.getState().bots.id === botId) {
                EventEmitter.emit('SendBotMessage', message);
            } else {
                const messageSender = new BackgroundMessageSender(botId);
                messageSender.sendMessage(message);
            }
            // }
            console.log('Send Message To Bot : ', message, sendMessage);
        } catch (e) {
            console.log('Catch : ', e);
        }
    };

    const onConferenceTerminated = () => {
        sendMessageToBot({
            controlId: 'conferenceCall',
            action: 'callEnd',
            videoSessionId: roomId
        });
        stopForegroundService();
        setClosed(true);
    };

    useEffect(() => {
        if (closed) {
            if (Platform.OS == 'ios') {
                console.log('ending call');
                JitsiMeet.endCall();
                if (callUUID) {
                    RNCallKeep.endCall(callUUID);
                }
                StatusBar.setHidden(false, 'slide');
                StatusBar.setTranslucent(false);
                StatusBar.setBarStyle('dark-content');
            }
            NavigationAction.pop();
        }
    }, [closed]);

    const onConferenceJoined = () => {
        sendMessageToBot({
            controlId: 'conferenceCall',
            action: 'callActive',
            videoSessionId: roomId
        });
    };

    const onConferenceWillJoin = () => {
        /* Conference will join event */
        //Actions.pop();
    };

    const startForegroundService = async () => {
        if (Platform.OS !== 'android') {
            return;
        }
        const notificationConfig = {
            channelId: 'VOIPForegroundService',
            id: Math.ceil(Math.random() * 1000000),
            title: 'Conference Call',
            text: 'In Conference call',
            icon: 'ic_call_white'
        };
        try {
            await VIForegroundService.getInstance().startService(
                notificationConfig
            );
        } catch (e) {
            console.error(
                `Amal : Error in starting foreground service ${JSON.stringify(
                    e
                )}`
            );
        }
    };

    const performPreConnectCallCheck = () => {
        if (preConnectCallCheck) {
            UserServices.preConnectCallCheck({
                videoSessionId: roomId,
                callInitiatorUserId: userId
            })
                .then((callCheck) => {
                    console.log('call check result', callCheck);
                    if (callCheck.success) {
                        connectToMeeting();
                    } else {
                        showErrorAndExit();
                    }
                })
                .catch((err) => {
                    console.log('Catch : ', e);
                    showErrorAndExit(
                        'Unable to connect to the server. Can you try again later ?'
                    );
                });
        } else {
            connectToMeeting();
        }
    };

    const showErrorAndExit = (
        message = 'Another person has already responded this call. Thank you for  your help!'
    ) => {
        if (
            NavigationAction.currentScreen() === NavigationAction.SCREENS.jitsi
        ) {
            AlertDialog.show(null, message, [
                {
                    text: 'OK',
                    onPress: goBack
                }
            ]);
        }
    };

    const goBack = () => {
        if (
            NavigationAction.currentScreen() === NavigationAction.SCREENS.jitsi
        ) {
            RNCallKeep.endCall(callUUID);
            NavigationAction.pop();
        }
    };

    const connectToMeeting = () => {
        console.log('~~~connectToMeeting', urlData?.current);
        if (Platform.OS == 'android') {
            setCanConnect(true);
            console.log('setCanConnect');
        } else {
            if (
                AppState.currentState === 'active' &&
                currentState.current === 'unknown'
            ) {
                connectWhnAppActive();
            } else {
                currentState.current = 'waiting_for_app';
            }
        }
    };

    const handleAppStateChange = (nextAppState) => {
        if (nextAppState == 'active') {
            if (currentState.current === 'waiting_for_app') {
                connectWhnAppActive();
            }
        }
    };

    const connectWhnAppActive = () => {
        currentState.current = 'connected';
        if (urlData.current) {
            data = urlData.current;
            const uri = data.data.baseConnectUrl;
            const userInfo = {
                displayName: data.data.displayname,
                welcomePageEnabled: false,
                iamHost: data.data.iAmHost
            };
            JitsiMeet.call(uri, userInfo, {
                videoMuted: data.data.startvideomute,
                audioMuted: data.data.startaudiomute
            });
        } else {
            let encodedRoomName = roomName;
            if (roomName?.includes(' ')) {
                encodedRoomName = encodeURIComponent(roomName);
            }
            const uri = roomName
                ? `https://${hostname}/${roomId}/${encodedRoomName}`
                : `https://${hostname}/${roomId}`;

            const userInfo = {
                displayName: displayName,
                welcomePageEnabled: false,
                iamHost: true
            };
            JitsiMeet.call(uri, userInfo, {
                videoMuted: startWithVideoMuted,
                audioMuted: startWithAudioMuted
            });
        }
    };
    const stopForegroundService = () => {
        dispatch(setCallState(false));
        if (Platform.OS !== 'android') {
            return;
        }
        VIForegroundService.getInstance().stopService();
        StatusBar.setHidden(false);
        StatusBar.setTranslucent(false);
    };

    const handleMessageFromWebView = (event) => {
        const data = event.nativeEvent?.data;
        console.log('~~~~ webview event : ', event);
        if (data) {
            switch (data) {
                case 'CONFERENCE_JOINED':
                    onConferenceJoined();
                    break;
                case 'CONFERENCE_ENDED':
                    onConferenceTerminated();
                    break;
            }
        }
    };

    const dummpOnpress = () => {
        console.log('dimmy pressed');
    };

    if (Platform.OS === 'ios') {
        return (
            <TouchableWithoutFeedback
                onPress={dummpOnpress}
                style={styles.container}
            >
                <JitsiMeetView
                    onConferenceTerminated={onConferenceTerminated}
                    onConferenceJoined={onConferenceJoined}
                    onConferenceWillJoin={onConferenceWillJoin}
                    style={{
                        flex: 1,
                        height: '100%',
                        width: '100%'
                    }}
                />
            </TouchableWithoutFeedback>
        );
    } else {
        console.log('~~~ android URI : ', urlData.current?.url);
        return (
            <View style={[styles.container, {}]}>
                <View
                    style={{
                        height: '100%',
                        width: '100%'
                    }}
                >
                    {canConnect && urlData?.current && (
                        <WebView
                            cacheEnabled={true}
                            domStorageEnabled={true}
                            incognito={true}
                            originWhitelist={['*']}
                            automaticallyAdjustContentInsets
                            allowsInlineMediaPlayback
                            source={{ uri: urlData.current?.url }}
                            mediaPlaybackRequiresUserAction={false}
                            onLoad={(data) => {
                                const { url, loading } = data.nativeEvent;
                                console.log(
                                    'Onload :',
                                    url,
                                    loading,
                                    _.endsWith(url, '.html'),
                                    _.indexOf('/close')
                                );
                                setIsLoading(false);
                                if (!loading) {
                                    if (
                                        _.endsWith(url, '.html') &&
                                        url.includes('/close') !== -1
                                    ) {
                                        onConferenceTerminated();
                                    } else {
                                        onConferenceJoined();
                                    }
                                }
                            }}
                        />
                    )}
                    {isLoading && (
                        <ActivityIndicator
                            size={'large'}
                            style={{
                                position: 'absolute',
                                right: 0,
                                left: 0,
                                top: 0,
                                bottom: 0
                            }}
                        />
                    )}
                </View>
            </View>
        );
    }
};

const mapStateToProps = (state) => ({
    botMessage: state.bots.messageByBot
});

export default connect(mapStateToProps)(JitsiRoom);
