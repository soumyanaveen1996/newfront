import React from 'react';
import { Platform, PermissionsAndroid, TouchableOpacity, View, TextInput, Image, Text, NetInfo } from 'react-native';
import { AudioRecorder, AudioUtils } from 'react-native-audio';
import styles from './styles';
import Images from '../../config/images';
import Icons from '../../config/icons';
import { AudioRecordingConfig, ChatInputBarState } from './config';
import ActionSheet from '@yfuks/react-native-action-sheet';

export default class ChatInputBar extends React.Component {

    constructor(props) {
        super(props);
    }

    componentWillMount() {
        this.setInitialState();
        NetInfo.isConnected.addEventListener('connectionChange', this.handleConnectionChange);
    }

    async componentWillUnmount() {
        // Stop recording when the user closes the app
        await this._cancelRecording();
        NetInfo.isConnected.removeEventListener('connectionChange', this.handleConnectionChange);
    }

    setInitialState() {
        this.setState({ recordedTimeInSeconds: 0, text: '', chatState: ChatInputBarState.READY_FOR_SPEECH, network:'true'});
    }

    handleConnectionChange = (isConnected) => {
        if(isConnected){
            this.setState({ network: 'true' });
        } else {
            this.setState({ network: 'false' });
        }
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
                if (buttonIndex !== cancelButtonIndex) {
                    if (this.props.onOptionSelected) {
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
        const platformOptions = Platform.select({
            android: {
                extension: '.3gp',
                OutputFormat: 'three_gpp',
                AudioEncoding: 'amr_nb'
            },

            ios: {
                extension: '.caf',
                AudioEncoding: 'ima4'
            }
        });
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
        }
    }

    _hasRecordPermission() {
        if (Platform.OS === 'ios') {
            return Promise.resolve(true);
        } else {
            return PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO).then((result) => {
                return (result === true);
            });
        }
    }

    _startRecording() {
        if (this.state.chatState === ChatInputBarState.READY_FOR_SPEECH) {
            this._hasRecordPermission().then((status) => {
                if (!status) {
                    this._requestRecordPermission().then((granted) => {
                        if (granted) {
                            this._recordAudio();
                        }
                    });
                } else {
                    this._recordAudio();
                }
            });
        }
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

    sendMessage = () => {
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
            return (
                <View style={this.state.network === "true" ? styles.chatBarNetOn : styles.chatBarNetOff}>
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
                <View style={this.state.network === "true" ? styles.chatBarNetOn : styles.chatBarNetOff}>
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
