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
    incall: 'incall',
    incomingcall: 'incomingcall'
}


export default class Phone extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            state: props.state,
            call_from: props.data.call_from
        }
    }

    componentDidMount() {
        console.log('FrontM VoIP : adding listeners. ', TwilioEvents.connectionDidDisconnect)
        this.connectionDidDisconnectListener = EventEmitter.addListener(TwilioEvents.connectionDidDisconnect, this.connectionDidDisconnectHandler.bind(this));
    }

    componentWillUnmount() {
        if (this.connectionDidDisconnectListener) {
            this.connectionDidDisconnectListener.remove();
        }
    }

    connectionDidDisconnectHandler(data) {
        console.log('FrontM VoIP : Phone connectionDidDisconnect')
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
        const { state } = this.state;
        const { data } = this.props;
        if (state === PhoneState.calling) {
            return data.call_to;
        } else {
            return this.state.call_from
        }
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
