import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import RNFS from 'react-native-fs';
import mime from 'react-native-mime-types';
import Constants from '../../../../config/constants';
import { AssetFetcher } from '../../../../lib/dce';
import { Auth, Utils } from '../../../../lib/capability';
import configToUse from '../../../../config/config';
import utils from '../../../../lib/utils';
import { getScopeId } from '../../../../lib/utils/FileUtils';
import images from '../../../../images';
import VideoPlayer from 'react-native-video-player';
import GlobalColors from '../../../../config/styles';
import { Icon } from '@rneui/themed';

export const FileState = {
    REMOTE: 'remote',
    DOWNLOADING: 'downloading',
    SAVED: 'saved'
};
//TODO: review for optimization

/**
 * @param {Object} source Details of the file source
 * @param {function} fileView render funtion to display view, provides status, fileinfo, callback to initiate download/view.
 */
export default class BotVideoView extends React.Component {
    constructor(props) {
        super(props);
        this.fileName = this.props?.source.fileName;
        this.MIMEType = this.props.source.MIMEType
            ? this.props.source.MIMEType
            : mime.contentType(this.fileName);
        this.localPath = decodeURI(
            `${Constants.VIDEO_DIRECTORY}/${this.fileName}`
        );
        RNFS.mkdir(Constants.VIDEO_DIRECTORY);
        this.state = {
            status: FileState.REMOTE,
            source: images.imageTumbnail
        };
    }

    componentDidUpdate(prevProp) {
        if (prevProp.source?.fileName !== this.props?.source?.fileName) {
            this.fileName = this.props?.source.fileName;
            this.localPath = decodeURI(
                `${Constants.VIDEO_DIRECTORY}/${this.fileName}`
            );
            AssetFetcher.existsOnDevice(this.localPath).then((exist) => {
                if (exist) {
                    this.setState({
                        status: FileState.SAVED,
                        source: { uri: this.localPath }
                    });
                } else {
                    this.downloadFile();
                }
            });
        }
    }

    async componentDidMount() {
        AssetFetcher.existsOnDevice(this.localPath).then((exist) => {
            if (exist) {
                console.log('IMAGE_VIEW: image exisits', this.localPath);
                this.setState({
                    status: FileState.SAVED,
                    source: { uri: this.localPath }
                });
            } else {
                this.downloadFile();
            }
        });
    }

    async downloadFile() {
        this.setState({ status: FileState.DOWNLOADING });
        AssetFetcher.existsOnDevice(this.localPath)
            .then(async (exist) => {
                const url = `${configToUse.proxy.protocol}${
                    configToUse.proxy.resource_host
                }/downloadwithsignedurl/${
                    this.props?.source.scope
                }/${getScopeId(this.props?.source.scope)}/${
                    this.props?.source.fileName
                }`;
                const headers =
                    utils.s3DownloadHeaders(url, Auth.getUserData()) ||
                    undefined;

                console.log('IMAGE_VIEW: FILE: downloading file', url, headers);
                const response = await fetch(url, {
                    method: 'GET',
                    headers: headers
                }).then((res) => {
                    return res.json();
                });
                return AssetFetcher.downloadFile(
                    this.localPath,
                    response.signedUrl,
                    headers,
                    true,
                    false
                );
            })
            .then((res) => {
                this.setState({
                    status: FileState.SAVED,
                    source: { uri: this.localPath }
                });
            })
            .catch((e) => {
                const params = {
                    entry: {
                        level: 'LOG',
                        message: 'FILE download failure'
                    },
                    type: 'SYSTEM',
                    more: JSON.stringify(e)
                };
                Utils.addLogEntry(params);
                console.log(
                    'IMAGE_VIEW: FILE: ERROR while downloading the file',
                    e
                );
                this.setState({ status: FileState.REMOTE });
                AssetFetcher.deleteFile(this.localPath);
            });
    }

    render() {
        return (
            <View style={{}}>
                {this.state.status === FileState.SAVED && (
                    <VideoPlayer
                        disableFullscreen={true}
                        showDuration={true}
                        video={this.state.source}
                        thumbnail={this.state.source}
                    />
                )}
                {this.state.status === FileState.DOWNLOADING && (
                    <ActivityIndicator
                        style={styles.activityIndicatorContainer}
                        size={'large'}
                    />
                )}
                {this.state.status === FileState.REMOTE && (
                    <Icon
                        name="save-alt"
                        type="material"
                        size={30}
                        color={GlobalColors.white}
                        containerStyle={styles.activityIndicatorContainer}
                    />
                )}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    activityIndicatorContainer: {
        flex: 1,
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        backgroundColor: GlobalColors.textDarkGrey
    }
});
