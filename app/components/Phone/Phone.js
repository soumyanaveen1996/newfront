import React from 'react';
import {
    Alert,
    View,
    Text,
    TouchableOpacity,
    Keyboard,
    Platform,
    InteractionManager,
    Image,
    SafeAreaView
} from 'react-native';
import TwilioVoice from 'react-native-twilio-programmable-voice';
import Styles from './styles';
import { Icons } from '../../config/icons';
import { Actions, ActionConst } from 'react-native-router-flux';
import { EventEmitter, TwilioEvents, CallsEvents } from '../../lib/events';
import I18n from '../../config/i18n/i18n';
import { TwilioVoIP } from '../../lib/twilio';
import { ContactsCache } from '../../lib/ContactsCache';
import _ from 'lodash';
import { Auth, Network } from '../../lib/capability';
import ROUTER_SCENE_KEYS from '../../routes/RouterSceneKeyConstants';
import Conversation from '../../lib/conversation/Conversation';
import ProfileImage from '../ProfileImage';
import ModalDialPad from '../Dialler/ModalDialPad';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp
} from 'react-native-responsive-screen';
import Calls from '../../lib/calls';
import BackgroundTimer from 'react-native-background-timer';

export const PhoneState = {
    init: 'init',
    calling: 'calling',
    incall: 'incall',
    incomingcall: 'incomingcall'
};

export default class Phone extends React.Component {
    constructor(props) {
        super(props);
        this.setUpPhoneCall(props);
    }

    componentDidMount() {
        this.mounted = true;
        this.connectionDidDisconnectListener = EventEmitter.addListener(
            TwilioEvents.connectionDidDisconnect,
            this.connectionDidDisconnectHandler.bind(this)
        );
        this.connectionDidConnectListener = EventEmitter.addListener(
            TwilioEvents.connectionDidConnect,
            this.connectionDidConnectHandler.bind(this)
        );
        this.deviceDidReceiveIncomingListener = EventEmitter.addListener(
            TwilioEvents.deviceDidReceiveIncoming,
            this.deviceDidReceiveIncomingHandler.bind(this)
        );

        if (this.state.phoneState === PhoneState.init) {
            this.initialize();
        } else if (this.state.phoneState === PhoneState.incomingcall) {
            this.findCallerName({ username: this.state.username });
            Keyboard.dismiss();
        }
    }

    componentWillUnmount() {
        this.mounted = false;
        if (this.connectionDidDisconnectListener) {
            this.connectionDidDisconnectListener.remove();
        }
        if (this.connectionDidConnectListener) {
            this.connectionDidConnectListener.remove();
        }
        if (this.deviceDidReceiveIncomingListener) {
            this.deviceDidReceiveIncomingListener.remove();
        }
        EventEmitter.emit(CallsEvents.callHistoryUpdated);
    }

    async setUpPhoneCall(props) {
        let call_to, call_from;
        if (Platform.OS === 'ios') {
            call_to = props.data ? props.data.call_to : 'Unknown';
            call_from = props.data ? props.data.call_from : 'Unknown';
            if (call_from && call_from.startsWith('client:')) {
                this.findCallerName({ call_from });
                call_from = '';
            }
        }
        if (Platform.OS === 'android') {
            call_to = props.data ? props.data.call_to : 'Unknown';
            call_from = props.data ? props.data.call_from : 'Unknown';
            if (call_from && call_from.startsWith('client:')) {
                call_from = '';
            }
        }
        this.state = {
            isModalDialPadVisible: false,
            phoneState: props.state,
            micOn: true,
            speakerOn: false,
            userId: null,
            username:
                props.state === PhoneState.calling ||
                props.state === PhoneState.init
                    ? call_to
                    : call_from
        };
    }

    async findCallerName({ username }) {
        // const {username} = this.state
        if (username && _.startsWith(username, 'client:')) {
            const clientId = username.substr(7);
            const clientDetails = await ContactsCache.getUserDetails(clientId);
            if (clientDetails) {
                if (this.mounted) {
                    this.setState({
                        username: clientDetails.userName,
                        userId: clientId
                    });
                }
            } else {
                ContactsCache.fetchContactDetailsForUser(clientId).then(
                    contactDetails => {
                        if (this.mounted) {
                            this.setState({
                                username: contactDetails.userName,
                                userId: clientId
                            });
                        }
                    }
                );
            }
        }
    }

