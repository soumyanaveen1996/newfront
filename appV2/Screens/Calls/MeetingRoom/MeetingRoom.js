import {
    View,
    SafeAreaView,
    Text,
    Image,
    ActivityIndicator,
    PixelRatio,
    TouchableOpacity,
    Platform,
    NativeModules,
    BackHandler,
    Keyboard,
    AppState
} from 'react-native';
import React from 'react';
import RNCallKeep from 'react-native-callkeep';
import { RTCView, mediaDevices } from 'react-native-webrtc';
import Peer from 'react-native-peerjs';
import KeepAwake from 'react-native-keep-awake';
import { connect } from 'react-redux';
import InCallManager from 'react-native-incall-manager';
import * as Progress from 'react-native-progress';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp
} from 'react-native-responsive-screen';
import _ from 'lodash';
import VIForegroundService from '@voximplant/react-native-foreground-service';
import BackgroundTimer from 'react-native-background-timer';
import UserServices from '../../../apiV2/UserServices';
import Config from '../../../config/config';
import {
    Message,
    Auth,
    Network,
    Utils,
    PollingStrategyTypes,
    Settings
} from '../../../lib/capability';
import GlobalColors from '../../../config/styles';
import Store from '../../../redux/store/configureStore';
import { messageBroadcastByBot } from '../../../redux/actions/BotActions';
import Icons from '../../../config/icons';
import styles from './styles';
import Bugsnag from '../../../config/ErrorMonitoring';
import EventEmitter, { MessageEvents } from '../../../lib/events';
import AsyncStorage from '@react-native-community/async-storage';
import NavigationAction from '../../../navigation/NavigationAction';
import images from '../../../images';
import AlertDialog from '../../../lib/utils/AlertDialog';
import AppFonts from '../../../config/fontConfig';
const { FrontMWakeLockModule } = NativeModules;

export const diameter = hp('24%');

const MeetingRoomActions = {
    CALL_ACTIVE: 'callActive',
    CALL_END: 'callEnd',
    PEER_REQUEST: 'peerRequest',
    ERROR: 'error'
};
const MeetingRoomStatus = {
    INITIATING: 1,
    WAITING: 2,
    INCOMING: 3,
    IN_PROGRESS: 4,
    RECONNECTING: 5,
    ENDING: 6
};

const webrtc_server = Config.proxy.webertcSignalServer;

class MeetingRoom extends React.Component {
    static navigationOptions({ navigation }) {
        const { state } = navigation;

        return {
            headerTitle: state.params.title
                ? state.params.title
                : 'Meeting Room',
            headerLeft: null,
            headerStyle: {
                backgroundColor: GlobalColors.textBlack,
                borderWidth: 0
            },
            gesturesEnabled: false
        };
    }

    constructor(props) {
        super(props);
        let callerName = null;
        if (this.props.route.params.data) {
            callerName =
                this.props.route.params.data.otherUserName ||
                this.props.route.params.data.callerName;
        } else if (this.props.route.params.voipCallData) {
            callerName = this.props.route.params.voipCallData.otherUserName;
        } else if (this.props.route.params.title) {
            callerName = this.props.route.params.title;
        }
        this.state = {
            localStream: null,
            remoteStream: null,
            cachedLocalPC: null,
            cachedRemotePC: null,
            isMuted: false,
            camMuted: false,
            loading: true,
            status: MeetingRoomStatus.INITIATING,
            callData: this.props.route.params.data,
            newVoipCallData: this.props.route.params.voipCallData,
            audioStreamAvailable: false, // always on
            videoStreamAvailable: false, // local
            voipCall:
                this.props.route.params.voipCallData ||
                this.props.route.params.incomingVoipCall,
            remoteVideoMute: false,
            speakerOn: false,
            isVideoCall: this.props.route.params.isVideoCall || false,
            callTime: 0,
            connectionProgress: 1,
            callerName
        };
        this.netWorkMode = null;
        this.callEnded = false;
        this.endCallSent = false;
        this.callStartSent = false;
        this.userId = this.props.route.params.userId;
        this.callClosed = false;

        // this.createdMeeting = false;
        console.log(
            'voipCall: my id: in constuctor',
            this.props.route.params.userId
        );
    }

    handleBackButtonClick = () => true;

