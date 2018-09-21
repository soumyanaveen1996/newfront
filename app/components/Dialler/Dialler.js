import React from 'react';
import { Alert, View, Text, TouchableOpacity } from 'react-native';
import TwilioVoice from 'react-native-twilio-programmable-voice';
import Styles from './styles';
import { Icons } from '../../config/icons';
import { Actions } from 'react-native-router-flux';
import { EventEmitter, TwilioEvents, CallQuotaEvents } from '../../lib/events';
import I18n from '../../config/i18n/i18n';
import { TwilioVoIP } from '../../lib/twilio';
import _ from 'lodash';
import { Message } from '../../lib/capability';
import { BackgroundBotChat } from '../../lib/BackgroundTask';
import SystemBot from '../../lib/bot/SystemBot';

let EventListeners = [];
export const DiallerState = {
    initial: 'initial',
    connecting: 'connecting',
    incall: 'incall',
    incall_digits: 'incall_digits'
};

const MESSAGE_TYPE = 'UPDATE_CALL_QUOTA';

export default class Dialler extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            diallerState: DiallerState.initial,
            dialledNumber: '+',
            dialledDigits: '919880433199',
            micOn: true,
            speakerOn: false,
            callQuota: 100,
            callQuotaUpdateError: false,
            updatingCallQuota: false
        };
    }

    componentDidMount() {
        console.log('>>>>>>>>>>>>>IN PSTN MOUNT!!!!');

        this.mounted = true;
        // Get the current Call Quota using a background Bot
        this.initBackGroundBot();
        // Subscribe to Events
        EventListeners.push(
            EventEmitter.addListener(
                TwilioEvents.connectionDidDisconnect,
                this.connectionDidDisconnectHandler.bind(this)
            )
        );
        EventListeners.push(
            EventEmitter.addListener(
                TwilioEvents.connectionDidConnect,
                this.connectionDidConnectHandler.bind(this)
            )
        );

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
    }

    async call() {
        if (this.state.dialledNumber.length < 9) {
            Alert.alert(I18n.t('Enter_valid_number'));
            return;
        }
        if (this.state.callQuota === 0) {
            Alert.alert(I18n.t('No_balance'));
            return;
        }
        try {
            this.setState({ diallerState: DiallerState.connecting });
            await TwilioVoIP.initTelephony();
            if (this.mounted) {
                TwilioVoice.connect({ To: `${this.state.dialledNumber}` });
            }
        } catch (err) {
            Alert.alert('VoIP Error', 'Error : ' + JSON.stringify(err));
            this.closeCall();
        }
    }

    async closeCall() {
        TwilioVoice.disconnect();
        Actions.pop();
    }

    initBackGroundBot = () => {
        const message = new Message({
            msg: {
                callQuotaUsed: 0
            },
            messageType: MESSAGE_TYPE
        });
        message.setCreatedBy({ addedByBot: true });
        var bgBotScreen = new BackgroundBotChat({
            bot: SystemBot.onboardingBot
        });

        bgBotScreen.next(message, {}, [], bgBotScreen.getBotContext());
        this.setState({ updatingCallQuota: true });
    };

    handleCallQuotaUpdateSuccess = ({ callQuota }) => {
        this.setState({
            callQuota,
            updatingCallQuota: false,
            callQuotaUpdateError: false
        });
    };

    handleCallQuotaUpdateFailure = ({ error }) => {
        this.setState({
            updatingCallQuota: false,
            callQuotaUpdateError: true
        });
    };
    componentWillUnmount() {
        this.mounted = false;
        EventListeners.forEach(listener => listener.remove());
        EventListeners = [];
    }

    connectionDidConnectHandler(data) {
        if (data.call_state === 'ACCEPTED' || data.call_state === 'CONNECTED') {
            this.setState({ diallerState: DiallerState.incall });
        }
    }

    connectionDidDisconnectHandler(data) {
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
                <TouchableOpacity
                    style={[Styles.button, Styles.callButton]}
                    onPress={this.call.bind(this)}
                >
                    {Icons.greenCall()}
                </TouchableOpacity>
            );
        } else {
            return (
                <TouchableOpacity
                    style={[Styles.button, Styles.callCloseButton]}
                    onPress={this.closeCall.bind(this)}
                >
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
                    this.setState({
                        dialledNumber: this.state.dialledNumber + char
                    });
                }
            } else {
                if (dialledNumber.length < 15) {
                    this.setState({
                        dialledNumber: this.state.dialledNumber + char
                    });
                }
            }
        } else if (diallerState === DiallerState.incall_digits) {
            this.setState({ dialledDigits: this.state.dialledDigits + char });
            TwilioVoice.sendDigits(char);
        }
    }

    handleDelete() {
        const { dialledNumber } = this.state;
        const newNumber =
            dialledNumber.length > 0
                ? dialledNumber.substr(0, dialledNumber.length - 1)
                : '';
        this.setState({ dialledNumber: newNumber === '' ? '+' : newNumber });
    }

    renderButtonForChar(char) {
        return (
            <TouchableOpacity
                key={char}
                style={Styles.roundButton}
                onPress={this.buttonPressed.bind(this, char)}
            >
                <Text style={Styles.roundButtonText}>{char}</Text>
            </TouchableOpacity>
        );
    }

    renderButtons() {
        const { diallerState } = this.state;
        const digits =
            diallerState === DiallerState.initial
                ? [['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9'], ['0']]
                : [
                    ['1', '2', '3'],
                    ['4', '5', '6'],
                    ['7', '8', '9'],
                    ['*', '0', '+']
                ];
        return digits.map((row, index) => {
            return (
                <View key={index} style={Styles.buttonRow}>
                    {row.map(char => this.renderButtonForChar(char))}
                </View>
            );
        });
    }

    closeScreen() {
        Actions.pop();
    }

    renderCloseButton() {
        const { diallerState } = this.state;
        if (diallerState === DiallerState.initial) {
            return (
                <TouchableOpacity
                    style={Styles.closeButton}
                    onPress={this.closeScreen.bind(this)}
                >
                    <Text style={Styles.closeButtonText}>
                        {I18n.t('Close')}
                    </Text>
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
                <TouchableOpacity
                    style={Styles.closeButton}
                    onPress={this.handleDelete.bind(this)}
                >
                    <Text style={Styles.closeButtonText}>
                        {I18n.t('Delete')}
                    </Text>
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
        if (diallerState === DiallerState.incall) {
            this.setState({ diallerState: DiallerState.incall_digits });
        }
    }

    toggleMic() {
        TwilioVoice.setMuted(this.state.micOn);
        this.setState({ micOn: !this.state.micOn });
    }

    toggleSpeaker() {
        TwilioVoice.setSpeakerPhone(!this.state.speakerOn);
        this.setState({ speakerOn: !this.state.speakerOn });
    }

    render() {
        const { diallerState } = this.state;
        const message = this.statusMessage(diallerState);
        if (diallerState === DiallerState.initial) {
            return (
                <View style={Styles.container}>
                    <View style={Styles.initialMainContainer}>
                        <Text style={Styles.diallerNumberText}>
                            {this.phonenumber(diallerState)}
                        </Text>
                    </View>
                    <View style={Styles.diallerContainer}>
                        <View style={Styles.callQuotaContainer}>
                            <Text style={Styles.callQuotaText}>
                                {'Call to Phone'}
                            </Text>
                            <Text style={Styles.callQuotaPrice}>
                                {`\u00A3 ${this.state.callQuota}`}
                            </Text>
                        </View>
                        <View style={Styles.horizontalRuler} />
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
        } else if (
            diallerState === DiallerState.incall ||
            diallerState === DiallerState.connecting
        ) {
            return (
                <View style={Styles.container}>
                    <View style={Styles.mainContainer}>
                        <View style={Styles.nameContainer}>
                            <Text style={Styles.callingText}>{message}</Text>
                            <Text style={Styles.callingNumberText}>
                                {this.phonenumber(diallerState)}
                            </Text>
                        </View>
                        <View style={Styles.incallDiallerContainer}>
                            <View style={Styles.incallDiallerButtonContainer}>
                                <TouchableOpacity
                                    style={[Styles.button]}
                                    onPress={this.toggleMic.bind(this)}
                                >
                                    {this.state.micOn
                                        ? Icons.mic()
                                        : Icons.micOff()}
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[Styles.button]}
                                    onPress={this.openDial.bind(this)}
                                >
                                    {Icons.numdial()}
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[Styles.button]}
                                    onPress={this.toggleSpeaker.bind(this)}
                                >
                                    {this.state.speakerOn
                                        ? Icons.speakerOn()
                                        : Icons.speakerOff()}
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
                        <Text style={Styles.diallerNumberText}>
                            {this.phonenumber(diallerState)}
                        </Text>
                    </View>
                    <View style={Styles.swapButtonContainer}>
                        <TouchableOpacity
                            style={Styles.closeButton}
                            onPress={this.closeDigits.bind(this)}
                        >
                            <Text style={Styles.closeButtonText}>
                                {I18n.t('Close')}
                            </Text>
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
