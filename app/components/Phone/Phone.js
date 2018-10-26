import React from 'react';
import { Alert, View, Text, TouchableOpacity, Keyboard } from 'react-native';
import TwilioVoice from 'react-native-twilio-programmable-voice';
import Styles from './styles';
import { Icons } from '../../config/icons';
import { Actions, ActionConst } from 'react-native-router-flux';
import { EventEmitter, TwilioEvents } from '../../lib/events';
import I18n from '../../config/i18n/i18n';
import { TwilioVoIP } from '../../lib/twilio';
import { ContactsCache } from '../../lib/ContactsCache';
import _ from 'lodash';
import { Auth, Network } from '../../lib/capability';
import ROUTER_SCENE_KEYS from '../../routes/RouterSceneKeyConstants';

export const PhoneState = {
    init: 'init',
    calling: 'calling',
    incall: 'incall',
    incomingcall: 'incomingcall'
};

export default class Phone extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            phoneState: props.state,
            micOn: true,
            speakerOn: false,
            username:
                props.state === PhoneState.calling ||
                props.state === PhoneState.init
                    ? props.data.call_to
                    : props.data.call_from
        };
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

    findCallerName({ username }) {
        // const {username} = this.state
        if (username && _.startsWith(username, 'client:')) {
            const clientId = username.substr(7);
            const clientDetails = ContactsCache.getUserDetails(clientId);
            if (clientDetails) {
                if (this.mounted) {
                    this.setState({ username: clientDetails.userName });
                }
            } else {
                ContactsCache.fetchContactDetailsForUser(clientId).then(
                    contactDetails => {
                        if (this.mounted) {
                            this.setState({
                                username: contactDetails.userName
                            });
                        }
                    }
                );
            }
        }
    }

    async initialize() {
        try {
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
            Alert.alert('VoIP Error', 'Error : ' + JSON.stringify(err));
            Actions.pop();
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

    render() {
        const { phoneState } = this.state;
        const message = this.statusMessage({
            state: phoneState,
            userName: this.username()
        });
        return (
            <View style={Styles.containerStyle}>
                <View style={Styles.nameContainer}>
                    <Text style={Styles.callingText}>{message}</Text>
                </View>
                <View style={Styles.buttonContainer}>
                    {phoneState === PhoneState.incall ? (
                        <View style={Styles.buttonContainer}>
                            <TouchableOpacity onPress={this.toggleMic}>
                                {this.state.micOn
                                    ? Icons.mic()
                                    : Icons.micOff()}
                            </TouchableOpacity>
                            <TouchableOpacity onPress={this.toggleSpeaker}>
                                {this.state.speakerOn
                                    ? Icons.speakerOn()
                                    : Icons.speakerOff()}
                            </TouchableOpacity>
                        </View>
                    ) : null}
                </View>
                <View style={Styles.buttonContainer}>
                    <TouchableOpacity
                        style={[Styles.button, Styles.closeButton]}
                        onPress={this.close.bind(this)}
                    >
                        {Icons.redClose()}
                    </TouchableOpacity>
                    {this.renderAcceptButton()}
                </View>
            </View>
        );
    }
}
