import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
} from 'react-native';
import TwilioVoice from 'react-native-twilio-programmable-voice';
import Styles from './styles';
import { Icons } from '../../config/icons';
import { Actions } from 'react-native-router-flux';
import { EventEmitter, TwilioEvents } from '../../lib/events';

export const PhoneState = {
    calling: 'calling',
    calling_incall: 'calling_incall',
    incall: 'incall',
    incomingcall: 'incomingcall'
}


export default class Phone extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            state: props.state,
            username: props.state === PhoneState.calling ? props.data.call_to : props.data.call_from
        }
    }

    componentDidMount() {
        this.connectionDidDisconnectListener = EventEmitter.addListener(TwilioEvents.connectionDidDisconnect, this.connectionDidDisconnectHandler.bind(this));
        this.connectionDidConnectListener = EventEmitter.addListener(TwilioEvents.connectionDidConnect, this.connectionDidConnectHandler.bind(this));
    }

    componentWillUnmount() {
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
            this.setState({state : PhoneState.incall});
        }
    }

    connectionDidDisconnectHandler(data) {
        console.log('FrontM VoIP : Phone connectionDidDisconnect : ', data);
        Actions.pop();
    }

    accept() {
        TwilioVoice.accept();
        this.setState({state : PhoneState.incall});
    }

    close() {
        const { state } = this.state;
        if (state === PhoneState.incall) {
            TwilioVoice.disconnect();
        } else {
            TwilioVoice.reject();
        }
        Actions.pop();
    }

    renderAcceptButton() {
        const { state } = this.state;
        if (state === PhoneState.incomingcall) {
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
            return 'Calling'
        } else {
            return 'From'
        }
    }

    username() {
        return this.state.username;
    }

    render(){
        const { state } = this.state;

        const message = this.statusMessage(state);
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
