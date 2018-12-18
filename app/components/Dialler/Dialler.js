import React from 'react';
import {
    Alert,
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    Image,
    ScrollView
} from 'react-native';
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
import ROUTER_SCENE_KEYS from '../../routes/RouterSceneKeyConstants';
import Modal from 'react-native-modal';
import GlobalColors from '../../config/styles';
import CountryCodes from './code';
import Bot from '../../lib/bot';
import { Action } from 'rxjs/scheduler/Action';
import ProfileImage from '../ProfileImage';

const R = require('ramda');

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
            dialledNumber: '',
            dialledDigits: '',
            micOn: true,
            speakerOn: false,
            callQuota: 0,
            callQuotaUpdateError: false,
            updatingCallQuota: false,
            timerId: null,
            callTime: 0,
            intervalId: null,
            noBalance: false,
            bgBotScreen: null,
            codes: CountryCodes(),
            showCodes: false,
            countryElements: []
        };
    }

    componentDidMount() {
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
        this.setState({ callTime: 0 });
        if (this.props.phoneNumber) {
            this.setState({ dialledNumber: this.props.phoneNumber });
        }

        if (this.props.call && this.props.number) {
            this.setState({ dialledNumber: this.props.number });
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (
            prevState.updatingCallQuota !== this.state.updatingCallQuota &&
            !this.state.updatingCallQuota
        ) {
            if (this.props.call) {
                this.call();
            }
        }
    }

    async call() {
        this.setState({ noBalance: false });
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
            this.setState({ noBalance: true });
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
            const connection = await Network.isConnected();
            if (!connection) {
                Alert.alert(I18n.t('No_Network'));
                Actions.pop();
                return;
            }
            Alert.alert('VoIP Error', 'Error : ' + JSON.stringify(err));
            this.closeCall();
        }
    }

    async closeCall() {
        const { diallerState } = this.state;
        // if (intervalId) {
        //     clearInterval(intervalId)
        // }
        TwilioVoice.disconnect();
        // Actions.pop()
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
        this.setState({ updatingCallQuota: true, bgBotScreen });
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
            const intervalId = setInterval(() => {
                this.setState({ callTime: this.state.callTime + 1 });
            }, 1000);
            this.setState({ diallerState: DiallerState.incall, intervalId });
        }
    }

    connectionDidDisconnectHandler(data) {
        // Actions.pop()
        if (this.state.intervalId) {
            clearInterval(this.state.intervalId);
        }
        let dialledNumber = this.state.dialledNumber;
        this.setState({
            diallerState: DiallerState.initial,
            dialledNumber: '',
            dialledDigits: '',
            intervalId: null
        });
        Actions.pop();
        setTimeout(
            () =>
                Actions.refresh({
                    bot: undefined,
                    summary: true,
                    time: this.state.callTime,
                    dialContact: this.props.contact
                        ? this.props.contact
                        : undefined,
                    dialledNumber: dialledNumber,
                    key: Math.random()
                }),
            0
        );
        // if (this.state.bgBotScreen) {
        //     this.setState({updatingCallQuota: true})
        //     setTimeout(() => {
        //         console.log('Updating Call Balance......')
        //         const message = new Message({
        //             msg: {
        //                 callQuotaUsed: 0
        //             },
        //             messageType: MESSAGE_TYPE
        //         })
        //         message.setCreatedBy({addedByBot: true})
        //         this.state.bgBotScreen.next(
        //             message,
        //             {},
        //             [],
        //             this.state.bgBotScreen.getBotContext()
        //         )
        //     }, 6000)
        // }
    }

    countMinutes = callQuota => {
        // let quotaLeft = callQuota * 60
        // const intervalId = setInterval(() => {
        //     quotaLeft = quotaLeft - 1
        //     if (quotaLeft < 0) {
        //         this.closeCall()
        //     }
        // }, 1000)
        this.setState({ intervalId });
    };

    close() {
        if (diallerState === Dialler.incall) {
            TwilioVoice.disconnect();
        }
        // Actions.pop()
    }

    renderButton() {
        const { diallerState } = this.state;
        if (diallerState === DiallerState.initial) {
            return (
                <TouchableOpacity
                    style={Styles.callButtonGreen}
                    onPress={this.call.bind(this)}
                    disabled={this.state.updatingCallQuota}
                >
                    <Image
                        style={Styles.callButtonGreen}
                        source={require('../../images/contact/call-btn-large.png')}
                    />
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
        console.log('Phone Number', state);
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
                this.handleDelete();
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

    alphaForNumber = char => {
        switch (char) {
        case '2':
            return 'ABC';
        case '3':
            return 'DEF';
        case '4':
            return 'GHI';
        case '5':
            return 'JKL';
        case '6':
            return 'MNO';
        case '7':
            return 'PQRS';
        case '8':
            return 'TUV';
        case '9':
            return 'WXYZ';
        default:
            '';
        }
    };
    renderButtonForChar(char) {
        if (char === '+') {
            return (
                <TouchableOpacity
                    key={char}
                    style={Styles.roundButtonDel}
                    onPress={this.buttonPressed.bind(this, char)}
                >
                    {Icons.backSpace()}
                </TouchableOpacity>
            );
        }
        if (char === '*') {
            return (
                <TouchableOpacity
                    key={char}
                    style={Styles.roundButton}
                    onPress={this.buttonPressed.bind(this, char)}
                >
                    <Text style={Styles.roundButtonStar}>{char}</Text>
                </TouchableOpacity>
            );
        }
        return (
            <TouchableOpacity
                key={char}
                style={Styles.roundButton}
                onPress={this.buttonPressed.bind(this, char)}
            >
                <Text style={Styles.roundButtonText}>{char}</Text>
                <Text style={Styles.roundButtonAlpha}>
                    {this.alphaForNumber(char)}
                </Text>
            </TouchableOpacity>
        );
    }

    renderButtons() {
        const { diallerState } = this.state;
        const digits =
            diallerState === DiallerState.initial
                ? [
                    ['1', '2', '3'],
                    ['4', '5', '6'],
                    ['7', '8', '9'],
                    ['*', '0', '+']
                ]
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
        if (this.props.newCallScreen) {
            // Actions.tabBarCall()
            // Actions.popTo(ROUTER_SCENE_KEYS.tabBarCall);
            Actions.pop();
            setTimeout(
                () => Actions.refresh({ key: Math.random(), bot: undefined }),
                0
            );
        } else {
            Actions.pop();
        }
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
                <TouchableOpacity style={Styles.closeButton}>
                    <Text style={Styles.closeButtonText} />
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
        if (
            this.state.diallerState === DiallerState.connecting ||
            this.state.diallerState === DiallerState.incall
        ) {
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

    showCodes = () => this.setState({ showCodes: true });
    hideCodes = () => this.setState({ showCodes: false });

    getCredit() {
        Bot.getInstalledBots()
            .then(bots => {
                console.log(bots);
                dwIndex = R.findIndex(R.propEq('botId', 'DigitalWallet'))(bots);
                if (dwIndex < 0) {
                    return Alert.alert(
                        'You have to download DigitalWallet Bot to buy Credits'
                    );
                }
                const DWBot = bots[dwIndex];
                // Actions.botChat({bot: DWBot})
                Actions.pop();
                setTimeout(
                    () => Actions.refresh({ bot: DWBot, key: Math.random() }),
                    0
                );
            })
            .catch(err => {
                console.log(err);
                Alert.alert('An error occured');
            });
    }
    renderCountryCode = () => {
        if (this.state.countryElements.length > 0) {
            return this.state.countryElements;
        }
        let countryElements = [];
        for (let prop in this.state.codes) {
            const el = (
                <TouchableOpacity
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
                        style={{ color: 'rgba(0,167,214,1)' }}
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
    renderModal = () => {
        return (
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
    };

    diallerInitial = () => {
        const { diallerState } = this.state;
        return (
            <View style={Styles.container}>
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
                            source={require('../../images/contact/arrow-down-white.png')}
                        />
                    </TouchableOpacity>
                    <Text style={Styles.diallerNumberText}>
                        {this.phonenumber(diallerState)}
                    </Text>
                </View>
                <View style={Styles.callQuotaContainer}>
                    <View style={Styles.callQuotaTextContainer}>
                        <Text style={Styles.callQuotaText}>
                            {'Call to Phone'}
                        </Text>
                        <Text style={Styles.callQuotaText}>
                            {'Current Balance: '}
                            <Text style={{ color: GlobalColors.black }}>$</Text>
                            <Text style={{ color: GlobalColors.black }}>
                                {this.state.updatingCallQuota
                                    ? '...'
                                    : this.state.callQuota}
                            </Text>
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={Styles.callQuotaBuy}
                        onPress={this.getCredit.bind(this)}
                        disabled={this.state.updatingCallQuota}
                    >
                        <Text style={{ color: 'rgba(0,167,214,1)' }}>
                            Get Credit
                        </Text>
                    </TouchableOpacity>
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
                {this.renderModal()}
            </View>
        );
    };

    renderCallerInfo = () => {
        if (this.props.contact) {
            return (
                <View>
                    <Text style={Styles.callingNumberText}>
                        {this.props.contact.name}
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
            if (this.props.contact) {
                return (
                    <ProfileImage
                        uuid={this.props.contact.id}
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
        }

        if (this.state.diallerState === DiallerState.incall) {
            if (this.props.contact) {
                return (
                    <ProfileImage
                        uuid={this.props.contact.id}
                        placeholder={require('../../images/contact/GreenGoblin.png')}
                        style={Styles.avatar}
                        placeholderStyle={Styles.avatar}
                        resizeMode="cover"
                    />
                );
            }

            return (
                <Image
                    style={Styles.avatar}
                    source={require('../../images/contact/GreenGoblin.png')}
                />
            );
        }
    };

    diallerConnecting = () => {
        const { diallerState } = this.state;
        const message = this.statusMessage(diallerState);
        return (
            <View style={Styles.container}>
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
                <View style={Styles.buttonContainer}>
                    <TouchableOpacity
                        style={
                            this.state.micOn
                                ? Styles.buttonCtr
                                : Styles.buttonCtrOn
                        }
                        onPress={this.toggleMic.bind(this)}
                    >
                        <Image
                            style={Styles.btnImg}
                            source={require('../../images/contact/call-mute-btn.png')}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={Styles.buttonCtr}
                        onPress={this.closeCall.bind(this)}
                    >
                        <Image
                            style={Styles.btnImg}
                            source={require('../../images/contact/call-endcall-btn.png')}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={
                            this.state.speakerOn
                                ? Styles.buttonCtrOn
                                : Styles.buttonCtr
                        }
                        onPress={this.toggleSpeaker.bind(this)}
                    >
                        <Image
                            style={Styles.btnImg}
                            source={require('../../images/contact/call-speaker-btn.png')}
                        />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    diallerIncallwDigits = () => {
        const { diallerState } = this.state;
        const message = this.statusMessage(diallerState);
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
    };

    render() {
        console.log('Dialled Number', this.state.diallerState);

        const { diallerState } = this.state;
        const message = this.statusMessage(diallerState);

        if (this.state.updatingCallQuota && this.props.call) {
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

        if (diallerState === DiallerState.incall_digits) {
            return this.diallerIncallwDigits();
        }

        return <View />;
    }
}
