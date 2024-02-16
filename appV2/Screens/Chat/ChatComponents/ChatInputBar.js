import React, { PureComponent } from 'react';
import {
    Platform,
    TouchableOpacity,
    View,
    TextInput,
    Image,
    Text,
    TouchableHighlight
} from 'react-native';
import AudioRecorderPlayer, {
    AVEncoderAudioQualityIOSType,
    AVEncodingOption,
    AudioEncoderAndroidType,
    AudioSourceAndroidType,
    OutputFormatAndroidType
} from 'react-native-audio-recorder-player';
import AttachmentIcon from 'react-native-vector-icons/MaterialIcons';
import Permissions from 'react-native-permissions';
import AndroidOpenSettings from 'react-native-android-open-settings';
import RNFS from 'react-native-fs';
import { connect } from 'react-redux';
import styles, { chatBarStyle } from '../styles';
import Images from '../../../config/images';
import Icons from '../../../config/icons';
import { AudioRecordingConfig, ChatInputBarState } from '../config';
import Utils from '../../../lib/utils';
// import { MessageCounter } from '../../../lib/MessageCounter';
import I18n from '../../../config/i18n/i18n';
import GlobalColors from '../../../config/styles';
import RNFetchBlob from 'react-native-blob-util';
import PermissionList from '../../../lib/utils/PermissionList';
import { Icon } from '@rneui/themed';
import { Pressable } from 'react-native';
import AlertDialog from '../../../lib/utils/AlertDialog';
import { BotInputBarCapabilities } from '../config/BotConstants';

const RightButton = React.memo(
    (props) => {
        const {
            chatState,
            showSwipe,
            showOptions,
            showImageOptions,
            startRecording,
            sendMessage,
            cancelRecording
        } = props;
        console.log('the data is ticking -------->', props.chatState);
        if (chatState === ChatInputBarState.READY_FOR_SPEECH) {
            return (
                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    {showSwipe ? null : (
                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <TouchableOpacity
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 20,
                                    opacity: 1,
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                                onPress={() => showOptions()}
                            >
                                <View style={[styles.rightMediaIcon]}>
                                    <Icon
                                        name={'attach-sharp'}
                                        type={'ionicon'}
                                        size={22}
                                        color={GlobalColors.actionButtons}
                                    />
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 20,
                                    opacity: 1,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: 8
                                }}
                                onPress={() => showImageOptions()}
                                // unstable_pressDelay={200}
                            >
                                <View style={[styles.rightMediaIcon]}>
                                    {Icons.shareImageNew({
                                        color: GlobalColors.actionButtons,
                                        size: 20
                                    })}
                                </View>
                            </TouchableOpacity>
                        </View>
                    )}
                    <Pressable
                        accessibilityLabel="Right Button Mic"
                        testID="right-button-mic"
                        // disabled={this.props.network === 'none'}
                        onPress={startRecording}
                        unstable_pressDelay={100}
                        // onPressIn={() => {
                        //     this.setState({
                        //         showSwipe: true,
                        //         enlargeView: true
                        //     });
                        // }}
                        style={[
                            styles.micContainer,
                            { backgroundColor: GlobalColors.primaryColor }
                        ]}
                    >
                        <Icon
                            name={'microphone'}
                            type={'font-awesome'}
                            size={18}
                            color={GlobalColors.white}
                        />
                    </Pressable>
                </View>
            );
        }
        const action =
            chatState === ChatInputBarState.TYPING
                ? sendMessage
                : cancelRecording;
        return (
            <TouchableOpacity
                accessibilityLabel="Right Button Send"
                testID="right-button-send"
                onPress={action}
            >
                {chatState !== ChatInputBarState.TYPING ? (
                    <View style={styles.micContainer}>
                        <Icon
                            name={'check'}
                            type={'feather'}
                            size={22}
                            color={GlobalColors.textRippleColor}
                        />
                    </View>
                ) : (
                    <View
                        style={{
                            // flexDirection: 'row',
                            justifyContent: 'flex-end'
                        }}
                    >
                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center'
                            }}
                        >
                            <TouchableHighlight
                                activeOpacity={0.8}
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 20,
                                    opacity: 1,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: 4
                                }}
                                onPress={() => showOptions()}
                            >
                                <View style={[styles.rightMediaIcon]}>
                                    <Icon
                                        name={'attach-sharp'}
                                        type={'ionicon'}
                                        size={22}
                                        color={
                                            GlobalColors.secondaryButtonColor
                                        }
                                    />
                                </View>
                            </TouchableHighlight>
                            <View
                                style={[
                                    styles.micContainer,
                                    {
                                        backgroundColor:
                                            GlobalColors.toggleOnColor
                                    }
                                ]}
                            >
                                <Icon
                                    name={'send'}
                                    // type
                                    size={22}
                                    color={GlobalColors.white}
                                />
                            </View>
                        </View>
                    </View>
                )}
            </TouchableOpacity>
        );
    },
    (prevProps, nextProps) => {
        if (prevProps.chatState !== nextProps.chatState) {
            return false; // props are equal
        }
        if (prevProps.showSwipe !== nextProps.showSwipe) {
            return false; // props are equal
        }
        return true; // props are not equal -> update the component
    }
);

