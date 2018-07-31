import React from 'react';
import { Platform, TouchableOpacity, View, TextInput, Image, Text, Alert } from 'react-native';
import { AudioRecorder, AudioUtils } from 'react-native-audio';
import styles, { chatBarStyle } from './styles';
import Images from '../../config/images';
import Icons from '../../config/icons';
import { AudioRecordingConfig, ChatInputBarState } from './config';
import ActionSheet from '@yfuks/react-native-action-sheet';
import Utils from '../../lib/utils';
import Permissions from 'react-native-permissions';
import AndroidOpenSettings from 'react-native-android-open-settings';
import { MessageCounter } from '../../lib/MessageCounter';
import I18n from '../../config/i18n/i18n';

export default class ChatInputBar extends React.Component {

    constructor(props) {
        super(props);
    }

    componentWillMount() {
        this.setInitialState();
    }

    async componentWillUnmount() {
        // Stop recording when the user closes the app
        await this._cancelRecording();
    }

    setInitialState() {
        this.setState({ recordedTimeInSeconds: 0, text: '', chatState: ChatInputBarState.READY_FOR_SPEECH });
    }

    showOptions() {
        const cancelButtonIndex = this.props.options.length;
        let optionLabels = this.props.options.map((elem) => elem.label)
        if (Platform.OS === 'ios') {
            optionLabels.push('Cancel');
        }

        ActionSheet.showActionSheetWithOptions(
            {
                options: optionLabels,
                cancelButtonIndex: cancelButtonIndex
            },
            buttonIndex => {
                if (buttonIndex !== undefined && buttonIndex !== cancelButtonIndex) {
                    if (this.props.onOptionSelected) {
                        //On Android in case of a touch outside the ActionSheet or the button back is pressed the buttonIndex value is 'undefined'
                        this.props.onOptionSelected(this.props.options[buttonIndex].key);
                    }
                }
            }
        );
    }

    onChangeText(text) {
        if (text) {
            this.setState({ text: text, chatState: ChatInputBarState.TYPING });
        } else {
            this.setInitialState();
        }
    }

    _setPostAudioState() {
        const message = this.state.text && this.state.text.trim();
        if (message) {
            this.setState({ recordedTimeInSeconds: 0, chatState: ChatInputBarState.TYPING });
        } else {
            this.setInitialState();
        }
    }

    _setOnFinishedListener() {
        // Event emitter is set only for iOS as Android gets it through promise
        if (Platform.OS === 'ios') {
            AudioRecorder.onFinished = (data) => {
                // Android callback comes in the form of a promise instead
                if (Platform.OS === 'ios') {
                    if (data.status === 'OK') {
                        this.sendAudio(data.audioFileURL);
                        // Reset the state after the audio has been sent as we need the recorded time
                        this._setPostAudioState();
                    }
                }
            };
        }
    }

    _resetOnFinishedListener() {
        AudioRecorder.onFinished = null;
    }

    async _cancelRecording() {
        if (this.state.chatState === ChatInputBarState.RECORDING_SPEECH) {
            // Prevent this listener from getting called on iOS when the recording is cancelled
            // This is to make sure that the file doesn't get uploaded
            this._resetOnFinishedListener();
            try {
                await AudioRecorder.stopRecording();
            } catch (error) {
                console.log('Error while cancelling recording:', error);
            }
            this._setPostAudioState();
        }
    }

    _stopRecording = async () => {
        if (this.state.chatState === ChatInputBarState.RECORDING_SPEECH) {
            try {
                const filePath = await AudioRecorder.stopRecording();
                // For iOS, we use the event emitter configured in the previous steps
                if (Platform.OS === 'android') {
                    this.sendAudio(filePath);
                    this._setPostAudioState();
                }
            } catch (error) {
                console.log('Error while stopping recording:', error);
                this._setPostAudioState();
            }
            // Reset the state after the audio has been sent as we need the recorded time
        }
    }

    async _prepareAudioRecordingPath() {
        const commonOptions = {
            SampleRate: 44100,
            Channels: 2,
            AudioQuality: 'Low'
        };

        // Options borrowed from Expo
        const platformOptions = {
            extension: '.aac',
            AudioEncoding: 'aac',
            Channels: 1,
            AudioQuality: 'Low',
            OutputFormat: 'aac_adts'
        }
        const options = {...commonOptions, ...platformOptions};
        // Generate file name using current time
        // Path will be like: /data/user/0/org.frontm.app/files/FrontM_1514101359570.3gp in Android
        const filePath = AudioUtils.DocumentDirectoryPath + '/FrontM_' + Date.now() + options.extension;
        console.log('Generated file path:', filePath, options);
        try {
            await AudioRecorder.prepareRecordingAtPath(filePath, options);
            return true;
        } catch (error) {
            console.log('Error while preparing audio:', error);
            return false;
        }
    }