    async initialize() {
        try {
            this.setState({ userId: this.props.data.otherUserId });
            await TwilioVoIP.initTelephony();
            if (this.mounted) {
                const user = await Auth.getUser();
                TwilioVoice.connect({
                    To: `client:${this.props.data.otherUserId}`,
                    CallerId: `${user.info.emailAddress}`
                });
                this.setState({ phoneState: PhoneState.calling });
            }
        } catch (err) {
            const connection = await Network.isConnected();
            if (!connection) {
                Alert.alert(I18n.t('No_Network'));
                Actions.pop();
                return;
            }
            Alert.alert('Sorry, I am unable to call. Please try again.');
            Actions.pop();
        }
    }

    connectionDidConnectHandler(data) {
        if (data.call_state === 'ACCEPTED' || data.call_state === 'CONNECTED') {
            this.setState({ phoneState: PhoneState.incall });
        }
    }

    deviceDidReceiveIncomingHandler(data) {
        const username = data.call_from;
        this.setState({ phoneState: PhoneState.incomingcall });
        this.findCallerName({ username });
    }

    connectionDidDisconnectHandler(data) {
        const sceneBefore = Actions.currentScene;
        Actions.pop();
        const sceneAfter = Actions.currentScene;
        if (sceneBefore === sceneAfter) {
            Actions.homeMain({
                type: ActionConst.REPLACE
            });
        }
    }

    accept() {
        TwilioVoice.accept();
        this.setState({ phoneState: PhoneState.incall });
    }

    toggleMic = () => {
        TwilioVoice.setMuted(this.state.micOn);
        this.setState({ micOn: !this.state.micOn });
    };

    toggleSpeaker = () => {
        TwilioVoice.setSpeakerPhone(!this.state.speakerOn);
        this.setState({ speakerOn: !this.state.speakerOn });
    };

    close() {
        const { phoneState } = this.state;
        if (
            phoneState === PhoneState.incall ||
            phoneState === PhoneState.calling
        ) {
            TwilioVoice.disconnect();
        } else if (phoneState === PhoneState.incomingcall) {
            TwilioVoice.reject();
        }
        Actions.pop();
    }

    buttonPressedOnModal(char) {
        TwilioVoice.sendDigits(char);
    }

    renderAcceptButton() {
        const { phoneState } = this.state;
        if (phoneState === PhoneState.incomingcall) {
            return (
                <TouchableOpacity
                    style={[Styles.button, Styles.callButton]}
                    onPress={this.accept.bind(this)}
                >
                    {Icons.greenCall()}
                </TouchableOpacity>
            );
        } else {
            return null;
        }
    }

    statusMessage({ state, userName = 'Unknown' }) {
        if (state === PhoneState.incall) {
            return `${userName}`;
        } else if (state === PhoneState.calling) {
            return `${I18n.t('Calling')} ${userName}`;
        } else if (state === PhoneState.init) {
            return 'Initiating Call';
        } else if (state === PhoneState.incomingcall) {
            return `${this.state.username}`;
        } else {
            return I18n.t('From');
        }
    }

    username() {
        return this.state.username;
    }

    renderCallerInfo = () => {
        if (
            this.state.phoneState === PhoneState.calling ||
            this.state.phoneState === PhoneState.incall
        ) {
            return (
                <View>
                    <Text style={Styles.callingNumberText}>
                        {this.state.username}
                    </Text>
                </View>
            );
        }
        if (this.state.phoneState === PhoneState.incomingcall) {
            return (
                <View>
                    <Text style={Styles.callingNumberText}>
                        {this.state.username}
                    </Text>
                </View>
            );
        }

        return (
            <View>
                <Text style={Styles.callingNumberText}>{''}</Text>
            </View>
        );
    };

    renderCallStatus = () => {
        if (this.state.phoneState === PhoneState.incall) {
            return <Text style={Styles.callStatusText}>CONNECTED</Text>;
        }

        if (this.state.phoneState === PhoneState.incomingcall) {
            return <Text style={Styles.callStatusText}>INCOMING</Text>;
        }

        if (this.state.phoneState === PhoneState.calling) {
            return <Text style={Styles.callStatusText}>CONNECTING</Text>;
        }

        return <Text style={Styles.callStatusText}>CONNECTING</Text>;
    };

