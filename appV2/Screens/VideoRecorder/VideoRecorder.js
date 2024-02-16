import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { RNCamera } from 'react-native-camera';
import styles from './styles';
import Icons from '../../config/icons';
import I18n from '../../config/i18n/i18n';
import NavigationAction from '../../navigation/NavigationAction';

const VideoRecorderStates = {
    recording: 'recording',
    start: 'start',
    recorded: 'recorded'
};

export default class VideoRecorder extends React.Component {
    constructor() {
        super();
        console.log();
        this.state = {
            // captureMode: RNCamera.Constants.CaptureMode.video,
            // captureTarget: RNCamera.Constants.CaptureTarget.disk,
            // captureQuality: RNCamera.Constants.CaptureQuality.medium,
            type: RNCamera.Constants.Type.back,
            flashMode: RNCamera.Constants.FlashMode.off,
            currentState: 'start'
        };
    }

    renderBottomBar = () => (
        <View style={styles.bottomBar}>
            {this.renderCancelButton()}
            {this.renderRecordButton()}
            {this.renderUseButton()}
        </View>
    );

    renderCancelButton = () =>
        this.renderTextButton(
            I18n.t('Cancel').toLocaleUpperCase(),
            this.cancel,
            [styles.bottomButton, styles.cancelButton]
        );

    renderRecordButton = () => {
        if (this.state.currentState === VideoRecorderStates.recording) {
            return (
                <TouchableOpacity
                    onPress={this.stopCaptureVideo}
                    style={styles.recordButtonContainer}
                >
                    <View style={styles.stopButton} />
                </TouchableOpacity>
            );
        }
        return (
            <TouchableOpacity
                onPress={this.captureVideo}
                style={styles.recordButtonContainer}
            >
                {Icons.videoRecordCircle()}
            </TouchableOpacity>
        );
    };

    renderUseButton = () => {
        if (this.state.currentState === VideoRecorderStates.recorded) {
            return this.renderTextButton(
                I18n.t('Use').toLocaleUpperCase(),
                this.useVideo,
                [styles.bottomButton, styles.useButton]
            );
        }
        return <Text style={[styles.bottomButton, styles.useButton]} />;
    };

    renderTextButton = (text, action, style) => (
        <TouchableOpacity onPress={action} style={styles.textButton}>
            <Text style={style}>{text}</Text>
        </TouchableOpacity>
    );

    renderButton = (icon, action) => (
        <TouchableOpacity onPress={action} style={styles.button}>
            {icon}
        </TouchableOpacity>
    );

    renderFlashButton = () =>
        this.state.flashMode === RNCamera.constants.FlashMode.off
            ? this.renderButton(Icons.cameraFlashOutline(), this.toggleFlash)
            : this.renderButton(Icons.cameraFlash(), this.toggleFlash);

    renderTopBar = () => {
        if (
            this.state.currentState === VideoRecorderStates.start ||
            this.state.currentState === VideoRecorderStates.recorded
        ) {
            return (
                <View style={styles.topBar}>
                    {this.renderButton(Icons.cameraFlip(), this.toggleCamera)}
                </View>
            );
        }
    };

    toggleCamera = () => {
        if (this.state.type === RNCamera.Constants.Type.back) {
            this.setState({ type: RNCamera.Constants.Type.front });
        } else {
            this.setState({ type: RNCamera.Constants.Type.back });
        }
    };

    toggleFlash = () => {
        if (this.state.flashMode === RNCamera.Constants.FlashMode.off) {
            this.setState({ flashMode: RNCamera.Constants.FlashMode.on });
        } else {
            this.setState({ flashMode: RNCamera.Constants.FlashMode.off });
        }
    };

    cancel = () => {
        this.close();
    };

    close = () => {
        this.camera.stopRecording();
        const {
            route: {
                params: { onCancel }
            }
        } = this.props;
        if (onCancel) {
            onCancel();
        }
        NavigationAction.pop();
    };

    componentWillUnmount() {
        this.camera.stopRecording();
    }

    useVideo = () => {
        const {
            route: {
                params: { onVideoCaptured, onCancel }
            }
        } = this.props;
        if (this.state.video && this.props.onVideoCaptured) {
            this.props.onVideoCaptured({ ...this.state.video });
        } else if (this.props.onCancel) {
            this.props.onCancel();
        }
        NavigationAction.pop();
    };

    stopCaptureVideo = () => {
        this.camera.stopRecording();
    };

    captureVideo = () => {
        const options = { audio: true };
        this.setState({ currentState: VideoRecorderStates.recording });
        this.camera
            .recordAsync(options)
            .then((res) => {
                console.log('~~~~~~~~~ recordAsync', res);
                this.setState({
                    currentState: VideoRecorderStates.recorded,
                    video: res
                });
            })
            .catch((err) => console.error(err));
        // this.camera
        //     .capture(options)
        //     .then(data => {
        //         this.video = data;
        //     })
        //     .catch(err => console.error(err));
    };

    render() {
        return (
            <View style={styles.container}>
                <RNCamera
                    ref={(cam) => {
                        this.camera = cam;
                    }}
                    // captureMode={this.state.captureMode}
                    // captureTarget={this.state.captureTarget}
                    // captureQuality={this.state.captureQuality}
                    flashMode={this.state.flashMode}
                    type={this.state.type}
                    style={styles.preview}
                    audio
                    // aspect={RNCamera.constants.Aspect.fill}
                />
                {this.renderBottomBar()}
                {this.renderTopBar()}
            </View>
        );
    }
}