    async _recordAudio() {
        console.log('Starting recording audio');
        if (this.state.chatState === ChatInputBarState.READY_FOR_SPEECH) {
            this.setState({ chatState: ChatInputBarState.RECORDING_SPEECH });
            const prepared = await this._prepareAudioRecordingPath();
            // Don't start recording if there was some error during preparation process
            if (prepared) {
                AudioRecorder.onProgress = (data) => {
                    this.setState({ recordedTimeInSeconds: data.currentTime });
                };
                this._setOnFinishedListener();
                try {
                    await AudioRecorder.startRecording();
                } catch (error) {
                    this._setPostAudioState();
                }
            } else {
                this._setPostAudioState();
            }
        }
    }

    _requestRecordPermission() {
        return Permissions.request('microphone');
        /*
        if (Platform.OS === 'ios') {
            return Promise.resolve(true);
        } else {
            const rationale = {
                'title': 'Microphone Permission',
                'message': 'This app needs access to your microphone to record audio'
            };

            return PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO, rationale).then((result) => {
                return (result === true || result === PermissionsAndroid.RESULTS.GRANTED);
            });
        } */
    }

    _hasRecordPermission() {
        //return Promise.resolve('authorized');
        return Permissions.check('microphone')
    }

    _startRecording() {
        if (this.state.chatState === ChatInputBarState.READY_FOR_SPEECH) {
            this._hasRecordPermission().then((permission) => {
                console.log('Permission : ', permission);
                //AudioRecorder.requestAuthorization();

                if (permission === 'undetermined') {
                    this._requestRecordPermission().then((rp) => {
                        if (rp === 'authorized') {
                            this._recordAudio();
                        }
                    });
                } else if (permission === 'authorized') {
                    this._recordAudio();
                } else {
                    this._alertForRecordingPermission();
                }
            });
        }
    }

    _alertForRecordingPermission() {
        Alert.alert(
            undefined,
            'We need permission so you can record your voice',
            [
                {
                    text: 'cancel',
                    onPress: () => console.log('Permission denied'),
                    style: 'cancel',
                },
                { text: 'Open Settings', onPress: (Platform.OS === 'ios') ? Permissions.openSettings : AndroidOpenSettings.appDetailsSettings },
            ],
        )
    }

    rightButton() {
        if (this.state.chatState === ChatInputBarState.READY_FOR_SPEECH) {
            return (
                <TouchableOpacity onPress={() => this._startRecording()}>
                    <Image source={Images.btn_record} style={styles.chatBarSpeakButton}/>
                </TouchableOpacity>
            );
        } else {
            const action = this.state.chatState === ChatInputBarState.TYPING ? this.sendMessage : this._stopRecording
            return (
                <TouchableOpacity onPress={action}>
                    <Image source={Images.btn_send} style={styles.chatBarSendButton}/>
                </TouchableOpacity>
            );
        }
    }

    showQuotaAlert = () => {
        Alert.alert(
            I18n.t('Quota'),
            I18n.t('Quota_unvailable'),
            [
                {text: 'OK'},
            ],
            { cancelable: true }
        )
        return;
    }

    sendMessage = () => {
        const { botId } = this.props;
        if (botId) {
            if (MessageCounter.getAvailableBotMessageQuota(botId) < 0) {
                this.showQuotaAlert();
                return;
            }
        }

        const message = this.state.text && this.state.text.trim();
        if (!message || message === '') {
            return
        }
        if (this.props.onSend) {
            this.props.onSend(message);
        }
        this.setInitialState();
    }

    sendAudio(audioURI) {
        if (audioURI && this.props.onSendAudio) {
            if (this.state.recordedTimeInSeconds >= AudioRecordingConfig.minAudioSeconds) {
                this.props.onSendAudio(audioURI);
            }
        }
    }

    render() {
        if (this.state.chatState === ChatInputBarState.RECORDING_SPEECH) {
            let seconds = Math.floor(this.state.recordedTimeInSeconds);
            const minutes = String(Math.floor(seconds / 60));
            seconds = String(seconds);
            if (Platform.OS === 'android') {
                Utils.padStartForAndroid();
            }
            return (
                <View style={chatBarStyle(this.props.network)}>
                    <TouchableOpacity onPress={() => this._cancelRecording()} style={styles.cancelButton}>
                        {Icons.cancelRecording({style: styles.cancelRecordingIcon})}
                    </TouchableOpacity>
                    <View style={styles.recordingTimeContainer}>
                        <Text style={styles.recordingTime}>{minutes.padStart(2, 0) + ':' + seconds.padStart(2, 0)}</Text>
                    </View>
                    {this.rightButton()}
                </View>
            );
        } else {
            return (
                <View style={chatBarStyle(this.props.network)}>
                    <TouchableOpacity onPress={this.showOptions.bind(this)}>
                        <Image source={Images.btn_more} style={styles.chatBarMoreButton}/>
                    </TouchableOpacity>
                    <TextInput
                        value={this.state.text}
                        style={styles.chatTextInput}
                        underlineColorAndroid="transparent"
                        placeholder="Type something nice"
                        multiline
                        onChangeText={this.onChangeText.bind(this)}
                    />
                    {this.rightButton()}
                </View>
            );
        }
    }
}