    renderAvatar = () => {
        if (this.state.userId) {
            return (
                <ProfileImage
                    uuid={this.state.userId}
                    placeholder={require('../../images/contact/calling-emptyavatar.png')}
                    style={Styles.avatar}
                    placeholderStyle={Styles.avatar}
                    resizeMode="cover"
                />
            );
        }

        return (
            <Image
                style={Styles.avatar}
                source={require('../../images/contact/calling-emptyavatar.png')}
            />
        );
    };

    renderButton = () => {
        const buttonIconStyle = { size: wp('11%'), color: 'white' };
        if (
            this.state.phoneState === PhoneState.incall ||
            this.state.phoneState === PhoneState.calling
        ) {
            return (
                <SafeAreaView style={Styles.buttonContainer}>
                    <View style={Styles.topButtonContainer}>
                        <TouchableOpacity
                            style={
                                this.state.micOn
                                    ? Styles.buttonCtr
                                    : Styles.buttonCtrRed
                            }
                            onPress={this.toggleMic.bind(this)}
                        >
                            {Icons.micOff(buttonIconStyle)}
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={Styles.buttonCtr}
                            onPress={() => {
                                this.setState({ isModalDialPadVisible: true });
                            }}
                        >
                            {Icons.numdial(buttonIconStyle)}
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={
                                this.state.speakerOn
                                    ? Styles.buttonCtrGreen
                                    : Styles.buttonCtr
                            }
                            onPress={this.toggleSpeaker.bind(this)}
                        >
                            {Icons.speakerOn(buttonIconStyle)}
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                        style={[Styles.buttonCtrRed, { alignSelf: 'center' }]}
                        onPress={this.close.bind(this)}
                    >
                        {Icons.phoneHangup(buttonIconStyle)}
                    </TouchableOpacity>
                </SafeAreaView>
            );
        }
        if (this.state.phoneState === PhoneState.incomingcall) {
            return (
                <View style={Styles.buttonContainerIn}>
                    <TouchableOpacity
                        style={Styles.buttonCtrGreen}
                        onPress={this.accept.bind(this)}
                    >
                        {Icons.call(buttonIconStyle)}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={Styles.buttonCtrRed}
                        onPress={this.close.bind(this)}
                    >
                        {Icons.phoneHangup(buttonIconStyle)}
                    </TouchableOpacity>
                </View>
            );
        }

        return <View style={Styles.buttonContainer} />;
    };

    renderInCall = () => {
        return (
            <SafeAreaView
                style={{ height: '100%', justifyContent: 'space-between' }}
            >
                <View style={Styles.callingContainer}>
                    <View style={{ display: 'flex', flexDirection: 'column' }}>
                        {this.renderCallerInfo()}
                    </View>
                    {this.renderCallStatus()}
                    {this.renderAvatar()}
                </View>
                {this.renderButton()}
            </SafeAreaView>
        );
    };

    render() {
        const { phoneState } = this.state;
        const message = this.statusMessage({
            state: phoneState,
            userName: this.username()
        });
        // console.log('Current Phone State', phoneState);
        return (
            <SafeAreaView style={Styles.container}>
                {this.renderInCall()}
                <ModalDialPad
                    isVisible={this.state.isModalDialPadVisible}
                    onClose={() => {
                        this.setState({ isModalDialPadVisible: false });
                    }}
                    onButtonPressed={this.buttonPressedOnModal.bind(this)}
                />
            </SafeAreaView>
        );
        // return (
        //     <View style={Styles.containerStyle}>
        //         <View style={Styles.nameContainer}>
        //             <Text style={Styles.callingText}>{message}</Text>
        //         </View>
        //         <View style={Styles.buttonContainer}>
        //             {phoneState === PhoneState.incall ? (
        //                 <View style={Styles.buttonContainer}>
        //                     <TouchableOpacity onPress={this.toggleMic}>
        //                         {this.state.micOn
        //                             ? Icons.mic()
        //                             : Icons.micOff()}
        //                     </TouchableOpacity>
        //                     <TouchableOpacity onPress={this.toggleSpeaker}>
        //                         {this.state.speakerOn
        //                             ? Icons.speakerOn()
        //                             : Icons.speakerOff()}
        //                     </TouchableOpacity>
        //                 </View>
        //             ) : null}
        //         </View>
        //         <View style={Styles.buttonContainer}>
        //             <TouchableOpacity
        //                 style={[Styles.button, Styles.closeButton]}
        //                 onPress={this.close.bind(this)}
        //             >
        //                 {Icons.redClose()}
        //             </TouchableOpacity>
        //             {this.renderAcceptButton()}
        //         </View>
        //     </View>
        // )
    }
}
