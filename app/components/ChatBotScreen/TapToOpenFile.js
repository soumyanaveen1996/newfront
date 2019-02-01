import React from 'react';
import {
    Text,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    Platform,
    View
} from 'react-native';
import styles from './styles';
import I18n from '../../config/i18n/i18n';
import ImageCache from '../../lib/image_cache';
import Icons from '../../config/icons';
import Constants from '../../config/constants';
import { AssetFetcher } from '../../lib/dce';
import RNFetchBlob from 'rn-fetch-blob';

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
            Constants.OTHER_FILE_DIRECTORY + '/' + fileName
        );
        RNFS.mkdir(Constants.OTHER_FILE_DIRECTORY);
        this.state = {
            status: FileState.REMOTE
        };
    }

    async componentDidMount() {
        const exists = await AssetFetcher.existsOnDevice(this.localPath);
        if (exists) {
            this.setState({ status: FileState.SAVED });
        }
    }

    downloadFile() {
        AssetFetcher.existsOnDevice(this.localPath)
            .then(exist => {
                if (!exist) {
                    AssetFetcher.downloadFile(
                        this.localPath,
                        this.uri,
                        this.headers,
                        true,
                        false
                    );
                }
                return;
            })
            .then(() => {
                this.setState({ status: FileState.SAVED });
            })
            .catch(e => {
                console.log('ERROR while downloading the file', e);
                this.setState({ status: FileState.REMOTE });
                AssetFetcher.deleteFile(this.localPath);
            });
    }

    openFile() {
        AssetFetcher.existsOnDevice(this.localPath).then(exists => {
            if (exists) {
                if (Platform.OS === 'android') {
                    RNFetchBlob.android.actionViewIntent(
                        this.localPath,
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

    onTap() {
        if (this.state.status === FileState.REMOTE) {
            this.setState({ status: FileState.DOWNLOADING });
            this.downloadFile();
        } else if (this.state.status === FileState.SAVED) {
            this.openFile();
        }
    }

    render() {
        <TouchableOpacity
            onPress={this.onTap.bind(this)}
            disabled={this.state.status === FileState.DOWNLOADING}
        >
            {Icons.fileIcon()}
            <Text>{this.type}</Text>
            <View>
                {this.state.status === FileState.REMOTE
                    ? Icons.downloadFile()
                    : null}
            </View>
        </TouchableOpacity>;
    }
}
