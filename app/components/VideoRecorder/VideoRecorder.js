import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import Camera from 'react-native-camera';
import styles from './styles';
import { Actions } from 'react-native-router-flux';
import Icons from '../../config/icons';
import I18n from '../../config/i18n/i18n';

const VideoRecorderStates = {
    recording: 'recording',
    start: 'start',
    recorded: 'recorded'
}

export default class VideoRecorder extends React.Component {
    state = {
        captureMode: Camera.constants.CaptureMode.video,
        captureTarget: Camera.constants.CaptureTarget.disk,
        captureQuality: Camera.constants.CaptureQuality.medium,
        type: Camera.constants.Type.back,
        flashMode: Camera.constants.FlashMode.off,
        currentState: 'start',
    }

    renderBottomBar = () => {
        return (
            <View style={styles.bottomBar}>
                {this.renderCancelButton()}
                {this.renderRecordButton()}
                {this.renderUseButton()}
            </View>
        );
    }

    renderCancelButton = () => {
        return this.renderTextButton(I18n.t('Cancel').toLocaleUpperCase(), this.cancel, [styles.bottomButton, styles.cancelButton]);
    }

    renderRecordButton = () => {
        if (this.state.currentState === VideoRecorderStates.recording) {
            return (
                <TouchableOpacity onPress={this.stopCaptureVideo} style={styles.recordButtonContainer}>
                    <View style={styles.stopButton}/>
                </TouchableOpacity>
            );
        } else {
            return (
                <TouchableOpacity onPress={this.captureVideo} style={styles.recordButtonContainer}>
                    {Icons.videoRecordCircle()}
                </TouchableOpacity>
            );
        }
    }

    renderUseButton = () => {
        if (this.state.currentState === VideoRecorderStates.recorded) {
            return this.renderTextButton(I18n.t('Use').toLocaleUpperCase(), this.useVideo, [styles.bottomButton, styles.useButton]);
        } else {
            return <Text style={[styles.bottomButton, styles.useButton]}>{''}</Text>
        }
    }

    renderTextButton = (text, action, style) => {
        return (
            <TouchableOpacity onPress={action} style={styles.textButton}>
                <Text style={style}>{text}</Text>
            </TouchableOpacity>
        );
    }

    renderButton = (icon, action) => {
        return (
            <TouchableOpacity onPress={action} style={styles.button}>
                { icon }
            </TouchableOpacity>
        )
    }

    renderFlashButton = () => {
        return this.state.flashMode === Camera.constants.FlashMode.off ?
            this.renderButton(Icons.cameraFlashOutline(), this.toggleFlash)
            : this.renderButton(Icons.cameraFlash(), this.toggleFlash)
    }

    renderTopBar = () => {
        if (this.state.currentState === VideoRecorderStates.start ||
            this.state.currentState === VideoRecorderStates.recorded) {
            return (
                <View style={styles.topBar}>
                    {this.renderButton(Icons.cameraFlip(), this.toggleCamera)}
                </View>
            );
        }
    }

    toggleCamera = () => {
        if (this.state.type === Camera.constants.Type.back) {
            this.setState({ type: Camera.constants.Type.front });
        } else {
            this.setState({ type: Camera.constants.Type.back });
        }
    }

    toggleFlash = () => {
        if (this.state.flashMode === Camera.constants.FlashMode.off) {
            this.setState({ flashMode: Camera.constants.FlashMode.on });
        } else {
            this.setState({ flashMode: Camera.constants.FlashMode.off });
        }
    }

    cancel = () => {
        this.close();
    }

    close = () => {
        this.camera.stopCapture();
        if (this.props.onCancel) {
            this.props.onCancel();
        }
        Actions.pop();
    }

    componentWillUnmount() {
        this.camera.stopCapture();
    }

    useVideo = () => {
        console.log('On Video captured : ', this.video);
        if (this.video && this.props.onVideoCaptured) {
            this.props.onVideoCaptured(this.video);
        } else if (this.props.onCancel) {
            this.props.onCancel();
        }
        Actions.pop();
    }

    stopCaptureVideo = () => {
        console.log('Stop Capturing video');
        this.setState({ currentState: VideoRecorderStates.recorded });
        this.camera.stopCapture();
    }

    captureVideo = () => {
        console.log('Capturing video');
        const options = { audio: true };
        this.setState({ currentState: VideoRecorderStates.recording });
        this.camera.capture(options)
            .then((data) => {
                this.video = data;
            })
            .catch(err => console.error(err));
    }

    render() {
        return (
            <View style={styles.container}>
                <Camera
                    ref={(cam) => {
                        this.camera = cam;
                    }}
                    captureMode={this.state.captureMode}
                    captureTarget={this.state.captureTarget}
                    captureQuality={this.state.captureQuality}
                    flashMode={this.state.flashMode}
                    type={this.state.type}
                    style={styles.preview}
                    audio={true}
                    aspect={Camera.constants.Aspect.fill} />
                {this.renderBottomBar()}
                {this.renderTopBar()}
            </View>
        );
    }
}



