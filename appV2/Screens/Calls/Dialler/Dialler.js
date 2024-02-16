import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    Image,
    ScrollView,
    PermissionsAndroid,
    Platform,
    BackHandler
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import Popover, { PopoverPlacement } from 'react-native-popover-view';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';

import { Endpoint } from 'react-native-pjsip';
import Sound from 'react-native-sound';
import Modal from 'react-native-modal';
import InCallManager from 'react-native-incall-manager';
import ModalDialPad, { PhoneButtons } from './DiallerComponents/ModalDialPad';

import Styles from './styles';
import { Icons } from '../../../config/icons';
import {
    EventEmitter,
    CallQuotaEvents,
    CallsEvents
} from '../../../lib/events';
import I18n from '../../../config/i18n/i18n';
import {
    CallQuota,
    Auth,
    Network,
    DeviceStorage,
    Utils
} from '../../../lib/capability';
import GlobalColors from '../../../config/styles';
import CountryCodes from './code';
import { ProfileImage } from '../../../widgets';
import phoneStyles from './styles_phone';
import {
    GoogleAnalytics,
    GoogleAnalyticsEventsCategories,
    GoogleAnalyticsEventsActions
} from '../../../lib/GoogleAnalytics';
import UserServices from '../../../apiV2/UserServices';
import Bugsnag from '../../../config/ErrorMonitoring';
import SipAccount from './SipAccount';
import configToUse from '../../../config/config';
import Connection from '../../../lib/events/Connection';
import AsyncStorage from '@react-native-community/async-storage';
import VIForegroundService from '@voximplant/react-native-foreground-service';
import NavigationAction from '../../../navigation/NavigationAction';
import images from '../../../images';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NumberPad } from './DiallerComponents/NumberPad';
import { Pressable } from 'react-native';
import AlertDialog from '../../../lib/utils/AlertDialog';
import { Toast } from 'react-native-toast-message/lib/src/Toast';
import AppFonts from '../../../config/fontConfig';

const R = require('ramda');

const PSTN_CALL = {
    SAT_CALL: 'SAT_CALL',
    NOT_SUPPORTED: 'NOT_SUPPORTED',
    OTHER_CALL: 'OTHER_CALL'
};

let EventListeners = [];

export const DiallerState = {
    initial: 0,
    connecting: 1,
    ringing: 2,
    incall: 3,
    incall_digits: 4
};

const kSort = (src) => {
    const keys = Object.keys(src);
    keys.sort();
    return keys.reduce((target, key) => {
        target[key] = src[key];
        return target;
    }, {});
};

// PSTN CALLS
export default class Dialler extends React.Component {
    constructor(props) {
        super(props);
        const { Inmarsat, Iridium, ...rest } = CountryCodes();
        const countries = kSort(rest);
        const countryCodes = { Inmarsat, Iridium, ...countries };
        this.state = {
            diallerState: DiallerState.initial,
            dialledNumber: '+',
            dialledDigits: '',
            micOn: true,
            speakerOn: false,
            callQuota: 0,
            callQuotaUpdateError: false,
            updatingCallQuota: true,
            creatingEndPoint: true,
            callTime: 0,
            codes: countryCodes,
            showCodes: false,
            countryElements: [],
            isModalDialPadVisible: false,
            satCall: false,
            // react-native-pjsip properties
            callerEndpoint: null,
            callingAccount: null,
            currentCall: null,
            callEndTime: new Date().getTime(),
            showPasteOption: false
        };
        this.intervalId = null;
    }

    handleBackButtonClick = () => {
        if (this.state.diallerState <= DiallerState.ringing) {
            this.hangupCall();
            return false;
        }
        return true;
    };

    componentDidMount() {
        this.mounted = true;
        this.getBalance();
        Platform.OS === 'android' && this.requestRecordRermission();

        this.backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            this.handleBackButtonClick
        );
        // PJSIP
        // this.setupPJSIP();

        EventListeners.push(
            EventEmitter.addListener(
                CallQuotaEvents.UPDATED_QUOTA,
                this.handleCallQuotaUpdateSuccess
            )
        );

        EventListeners.push(
            EventEmitter.addListener(
                CallQuotaEvents.UPD_QUOTA_ERROR,
                this.handleCallQuotaUpdateFailure
            )
        );

        EventListeners.push(
            EventEmitter.addListener(
                CallsEvents.callTerminate,
                this.handleCallTerminateEvent
            )
        );

        this.setState({ callTime: 0 });
        if (this.props.route.params?.phoneNumber) {
            this.setState({
                dialledNumber: this.props.route.params?.phoneNumber
            });
        }

