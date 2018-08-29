import React from 'react';
import {
    Alert,
    View,
    Text,
    TouchableOpacity,
} from 'react-native';
import TwilioVoice from 'react-native-twilio-programmable-voice';
import Styles from './styles';
import { Icons } from '../../config/icons';
import { Actions } from 'react-native-router-flux';
import { EventEmitter, TwilioEvents } from '../../lib/events';
import I18n from '../../config/i18n/i18n';
import { Twilio, TwilioVoIP } from '../../lib/twilio';

export const PhoneState = {
    init: 'init',
    calling: 'calling',
    calling_incall: 'calling_incall',
    incall: 'incall',
    incomingcall: 'incomingcall'
}


export default class Phone extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            phoneState: props.state,
            username: (props.state === PhoneState.calling) || (props.state === PhoneState.init) ? props.data.call_to : props.data.call_from
        }
    }

    componentDidMount() {
        this.mounted = true;
        this.connectionDidDisconnectListener = EventEmitter.addListener(TwilioEvents.connectionDidDisconnect, this.connectionDidDisconnectHandler.bind(this));
        this.connectionDidConnectListener = EventEmitter.addListener(TwilioEvents.connectionDidConnect, this.connectionDidConnectHandler.bind(this));

        if (this.state.phoneState === PhoneState.init) {
            this.initialize();
        }
    }

    async initialize() {
        console.log('hello1 : ', this.props);
        try {
            await TwilioVoIP.initTelephony();
            if (this.mounted) {
                TwilioVoice.connect({To: `client:${this.props.data.otherUserId}`, From: this.props.data.from})
                this.setState({phoneState : PhoneState.calling});
            }
        } catch (err) {
            console.log('Unable to make the call : ', err);
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
    }

    connectionDidConnectHandler(data) {
        console.log('FrontM VoIP : Phone connectionDidConnect : ', data);
        if (data.call_state === 'ACCEPTED' || data.call_state === 'CONNECTED') {
            this.setState({phoneState : PhoneState.incall});
        }
    }

    connectionDidDisconnectHandler(data) {
        console.log('FrontM VoIP : Phone connectionDidDisconnect : ', data);
        Actions.pop();
    }

    accept() {
        TwilioVoice.accept();
        this.setState({phoneState : PhoneState.incall});
    }

    close() {
        const { phoneState } = this.state;
        if (phoneState === PhoneState.incall) {
            TwilioVoice.disconnect();
        } else if (phoneState !== PhoneState.init) {
            TwilioVoice.reject();
        }
        Actions.pop();
    }

    renderAcceptButton() {
        const { phoneState } = this.state;
        if (phoneState === PhoneState.incomingcall) {
            return (
                <TouchableOpacity style={[Styles.button, Styles.callButton]} onPress={this.accept.bind(this)}>
                    {Icons.greenCall()}
                </TouchableOpacity>
            );
        } else {
            return null;
        }
    }

    statusMessage(state) {
        if (state === PhoneState.incall) {
            return ''
        } else if (state === PhoneState.calling) {
            return I18n.t('Calling')
        } else if (state === PhoneState.init) {
            return I18n.t('Initializing');
        } else {
            return I18n.t('From')
        }
    }

    username() {
        return this.state.username;
    }

    render(){
        const { phoneState } = this.state;

        const message = this.statusMessage(phoneState);
        return (
            <View style={Styles.containerStyle}>
                <View style={Styles.nameContainer}>
                    <Text style={Styles.callingText}>{message}</Text>
                    <Text style={Styles.nameText}>{this.username()}</Text>
                </View>
                <View style={Styles.buttonContainer}>
                    <TouchableOpacity style={[Styles.button, Styles.closeButton]} onPress={this.close.bind(this)}>
                        {Icons.redClose()}
                    </TouchableOpacity>
                    {this.renderAcceptButton()}
                </View>
            </View>
        );
    }
}
