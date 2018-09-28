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
import { Message, MessageTypeConstants } from '../../lib/capability';
import { BackgroundBotChat } from '../../lib/BackgroundTask';
import SystemBot from '../../lib/bot/SystemBot';
import { Auth } from '../../lib/capability';
import { Network } from '../../lib/capability';

let EventListeners = [];
export const DiallerState = {
    initial: 'initial',
    connecting: 'connecting',
    incall: 'incall',
    incall_digits: 'incall_digits'
};

const MESSAGE_TYPE = MessageTypeConstants.MESSAGE_TYPE_UPDATE_CALL_QUOTA;

export default class Dialler extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            diallerState: DiallerState.initial,
            dialledNumber: '+',
            dialledDigits: '',
            micOn: true,
            speakerOn: false,
            callQuota: 0,
            callQuotaUpdateError: false,
            updatingCallQuota: false,
            timerId: null,
            intervalId: null
        };
    }

    componentDidMount() {
        console.log('>>>>>>>>>>>>IN PSTN MOUNT!!!!');

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
        console.log(Network);

        const connection = await Network.isConnected();
        if (!connection) {
            Alert.alert(I18n.t('No_Network'));
            return;
        }
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
                const user = await Auth.getUser();
                TwilioVoice.connect({
                    CallerId: `${user.info.emailAddress}`,
                    To: `${this.state.dialledNumber}`
                });
            }
        } catch (err) {
            Alert.alert('VoIP Error', 'Error : ' + JSON.stringify(err));
            this.closeCall();
        }
    }

    async closeCall() {
        const { diallerState, timerId, intervalId } = this.state;
        if (timerId) {
            console.log('>>>Clearing Timeout<<<');
            clearTimeout(timerId);
        }
        if (intervalId) {
            console.log('>>>>>>>Clearing Interval to check call<<<<<<<');
            clearInterval(intervalId);
        }
        TwilioVoice.disconnect();
        Actions.pop();
    }

    initBackGroundBot = async () => {
        const message = new Message({
            msg: {
                callQuotaUsed: 0
            },
            messageType: MESSAGE_TYPE
        });
        message.setCreatedBy({ addedByBot: true });
        var bgBotScreen = new BackgroundBotChat({
            bot: SystemBot.backgroundTaskBot
        });

        await bgBotScreen.initialize();

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
            const timerId = setTimeout(
                this.countMinutes,
                20000,
                this.state.callQuota
            );
            this.setState({ diallerState: DiallerState.incall, timerId });
        }
    }

    connectionDidDisconnectHandler(data) {
        Actions.pop();
    }

    countMinutes = callQuota => {
        console.log(
            '>>>>>>Start Counting Minutes for Call<<<<<<<<<',
            callQuota
        );

        let quotaLeft = callQuota * 60;
        const intervalId = setInterval(() => {
            quotaLeft = quotaLeft - 1;
            console.log('>>>>Quota Left<<<<', quotaLeft);
            if (quotaLeft < 0) {
                this.closeCall();
            }
        }, 1000);
        this.setState({ intervalId });
    };

    close() {
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
                    disabled={this.state.updatingCallQuota}
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
                                {this.state.updatingCallQuota
                                    ? '...'
                                    : `Call Balance: ${
                                        this.state.callQuota
                                    } mins`}
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