//TODO: review for optimization
class ChatInputBar extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            recordedTimeInSeconds: 0,
            text: '',
            chatState: ChatInputBarState.READY_FOR_SPEECH,
            showSwipe: false
        };
        this.audioRecorderPlayer = new AudioRecorderPlayer();
        this.audioRecorderPlayer.setSubscriptionDuration(0.1);
        this.chatListHeight = 100;
    }

    async componentWillUnmount() {
        console.log('the data is componentWillUnmount');
        // Stop recording when the user closes the app
        await this.cancelRecording();
    }

    setInitialState = () => {
        this.setState({
            recordedTimeInSeconds: 0,
            text: '',
            chatState: ChatInputBarState.READY_FOR_SPEECH
        });
    };

    showOptions = () => {
        // const optionLabels = this.props.options.map((elem) => elem.label);
        // if (Platform.OS === 'ios') {
        //     optionLabels.push('Cancel');
        // }

        this.props.onPlusButtonPressed(this.chatListHeight + 45);
    };
    showImageOptions = () => {
        // const optionLabels = this.props.options.map((elem) => elem.label);
        // if (Platform.OS === 'ios') {
        //     optionLabels.push('Cancel');
        // }

        this.props.onSelectGalary(BotInputBarCapabilities.photo_library);
    };

    onChangeText = (text) => {
        if (text) {
            // if (this.state.chatState !== ChatInputBarState.TYPING)
            this.setState({ text, chatState: ChatInputBarState.TYPING });
        } else {
            this.setInitialState();
        }
    };

    setPostAudioState() {
        const message = this.state.text && this.state.text.trim();
        if (message) {
            this.setState({
                recordedTimeInSeconds: 0,
                chatState: ChatInputBarState.TYPING,
                showSwipe: false
            });
        } else {
            this.setInitialState();
        }
    }

    //actual stopping of recording
    cancelRecording = async () => {
        this.setState({ enlargeView: false, showSwipe: false });
        console.log('audio: end - cancelRecording');
        if (this.state.chatState === ChatInputBarState.RECORDING_SPEECH) {
            try {
                let recordedTime = this.state.recordedTimeInSeconds;
                const result = await this.audioRecorderPlayer.stopRecorder();
                this.setPostAudioState();
                this.audioRecorderPlayer.removeRecordBackListener();
                console.log('audio: end-cancelRecording', result);
                this.sendAudio(result, recordedTime);
            } catch (error) {
                console.error('Error while stopping recording:', error);
                this.setPostAudioState();
            }
        }
    };

    cancelAndDiscardRecording = async () => {
        if (this.state.chatState === ChatInputBarState.RECORDING_SPEECH) {
            this.setState({ enlargeView: false, showSwipe: false });
            this.setPostAudioState();
            // Prevent this listener from getting called on iOS when the recording is cancelled
            // This is to make sure that the file doesn't get uploaded
            try {
                const result = await this.audioRecorderPlayer.stopRecorder();
                this.audioRecorderPlayer.removeRecordBackListener();
                RNFS.unlink(result)
                    .then(() => {
                        console.log(
                            'audio: cancelAndDiscardRecording - file deleted'
                        );
                    })
                    .catch(() => {
                        console.log('audio: error - cancelAndDiscardRecording');
                    });
            } catch (error) {
                console.log('Error while cancelling recording:', error);
            }
        }
    };

    async prepareAudioRecordingPath() {
        const audioSet = {
            AVEncoderAudioQualityKeyIOS: AVEncoderAudioQualityIOSType.low,
            AVNumberOfChannelsKeyIOS: 2,
            AVFormatIDKeyIOS: AVEncodingOption.aac,

            AudioEncoderAndroid: AudioEncoderAndroidType.AAC,
            AudioSourceAndroid: AudioSourceAndroidType.MIC,
            AVEncodingType: AVEncodingOption.aac,
            OutputFormatAndroid: OutputFormatAndroidType.AAC_ADTS
        };

        const dirs = RNFetchBlob.fs.dirs;
        const filePath = Platform.select({
            ios: `FrontM_${Date.now()}${`.aac`}`,
            android: `${dirs.CacheDir}/FrontM_${Date.now()}${`.aac`}`
        });

        return { filePath, audioSet };
    }

    async recordAudio() {
        if (this.state.chatState === ChatInputBarState.READY_FOR_SPEECH) {
            this.setState({
                chatState: ChatInputBarState.RECORDING_SPEECH
            });
            const prepared = await this.prepareAudioRecordingPath();

            // Don't start recording if there was some error during preparation process
            if (prepared) {
                console.log(
                    'audio: ading  addRecordBackListener to ',
                    this.audioRecorderPlayer
                );
                this.audioRecorderPlayer.addRecordBackListener((e) => {
                    console.log('audio:  addRecordBackListener callback', e);
                    this.setState({
                        recordedTimeInSeconds: Math.floor(
                            e.currentPosition / 1000
                        ),
                        enlargeView: false
                    });
                    return;
                });
                console.log('audio: calling start recordAudio');
                try {
                    const uri = await this.audioRecorderPlayer.startRecorder(
                        prepared.filePath,
                        prepared.audioSet,
                        false
                    );
                    console.log('audio: recordAudio callback', uri);
                } catch (e) {
                    console.log('Exception : ', JSON.stringify(e));
                }
            } else {
                this.setPostAudioState();
            }
        }
    }

    requestRecordPermission() {
        return Permissions.requestMultiple([PermissionList.MICROPHONE]);
    }

    hasRecordPermission() {
        return Permissions.checkMultiple([PermissionList.MICROPHONE]);
    }

    startRecording = () => {
        if (this.state.chatState === ChatInputBarState.READY_FOR_SPEECH) {
            if (Platform.OS === 'android') {
                this.hasRecordPermission().then((permission) => {
                    console.log('audio: hasRecordPermission', permission);
                    if (
                        permission[PermissionList.MICROPHONE] ===
                        Permissions.RESULTS.DENIED
                    ) {
                        this.requestRecordPermission().then((rp) => {
                            console.log('audio: requestRecordPermission', rp);
                            if (
                                rp[PermissionList.MICROPHONE] ===
                                Permissions.RESULTS.GRANTED
                            ) {
                                this.recordAudio();
                            }
                        });
                    } else if (
                        permission[PermissionList.MICROPHONE] ===
                        Permissions.RESULTS.GRANTED
                    ) {
                        this.recordAudio();
                    } else {
                        this.alertForRecordingPermission();
                    }
                });
            } else {
                Permissions.check(PermissionList.MICROPHONE).then(
                    (permission) => {
                        // AudioRecorder.requestAuthorization();

                        if (permission === Permissions.RESULTS.DENIED) {
                            Permissions.request(PermissionList.MICROPHONE).then(
                                (rp) => {
                                    if (rp === Permissions.RESULTS.GRANTED) {
                                        this.recordAudio();
                                    }
                                }
                            );
                        } else if (permission === Permissions.RESULTS.GRANTED) {
                            this.recordAudio();
                        } else {
                            this.alertForRecordingPermission();
                        }
                    }
                );
            }
        }
    };

    alertForRecordingPermission() {
        AlertDialog.show(
            undefined,
            'We need permission so you can record your voice',
            [
                {
                    text: 'cancel',
                    onPress: () => console.log('audio: Permission denied'),
                    style: 'cancel'
                },
                {
                    text: 'Open Settings',
                    onPress:
                        Platform.OS === 'ios'
                            ? Permissions.openSettings
                            : AndroidOpenSettings.appDetailsSettings
                }
            ]
        );
    }

    showQuotaAlert = () => {
        AlertDialog.show(I18n.t('Quota'), I18n.t('Quota_unavailable'));
    };

    sendMessage = () => {
        const { botId } = this.props;
        // if (botId) {
        //     if (MessageCounter.getAvailableBotMessageQuota(botId) <= 0) {
        //         this.showQuotaAlert();
        //         return;
        //     }
        // }

        const message = this.state.text && this.state.text.trim();
        if (!message || message === '') {
            return;
        }
        if (this.props.onSend) {
            this.props.onSend(message);
        }
        this.setInitialState();
    };

    sendAudio(audioURI, recordedTime) {
        if (audioURI && this.props.onSendAudio) {
            if (recordedTime >= AudioRecordingConfig.minAudioSeconds) {
                this.props.onSendAudio(audioURI);
            }
        }
    }
    onChatListLayout = (event) => {
        console.log('onChatListLayout');
        const { height } = event.nativeEvent.contentSize;
        this.chatListHeight = height;
        // this.chatList.scrollToBottom({animated : true});
    };
    render() {
        let renderOptions = this.props.options;
        if (this.state.chatState === ChatInputBarState.RECORDING_SPEECH) {
            let seconds = Math.floor(this.state.recordedTimeInSeconds);
            const minutes = String(Math.floor(seconds / 60));
            seconds = String(seconds);
            if (Platform.OS === 'android') {
                Utils.padStartForAndroid();
            }
            return (
                <View style={{ alignItems: 'flex-end' }}>
                    <View
                        style={[
                            chatBarStyle(),
                            { paddingVertical: 8, justifyContent: 'flex-end' }
                        ]}
                    >
                        <View
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                width: '100%',
                                height: 50
                            }}
                        >
                            <View style={{ flex: 9 }}>
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: 20,
                                        paddingVertical: 4
                                    }}
                                >
                                    <TouchableOpacity
                                        onPress={this.cancelAndDiscardRecording}
                                        style={styles.cancelButton}
                                    >
                                        <Icon
                                            name={'close'}
                                            type="antdesign"
                                            size={22}
                                            color={GlobalColors.formDelete}
                                            style={[
                                                this.props.network ===
                                                    'none' && {
                                                    tintColor: 'grey'
                                                }
                                            ]}
                                        />
                                    </TouchableOpacity>
                                    <View style={styles.recordingTimeContainer}>
                                        <Text style={styles.recordingTime}>
                                            {`${minutes.padStart(
                                                2,
                                                0
                                            )}:${seconds.padStart(2, 0)}`}
                                        </Text>
                                    </View>
                                    <RightButton
                                        chatState={this.state.chatState}
                                        showSwipe={this.state.showSwipe}
                                        showOptions={this.showOptions}
                                        showImageOptions={this.showImageOptions}
                                        startRecording={this.startRecording}
                                        sendMessage={this.sendMessage}
                                        cancelRecording={this.cancelRecording}
                                    />
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            );
        }
        return (
            <View
                style={{
                    alignItems: 'center'
                }}
            >
                <View style={[chatBarStyle(), { alignItems: 'flex-end' }]}>
                    <TextInput
                        onContentSizeChange={this.onChatListLayout}
                        value={this.state.text}
                        style={styles.chatTextInput}
                        placeholderTextColor={GlobalColors.formPlaceholderText}
                        underlineColorAndroid="transparent"
                        placeholder="Your message here…"
                        multiline
                        selectTextOnFocus={true}
                        onChangeText={(text) => {
                            this.onChangeText(text);
                        }}
                    />
                    <View
                        style={{
                            alignItems: 'flex-end',
                            justifyContent: 'center',
                            alignSelf: 'center',
                            flex: 3.8
                        }}
                    >
                        <View>
                            <RightButton
                                chatState={this.state.chatState}
                                showSwipe={this.state.showSwipe}
                                showOptions={this.showOptions}
                                showImageOptions={this.showImageOptions}
                                startRecording={this.startRecording}
                                sendMessage={this.sendMessage}
                                cancelRecording={this.cancelRecording}
                            />
                        </View>
                    </View>
                </View>
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    network: state.user?.network
});

export default connect(mapStateToProps)(ChatInputBar);
