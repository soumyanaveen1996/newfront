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
import RNFetchBlob from 'rn-fetch-blob';
import RNFS from 'react-native-fs';
import GlobalColors from '../../config/styles';
import mime from 'react-native-mime-types';
import { Actions } from 'react-native-router-flux';
import utils from '../../lib/utils';
import { Auth } from '../../lib/capability';
import config from '../../config/config';
import styles from './styles';

const FileState = {
    REMOTE: 'remote',
    DOWNLOADING: 'downloading',
    SAVED: 'saved'
};

export default class ImageMessage extends React.Component {
    constructor(props) {
        super(props);
        this.localPath = decodeURI(
            Constants.IMAGES_DIRECTORY + '/' + this.props.fileName
        );
        this.remoteUrl = `${config.proxy.protocol}${
            config.proxy.resource_host
        }${config.proxy.downloadFilePath}/${
            this.props.conversationContext.conversationId
        }/${this.props.fileName}`;
        this.state = {
            status: FileState.DOWNLOADING
        };
    }

    async componentDidMount() {
        AssetFetcher.existsOnDevice(this.localPath).then(exist => {
            if (exist) {
                this.setState({ status: FileState.SAVED });
            } else {
                this.downloadFile();
            }
        });
    }

    async downloadFile() {
        let user;
        Auth.getUser()
            .then(res => {
                user = res;
                return RNFS.mkdir(Constants.IMAGES_DIRECTORY);
            })
            .then(() => {
                return AssetFetcher.existsOnDevice(this.localPath);
            })
            .then(exist => {
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
            .then(res => {
                this.setState({ status: FileState.SAVED });
            })
            .catch(e => {
                console.log('ERROR while downloading the file', e);
                this.setState({ status: FileState.REMOTE });
                AssetFetcher.deleteFile(this.localPath);
            });
    }

    async onTap() {
        if (this.state.status === FileState.REMOTE) {
            this.setState({ status: FileState.DOWNLOADING });
            this.downloadFile();
        } else if (this.state.status === FileState.SAVED) {
            this.openImage();
        }
    }

    openImage(headers, uri) {
        AssetFetcher.existsOnDevice(this.localPath).then(exists => {
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
                    {this.state.status === FileState.DOWNLOADING ? (
                        <ActivityIndicator size="large" />
                    ) : this.state.status === FileState.SAVED ? (
                        <Image
                            source={{ uri: this.localPath }}
                            style={styles.image}
                        />
                    ) : (
                        <Text>Tap to download.</Text>
                    )}
                </TouchableOpacity>
            </View>
        );
    }
}
