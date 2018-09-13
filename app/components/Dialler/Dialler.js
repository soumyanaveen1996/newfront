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
    incall: 'incall',
    incall_digits: 'incall_digits',
}


export default class Dialler extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            diallerState: DiallerState.initial,
            dialledNumber: '+918971723492',
            dialledDigits: '',
            micOn: true,
            speakerOn: false
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
            this.setState({diallerState : DiallerState.incall});
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
        } else if (state === DiallerState.incall_digits) {
            return '';
        } else if (state === DiallerState.incall) {
            return I18n.t('Calling');
        }
    }

    phonenumber(state) {
        if (state === DiallerState.incall_digits) {
            return this.state.dialledDigits;
        } else {
            return this.state.dialledNumber;
        }
    }

    buttonPressed(char) {
        const { dialledNumber, diallerState } = this.state;
        if (diallerState === DiallerState.initial) {
            if (char === '+') {
                if (dialledNumber.length === 0) {
                    this.setState({ dialledNumber: this.state.dialledNumber + char });
                }
            } else {
                if (dialledNumber.length < 15) {
                    this.setState({ dialledNumber: this.state.dialledNumber + char });
                }
            }
        } else if (diallerState === DiallerState.incall_digits) {
            this.setState({ dialledDigits: this.state.dialledDigits + char})
            TwilioVoice.sendDigits(char);
        }

    }

    handleDelete() {
        const { dialledNumber } = this.state;
        const newNumber = dialledNumber.length > 0 ? dialledNumber.substr(0, dialledNumber.length - 1) : ''
        this.setState({ dialledNumber: newNumber === '' ? '+' : newNumber });
    }

    renderButtonForChar(char) {
        return (
            <TouchableOpacity key={char} style={Styles.roundButton} onPress={this.buttonPressed.bind(this, char)}>
                <Text style={Styles.roundButtonText}>{char}</Text>
            </TouchableOpacity>
        );
    }

    renderButtons() {
        const { diallerState } = this.state;
        const digits  = diallerState === DiallerState.initial ? [['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9'], ['0']] :
            [['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9'], ['*', '0', '+']]
        return digits.map((row, index) => {
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

    renderDeleteButton() {
        const { diallerState } = this.state;
        if (diallerState === DiallerState.initial) {
            return (
                <TouchableOpacity style={Styles.closeButton} onPress={this.handleDelete.bind(this)}>
                    <Text style={Styles.closeButtonText}>{I18n.t('Delete')}</Text>
                </TouchableOpacity>
            );
        } else {
            return null;
        }
    }

    closeDigits() {
        this.setState({ diallerState: DiallerState.incall });
    }

    openDial() {
        this.setState({ diallerState: DiallerState.incall_digits });
    }

    toggleMic() {
        TwilioVoice.setMuted(!this.state.micOn);
        this.setState({micOn : !this.state.micOn})
    }

    toggleSpeaker() {
        TwilioVoice.setSpeakerPhone(!this.state.speakerOn);
        this.setState({speakerOn : !this.state.speakerOn})
    }

    render(){
        const { diallerState } = this.state;
        const message = this.statusMessage(diallerState);
        if (diallerState === DiallerState.initial) {
            return (
                <View style={Styles.container}>
                    <View style={Styles.initialMainContainer}>
                        <Text style={Styles.diallerNumberText}>{this.phonenumber(diallerState)}</Text>
                    </View>
                    <View style={Styles.diallerContainer}>
                        <View style={Styles.diallerButtonContainer}>
                            {this.renderButtons()}
                        </View>
                    </View>
                    <View style={Styles.callButtonContainer}>
                        {this.renderCloseButton()}
                        {this.renderButton()}
                        {this.renderDeleteButton()}
                    </View>

                </View>
            );
        } else if (diallerState === DiallerState.incall) {
            return (
                <View style={Styles.container}>
                    <View style={Styles.mainContainer}>
                        <View style={Styles.nameContainer}>
                            <Text style={Styles.callingText}>{message}</Text>
                            <Text style={Styles.callingNumberText}>{this.phonenumber(diallerState)}</Text>
                        </View>
                        <View style={Styles.incallDiallerContainer}>
                            <View style={Styles.incallDiallerButtonContainer}>
                                <TouchableOpacity style={[Styles.button]} onPress={this.toggleMic.bind(this)}>
                                    {this.state.micOn ? Icons.mic() : Icons.micOff()}
                                </TouchableOpacity>
                                <TouchableOpacity style={[Styles.button]} onPress={this.openDial.bind(this)}>
                                    {Icons.numdial()}
                                </TouchableOpacity>
                                <TouchableOpacity style={[Styles.button]} onPress={this.toggleSpeaker.bind(this)}>
                                    {this.state.speakerOn ? Icons.speakerOn() : Icons.speakerOff()}
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={Styles.incallButtonContainer}>
                            {this.renderButton()}
                        </View>
                    </View>
                </View>
            );
        } else if (diallerState === DiallerState.incall_digits) {
            return (
                <View style={Styles.container}>
                    <View style={Styles.initialMainContainer}>
                        <Text style={Styles.diallerNumberText}>{this.phonenumber(diallerState)}</Text>
                    </View>
                    <View style={Styles.swapButtonContainer}>
                        <TouchableOpacity style={Styles.closeButton} onPress={this.closeDigits.bind(this)}>
                            <Text style={Styles.closeButtonText}>{I18n.t('Close')}</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={Styles.diallerContainer}>
                        <View style={Styles.diallerButtonContainer}>
                            {this.renderButtons()}
                        </View>
                    </View>
                    <View style={Styles.callButtonContainer}>
                        {this.renderButton()}
                    </View>
                </View>
            );
        }
    }
}