    startForegroundService = async () => {
        if (Platform.OS !== 'android') {
            return;
        }
        const notificationConfig = {
            channelId: 'VOIPForegroundService',
            id: Math.ceil(Math.random() * 1000000),
            title: 'Call',
            text: 'In Ongoing call',
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

    stopForegroundService = () => {
        if (Platform.OS !== 'android') {
            return;
        }
        VIForegroundService.getInstance().stopService();
    };

    listenToAppEvents = async () => {
        this.appStateListener = AppState.addEventListener(
            'change',
            this.handleAppStateChange
        );
    };

    handleAppStateChange = async (nextAppState) => {
        console.log(
            'VOIP Amal : Meeting Room Handle App State : ',
            nextAppState
        );
        const { isVideoCall, status, camMuted, dataConnection } = this.state;
        console.log(
            'Amal : Meeting Room Handle App State : ',
            nextAppState,
            isVideoCall,
            camMuted,
            dataConnection,
            status
        );
        if (isVideoCall && status === MeetingRoomStatus.IN_PROGRESS) {
            if (nextAppState === 'active') {
                if (!camMuted) {
                    const tracks = this.localStreamRef.getTracks();
                    console.log(
                        'VOIP Amal : Meeting Room +++++++ un-Muting video'
                    );
                    tracks.forEach((track) => {
                        if (track.kind === 'video') {
                            track.enabled = true;
                        }
                    });
                    this.sendData('video-on');
                    if (dataConnection) {
                        dataConnection.send('video-on');
                    }
                }
            } else if (nextAppState === 'background') {
                if (!camMuted) {
                    const tracks = this.localStreamRef.getTracks();
                    console.log(
                        'Amal : Meeting Room +++++++ Muting video',
                        tracks.length
                    );
                    tracks.forEach((track) => {
                        if (track.kind === 'video') {
                            track.enabled = false;
                        }
                    });
                    this.sendData('video-off');
                    if (dataConnection) {
                        dataConnection.send('video-off');
                    }
                }
            }
        }
    };

    componentDidMount() {
        console.log(
            'VOIP Amal : in Incoming Voip call',
            this.props.route.params
        );
        this.listenToAppEvents();
        Settings.getPollingStrategy().then((val) => {
            this.netWorkMode = val;
        });
        Keyboard.dismiss();
        this.backhandler = BackHandler.addEventListener(
            'hardwareBackPress',
            this.handleBackButtonClick
        );

        this.startForegroundService();

        console.log('VOIP FrontMWakeLockModule  : ', FrontMWakeLockModule);
        if (FrontMWakeLockModule) {
            FrontMWakeLockModule.acquireWakeLock(() => {});
        }
        Network.isConnected().then((connected) => {
            if (connected) {
                InCallManager.stop();
                KeepAwake.activate();
                const userDetails = Auth.getUserData();
                this.userId = userDetails.userId;
                const info = { ...userDetails.info };
                this.userName = info.userName;
                if (this.props.route.params.incomingVoipCall) {
                    console.log(
                        'Amal : in INcoming Voip call',
                        this.state.callData
                    );
                    this.calSessionId = this.state.callData.videoSessionId;
                    this.joinMeeting(this.state.callData.videoSessionId);
                    this.startInCallManager(this.state.isVideoCall);
                } else if (
                    this.state.callData &&
                    this.state.callData.videoSessionId
                ) {
                    this.getCallDetails();
                } else if (this.state.newVoipCallData) {
                    this.createMeeting(this.state.newVoipCallData);
                } else {
                    console.log(
                        'voip: calling createMeeting() in did mount, get call detaisl not called'
                    );
                    this.createMeeting();
                }
                this.intervalConnectionProgressId = setInterval(() => {
                    this.setState((prevState) => ({
                        connectionProgress: prevState.connectionProgress + 1
                    }));
                }, 1000);
            } else {
                this.showErrorAndExit(
                    'You seem to be offline at this moment. Please try again later'
                );
            }
        });
        this.eventSubscription = EventEmitter.addListener(
            MessageEvents.callMessage,
            this.handleCallMessages
        );

        this.localStreamPromise = this.startLocalStream().then((stream) => {
            this.localStream = stream;
            const tracks = stream.getTracks();
        });
    }

    sendLog = (event, startTime, endTime) => {
        const params = {
            entry: {
                level: 'PERF'
            },
            type: 'SYSTEM',
            more: JSON.stringify({
                startTime,
                endTime,
                event,
                duration: endTime - startTime
            })
        };
        console.log('VOIP >>>> log entry:', params);
        // Utils.addLogEntry(params);
    };

    handleCallMessages = (message) => {
        if (this.calSessionId !== message.videoSessionId) return;
        if (message.callAction === 'CallEnd') {
            const { status } = this.state;
            if (
                status === MeetingRoomStatus.WAITING ||
                status === MeetingRoomStatus.INITIATING ||
                status === MeetingRoomStatus.INCOMING
            ) {
                InCallManager.stopRingback();
                InCallManager.stop();
                this.callPress();
            }
        } else if (
            message.callAction === 'CallData' &&
            this.calSessionId === message.videoSessionId
        ) {
            // console.log('VOIP voipCall: CallData', message.data);
            this.handleDataMessages(message);
        } else if (message.callAction === 'callKeepEvent') {
            console.log('VOIP voipCall: callkeep mute action');
            if (this.localStreamRef) {
                const tracks = this.localStreamRef.getTracks();
                console.log(
                    `VOIP voipCall: togling  audio to ${message.muted}`
                );
                tracks.forEach((track) => {
                    if (track.kind === 'audio') {
                        track.enabled = !message.muted;
                    }
                });
                this.setState({ isMuted: !message.muted });
            }
        }
    };

    handleDataMessages = (message) => {
        // switch (message.data) {
        // case 'video-on': {
        //     this.setState({ remoteVideoMute: false });
        //     break;
        // }
        // case 'video-off': {
        //     this.setState({ remoteVideoMute: true });
        //     break;
        // }
        // default: {
        //     // ignore
        // }
        // }
    };

    async componentWillUnmount() {
        this.appStateListener?.remove();
        if (this.eventSubscription) {
            this.eventSubscription.remove();
        }
        if (this.eventSubscription2) {
            this.eventSubscription2.remove();
        }
        UserServices.setUserAvailableForCall().then(() => {});
        InCallManager.stop();
        InCallManager.stopRingback();
        if (this.props.route.params.callUUID) {
            RNCallKeep.endCall(this.props.route.params.callUUID);
        } else {
            RNCallKeep.endAllCalls();
        }
        this.stopForegroundService();

        KeepAwake.deactivate();
        RNCallKeep.setAvailable(true);
        if (FrontMWakeLockModule) {
            FrontMWakeLockModule.releaseWakeLock(() => {});
        }
        try {
            console.log('VOIP voipCall: end call done, ging back');
            await this.endCall();
        } catch (error) {
            Bugsnag.notify(error, (report) => {
                report.context = 'Call error';
            });
        }

        if (this.state.callConnectTimeout) {
            clearTimeout(this.state.callConnectTimeout);
        }
        if (this.state.pingInterval) {
            clearInterval(this.state.pingInterval);
        }

        Store.dispatch(messageBroadcastByBot(undefined));
        this.backhandler?.remove();
    }

    handleDisconnect = () => {
        try {
            if (!this.state.peer) {
                return;
            }
            this.state.peer.reconnect();
        } catch (error) {
            console.log('VOIP +++++++ cathc blaock', error);
        }
    };

    startInCallManager = (video = false) => {
        if (video) {
            InCallManager.start({ media: 'video', auto: true });
        } else {
            InCallManager.start({ media: 'audio', auto: true });
        }
    };

    createMeeting = (voipCallData) => {
        this.createPeerConnection(voipCallData).then((id) => {
            if (this.callEnded) {
                if (this.state.peer) {
                    this.state.peer.destroy();
                }
                return;
            }

            if (id) {
                if (voipCallData) {
                    this.calSessionId = id;
                    this.sendVoipPush(voipCallData, id, 'CallStart');
                } else {
                    this.setState({
                        callData: {
                            videoSessionId: id,
                            videoControlId: 'videoCall'
                        }
                    });
                    this.sendVideoBotMessage(MeetingRoomActions.PEER_REQUEST);
                    this.setState({ status: MeetingRoomStatus.WAITING });
                    this.startInCallManager();
                }
            }
        });
    };

    terminate = () => {
        if (this.state.loading) {
            this.callPress();
        }
    };

    sendVoipPush = (voipCallData, videoSessionId, action) => {
        // hardcoded video params to true
        const sendPushStartTime = new Date().getTime();
        UserServices.sendVoipPushNotification({
            userId: voipCallData.otherUserId, //taget
            videoSessionId,
            callerUserId: this.userId, //source
            callAction: action,
            video: this.state.isVideoCall
        })
            .then((result) => {
                this.sendLog(
                    'VOIP OutGoing3: send voip push',
                    sendPushStartTime,
                    new Date().getTime()
                );
                console.log('VOIP voip: sendVoipPush: result', result);
                if (result?.success) {
                    this.callStartSent = true;
                    this.setState({ status: MeetingRoomStatus.WAITING });
                    this.startInCallManager(this.state.isVideoCall);

                    InCallManager.startRingback('_BUNDLE_');
                    InCallManager.getAudioUri().then((res) => {
                        console.log('VOIP res');
                    });
                    this.intervalConnectionProgressId = setInterval(() => {
                        this.setState((prevState) => ({
                            connectionProgress: prevState.connectionProgress + 1
                        }));
                    }, 1000);
                    setTimeout(() => {
                        if (this.state.loading) {
                            if (
                                NavigationAction.currentScreen() ===
                                NavigationAction.SCREENS.meetingRoom
                            ) {
                                AlertDialog.show(
                                    'No answer',
                                    'The user is unreachable or busy, please try again later',
                                    [
                                        {
                                            text: 'OK',
                                            onPress: this.terminate
                                        }
                                    ],
                                    { cancelable: false }
                                );
                            }
                        }
                    }, 45000);
                } else {
                    if (
                        result.errorMessage &&
                        result.errorMessage == 'Caller not in receiver contacts'
                    ) {
                        AlertDialog.show(
                            'Connection not available!',
                            'You are not on receiver contacts list. Please send invitation.',
                            [
                                {
                                    text: 'OK',
                                    onPress: this.terminate
                                }
                            ],
                            { cancelable: false }
                        );
                    } else {
                        AlertDialog.show(
                            'User not available',
                            'The user you are trying to call seems to be offline or busy. Please try again later.',
                            [
                                {
                                    text: 'OK',
                                    onPress: this.terminate
                                }
                            ],
                            { cancelable: false }
                        );
                    }
                }
            })
            .catch((e) => {
                console.log('VOIP ++++++++ sendvoip pish error', e);
                const params = {
                    entry: {
                        level: 'LOG',
                        message: 'Call failure'
                    },
                    type: 'SYSTEM',
                    more: JSON.stringify(e)
                };
                Utils.addLogEntry(params);
                if (
                    NavigationAction.currentScreen() ===
                    NavigationAction.SCREENS.meetingRoom
                ) {
                    AlertDialog.show(
                        'Connection error',
                        'Connection cannot be established...',
                        [
                            {
                                text: 'OK',
                                onPress: this.terminate
                            }
                        ]
                    );
                }
            });
    };

    sendData = (data) => {
        const { newVoipCallData, callData } = this.state;
        UserServices.sendVoipPushNotification({
            userId: newVoipCallData
                ? newVoipCallData.otherUserId
                : callData.callerUserId,
            videoSessionId: this.calSessionId,
            callerUserId: this.userId,
            callAction: 'CallData',
            video: this.state.isVideoCall,
            data
        })
            .then((result) => {
                // console.log(`VOIP voipCall: data sent ${data}`);
            })
            .catch((e) => {
                // console.log(`VOIP voipCall: data error ${data}`, e);
            });
    };

    getTwilioIceServers = async () => {
        const item = await AsyncStorage.getItem('ICE_SERVERS');
        const time =
            (await AsyncStorage.getItem('ICE_SERVERS_LAST_CHECKED')) || 0;
        const now = new Date().getTime();
        const hours = Math.abs(now - parseInt(time)) / 36e5;
        if (item != null && time != null && hours <= 24) {
            return JSON.parse(item);
        } else {
            const res = await UserServices.getTwilioIceServers();
            console.log('VOIP ~~~~~ ice server', res);
            AsyncStorage.setItem('ICE_SERVERS', JSON.stringify(res));
            AsyncStorage.setItem(
                'ICE_SERVERS_LAST_CHECKED',
                new Date().getTime().toString()
            );
            return res;
        }
    };

    createPeerConnection = (voipCallData) =>
        new Promise(async (resolve, reject) => {
            const iceFetchST = new Date().getTime();
            const { iceServers } = await this.getTwilioIceServers();

            const iceFetchET = new Date().getTime();
            this.sendLog(
                'VOIP OutGoing1: Fetch ice servers',
                iceFetchST,
                iceFetchET
            );
            const createPeerConnectionStartTime = new Date().getTime();
            const path = '/webrtc/peerjs/myapp';
            const peerInitiator = new Peer({
                host: webrtc_server,
                path: path,
                debug: 3,
                secure: true,
                iceTransportPolicy: 'relay',
                config: {
                    iceServers: iceServers
                }
            });
            this.setState({ peer: peerInitiator });
            peerInitiator.on('error', (err) => {
                console.error(
                    'VOIPevent peerInitiator An Error has occured in Meeting',
                    err
                );
                setTimeout(() => {
                    if (this.callClosed) return;
                    this.sendLog(
                        `VOIP : Error in Peer ${err.type}`,
                        createPeerConnectionStartTime,
                        new Date().getTime()
                    );

                    if (
                        _.includes(
                            [
                                'disconnected',
                                'invalid-id',
                                'invalid-key',
                                'ssl-unavailable',
                                'socket-error',
                                'server-error',
                                'socket-closed',
                                'unavailable-id'
                            ],
                            err.type
                        )
                    ) {
                        this.sendEndCallEvent();
                        this.showErrorAndExit(
                            'Error in Connection. Call to be Disconnected',
                            'Connection Error'
                        );
                    }
                }, 1000);
            });
            peerInitiator.on('disconnected', () => {
                console.log('VOIP VOIPevent peerInitiator disconnect');
                this.handleDisconnect;
            });
            peerInitiator.on('open', (id) => {
                console.log(
                    'VOIPevent peerInitiator Peer connection Opened wiht id',
                    id
                );
                this.sendLog(
                    'VOIP OutGoing2: PeerConnectionCreation',
                    createPeerConnectionStartTime,
                    new Date().getTime()
                );
                resolve(id);
            });
            peerInitiator.on('call', this.handleIncomingCall);
            peerInitiator.on('close', () => {
                console.log('VOIP VOIPevent peerInitiator close');
            });
        });

    handleIncomingCall = async (call) => {
        console.log('VOIP VOIPevent ouTgoing : peerInitiator on call');

        console.log('VOIP +++++++ Received Incoming Call', call);
        this.setState({ call });

        call.on('error', (error) => {
            console.log('VOIP VOIPevent  ouTgoing : call error');

            setTimeout(() => {
                if (!this.callClosed) {
                    console.log('VOIP ++++++++ error', error);
                    if (Platform.OS === 'ios') {
                        // this.sendEndCallEvent();
                        // this.showErrorAndExit('Error in connection');
                    }
                } else {
                    console.log(
                        '++++++++ error ignored as call already ended',
                        error
                    );
                }
            }, 1000);
        });
        const peer_id = call.peer;

        const localStreamStartTime = new Date().getTime();
        this.startLocalStream()
            .then((mystream) => {
                this.sendLog(
                    'VOIP OutGoing4: Read Local Stream',
                    localStreamStartTime,
                    new Date().getTime()
                );
                const inConnectionProcessStartTime = new Date().getTime();
                const tracks = mystream.getTracks();
                console.log('VOIP Amal : +++++++ Tracks -Muting Video', tracks);
                this.localStreamRef = mystream;
                let audio = false;
                let video = false;
                tracks.forEach((track) => {
                    if (track.kind === 'video') {
                        video = true;
                    }
                    if (track.kind === 'audio') {
                        audio = true;
                    }
                });
                if (!video && !this.state.voipCall) {
                    AlertDialog.show(
                        'No video',
                        'Please enable camera access for the app from settings'
                    );
                }
                if (!audio) {
                    AlertDialog.show(
                        'No audio',
                        'Please enable audio access for the app from settings'
                    );
                }

                this.setState(
                    {
                        meetingStarted: true,
                        camMuted: !video,
                        localStream: mystream,
                        audioStreamAvailable: audio,
                        videoStreamAvailable: video
                    },
                    async () => {
                        const waitStartTime = new Date().getTime();
                        // call.answer(mystream);
                        call.answer(mystream, {
                            sdpTransform: this.getSdrpOptions
                        });

                        this.sendLog(
                            'VOIP OutGoing5: process incoming connection',
                            inConnectionProcessStartTime,
                            new Date().getTime()
                        );
                        call.on('stream', (stream) => {
                            console.log(
                                'VOIP VOIPevent ouTgoing : call onstream'
                            );
                            this.handleStreamStarted(
                                stream,
                                waitStartTime,
                                'VOIP OutGoing6: wait after processing incoming connection'
                            );
                        });
                        call.on('close', () => {
                            console.log('VOIP VOIPevent ouTgoing : call close');
                            this.callClosed = true;
                            console.log('VOIP voipCall: call close:');
                            this.endCall()
                                .then(() => {
                                    this.goBack();
                                })
                                .catch(() => {
                                    this.goBack();
                                });
                        });
                    }
                );
            })
            .catch((error) => {
                console.log('VOIP ++++++++ Error Getting local Stream', error);
                this.showErrorAndExit('Cannot access cam/mic');
            });
    };

    // handleData = data => {
    //     console.log('VOIP +++++++ handleData DATA', data);
    //     if (data === 'end-call') {
    //         this.cleanup();
    //         Actions.pop();
    //     } else if (data === 'video-off') {
    //         this.setState({ remoteVideoMute: true });
    //     } else if (data === 'video-on') {
    //         this.setState({ remoteVideoMute: false });
    //     } else if (data === 'audio-off') {
    //         this.setState({ remoteAudioMute: true });
    //     } else if (data === 'audio-on') {
    //         this.setState({ remoteAudioMute: false });
    //     } else {
    //         if (data) {
    //             const name = data.name ? data.name : 'Anonymous user';
    //             this.setState({ callerName: this.getNameAcronym(name) });
    //         }
    //     }
    // };

    getNameAcronym(name) {
        const matches = name.match(/\b(\w)/g);
        return matches.join('');
    }

    getCallDetails = () => {
        this.setState({ loading: true }, async () => {
            UserServices.preConnectCallCheck({
                videoSessionId: this.state.callData.videoSessionId,
                callInitiatorUserId: this.state.callData.userId
            })
                .then((res) => {
                    console.log('VOIP voip: connect call cheke result', res);
                    if (res.success) {
                        this.joinMeeting(this.state.callData.videoSessionId);
                    } else {
                        this.showErrorAndExit(
                            'The user is unavailable at the moment.'
                        );
                        this.sendVideoBotErrorMessage(res.error);
                    }
                })
                .catch((error) => {
                    console.log(
                        'VOIP voip: error in preConnectCallCheck',
                        error
                    );
                    this.sendVideoBotErrorMessage(error);
                    this.showErrorAndExit('Cannot get details');
                });
        });
    };

    getConstraints = (facingMode, videoSourceId) => {
        if (this.state.voipCall) {
            if (this.state.isVideoCall) {
                return {
                    audio: true,
                    video: {
                        mandatory: {
                            height: 1280,
                            width: 720,
                            minWidth: 360, // Provide your own width, height and frame rate here
                            minHeight: 640,
                            minFrameRate: 10
                        },
                        facingMode,
                        optional: videoSourceId
                            ? [{ sourceId: videoSourceId }]
                            : []
                    }
                };
            }
            return {
                audio: true
            };
        }
        return {
            audio: true,
            video: {
                mandatory: {
                    minWidth: 500, // Provide your own width, height and frame rate here
                    minHeight: 300,
                    minFrameRate: 10
                },
                facingMode,
                optional: videoSourceId ? [{ sourceId: videoSourceId }] : []
            }
        };
    };

    setMediaBitrate = (sdp, media, bitrate) => {
        const lines = sdp.split('\n');
        let line = -1;
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].indexOf(`m=${media}`) === 0) {
                line = i;
                break;
            }
        }
        if (line === -1) {
            console.log('VOIP ~~~~~~ SDP Could not find the m line for', media);
            return sdp;
        }
        console.log(
            'VOIP ~~~~~~ SDP Found the m line for',
            media,
            'at line',
            line
        );

