import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import styles from './styles';
import Icons from '../../config/icons';
import Config from './config.js';
import Constants from '../../config/constants';
import utils from '../../lib/utils';
import Sound from 'react-native-sound';

const AudioPlayerStates = {
    PLAYING: 'playing',
    STOPPED: 'stopped'
}

export default class AudioPlayer extends React.Component {

    constructor(props) {
        super(props);
        Sound.setCategory('Playback');
        this.state = {
            playerState: AudioPlayerStates.STOPPED,
            progress: 0,
        };
    }

    _clearTrackProgessInterval() {
        clearInterval(this.trackProgressInterval);
    }

    componentWillUnmount() {
        // Check whether the audio instance is available before releasing it as it the
        // user might have pressed the back button just after opening the app without opening the audio.
        // Releasing an unavailable resource causes the app to crash
        if (this.audio) {
            try {
                this.audio.release();
            } catch (exception) {
                console.log('Error while releasing audio player', exception);
            }
        }
        // When user presses the back button to close the app, clear the trackProgressInterval
        // When not done, it gives an error as the audio instance won't be available
        this._clearTrackProgessInterval();
    }

    _resetPlayer() {
        if (this.audio) {
            this.audio.setCurrentTime(0);
            this.setState({ progress: 0, playerState: AudioPlayerStates.STOPPED });
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

        if (this.audio) {
            this.trackProgressInterval = setInterval(() => {
                this.audio.getCurrentTime((currentTime, isPlaying) => {
                    callback(currentTime, isPlaying);
                });
            }, 1000);
        }
    }

    _onPlayEnd(success) {
        this._resetPlayer();
    }

    async _playAudio() {
        this.setState({ playerState: AudioPlayerStates.PLAYING });
        const callback = (error, sound) => {
            if (!error) {
                this.audio = sound;
                this.audio.play((success) => this._onPlayEnd(success));
                this._trackProgress(sound._duration);
            } else {
                this.setState({ playerState: AudioPlayerStates.STOPPED });
            }
        };

        if (!this.audio) {
            // Expo doesn't support passing secure headers to download, so use our own
            const { uri, headers } = this.props.audioSource;
            const audioSource = await utils.downloadFileAsync(uri, headers, Constants.AUDIO_DIRECTORY);

            const sound = new Sound(audioSource.uri, (error) => callback(error, sound));
        } else {
            this.audio.play((success) => this._onPlayEnd(success));
            this._trackProgress(this.audio.getDuration())
        }
    }

    _pauseAudio() {
        this.setState({ playerState: AudioPlayerStates.STOPPED });

        if (this.audio) {
            this.audio.pause();
            this._clearTrackProgessInterval();
        }
    }

    _renderPlayButton() {
        return (
            <TouchableOpacity style={styles.button} onPress={() => this._playAudio()}>
                {Icons.playIcon({})}
            </TouchableOpacity>
        );
    }

    _renderPauseButton() {
        return (
            <TouchableOpacity style={styles.button} onPress={() => this._pauseAudio()}>
                {Icons.pauseIcon({})}
            </TouchableOpacity>
        );
    }

    _renderProgress() {
        const left = this.state.progress * Config.BAR_WIDTH;
        return (
            <View style={styles.progress}>
                <View style={styles.line} />
                {Icons.audioCircle({style: [styles.circle, {left: left}]})}
            </View>
        )
    }

    render() {
        return (
            <View style={styles.container}>
                {this.state.playerState === AudioPlayerStates.STOPPED ?
                    this._renderPlayButton() : this._renderPauseButton()}
                {this._renderProgress()}
            </View>
        )
    }
}
