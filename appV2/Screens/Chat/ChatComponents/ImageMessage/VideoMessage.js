import React from 'react';
import {
    Text,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    Platform,
    View
} from 'react-native';
import Constants from '../../config/constants';
import { AssetFetcher } from '../../lib/dce';
import RNFetchBlob from 'react-native-blob-util';
import RNFS from 'react-native-fs';
import GlobalColors from '../../config/styles';
import mime from 'react-native-mime-types';
import { Actions } from 'react-native-router-flux';
import utils from '../../lib/utils';
import { Auth } from '../../lib/capability';
import config from '../../config/config';
import styles from './styles';
import Video from 'react-native-video';
import images from '../../config/images';

const FileState = {
    REMOTE: 'remote',
    DOWNLOADING: 'downloading',
    SAVED: 'saved'
};

export default class VideoMessage extends React.Component {
    constructor(props) {
        super(props);
        // this.localPath = decodeURI(
        //     Constants.VIDEO_DIRECTORY + '/' + this.props.fileName
        // );
        // this.remoteUrl = `${config.proxy.protocol}${
        //     config.proxy.resource_host
        //     }${config.proxy.downloadFilePath}/${
        //     this.props.conversationContext.conversationId
        //     }/${this.props.fileName}`;
        this.url =
            this.props.options && this.props.options.fullUrl
                ? this.props.url
                : this.props.url;
        this.state = {
            status: FileState.SAVED,
            ready: false
        };
    }

    async componentDidMount() {
        // AssetFetcher.existsOnDevice(this.localPath).then(exist => {
        //     if (exist) {
        //         this.setState({ status: FileState.SAVED });
        //     } else {
        //         this.downloadFile();
        //     }
        // });
    }

    async downloadFile() {
        const user = Auth.getUserData();
        RNFS.mkdir(Constants.IMAGES_DIRECTORY)
            .then(() => {
                return AssetFetcher.existsOnDevice(this.localPath);
            })
            .then((exist) => {
                if (!exist) {
                    const headers =
                        utils.s3DownloadHeaders(this.remoteUrl, user) ||
                        undefined;
                    return AssetFetcher.downloadFile(
                        this.localPath,
                        this.remoteUrl,
                        headers,
                        true,
                        false
                    );
                } else {
                    return;
                }
            })
            .then((res) => {
                this.setState({ status: FileState.SAVED });
            })
            .catch((e) => {
                console.log('ERROR while downloading the file', e);
                this.setState({ status: FileState.REMOTE });
                AssetFetcher.deleteFile(this.localPath);
            });
    }

    async onTap() {
        // if (this.state.status === FileState.REMOTE) {
        //     this.setState({ status: FileState.DOWNLOADING });
        //     this.downloadFile();
        // } else if (this.state.status === FileState.SAVED) {
        //     this.openImage();
        // }
        this.player.presentFullscreenPlayer();
    }

    openImage(headers, uri) {
        AssetFetcher.existsOnDevice(this.localPath).then((exists) => {
            if (exists) {
                Actions.imageViewer({ uri: this.localPath });
            } else {
                this.setState({ status: FileState.REMOTE });
            }
        });
    }

    render() {
        return (
            <View
                style={[
                    styles.container,
                    {
                        alignItems: this.props.isFromUser
                            ? 'flex-end'
                            : 'flex-start'
                    }
                ]}
            >
                <TouchableOpacity
                    style={styles.message}
                    disabled={this.state.status === FileState.DOWNLOADING}
                    onPress={this.onTap.bind(this)}
                >
                    <Video
                        source={{ uri: this.url }}
                        ref={(player) => {
                            this.player = player;
                        }}
                        paused
                        autopla
                        // headers={headers}
                        // videoWidth={'98%'}
                        // videoHeight={'98%'}
                        // autoplay={false}
                        // loop={false}
                        // onLoad={() => console.log('AmalVideo: File loaded')}
                        // onLoadStart={() =>
                        //     console.log('AmalVideo: File load started')
                        // }
                        // hideControlsOnStart={true}
                        // disableSeek
                        // pauseOnPress
                        // fullScreenOnLongPress
                        style={styles.image}
                        onLoad={() => {
                            this.setState({ ready: true });
                        }}
                    />
                    {this.state.ready ? null : (
                        <Image
                            source={images.play_button}
                            resizeMode={'contain'}
                            style={[
                                styles.image,
                                {
                                    position: 'absolute',
                                    width: '50%',
                                    height: '50%'
                                }
                            ]}
                        />
                    )}
                </TouchableOpacity>
            </View>
        );
    }
}
