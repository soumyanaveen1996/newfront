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
import { TwilioVoIP } from '../../lib/twilio';
import _ from 'lodash';

export const DiallerState = {
    initial: 'initial',
    connecting: 'connecting',
    incall: 'incall',
    incall_digits: 'calling_incall',
}


export default class Dialler extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            diallerState: DiallerState.initial,
            dialledNumber: '+',
        }
    }

    componentDidMount() {
        this.mounted = true;
        this.connectionDidDisconnectListener = EventEmitter.addListener(TwilioEvents.connectionDidDisconnect, this.connectionDidDisconnectHandler.bind(this));
        this.connectionDidConnectListener = EventEmitter.addListener(TwilioEvents.connectionDidConnect, this.connectionDidConnectHandler.bind(this));
    }

    async call() {
        if (this.state.dialledNumber.length < 9) {
            Alert.alert(I18n.t('Enter_valid_number'));
            return;
        }
        try {
            this.setState({diallerState : DiallerState.connecting});
            await TwilioVoIP.initTelephony();
            if (this.mounted) {
                TwilioVoice.connect({To: `${this.state.dialledNumber}`})
            }
        } catch (err) {
            console.log('Unable to make the call : ', JSON.stringify(err));
            Alert.alert('VoIP Error', 'Error : ' + JSON.stringify(err));
            this.closeCall();
        }
    }

    async closeCall() {
        TwilioVoice.disconnect();
        Actions.pop();
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
            this.setState({diallerState : DiallerState.incall});
        }
    }

    connectionDidDisconnectHandler(data) {
        console.log('FrontM VoIP : Phone connectionDidDisconnect : ', data);
        Actions.pop();
    }

    close() {
        const { diallerState } = this.state;
        if (diallerState === Dialler.incall) {
            TwilioVoice.disconnect();
        }
        Actions.pop();
    }

    renderButton() {
        const { diallerState } = this.state;
        if (diallerState === DiallerState.initial) {
            return (
                <TouchableOpacity style={[Styles.button, Styles.callButton]} onPress={this.call.bind(this)}>
                    {Icons.greenCall()}
                </TouchableOpacity>
            );
        } else {
            return (
                <TouchableOpacity style={[Styles.button, Styles.callCloseButton]} onPress={this.closeCall.bind(this)}>
                    {Icons.redClose()}
                </TouchableOpacity>
            );
        }
    }

    statusMessage(state) {
        if (state === DiallerState.initial) {
            return I18n.t('Dial');
        } else if (state === DiallerState.connecting) {
            return I18n.t('Calling');
        } else if (state === DiallerState.incall) {
            return I18n.t('Calling');
        }
    }

    phonenumber() {
        return this.state.dialledNumber;
    }

    buttonPressed(char) {
        const { dialledNumber, diallerState } = this.state;
        if (diallerState !== DiallerState.initial) {
            return;
        }
        if (char === '<') {
            const newNumber = dialledNumber.length > 0 ? dialledNumber.substr(0, dialledNumber.length - 1) : ''
            this.setState({ dialledNumber: newNumber === '' ? '+' : newNumber });
        } else if (char === '+') {
            if (dialledNumber.length === 0) {
                this.setState({ dialledNumber: this.state.dialledNumber + char });
            }
        } else {
            if (dialledNumber.length < 15) {
                this.setState({ dialledNumber: this.state.dialledNumber + char });
            }
        }
    }

    renderButtonForChar(char) {
        return (
            <TouchableOpacity key={char} style={Styles.roundButton} onPress={this.buttonPressed.bind(this, char)}>
                <Text style={Styles.roundButtonText}>{char}</Text>
            </TouchableOpacity>
        );
    }

    renderButtons() {
        return [['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9'], [' ', '0', '<']].map((row, index) => {
            return (
                <View key={index} style={Styles.buttonRow}>
                    {
                        row.map((char) => this.renderButtonForChar(char))
                    }
                </View>
            )
        });
    }

    closeScreen() {
        Actions.pop();
    }

    renderCloseButton() {
        const { diallerState } = this.state;
        if (diallerState === DiallerState.initial) {
            return (
                <TouchableOpacity style={Styles.closeButton} onPress={this.closeScreen.bind(this)}>
                    <Text style={Styles.closeButtonText}>{I18n.t('Close')}</Text>
                </TouchableOpacity>
            );
        } else {
            return null;
        }
    }

    render(){
        const { diallerState } = this.state;
        const message = this.statusMessage(diallerState);
        return (
            <View style={Styles.container}>
                <View style={Styles.mainContainer}>
                    <View style={Styles.nameContainer}>
                        <Text style={Styles.callingText}>{message}</Text>
                        <Text style={Styles.nameText}>{this.phonenumber()}</Text>
                    </View>
                    <View style={Styles.diallerContainer}>
                        <View style={Styles.diallerButtonContainer}>
                            {this.renderButtons()}
                        </View>
                    </View>
                    <View style={Styles.buttonContainer}>
                        {this.renderButton()}
                    </View>
                    {this.renderCloseButton()}
                </View>
            </View>
        );
    }
}