        if (this.props.route.params?.call && this.props.route.params?.number) {
            this.setState({ dialledNumber: this.props.route.params?.number });
        }
        Auth.isPostPaidUser().then((isPostPaidUser) => {
            this.setState({ prepaid: !isPostPaidUser });
        });

        this.networkStatusSubscription = EventEmitter.addListener(
            Connection.netWorkStatusChange,
            this.handleConnectionChange
        );

        Sound.setCategory('Playback');
    }

    componentWillUnmount() {
        this.mounted = false;
        this.placingCall = false;
        EventListeners.forEach((listener) => listener.remove());
        EventListeners = [];
        EventEmitter.emit(CallsEvents.callHistoryUpdated);
        this.backHandler?.remove();

        this.networkStatusSubscription?.remove();
    }

    componentDidUpdate(prevProps, prevState) {
        if (
            prevState.updatingCallQuota !== this.state.updatingCallQuota &&
            !this.state.updatingCallQuota
        ) {
        }
    }

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

    handleConnectionChange = (connection) => {
        console.log('Netweork Changed', connection);
        if (!connection.isInternetReachable) {
            this.hangupCall();
        }
    };

    requestRecordRermission = async () => {
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
                {
                    title: 'Audio Record Permission',
                    message: 'Audio Record Permission is required'
                }
            );
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                console.log('Audio Record Permission Granted.');
            } else {
                console.log('Audio Record Permission Not Granted');
            }
        } catch (err) {
            console.warn(err);
        }
    };

    getBalance() {
        this.setState({ updatingCallQuota: true }, async () => {
            try {
                UserServices.getUserBalance()
                    .then(({ callQuota, error }) => {
                        this.setState(
                            {
                                callQuota: callQuota,
                                updatingCallQuota: false,
                                callQuotaUpdateError: false
                            },
                            () => {
                                // PJSIP
                                this.setupPJSIP();
                            }
                        );
                        if (error === 0) {
                            DeviceStorage.save(
                                CallQuota.CURRENT_BALANCE_LOCAL_KEY,
                                callQuota
                            );
                        }
                    })
                    .catch((err) => {
                        console.log(
                            'Error in updating balance : ',
                            JSON.stringify(err)
                        );
                    });
            } catch (error) {
                try {
                    const newBalance = await CallQuota.getBalanceLocal();
                    this.setState(
                        {
                            callQuota: newBalance,
                            updatingCallQuota: false,
                            callQuotaUpdateError: false
                        },
                        () => {
                            // PJSIP
                            this.setupPJSIP();
                        }
                    );
                } catch (e) {
                    this.setState({
                        updatingCallQuota: false,
                        callQuotaUpdateError: true
                    });
                }
            }
        });
    }

    checkSatelliteCall(number) {
        if (number.startsWith('00870') || number.startsWith('+870')) {
            return [PSTN_CALL.SAT_CALL];
        }
        if (number.startsWith('008816') || number.startsWith('+8816')) {
            return [PSTN_CALL.SAT_CALL];
        }
        if (number.startsWith('00882') || number.startsWith('+882')) {
            return [PSTN_CALL.NOT_SUPPORTED, I18n.t('Thuraya_message')];
        }
        return [PSTN_CALL.OTHER_CALL];
    }

    async getSatelliteCallNumber(number) {
        try {
            let callingNumber;
            if (number.startsWith('00870') || number.startsWith('00816')) {
                callingNumber = number.substring(2);
            }
            if (number.startsWith('+870') || number.startsWith('+8816')) {
                callingNumber = number.substring(1);
            }

            return {
                error: null,
                sat_phone_number: null,
                sat_phone_pin: null,
                phone_number: callingNumber
            };
        } catch (error) {
            return {
                error,
                phoneNumber: null
            };
        }
    }

    call = async () => {
        if (this.placingCall) return;
        this.placingCall = true;
        console.log('~~~~ placing call---');
        const connection = await Network.isConnected();
        if (!connection) {
            Toast.show({ text1: I18n.t('No_Network') });
            return;
        }
        if (this.state.dialledNumber.length < 9) {
            AlertDialog.show(I18n.t('Enter_valid_number'));
            return;
        }
        if (this.state.prepaid && this.state.callQuota <= 0) {
            AlertDialog.show(I18n.t('No_balance'));
            return;
        }
        try {
            let toNumber = this.state.dialledNumber;
            const [call_type, pstnMessage] = this.checkSatelliteCall(
                this.state.dialledNumber
            );
            if (call_type === PSTN_CALL.NOT_SUPPORTED) {
                this.setState({ diallerState: DiallerState.initial });
                AlertDialog.show(pstnMessage);
                return;
            }
            const user = Auth.getUserData();
            if (call_type === PSTN_CALL.SAT_CALL) {
                GoogleAnalytics.logEvents(
                    GoogleAnalyticsEventsCategories.CALL,
                    GoogleAnalyticsEventsActions.SATELLITE_CALL,
                    null,
                    0,
                    null
                );
                const { error, sat_phone_number, sat_phone_pin, phone_number } =
                    await this.getSatelliteCallNumber(
                        this.state.dialledNumber,
                        user
                    );
                if (error) {
                    AlertDialog.show('Unable to Call number');
                    return;
                }
                toNumber = sat_phone_number;
                toNumber = phone_number;
                this.setState({
                    satCall: true,
                    satCallPin: sat_phone_pin,
                    call_to: phone_number
                });
                console.log(
                    `~~~~ placing call--- ${phone_number}  pin: ${sat_phone_pin}`
                );
            } else {
                GoogleAnalytics.logEvents(
                    GoogleAnalyticsEventsCategories.CALL,
                    GoogleAnalyticsEventsActions.PSTN_CALL,
                    null,
                    0,
                    null
                );
                this.setState({
                    satCall: false,
                    satCallPin: null,
                    call_to: null
                });
            }
            this.setState({ diallerState: DiallerState.connecting });
            if (this.mounted) {
                console.log(`~~~~ makeSIPCall call--- ${toNumber} `);
                this.makeSIPCall(toNumber, call_type);
            }
        } catch (err) {
            console.log('+++++ catch', err);
            const connection = await Network.isConnected();
            if (!connection) {
                Toast.show({ text1: I18n.t('No_Network') });
                NavigationAction.pop();
                return;
            }
            AlertDialog.show(
                'Sorry , I am unable to connect your call. Please try after sometime'
            );
            this.closeCall();
            NavigationAction.pop();
        }
    };

    getSatNumber(to) {
        let SAT_PHONE_NUM;
        let SAT_PHONE_PIN;
        let startString;
        SAT_PHONE_NUM = '+12124010649';
        SAT_PHONE_PIN = '1235476';
        [startString, phone_number] = R.split(':', to);
        const pinWithWait = SAT_PHONE_PIN.split('')
            .map((char) => `ww${char}`)
            .join('');
        const phoneNumberWait = phone_number
            .split('')
            .map((char) => `w${char}`)
            .join('');
        return `1wwwwwwww${pinWithWait}wwwwwwwwwwwwww9wwwwwwwwww`;
    }

    async closeCall() {}

    handleCallQuotaUpdateSuccess = (callQuota) => {
        this.setState({
            callQuota,
            updatingCallQuota: false,
            callQuotaUpdateError: false
        });
    };

    handleCallQuotaUpdateFailure = (error) => {
        this.setState({
            updatingCallQuota: false,
            callQuotaUpdateError: true
        });
    };

    handleCallTerminateEvent = () => {
        this.hangupCall();
    };

    connectionDidConnectHandler() {
        const { satCall, callerEndpoint, filler } = this.state;
        this.intervalId = setInterval(() => {
            this.setState((prevState) => ({
                callTime: prevState.callTime + 1
            }));
        }, 1000);
        const d = new Date();
        this.setState({
            diallerState: DiallerState.incall,
            callStartTime: d.getTime()
        });

        if (satCall) {
            if (filler) {
                console.log('playing filler');
                filler.setNumberOfLoops(-1);
                filler.play((success) => {
                    if (success) {
                        console.log('+++++++++Played Sound');
                    } else {
                        console.log(
                            'playback failed due to audio decoding errors'
                        );
                        // reset the player to its uninitialized state (android only)
                        // this is the only option to recover after an errostopServicer occured and use the player again
                        filler.release();
                    }
                });
                setTimeout(() => {
                    console.log(
                        '+++++++++stop Sound',
                        callerEndpoint.activateAudioSession
                    );
                    filler.stop();
                    this.props.route.params?.sendVoiceMessageToBot?.(
                        'ringStart',
                        this.props.route.params?.controlId
                    );
                    if (Platform.OS === 'ios') {
                        callerEndpoint
                            .activateAudioSession()
                            .then((res) => {
                                console.log('>>>>> cal un hold', res);
                            })
                            .catch((err) => {
                                console.log('>>>>> cal un hold error', err);
                            });
                    }
                }, 15000);
            } else {
                console.log('filler not ready yet');
            }
        }
    }

    connectionDidDisconnectHandler = () => {
        console.log('++++++ connectionDidDisconnectHandler');
        this.props.route.params?.sendVoiceMessageToBot?.(
            'callEnd',
            this.props.route.params?.controlId
        );

        const {
            dialledNumber,
            filler,
            callTime,
            satCall,
            outgoingNumber,
            callStartTime,
            callerEndpoint,
            callEndTime
        } = this.state;

        if (filler) {
            filler.stop();
        }

        this.setState({
            diallerState: DiallerState.initial,
            dialledNumber: '',
            dialledDigits: '',
            satCall: false,
            currentCall: null
        });

        try {
            if (this.intervalId) {
                clearInterval(this.intervalId);
                this.intervalId = null;
            }
            this.callType = null;
            this.callConfirmed = false;

            if (callerEndpoint) {
                callerEndpoint.removeListener(
                    'call_changed',
                    this.callChangedHandler
                );
                callerEndpoint.removeListener(
                    'call_terminated',
                    this.callTerminatedHandler
                );
            }
            SipAccount.removeListener(
                'account_created',
                this.registrationChangedHandler
            );
            SipAccount.removeListener(
                'account_creation_error',
                this.registrationErrorHandler
            );
        } catch (err) {
            console.log('+++++sip acc delete error catch:', err);
            Bugsnag.notify(err, (report) => {
                report.context = 'SPI call crash';
            });
        }
        this.stopForegroundService();
        const seconds =
            ((callEndTime || new Date().getTime()) -
                (callStartTime || new Date().getTime())) /
            1000;
        const userId = this.props.route.params?.contact
            ? this.props.route.params?.contact.id
            : outgoingNumber && outgoingNumber.length > 1
            ? outgoingNumber.substring(1)
            : '';
        const user = Auth.getUserData();
        let calldata = {
            callerUserId: user.userId,
            userId: userId,
            video: false,
            callAction: 'CallSummary',
            callType: satCall ? 'SAT' : 'PSTN',
            calledNumber: satCall ? '+12124010649' : outgoingNumber,
            dialledSatPhoneNumber: satCall ? outgoingNumber : '',
            callDuration: Math.round(seconds).toString(),
            callStartTime: callStartTime || new Date().getTime()
        };
        console.log('++++++ sending report ******************1', calldata);
        Utils.addLogEntry({
            type: 'SYSTEM',
            entry: {
                level: 'LOG',
                message: 'voip: call summary initiated'
            },
            data: {
                calldata
            }
        });
        UserServices.sendVoipPushNotification(calldata)
            .then(() => {
                console.log('++++++ report sent ******************1');
                this.showCallSummary(seconds, dialledNumber);
            })
            .catch((err) => {
                Utils.addLogEntry({
                    type: 'SYSTEM',
                    entry: {
                        level: 'LOG',
                        message: 'voip: call summary error'
                    },
                    data: {
                        e: JSON.stringify(err)
                    }
                });
                console.log('++++ report failed', err);
                this.showCallSummary(seconds, dialledNumber);
            });
    };

    showCallSummary = (seconds, dialledNumber) => {
        if (
            NavigationAction.currentScreen() ===
            NavigationAction.SCREENS.dialler
        ) {
            NavigationAction.replace(NavigationAction.SCREENS.callSummary, {
                time: Math.round(seconds).toString(),
                contact: this.state.dialContact,
                dialledNumber
            });
        } else {
            NavigationAction.push(NavigationAction.SCREENS.callSummary, {
                time: Math.round(seconds).toString(),
                contact: this.state.dialContact,
                dialledNumber
            });
        }
    };

    //----------------------------------------------------------------------------
    // PJ SIP IMPLEMENTATION STARTS
    //----------------------------------------------------------------------------
    setupPJSIP = async () => {
        console.log('Amal : setting up PJSIP');
        const endpoint = new Endpoint();
        SipAccount.addListener(
            'account_created',
            this.registrationChangedHandler
        );
        SipAccount.addListener(
            'account_creation_error',
            this.registrationErrorHandler
        );
        SipAccount.create({
            name: 'frontmsecureobile',
            username: 'frontmsecureobile',
            domain: configToUse.proxy.pstnServer,
            password: 'frontm@$%^!2',
            proxy: null,
            transport: 'TCP',
            regServer: null, // Default wildcard
            regTimeout: null // Default 3600
        });
    };

    registrationErrorHandler = () => {
        Toast.show({ text1: I18n.t('No_Server_Network') });
        SipAccount.removeListener(
            'account_creation_error',
            this.registrationErrorHandler
        );
        NavigationAction.pop();
    };

    registrationChangedHandler = ({ account, endpoint }) => {
        console.log('~~~~  Registration Cahnged', account);
        this.setState(
            {
                callerEndpoint: endpoint,
                callingAccount: account,
                creatingEndPoint: false
            },
            () => {
                if (this.props.route.params?.call) {
                    this.call();
                }
            }
        );
    };

    async makeSIPCall(number, callType) {
        console.log('~~~~~~ to number', number);
        try {
            // Subscribe to endpoint events
            const options = {
                headers: {
                    'P-Assserted-Identity': 'Header example',
                    'X-UA': 'React native'
                }
            };

            console.log('~~~~~~Endpoint created', this.state.callerEndpoint);
            let call;
            call = await this.state.callerEndpoint.makeCall(
                this.state.callingAccount,
                number,
                options
            );
            // }

            this.callType = callType;
            // Use this id to detect changes and make actions
            this.setState(
                {
                    currentCall: call,
                    outgoingNumber: number
                },
                () => {
                    this.state.callerEndpoint.addListener(
                        'call_changed',
                        this.callChangedHandler
                    );

                    this.state.callerEndpoint.addListener(
                        'call_terminated',
                        this.callTerminatedHandler
                    );
                }
            );
            this.startForegroundService();
        } catch (error) {
            console.log(`PJSIP make call issue ${error}`);
        }
    }

    callTerminatedHandler = (newCall) => {
        if (this.state.satCall) {
            InCallManager.stopRingback();
        }
        console.log(
            'Call Terminated : ',
            this.state.currentCall.getId(),
            newCall.getId()
        );
        if (this.state.currentCall.getId() === newCall.getId()) {
            // this.hangupCall();
            this.setState({ callEndTime: new Date().getTime() });
            this.connectionDidDisconnectHandler();
        }
    };

    callChangedHandler = (newCall) => {
        console.log('~~~ Call Changed : ', this.state.currentCall, newCall);
        const { currentCall, callerEndpoint, outgoingNumber } = this.state;
        if (currentCall.getId() === newCall.getId()) {
            // Our call changed, do smth.
            console.log('>>>>>> new call state:', newCall.getStateText());
            if (newCall.getStateText() === 'EARLY' && this.state.satCall) {
                InCallManager.startRingback('_BUNDLE_');
            } else {
                InCallManager.stopRingback();
            }
            if (newCall.getStateText() === 'CONFIRMED' && !this.callConfirmed) {
                this.connectionDidConnectHandler();
                this.callConfirmed = true;
            } else if (newCall.getStateText() === 'EARLY') {
            }
        }
    };

    hangupCall = () => {
        if (this.state.satCall) {
            InCallManager.stopRingback();
        }
        const { diallerState, callerEndpoint, currentCall, callStartTime } =
            this.state;
        this.setState({ callEndTime: new Date().getTime() });
        const seconds =
            (new Date().getTime() - (callStartTime || new Date().getTime())) /
            1000;
        if (diallerState <= DiallerState.ringing) {
            if (currentCall) {
                callerEndpoint
                    .declineCall(currentCall)
                    .then((res) => {
                        console.log('++++done decline : ', JSON.stringify(res));
                        this.connectionDidDisconnectHandler();
                    })
                    .catch((err) => {
                        console.log('++++error', JSON.stringify(err));
                        // this.connectionDidDisconnectHandler();
                    });
            } else {
            }
        } else {
            const { satCall, outgoingNumber, callStartTime, callerEndpoint } =
                this.state;
            const calldata = {
                callerUserId: '',
                userId: this.props.route.params?.contact
                    ? this.props.route.params?.contact.id
                    : '',
                video: false,
                action: 'CallSummary',
                callType: satCall ? 'SAT' : 'PSTN',
                calledNumber: satCall ? '+12124010649' : outgoingNumber,
                dialledSatPhoneNumber: satCall ? outgoingNumber : '',
                callDuration: Math.round(seconds).toString(),
                callStartTime: callStartTime || new Date().getTime()
            };
            AsyncStorage.setItem('AbortedCall', JSON.stringify(calldata));
            callerEndpoint
                .hangupCall(currentCall)
                .then((res) => {
                    console.log('++++done : ', JSON.stringify(res));
                    this.connectionDidDisconnectHandler();
                })
                .catch((err) => {
                    console.log('++++error', JSON.stringify(err));
                });
        }
    };

    //----------------------------------------------------------------------------
    // PJ SIP IMPLEMENTATION ENDS
    //----------------------------------------------------------------------------

    countMinutes = (callQuota) => {
        this.setState({ intervalId });
    };

    renderButton() {
        const { diallerState } = this.state;
        console.log(
            'Disabled : ',
            this.state.updatingCallQuota,
            this.state.creatingEndPoint
        );
        return (
            <TouchableOpacity
                style={Styles.callButtonGreen}
                onPress={this.call}
                disabled={
                    this.state.updatingCallQuota || this.state.creatingEndPoint
                }
            >
                <Image
                    style={Styles.callButtonGreen}
                    source={images.largeCallButton}
                />
            </TouchableOpacity>
        );
    }

    statusMessage(state) {
        if (state === DiallerState.initial) {
            return I18n.t('Dial');
        }
        if (state === DiallerState.incall_digits) {
            return '';
        }
        if (state === DiallerState.incall) {
            return I18n.t('Calling');
        }
    }

    phonenumber(state) {
        if (state === DiallerState.incall_digits) {
            return this.state.dialledDigits;
        }
        return this.state.dialledNumber;
    }

    buttonPressed(char) {
        const { dialledNumber } = this.state;
        if (char === '+') {
            this.handleDelete();
        } else if (dialledNumber.length < 15) {
            this.setState({
                dialledNumber: this.state.dialledNumber + char
            });
        }
    }

    buttonPressedOnModal(char) {
        this.state.callerEndpoint.dtmfCall(this.state.currentCall, char);
    }

    handleDelete = () => {
        const { dialledNumber } = this.state;
        const newNumber =
            dialledNumber.length > 0
                ? dialledNumber.substr(0, dialledNumber.length - 1)
                : '';
        this.setState({ dialledNumber: newNumber === '' ? '+' : newNumber });
    };

    closeScreen = () => {
        NavigationAction.pop();
    };

    renderCloseButton() {
        const { diallerState } = this.state;
        if (diallerState === DiallerState.initial) {
            return (
                <Text style={Styles.closeButtonText}>{I18n.t('Close')}</Text>
            );
        }
        return null;
    }

    renderDeleteButton() {
        const { diallerState } = this.state;
        if (diallerState === DiallerState.initial) {
            return (
                <TouchableOpacity style={Styles.closeButton}>
                    <Text style={Styles.closeButtonText} />
                </TouchableOpacity>
            );
        }
        return null;
    }

    closeDigits() {
        this.setState({ diallerState: DiallerState.incall });
    }

    openDial() {
        if (
            this.state.diallerState === DiallerState.connecting ||
            this.state.diallerState === DiallerState.incall
        ) {
            this.setState({ diallerState: DiallerState.incall_digits });
        }
    }

    toggleMic = () => {
        // TwilioVoice.setMuted(this.state.micOn);
        if (this.state.micOn) {
            this.state.callerEndpoint.muteCall(this.state.currentCall);
        } else this.state.callerEndpoint.unMuteCall(this.state.currentCall);
        this.setState({ micOn: !this.state.micOn });
    };

    toggleSpeaker = () => {
        // TwilioVoice.setSpeakerPhone(!this.state.speakerOn);
        if (this.state.speakerOn) {
            this.state.callerEndpoint.useEarpiece(this.state.currentCall);
        } else {
            this.state.callerEndpoint.useSpeaker(this.state.currentCall);
        }

        this.setState({ speakerOn: !this.state.speakerOn });
    };

    showCodes = () => this.setState({ showCodes: true });

    hideCodes = () => this.setState({ showCodes: false });

    getCredit = () => {
        NavigationAction.push(NavigationAction.SCREENS.getCredit, {
            currentBalance: this.state.callQuota,
            wasDialler: this.state.dialledNumber
        });
    };

    renderCountryCode = () => {
        if (this.state.countryElements.length > 0) {
            return this.state.countryElements;
        }
        const countryElements = [];
        for (const prop in this.state.codes) {
            const el = (
                <TouchableOpacity
                    key={this.state.codes[prop]}
                    style={{
                        height: 40,
                        borderBottomColor: 'rgba(221,222,227,1)',
                        borderBottomWidth: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    onPress={() => {
                        this.setState({
                            dialledNumber: this.state.codes[prop]
                        });
                        this.hideCodes();
                    }}
                >
                    <Text
                        key={this.state.codes[prop]}
                        style={{ color: GlobalColors.primaryButtonColor }}
                    >
                        {prop}
                    </Text>
                </TouchableOpacity>
            );
            countryElements.push(el);
        }

        this.setState({ countryElements });
        return countryElements;
    };

    renderModal = () => (
        <Modal
            isVisible={this.state.showCodes}
            onBackButtonPress={() => this.hideCodes()}
            onBackdropPress={() => this.hideCodes()}
        >
            <View style={Styles.countryModalContainer}>
                <ScrollView>{this.renderCountryCode()}</ScrollView>
            </View>
        </Modal>
    );

    fetchCopiedText = async () => {
        let text = await Clipboard.getString();
        let addPlus = false;
        if (text.length > 1)
            if (text[0] == '+') {
                addPlus = true;
            }
        let replaceddashNo = text.replace(/[^0-9]/g, ''); // if pllus is in the middle of the string
        replaceddashNo = addPlus ? `+${replaceddashNo}` : replaceddashNo;
        this.setState({
            dialledNumber: replaceddashNo.length
                ? replaceddashNo
                : this.state.dialledNumber,
            showPasteOption: false
        });
    };

    diallerInitial = () => {
        const { diallerState } = this.state;
        return (
            <SafeAreaView style={Styles.container} edges={['bottom']}>
                <View style={Styles.initialMainContainer}>
                    <TouchableOpacity
                        onPress={this.showCodes}
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            width: '100%',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <Text style={Styles.diallerNumberCode}>
                            Select Country
                        </Text>
                        <Image
                            style={Styles.donwArrowImg}
                            source={images.arrowDownWhite}
                        />
                    </TouchableOpacity>
                    <Popover
                        // mode={PopoverMode.TOOLTIP}
                        placement={PopoverPlacement.RIGHT}
                        isVisible={this.state.showPasteOption}
                        onRequestClose={() =>
                            this.setState({ showPasteOption: false })
                        }
                        from={
                            <Pressable
                                style={({ pressed }) => [
                                    {
                                        flex: 1,
                                        flexDirection: 'row',
                                        width: '100%'
                                    } || {},
                                    { opacity: pressed ? 0.3 : 1 }
                                ]}
                                onLongPress={async () => {
                                    const copyText =
                                        await Clipboard.getString();
                                    this.setState({
                                        showPasteOption: Boolean(copyText)
                                    });
                                }}
                            >
                                <Text style={Styles.diallerNumberText}>
                                    {this.phonenumber(diallerState)}
                                </Text>
                            </Pressable>
                        }
                    >
                        <TouchableOpacity onPress={this.fetchCopiedText}>
                            <Text style={Styles.pasteOption}>Paste</Text>
                        </TouchableOpacity>
                    </Popover>
                </View>
                {this.state.prepaid && (
                    <View style={Styles.callQuotaContainer}>
                        <View style={Styles.callQuotaTextContainer}>
                            <Text style={Styles.callQuotaText}>
                                Call to Phone
                            </Text>
                            <Text style={Styles.callQuotaText}>
                                {'Current balance: '}
                                <Text
                                    style={{
                                        color: GlobalColors.primaryTextColor,
                                        fontWeight: AppFonts.BOLD
                                    }}
                                >
                                    $
                                </Text>
                                <Text
                                    style={{
                                        color: GlobalColors.primaryTextColor,
                                        fontWeight: AppFonts.BOLD
                                    }}
                                >
                                    {this.state.updatingCallQuota ||
                                    this.state.callQuotaUpdateError
                                        ? '...'
                                        : this.state.callQuota.toFixed(2)}
                                </Text>
                            </Text>
                        </View>
                        <TouchableOpacity
                            style={Styles.callQuotaBuy}
                            onPress={this.getCredit}
                            disabled={this.state.updatingCallQuota}
                        >
                            <Text
                                style={{
                                    color: GlobalColors.frontmLightBlue,
                                    fontSize: 15,
                                    fontWeight: AppFonts.BOLD
                                }}
                            >
                                {I18n.t('Top_Up')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}
                <View style={Styles.diallerContainer}>
                    <View style={Styles.diallerButtonContainer}>
                        <NumberPad
                            textColor={GlobalColors.primaryTextColor}
                            onButtonPress={this.buttonPressed.bind(this)}
                        />
                    </View>
                </View>
                <View style={Styles.callButtonContainer}>
                    <TouchableOpacity
                        style={{ flex: 1, alignItems: 'center' }}
                        onPress={this.closeScreen}
                    >
                        {this.renderCloseButton()}
                    </TouchableOpacity>
                    <View style={{ flex: 1, alignItems: 'center' }}>
                        {this.renderButton()}
                    </View>
                    <TouchableOpacity
                        style={{ flex: 1, alignItems: 'center' }}
                        onPress={this.handleDelete}
                    >
                        {Icons.backSpace({
                            color: GlobalColors.actionButtons
                        })}
                    </TouchableOpacity>
                </View>
                {this.renderModal()}
            </SafeAreaView>
        );
    };

    renderCallerInfo = () => {
        if (this.props.route.params?.contact) {
            return (
                <View>
                    <Text style={Styles.callingNumberText}>
                        {this.props.route.params?.contact.name ||
                            this.props.route.params?.contact.userName}
                    </Text>
                    <Text style={Styles.callNumAlt}>
                        {this.state.dialledNumber}
                    </Text>
                </View>
            );
        }

        return (
            <Text style={Styles.callingNumberText}>
                {this.state.dialledNumber}
            </Text>
        );
    };

    renderAvatar = () => {
        if (this.state.diallerState === DiallerState.connecting) {
            if (this.props.route.params?.contact) {
                return (
                    <ProfileImage
                        uuid={this.props.route.params?.contact.id}
                        placeholder={images.emptyAvatarCall}
                        style={Styles.avatar}
                        placeholderStyle={Styles.avatar}
                        resizeMode="cover"
                    />
                );
            }
            return (
                <Image style={Styles.avatar} source={images.emptyAvatarCall} />
            );
        }
        if (this.state.diallerState === DiallerState.incall) {
            if (this.state.satCall) {
                return (
                    <View
                        style={{
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <Image
                            style={[Styles.avatar, { position: 'absolute' }]}
                            source={images.greenDefaultAvatarCall}
                        />
                    </View>
                );
            }
            return (
                <Image
                    style={Styles.avatar}
                    source={images.greenDefaultAvatarCall}
                />
            );
        }
    };

    diallerConnecting = () => {
        const { diallerState } = this.state;
        const message = this.statusMessage(diallerState);
        const buttonIconStyle = {
            size: wp('11%'),
            color:
                this.state.diallerState >= DiallerState.ringing
                    ? 'white'
                    : 'grey'
        };
        const buttonIconStyleWhite = { size: wp('11%'), color: 'white' };
        return (
            <View
                style={[
                    Styles.container,
                    {
                        justifyContent: 'space-between',
                        backgroundColor: GlobalColors.black
                    }
                ]}
            >
                <View style={Styles.callingContainer}>
                    <View style={{ display: 'flex', flexDirection: 'column' }}>
                        {this.renderCallerInfo()}
                    </View>
                    {this.state.diallerState === DiallerState.incall ? (
                        <Text style={Styles.callStatusText}>CONNECTED</Text>
                    ) : (
                        <Text style={Styles.callStatusText}>CALLING...</Text>
                    )}

                    {this.renderAvatar()}
                </View>
                <SafeAreaView style={phoneStyles.buttonContainer}>
                    <View style={phoneStyles.topButtonContainer}>
                        <TouchableOpacity
                            style={
                                this.state.micOn
                                    ? phoneStyles.buttonCtr
                                    : phoneStyles.buttonCtrRed
                            }
                            disabled={
                                this.state.diallerState <= DiallerState.ringing
                            }
                            onPress={this.toggleMic}
                        >
                            {Icons.micOff(buttonIconStyle)}
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={phoneStyles.buttonCtr}
                            onPress={() => {
                                this.setState({ isModalDialPadVisible: true });
                            }}
                            disabled={
                                this.state.diallerState <= DiallerState.ringing
                            }
                        >
                            {Icons.numdial(buttonIconStyle)}
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={
                                this.state.speakerOn
                                    ? phoneStyles.buttonCtrGreen
                                    : phoneStyles.buttonCtr
                            }
                            disabled={
                                this.state.diallerState <= DiallerState.ringing
                            }
                            onPress={this.toggleSpeaker}
                        >
                            {Icons.speakerOn(buttonIconStyle)}
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                        style={[
                            phoneStyles.buttonCtrRed,
                            { alignSelf: 'center' }
                        ]}
                        // disabled={this.state.diallerState >= DiallerState.incall}
                        // onPress={this.closeCall.bind(this)}
                        onPress={this.hangupCall}
                    >
                        {Icons.phoneHangup(buttonIconStyleWhite)}
                    </TouchableOpacity>
                </SafeAreaView>
                <ModalDialPad
                    isVisible={this.state.isModalDialPadVisible}
                    onClose={() => {
                        this.setState({ isModalDialPadVisible: false });
                    }}
                    onButtonPressed={this.buttonPressedOnModal.bind(this)}
                />
            </View>
        );
    };

    render() {
        // console.log('Dialled Number', this.state.diallerState);

        const { diallerState } = this.state;
        const message = this.statusMessage(diallerState);

        if (this.state.updatingCallQuota && this.props.route.params?.call) {
            return (
                <View style={Styles.loading}>
                    <ActivityIndicator size="large" />
                </View>
            );
        }
        if (diallerState === DiallerState.initial) {
            return this.diallerInitial();
        }
        if (
            diallerState === DiallerState.incall ||
            diallerState === DiallerState.connecting
        ) {
            return this.diallerConnecting();
        }
        return <View />;
    }
}
