import React from 'react';
import { TouchableOpacity, View, Platform } from 'react-native';
import styles from './styles';
import Icons from '../../config/icons';
import Config from './config.js';
import Constants from '../../config/constants';
import utils from '../../lib/utils';
import Sound from 'react-native-sound';
import _ from 'lodash';
import { UIActivityIndicator } from 'react-native-indicators';
import RNFS from 'react-native-fs';
import { AssetFetcher } from '../../lib/dce';

const AudioPlayerStates = {
    LOADING: 'loading',
    PLAYING: 'playing',
    STOPPED: 'stopped'
};

export default class AudioPlayer extends React.Component {
    constructor(props) {
        super(props);
        Sound.setCategory('Playback');
        this.state = {
            playerState: AudioPlayerStates.LOADING,
            progress: 0
        };
        this.localPath = decodeURI(
            Constants.AUDIO_DIRECTORY + '/' + this.props.fileName
        );
    }

    _clearTrackProgessInterval() {
        clearInterval(this.trackProgressInterval);
    }

    componentWillUnmount() {
        // Check whether the audio instance is available before releasing it as it the
        // user might have pressed the back button just after opening the app without opening the audio.
        // Releasing an unavailable resource causes the app to crash
        if (this.state.audio) {
            try {
                this.state.audio.release();
            } catch (exception) {
                console.error('Error while releasing audio player', exception);
            }
        }
        // When user presses the back button to close the app, clear the trackProgressInterval
        // When not done, it gives an error as the audio instance won't be available
        this._clearTrackProgessInterval();
    }

    async componentDidMount() {
        const { uri, headers } = this.props.audioSource;
        const exist = await AssetFetcher.existsOnDevice(this.localPath);
        let audioPath;
        if (!exist) {
            await RNFS.mkdir(Constants.AUDIO_DIRECTORY);
            const audioSource = await utils.downloadFileAsync(
                uri,
                headers,
                Constants.AUDIO_DIRECTORY
            );
            audioPath = audioSource.uri;
        } else {
            audioPath = this.localPath;
        }
        if (_.startsWith(audioPath, 'file://') && Platform.OS === 'android') {
            audioPath = audioPath.substr(6);
        }

        const callback = (error, sound) => {
            if (!error) {
                this.setState({
                    audio: sound
                });
            } else {
                this.setState({ playerState: AudioPlayerStates.STOPPED });
            }
        };
        const sound = new Sound(audioPath, '', error => callback(error, sound));
    }

    _resetPlayer() {
        if (this.state.audio) {
            this.state.audio.setCurrentTime(0);
            this.setState({
                progress: 0,
                playerState: AudioPlayerStates.STOPPED
            });
        }
        this._clearTrackProgessInterval();
    }

    _trackProgress(duration) {
        const callback = (currentTime, isPlaying) => {
            if (!isPlaying) {
                this._resetPlayer();
            } else {
                this.setState({ progress: currentTime / duration });
            }
        };

        if (this.state.audio) {
            this.trackProgressInterval = setInterval(() => {
                this.state.audio.getCurrentTime((currentTime, isPlaying) => {
                    callback(currentTime, isPlaying);
                });
            }, 200);
        }
    }

    _onPlayEnd(success) {
        this._resetPlayer();
    }

    async _playAudio() {
        this.setState({ playerState: AudioPlayerStates.PLAYING });
        this.state.audio.play(success => this._onPlayEnd(success));
        this._trackProgress(this.state.audio.getDuration());
    }

    _pauseAudio() {
        this.setState({ playerState: AudioPlayerStates.STOPPED });

        if (this.state.audio) {
            this.state.audio.pause();
            this._clearTrackProgessInterval();
        }
    }

    _renderPlayButton() {
        if (this.state.audio) {
            return (
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => this._playAudio()}
                >
                    {Icons.playIcon({})}
                </TouchableOpacity>
            );
        } else {
            return (
                <View style={styles.loadingIndicator}>
                    <UIActivityIndicator size={16} color="rgb(255,255,255)" />
                </View>
            );
        }
    }

    _renderPauseButton() {
        return (
            <TouchableOpacity
                style={styles.button}
                onPress={() => this._pauseAudio()}
            >
                {Icons.pauseIcon({})}
            </TouchableOpacity>
        );
    }

    _renderProgress() {
        const left = this.state.progress * Config.BAR_WIDTH;
        return (
            <View style={styles.progress}>
                <View style={styles.line} />
                <View style={[styles.circle, { left: left }]}>
                    {Icons.audioCircle()}
                </View>
            </View>
        );
    }

    render() {
        return (
            <View style={styles.container}>
                {this.state.playerState === AudioPlayerStates.STOPPED ||
                this.state.playerState === AudioPlayerStates.LOADING
                    ? this._renderPlayButton()
                    : this._renderPauseButton()}
                {this._renderProgress()}
            </View>
        );
    }
}
