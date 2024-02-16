import React from 'react';
import { TouchableOpacity, Platform, Alert, View } from 'react-native';
import RNFetchBlob from 'react-native-blob-util';
import RNFS from 'react-native-fs';
import mime from 'react-native-mime-types';
import Constants from '../../../../config/constants';
import { AssetFetcher } from '../../../../lib/dce';
import { Auth, Utils } from '../../../../lib/capability';
import FileViewer from 'react-native-file-viewer';
import configToUse from '../../../../config/config';
import utils from '../../../../lib/utils';
import { getScopeId } from '../../../../lib/utils/FileUtils';
import { Toast } from 'react-native-toast-message/lib/src/Toast';

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
export default class FileViewWrapper extends React.Component {
    constructor(props) {
        super(props);
        this.fileName = this.props?.source.fileName;
        this.MIMEType = this.props.source.MIMEType
            ? this.props.source.MIMEType
            : mime.contentType(this.fileName);
        this.localPath = decodeURI(
            `${Constants.OTHER_FILE_DIRECTORY}/${this.fileName}`
        );
        RNFS.mkdir(Constants.OTHER_FILE_DIRECTORY);
        this.state = {
            status: FileState.REMOTE
        };
    }

    componentDidUpdate(prevProp) {
        if (prevProp.source?.fileName !== this.props?.source?.fileName) {
            this.fileName = this.props?.source.fileName;
            this.localPath = decodeURI(
                `${Constants.OTHER_FILE_DIRECTORY}/${this.fileName}`
            );
            AssetFetcher.existsOnDevice(this.localPath).then((exist) => {
                if (exist) {
                    this.setState({ status: FileState.SAVED });
                } else {
                    this.downloadFile();
                }
            });
        }
    }

    async componentDidMount() {
        AssetFetcher.existsOnDevice(this.localPath).then((exist) => {
            if (exist) {
                this.setState({ status: FileState.SAVED });
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

                console.log('FILE: downloading file', url, headers);
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
                this.setState({ status: FileState.SAVED });
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
                console.log('FILE: ERROR while downloading the file', e);
                this.setState({ status: FileState.REMOTE });
                AssetFetcher.deleteFile(this.localPath);
            });
    }

    async openFile() {
        AssetFetcher.existsOnDevice(this.localPath)
            .then((exists) => {
                if (exists) {
                    if (Platform.OS === 'android') {
                        const path = FileViewer.open(this.localPath.slice(7)) // absolute-path-to-my-local-file.
                            .then((res) => {
                                console.log('~~~ FILE: file opened', res);
                            })
                            .catch((error) => {
                                console.log(
                                    '~~~ FILE: ERROR while opening the file1',
                                    error
                                );
                                Toast.show({
                                    text1: error.message
                                });
                            });
                    } else if (Platform.OS === 'ios') {
                        FileViewer.open(this.localPath)
                            .then((res) => {
                                console.log('~~~ FILE: file opened', res);
                            })
                            .catch((error) => {
                                console.log(
                                    '~~~ FILE: ERROR while opening the file1',
                                    error
                                );
                                Toast.show({
                                    text1: error.message
                                });
                            });
                    }
                } else {
                    Toast.show({ text1: 'File not available' });
                    this.setState({ status: FileState.REMOTE });
                }
            })
            .catch((e) => {
                const params = {
                    entry: {
                        level: 'LOG',
                        message: 'FILE open failure'
                    },
                    type: 'SYSTEM',
                    more: JSON.stringify(e)
                };
                Utils.addLogEntry(params);
                console.log('FILE: ERROR while opening the file2', e);
            });
    }

    onTap = async () => {
        if (this.state.status === FileState.REMOTE) {
            this.setState({ status: FileState.DOWNLOADING });
            await this.downloadFile();
        } else if (this.state.status === FileState.SAVED) {
            this.openFile();
        }
    };

    render() {
        return (
            <View style={{ flex: 1 }}>
                {this.props.fileView(
                    this.state.status,
                    {
                        extention: mime.extension(this.MIMEType),
                        name: this.props.source.displayName
                    },
                    this.onTap
                )}
            </View>
        );
    }
}
