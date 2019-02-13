import React from 'react';
import {
    Text,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    Platform,
    View,
    PermissionsAndroid
} from 'react-native';
import styles from './styles';
import I18n from '../../config/i18n/i18n';
import ImageCache from '../../lib/image_cache';
import Icons from '../../config/icons';
import Constants from '../../config/constants';
import { AssetFetcher } from '../../lib/dce';
import RNFetchBlob from 'rn-fetch-blob';
import RNFS from 'react-native-fs';
import GlobalColors from '../../config/styles';

const FileState = {
    REMOTE: 'remote',
    DOWNLOADING: 'downloading',
    SAVED: 'saved'
};

export default class TapToOpenFile extends React.Component {
    constructor(props) {
        super(props);
        this.uri = this.props.source.uri;
        this.type = this.props.source.type;
        this.headers = this.props.source.headers;
        this.fileName = this.uri.split('/').pop();
        this.localPath = decodeURI(
            Constants.OTHER_FILE_DIRECTORY + '/' + this.fileName
        );
        RNFS.mkdir(Constants.OTHER_FILE_DIRECTORY);
        this.state = {
            status: FileState.REMOTE
        };
    }

    async componentDidMount() {
        AssetFetcher.existsOnDevice(this.localPath).then(exist => {
            if (exist) {
                this.setState({ status: FileState.SAVED });
            }
        });
    }

    async downloadFile() {
        AssetFetcher.existsOnDevice(this.localPath)
            .then(exist => {
                if (!exist) {
                    return AssetFetcher.downloadFile(
                        this.localPath,
                        this.uri,
                        this.headers,
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

    async openFile() {
        AssetFetcher.existsOnDevice(this.localPath).then(exists => {
            if (exists) {
                if (Platform.OS === 'android') {
                    RNFetchBlob.android.actionViewIntent(
                        this.localPath.slice(7),
                        this.type
                    );
                } else if (Platform.OS === 'ios') {
                    RNFetchBlob.ios.openDocument(this.localPath);
                }
            } else {
                this.setState({ status: FileState.REMOTE });
            }
        });
    }

    async onTap() {
        if (this.state.status === FileState.REMOTE) {
            this.setState({ status: FileState.DOWNLOADING });
            await this.downloadFile();
        } else if (this.state.status === FileState.SAVED) {
            this.openFile();
        }
    }

    renderActivityIndicator() {
        return (
            <ActivityIndicator size="small" color={GlobalColors.sideButtons} />
        );
    }

    renderFileExtension() {
        return <Text style={styles.fileType}>{this.type.split('/')[1]}</Text>;
    }

    renderDownloadIcon() {
        return (
            <View
                style={
                    this.props.alignRight
                        ? styles.downloadIconRight
                        : styles.downloadIcon
                }
            >
                {Icons.downloadFile()}
            </View>
        );
    }

    renderSmallCard() {
        if (this.state.status === FileState.REMOTE) {
            return this.renderDownloadIcon();
        } else if (this.state.status === FileState.DOWNLOADING) {
            return this.renderActivityIndicator();
        } else if (this.state.status === FileState.SAVED) {
            return Icons.fileIconSmall();
        }
    }

    render() {
        if (this.props.alignRight) {
            return (
                <TouchableOpacity
                    onPress={this.onTap.bind(this)}
                    disabled={this.state.status === FileState.DOWNLOADING}
                    style={styles.fileCardSmall}
                >
                    {this.renderSmallCard()}
                </TouchableOpacity>
            );
        } else {
            return (
                <TouchableOpacity
                    onPress={this.onTap.bind(this)}
                    disabled={this.state.status === FileState.DOWNLOADING}
                    style={styles.fileCard}
                >
                    {this.state.status === FileState.DOWNLOADING
                        ? this.renderActivityIndicator()
                        : Icons.fileIcon()}
                    {this.state.status === FileState.DOWNLOADING
                        ? null
                        : this.renderFileExtension()}
                    {this.state.status === FileState.REMOTE
                        ? this.renderDownloadIcon()
                        : null}
                </TouchableOpacity>
            );
        }
    }
}