        // Pass the m line
        line++;

        // Skip i and c lines
        while (
            lines[line].indexOf('i=') === 0 ||
            lines[line].indexOf('c=') === 0
        ) {
            line++;
        }

        // If we're on a b line, replace it
        if (lines[line].indexOf('b') === 0) {
            console.log('VOIP ~~~~~~ SDP Replaced b line at line', line);
            lines[line] = `b=AS:${bitrate}`;
            return lines.join('\n');
        }

        // Add a new b line
        console.log('VOIP ~~~~~~ SDP Adding new b line before line', line);
        let newLines = lines.slice(0, line);
        newLines.push(`b=AS:${bitrate}`);
        newLines = newLines.concat(lines.slice(line, lines.length));
        return newLines.join('\n');
    };

    getSdrpOptions = (sdp) => {
        if (this.netWorkMode === PollingStrategyTypes.satellite) {
            console.log(`VOIP ~~~~~~ SDP sdp${sdp}`);
            const sdp2 = this.setMediaBitrate(
                this.setMediaBitrate(sdp, 'video', 256),
                'audio',
                64
            );
            console.log(`VOIP ~~~~~~ SDP sdp2${sdp2}`);
            return sdp2;
        }
        console.log(
            'VOIP ~~~~~~ SDP retrning original as app is not in sattelite '
        );
        return sdp;
    };

    startLocalStream = () =>
        // isFront will determine if the initial camera should face user or environment
        new Promise((resolve, reject) => {
            if (this.localStream) return resolve(this.localStream);
            console.log('VOIP ++++++ starting local stream');
            const isFront = true;
            mediaDevices.enumerateDevices().then((devices) => {
                const facing = isFront ? 'front' : 'environment';
                const videoSourceId = devices.find(
                    (device) =>
                        device.kind === 'videoinput' && device.facing === facing
                );
                const facingMode = isFront ? 'user' : 'environment';
                // TODO verify frame size

                console.log(
                    '>>>msg ++++++ starting local stream success 1',
                    facingMode,
                    videoSourceId
                );
                const params = this.getConstraints(facingMode, videoSourceId);
                console.log(
                    '>>>msg ++++++ starting local stream success 2',
                    params
                );
                mediaDevices
                    .getUserMedia(params)
                    .then((newStream) => {
                        console.log(
                            '>>>>msg ++++++ starting local stream success'
                        );

                        resolve(newStream);
                    })
                    .catch((e) => {
                        console.log(
                            '>>>>msg ++++++ starting local stream reject'
                        );

                        reject(e);
                    });
            });
        });

    /**
     * Join an existing meeting, while piking the call from queue
     */
    joinMeeting = async (meetingId) => {
        const iceFetchST = new Date().getTime();
        const { iceServers } = await this.getTwilioIceServers();
        const peerCreationST = new Date().getTime();
        this.sendLog(
            'VOIP InComing1: Fetch ICE server',
            iceFetchST,
            peerCreationST
        );
        if (this.state.peer != null) return;
        const peerResponder = new Peer({
            host: webrtc_server,
            path: '/webrtc/peerjs/myapp',
            debug: 3,
            secure: true,
            iceTransportPolicy: 'relay',
            config: {
                iceServers: iceServers
            },
            video: !this.state.voipCall
        });
        peerResponder.on('error', (err) => {
            console.log(
                'VOIP VOIPevent peerresponse jionnmeeting : error',
                err
            );
            setTimeout(() => {
                if (this.callClosed) return;
                if (err.type === 'peer-unavailable') {
                    this.endCall();
                    this.sendEndCallEvent();
                    this.sendVideoBotErrorMessage(
                        'The meeting was ended by the host'
                    );
                    this.showErrorAndExit('Cannot connect to user');
                    console.log('VOIP +++++++  peer-unavailable');
                } else if (err.type === 'network') {
                    const params = {
                        entry: {
                            level: 'LOG',
                            message: 'Call failure'
                        },
                        type: 'SYSTEM',
                        data: err
                    };
                    Utils.addLogEntry(params);
                    //this.sendVideoBotErrorMessage(err.type);
                    //this.showErrorAndExit(
                    //    'Your call got disconnected because of poor network connection'
                    //);
                    console.log('VOIP Error in network : ', err);
                } else {
                    this.sendVideoBotErrorMessage(err.type);
                }
            }, 1000);
        });
        peerResponder.on('disconnect', () => {
            console.log('VOIP VOIPevent InComing : peerResponder disconnect');
            console.log('VOIP +++++++  RESPONDER:: PEER DISCONNECTED');
            this.handleDisconnect();
        });
        peerResponder.on('data', (data) => {
            console.log('VOIP +++++++ : Received DATA', data);
        });
        peerResponder.on('open', (data) => {
            console.log('VOIP VOIPevent InComing : peerResponder open');
            console.log('VOIP +++++++ : peerResponder open', data);
            this.sendLog(
                'VOIP InComing: Opening Peer',
                peerCreationST,
                new Date().getTime()
            );
            this.connectToMeeting(peerResponder, meetingId);
        });
        peerResponder.on('close', () => {
            console.log('VOIP VOIPevent InComing : peerResponder close');
        });
        this.setState({ peer: peerResponder });
        const callConnectTimeout = setTimeout(() => {
            this.sendVideoBotErrorMessage(
                'We are unable to connect the call right now.'
            );
            this.sendEndCallEvent();
            this.showErrorAndExit(
                'We are unable to connect the call right now.'
            );
        }, 50000);
        this.setState({ callConnectTimeout });
    };

    handleStreamStarted = (stream, startTime, action) => {
        this.sendLog(action, startTime, new Date().getTime());
        const d = new Date();
        this.setState({
            callStartTime: d.getTime()
        });
        this.intervalId = BackgroundTimer.setInterval(() => {
            this.setState((prevState) => ({
                callTime: prevState.callTime + 1
            }));
        }, 1000);

        InCallManager.stopRingback();
        console.log('VOIP VOIP InComing : Stream started');
        console.log('VOIP +++++++ STREAM STARTED', stream);
        if (this.state.callConnectTimeout) {
            clearTimeout(this.state.callConnectTimeout);
        }
        if (stream.getVideoTracks() && stream.getVideoTracks().length > 0) {
            const track = stream.getVideoTracks()[0];

            track.onmute = () => {
                this.setState({ remoteVideoMute: true });
            };
            track.onunmute = () => {
                this.setState({ remoteVideoMute: false });
            };
        }

        this.setState({
            remoteStream: stream,
            loading: false,
            callStarted: true,
            status: MeetingRoomStatus.IN_PROGRESS
        });
        if (!this.state.voipCall) {
            this.sendVideoBotMessage(MeetingRoomActions.CALL_ACTIVE);
            if (!this.state.speakerOn) this.toggleSpeaker();
        }
        // if (this.state.isVideoCall && !this.state.speakerOn) {
        if (this.state.isVideoCall) {
            // this.toggleSpeaker();
            this.startSpeaker();
        }
    };

    // speaker not getting turned on
    // https://github.com/react-native-webrtc/react-native-incall-manager/issues/123
    startSpeaker = async () => {
        const { speakerOn } = this.state;
        if (!speakerOn) {
            await InCallManager.checkRecordPermission();
            this.startInCallManager(true);
            this.setState({ speakerOn: true });
        }
    };

    connectToMeeting = async (peerResponder, meetingId) => {
        const localStreamST = new Date().getTime();
        this.startLocalStream()
            .then((mystream) => {
                const localStreamET = new Date().getTime();
                this.sendLog(
                    'VOIP InComing: read local media',
                    localStreamST,
                    localStreamET
                );
                this.setState({ meetingStarted: true }, async () => {
                    const tracks = mystream.getTracks();
                    console.log(
                        'VOIP InComing Amal : Connect to meeting +++++++ Tracks -Muting Video',
                        tracks
                    );
                    this.localStreamRef = mystream;
                    let audio = false;
                    let video = false;
                    tracks.forEach((track) => {
                        if (track.kind === 'video') {
                            video = true;
                        }
                        if (track.kind === 'audio') {
                            audio = true;
                        }
                    });
                    if (!this.state.voipCall && !video) {
                        AlertDialog.show(
                            'No video',
                            'Please enable camera access for the app from settings'
                        );
                    }
                    if (!audio) {
                        AlertDialog.show(
                            'No audio',
                            'Please enable audio access for the app from settings'
                        );
                    }
                    this.setState({
                        localStream: mystream,
                        audioStreamAvailable: audio,
                        videoStreamAvailable: video,
                        camMuted: !video
                    });
                    console.log(
                        `VOIP InComing : Initialized . calling + ${meetingId} ${mystream}`
                    );
                    // const dataConnection = peerResponder.connect(meetingId);
                    // const call = peerResponder.call(meetingId, mystream);
                    const call = peerResponder.call(meetingId, mystream, {
                        sdpTransform: this.getSdrpOptions
                    });

                    console.log('VOIP VOIP InComing : Initialized . called');

                    call.on('stream', (stream) => {
                        console.log('VOIP VOIPevent InComing : on stream');
                        this.handleStreamStarted(
                            stream,
                            localStreamET,
                            'VOIP InComing4: Wait for stream open'
                        );
                    });
                    call.on('close', () => {
                        console.log(
                            'VOIP voipCall: VOIPevent InComing : on close'
                        );
                        this.callClosed = true;
                        this.endCall()
                            .then(() => {
                                this.goBack();
                            })
                            .catch(() => {
                                this.goBack();
                            });
                    });
                    call.on('error', (error) => {
                        console.log(
                            `VOIPevent InComing : error . ${JSON.stringify(
                                error
                            )}`
                        );
                    });
                    this.setState({
                        call
                    });
                });
            })
            .catch((error) => {
                this.showErrorAndExit(
                    'Cannot get access to Camera and Speaker'
                );
                this.sendVideoBotErrorMessage(
                    'Cannot get access to Camera and Speaker'
                );
            });
    };

    cleanup = async () => {
        const { dataConnection, peer } = this.state;
        if (this.localStreamRef) {
            console.log('VOIP +++++++ ENDING CALL stopping streams');
            this.localStreamRef.getTracks().forEach((track) => {
                track.stop();
            });
            this.localStreamRef = null;
        }

        if (dataConnection) dataConnection.close();
        if (peer) peer.destroy();
    };

    sendEndCallEvent = () => {
        if (this.endCallSent) return;
        // if (!this.callStartSent && this.createdMeeting) return; // if start call is not sent , then dont send the end call
        this.endCallSent = true;
        try {
            // console.log('VOIP voipCall: try to send  end call sent');
            const { newVoipCallData, callData, isVideoCall } = this.state;
            if (callData || newVoipCallData) {
                // console.log('VOIP voipCall: sending end call');

                UserServices.sendVoipPushNotification({
                    userId: newVoipCallData
                        ? newVoipCallData.otherUserId
                        : callData.callerUserId,
                    videoSessionId: this.calSessionId,
                    callerUserId: this.userId,
                    callAction: 'CallEnd',
                    video: isVideoCall
                })
                    .then((result) => {
                        // console.log('VOIP voipCall: endcall sent', result);
                    })
                    .catch((e) => {
                        // console.log('VOIP voipCall: sending end call error', e);
                    });
            }
        } catch (error) {
            console.log('VOIP error', error);
        }
    };

    endCall = async () => {
        // InCallManager.startRingback();

        if (this.callEnded) {
            console.log('VOIP voipCall: CALL already ended, skipping');
            return;
        }
        console.log('VOIP >>>>>> ENDING CALL');
        this.callEnded = true;
        if (this.state.dataConnection) {
            this.state.dataConnection.send('end-call');
            console.log(
                'VOIP +++++++ ENDING CALL Sending End Call and Waiting'
            );
        }
        if (this.state.call) this.state.call.close();
        this.sendVideoBotMessage(MeetingRoomActions.CALL_END);
        if (this.intervalId) {
            BackgroundTimer.clearInterval(this.intervalId);
            this.intervalId = null;
        }
        if (this.intervalConnectionProgressId) {
            clearInterval(this.intervalConnectionProgressId);
            this.intervalConnectionProgressId = null;
        }
        if (this.state.voipCall) {
            await this.sendCallSummary();
            console.log('VOIP >>>>>>> sent summary returned');
        }
        try {
            console.log('VOIP >>>>> calenup started');
            await this.cleanup();
            console.log('VOIP >>>>> calenup ended');
        } catch (error) {
            Bugsnag.notify(error, (report) => {
                report.context = 'Call error - cleanup';
            });
            console.log('VOIP >>>>> calenup ended');
        }
    };

    getOtherUserId = () => {
        if (this.props.route.params.voipCallData) {
            return this.props.route.params.voipCallData.otherUserId;
        }
        if (this.props.route.params.data) {
            return this.props.route.params.data.otherUserId;
        }
    };

    sendCallSummary = async () => {
        //voipCallData is present only when the current user initiates the call.
        //Call summary has to be sentonly in this case
        console.log(
            'voipCall: Seding call summary check',
            this.props.route.params.voipCallData
        );
        if (this.props.route.params.voipCallData) {
            const { callStartTime, callTime, isVideoCall } = this.state;

            const calldata = {
                callerUserId: this.props.route.params.incomingVoipCall
                    ? this.getOtherUserId()
                    : this.userId,
                userId: this.props.route.params.incomingVoipCall
                    ? this.userId
                    : this.getOtherUserId(),
                video: isVideoCall,
                callAction: 'CallSummary',
                callType: 'VOIP',
                callDuration: callTime.toString(),
                callStartTime: callStartTime || new Date().getTime()
            };
            try {
                return UserServices.sendVoipPushNotification(calldata);
            } catch (err) {
                this.sendLog('CALLSUMMARY_FILED');
                console.log('VOIP >>>>>>> erro sding summary');
                Bugsnag.notify(error, (report) => {
                    report.context = 'Call error - sendCallSummary';
                });
                resolve();
            }
        }
    };

    callPress = async () => {
        InCallManager.stopRingback();
        this.sendEndCallEvent();
        console.log('VOIP voipCall: end call done, ging back');
        this.setState({ loading: false });
        if (
            this.state.status <= MeetingRoomStatus.WAITING ||
            NavigationAction.currentScreen() ===
                NavigationAction.SCREENS.meetingRoom
        ) {
            await this.endCall();
            this.goBack();
        } else await this.endCall();
    };

    goBack = () => {
        if (
            NavigationAction.currentScreen() ===
            NavigationAction.SCREENS.meetingRoom
        ) {
            console.log('VOIP >>>>>>> poping');
            if (this.props.route.params.backKey) {
                // NavigationAction.popTo(this.props.route.params.backKey);//TODO popto
                NavigationAction.pop();
            } else {
                NavigationAction.pop();
            }
        }
    };

    camPress = () => {
        const { camMuted, dataConnection } = this.state;
        if (this.localStreamRef) {
            if (camMuted) {
                const tracks = this.localStreamRef.getTracks();
                console.log('VOIP +++++++ un-Muting video');
                tracks.forEach((track) => {
                    if (track.kind === 'video') {
                        track.enabled = true;
                    }
                });
                this.sendData('video-on');
                if (dataConnection) {
                    dataConnection.send('video-on');
                }
            } else {
                const tracks = this.localStreamRef.getTracks();
                console.log('VOIP +++++++ Muting video');
                tracks.forEach((track) => {
                    if (track.kind === 'video') {
                        track.enabled = false;
                    }
                });
                this.sendData('video-off');
                if (dataConnection) {
                    dataConnection.send('video-off');
                }
            }
            this.setState((prevState) => ({
                camMuted: !camMuted
            }));
        }
    };

    micPress = () => {
        const { isMuted, dataConnection } = this.state;
        if (this.localStreamRef) {
            if (isMuted) {
                const tracks = this.localStreamRef.getTracks();
                console.log('VOIP +++++++ un-Muting audio');
                tracks.forEach((track) => {
                    if (track.kind === 'audio') {
                        track.enabled = true;
                    }
                });
                if (dataConnection) {
                    dataConnection.send('audio-on');
                }
            } else {
                const tracks = this.localStreamRef.getTracks();
                console.log('VOIP +++++++ Muting audio');
                tracks.forEach((track) => {
                    if (track.kind === 'audio') {
                        track.enabled = false;
                    }
                });
                if (dataConnection) {
                    dataConnection.send('audio-off');
                }
            }
            this.setState({ isMuted: !isMuted });
        }
    };

    toggleSpeaker = () => {
        const { speakerOn } = this.state;
        console.log(
            '%cIn speaker On',
            'color: red; font-size: 20px;',
            speakerOn
        );
        if (speakerOn) {
            InCallManager.setForceSpeakerphoneOn(false);
        } else {
            InCallManager.setForceSpeakerphoneOn(true);
        }
        this.setState((prevState) => ({
            speakerOn: !prevState.speakerOn
        }));
    };

    sendVideoBotMessage = (action) => {
        if (this.props.route.params.sendMessage && !this.state.voipCall) {
            const msg = {
                controlId: this.state.callData.videoControlId,
                action,
                videoSessionId: this.state.callData.videoSessionId
            };
            const message = new Message();
            message.messageByBot(false);
            message.videoResponseMessage(msg);
            message.setCreatedBy(this.userId);
            console.log('VOIP +++++++ sending message ', message);
            this.props.route.params.sendMessage(message);
        }
    };

    sendVideoBotErrorMessage = (errorMsg) => {
        if (this.props.route.params.sendMessage) {
            const msg = {
                controlId: this.state.callData.videoControlId,
                action: MeetingRoomActions.ERROR,
                errorMessage: errorMsg,
                videoSessionId: this.state.callData.videoSessionId
            };
            const message = new Message();
            message.messageByBot(false);
            message.videoResponseMessage(msg);
            message.setCreatedBy(this.userId);
            console.log('VOIP +++++++ sending message ', message);
            this.props.route.params.sendMessage(message);
        }
    };

    showErrorAndExit = (message, title = 'Error') => {
        if (
            NavigationAction.currentScreen() ===
            NavigationAction.SCREENS.meetingRoom
        ) {
            AlertDialog.show(title, message, [
                {
                    text: 'OK',
                    onPress: this.goBack
                }
            ]);
        }
    };

    renderLocalStream = (localStream) => {
        console.log('VOIP voipCall: rednering local srteam ');
        return (
            <RTCView
                zOrder={2}
                zIndex={2}
                style={styles.rtc}
                streamURL={localStream.toURL()}
            />
        );
    };

    renderVideoCall = () => {
        const {
            localStream,
            remoteStream,
            camMuted,
            remoteVideoMute,
            loading,
            callerName
        } = this.state;
        return Platform.OS === 'ios' ? (
            <View style={[styles.rtcview]}>
                {this.state.status === MeetingRoomStatus.IN_PROGRESS && (
                    <SafeAreaView
                        zOrder={3}
                        zIndex={3}
                        style={styles.buttonLayout}
                    >
                        <View style={[styles.videoDurationContainer]}>
                            {/* eslint-disable-next-line max-len */}
                            <Text style={styles.videoCallDuration}>
                                {new Date(this.state.callTime * 1000)
                                    .toISOString()
                                    .substr(11, 8)}
                            </Text>
                        </View>
                    </SafeAreaView>
                )}
                {!remoteStream || remoteVideoMute ? (
                    !loading && this.renderAvatar()
                ) : (
                    <RTCView
                        zOrder={1}
                        zIndex={1}
                        style={styles.rtc}
                        streamURL={remoteStream.toURL()}
                        objectFit="cover"
                    />
                )}
                {localStream && !camMuted && (
                    <>
                        <View style={styles.videoCallerName}>
                            <Text style={styles.videoCallNameText}>
                                {callerName}
                            </Text>
                        </View>
                        <View
                            zOrder={2}
                            zIndex={2}
                            style={[styles.localStream]}
                        >
                            {this.renderLocalStream(localStream)}
                        </View>
                    </>
                )}
            </View>
        ) : (
            <View style={[styles.rtcview]}>
                {this.state.status === MeetingRoomStatus.IN_PROGRESS && (
                    <SafeAreaView
                        zOrder={1}
                        zIndex={1}
                        style={styles.buttonLayout}
                    >
                        <View style={[styles.videoDurationContainer]}>
                            {/* eslint-disable-next-line max-len */}
                            <Text style={styles.videoCallDuration}>
                                {new Date(this.state.callTime * 1000)
                                    .toISOString()
                                    .substr(11, 8)}
                            </Text>
                        </View>
                    </SafeAreaView>
                )}
                {!remoteStream || remoteVideoMute ? (
                    !loading && this.renderAvatar()
                ) : (
                    <RTCView
                        zOrder={1}
                        zIndex={1}
                        style={styles.rtc}
                        streamURL={remoteStream.toURL()}
                        objectFit="cover"
                    />
                )}
                {localStream && !camMuted && (
                    <>
                        <View style={styles.videoCallerName}>
                            <Text style={styles.videoCallNameText}>
                                {callerName}
                            </Text>
                        </View>
                        <View style={[styles.localStream]}>
                            <RTCView
                                zOrder={2}
                                zIndex={2}
                                style={styles.rtc}
                                streamURL={localStream.toURL()}
                            />
                        </View>
                    </>
                )}
            </View>
        );
    };

    renderControls() {
        const { camMuted, isMuted, loading, speakerOn, voipCall, isVideoCall } =
            this.state;
        if (voipCall && !isVideoCall) {
            return (
                <SafeAreaView zOrder={3} zIndex={3} style={styles.buttonLayout}>
                    <View style={styles.callingToggleButtonsArea}>
                        <TouchableOpacity
                            style={
                                speakerOn
                                    ? styles.button
                                    : styles.buttonDisabled
                            }
                            onPress={this.toggleSpeaker}
                        >
                            {Icons.speakerOn({
                                size: PixelRatio.getPixelSizeForLayoutSize(13),
                                color: speakerOn
                                    ? GlobalColors.textBlack
                                    : GlobalColors.white
                            })}
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={
                                isMuted ? styles.button : styles.buttonDisabled
                            }
                            onPress={this.micPress}
                        >
                            {Icons.micOff({
                                size: PixelRatio.getPixelSizeForLayoutSize(13),
                                color: isMuted
                                    ? GlobalColors.textBlack
                                    : GlobalColors.white
                            })}
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                        style={styles.phoneHangupButton}
                        onPress={() => this.callPress()}
                    >
                        {Icons.phoneHangup({
                            size: PixelRatio.getPixelSizeForLayoutSize(13),
                            color: GlobalColors.white
                        })}
                    </TouchableOpacity>
                </SafeAreaView>
            );
        }
        return (
            <SafeAreaView zOrder={3} zIndex={3} style={styles.buttonLayout}>
                <View style={styles.callingVideoButtonsArea}>
                    <TouchableOpacity
                        style={
                            speakerOn
                                ? styles.videoButton
                                : styles.videoButtonDisabled
                        }
                        onPress={this.toggleSpeaker}
                    >
                        {Icons.speakerOn({
                            size: PixelRatio.getPixelSizeForLayoutSize(11),
                            color: speakerOn
                                ? GlobalColors.videoCallIconSelected
                                : GlobalColors.videoCallIcons
                        })}
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={
                            isMuted
                                ? styles.videoButton
                                : styles.videoButtonDisabled
                        }
                        onPress={this.micPress}
                    >
                        {Icons.videoCallMute({
                            size: PixelRatio.getPixelSizeForLayoutSize(11),
                            color: isMuted
                                ? GlobalColors.videoCallIconSelected
                                : GlobalColors.videoCallIcons
                        })}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={
                            camMuted
                                ? styles.videoButton
                                : styles.videoButtonDisabled
                        }
                        onPress={this.camPress}
                    >
                        {camMuted
                            ? Icons.videoCallCamOff({
                                  size: PixelRatio.getPixelSizeForLayoutSize(8),
                                  color: !camMuted
                                      ? GlobalColors.videoCallIconSelected
                                      : GlobalColors.videoCallIcons
                              })
                            : Icons.videoCallCam({
                                  size: PixelRatio.getPixelSizeForLayoutSize(
                                      12
                                  ),
                                  color: camMuted
                                      ? GlobalColors.videoCallIconSelected
                                      : GlobalColors.videoCallIcons
                              })}
                    </TouchableOpacity>

                    {/* commented for future */}
                    {/* <TouchableOpacity */}
                    {/*    style={ */}
                    {/*        !camMuted */}
                    {/*            ? styles.videoButton */}
                    {/*            : styles.videoButtonDisabled */}
                    {/*    } */}
                    {/*    onPress={this.camPress} */}
                    {/* > */}
                    {/*    {Icons.presentToAll({ */}
                    {/*        size: PixelRatio.getPixelSizeForLayoutSize(8), */}
                    {/*        color: !camMuted */}
                    {/*            ? GlobalColors.videoCallIconSelected */}
                    {/*            : GlobalColors.videoCallIcons */}
                    {/*    })} */}
                    {/* </TouchableOpacity> */}

                    {/* <TouchableOpacity */}
                    {/*    style={ */}
                    {/*        isMuted */}
                    {/*            ? styles.videoButton */}
                    {/*            : styles.videoButtonDisabled */}
                    {/*    } */}
                    {/*    onPress={this.micPress} */}
                    {/* > */}
                    {/*    {Icons.videoCallRecord({ */}
                    {/*        size: PixelRatio.getPixelSizeForLayoutSize(13), */}
                    {/*        color: isMuted */}
                    {/*            ? GlobalColors.videoCallIconSelected */}
                    {/*            : GlobalColors.videoCallIcons */}
                    {/*    })} */}
                    {/* </TouchableOpacity> */}

                    <TouchableOpacity
                        style={styles.videoPhoneHangupButton}
                        onPress={this.callPress}
                    >
                        {Icons.videoCallEnd({
                            size: PixelRatio.getPixelSizeForLayoutSize(8),
                            color: GlobalColors.white
                        })}
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    renderNameIfAvailable() {
        if (this.state.callerName) {
            return (
                <View
                    zIndex={3}
                    style={{
                        height: 200,
                        width: 200,
                        size: 100,
                        borderRadius: 100,
                        borderColor: GlobalColors.white,
                        borderWidth: 4,
                        textAlign: 'center',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}
                >
                    <Text
                        style={{
                            color: GlobalColors.white,
                            fontSize: 24,
                            fontWeight: AppFonts.BOLD
                        }}
                    >
                        {this.state.callerName}
                    </Text>
                </View>
            );
        }
    }

    renderVoiceCallUI() {
        const { voipCall, isVideoCall, loading } = this.state;
        return (
            <View style={styles.loading}>
                {voipCall && (
                    <View style={styles.callingContainer}>
                        {/* <View style={{ display: 'flex', flexDirection: 'column' }}>
                        {this.renderCallerInfo()}
                    </View> */}

                        {(!isVideoCall || loading) && this.renderAvatar()}
                        {!isVideoCall && this.renderCallerInfo()}
                        {(!isVideoCall || loading) && this.renderCallStatus()}
                    </View>
                )}
            </View>
        );
    }

    renderCallerInfo = () => {
        if (this.state.callerName) {
            return (
                <View style={{ marginHorizontal: 24, marginVertical: 8 }}>
                    <Text style={styles.callingNumberText}>
                        {this.state.callerName}
                    </Text>
                </View>
            );
        }
        return (
            <View>
                <Text style={styles.callingNumberText} />
            </View>
        );
    };

    renderCallStatus = () => {
        let statusText;
        switch (this.state.status) {
            case MeetingRoomStatus.IN_PROGRESS:
                statusText = new Date(this.state.callTime * 1000)
                    .toISOString()
                    .substr(11, 8);
                // statusText = 'CONNECTED';// todo
                break;
            case MeetingRoomStatus.INITIATING:
                statusText = 'CONNECTING';
                break;
            case MeetingRoomStatus.WAITING:
                statusText = 'RINGING';
                break;
            case MeetingRoomStatus.ENDING:
                statusText = 'DISCONNECTING';
                break;
            default:
                statusText = '...';
        }

        return <Text style={styles.callStatusText}>{statusText}</Text>;
    };

    renderAvatar = () => {
        let userimage = null;
        // if (this.state.callerID) {
        //     userimage = (
        //         <ProfileImage
        //             uuid={this.state.callerID}
        //             placeholder={require('../../images/contact/calling-emptyavatar.png')}
        //             style={{
        //                 height: hp('20%'),
        //                 width: hp('20%'),
        //                 borderRadius: hp('20%') / 2,
        //                 position: 'absolute'
        //             }}
        //             placeholderStyle={{
        //                 height: hp('20%'),
        //                 width: hp('20%'),
        //                 borderRadius: hp('20%') / 2,
        //                 position: 'absolute'
        //             }}
        //             resizeMode="cover"
        //         />
        //     );
        // } else {
        userimage = (
            <Image
                // style={[Styles.avatar, { position: 'absolute' }]}
                style={{
                    height: hp('20%'),
                    width: hp('20%'),
                    borderRadius: hp('20%') / 2,
                    position: 'absolute'
                }}
                source={images.green_goblin}
            />
        );

        if (
            this.state.status === MeetingRoomStatus.INITIATING ||
            this.state.status === MeetingRoomStatus.WAITING ||
            (this.props.route.params.incomingVoipCall &&
                this.state.status === MeetingRoomStatus.INITIATING)
        ) {
            return (
                <Progress.Pie
                    size={diameter}
                    progress={
                        this.state.loading
                            ? this.state.connectionProgress / 50
                            : 1
                    }
                    // progress={1}
                    color={GlobalColors.green}
                    style={{
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    {userimage}
                </Progress.Pie>
            );
        }
        if (
            this.state.status === MeetingRoomStatus.IN_PROGRESS ||
            (this.props.route.params.incomingVoipCall &&
                this.state.status === MeetingRoomStatus.IN_PROGRESS) ||
            this.state.status === MeetingRoomStatus.INITIATING
        ) {
            return (
                <View
                    style={[
                        this.state.isVideoCall
                            ? styles.videoAvatar
                            : styles.avatar
                    ]}
                >
                    <Image
                        style={[
                            this.state.isVideoCall
                                ? styles.videoAvatarImage
                                : styles.avatarImage
                        ]}
                        resizeMode="contain"
                        source={images.emptyAvatarCall}
                    />
                </View>
            );
        }
    };

    renderLoadingArea = () => {
        let { botMessage } = this.props.route.params;
        botMessage = botMessage || ' ';
        return (
            <View style={styles.loadingArea}>
                {botMessage && (
                    <Text style={styles.waitingMessage}>{botMessage}</Text>
                )}
                <ActivityIndicator size="small" style={styles.loading} />
            </View>
        );
    };

    render() {
        const { loading, voipCall, isVideoCall } = this.state;
        // when sendMessage fucntion i avaliable, it measn we are performing bot calls.
        return (
            <View style={styles.container}>
                {(isVideoCall || !voipCall) &&
                    // !(Platform.OS === 'android') && // temporary code for not rendering video in android
                    this.renderVideoCall()}
                {loading &&
                    this.props.route.params.sendMessage &&
                    this.renderLoadingArea()}
                {this.renderVoiceCallUI()}
                {this.renderControls()}
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    botMessage: state.bots.messageByBot
});

export default connect(mapStateToProps)(MeetingRoom);
