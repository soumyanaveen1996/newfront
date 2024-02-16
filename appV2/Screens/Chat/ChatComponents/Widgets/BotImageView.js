import React from 'react';
import { TouchableOpacity, Platform, Alert, View, Image } from 'react-native';
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
import images from '../../../../images';

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
export default class BotImageView extends React.Component {
    constructor(props) {
        super(props);
        this.fileName = this.props?.source.fileName;
        this.MIMEType = this.props.source.MIMEType
            ? this.props.source.MIMEType
            : mime.contentType(this.fileName);
        this.localPath = decodeURI(
            `${Constants.IMAGES_DIRECTORY}/${this.fileName}`
        );
        RNFS.mkdir(Constants.IMAGES_DIRECTORY);
        this.state = {
            status: FileState.REMOTE,
            source: images.imageTumbnail
        };
    }

    componentDidUpdate(prevProp) {
        if (prevProp.source?.fileName !== this.props?.source?.fileName) {
            this.fileName = this.props?.source.fileName;
            this.localPath = decodeURI(
                `${Constants.IMAGES_DIRECTORY}/${this.fileName}`
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

    // please fix this for ios images.imageTumbnail gives error for 3x it comes in point i just make change to run atleast without crash

    render() {
        return (
            <View>
                {this.state.status === FileState.SAVED && (
                    <Image
                        onError={(e) => {
                            console.log('Image load error:', e);
                        }}
                        style={
                            this.props.style
                                ? this.props.style
                                : {
                                      flex: 1,
                                      height: undefined,
                                      aspectRatio: this.props.aspectRatio
                                          ? this.props.aspectRatio
                                          : undefined,
                                      width: '100%'
                                  }
                        }
                        source={this.state.source}
                        resizeMode={
                            this.props.resizeMode
                                ? this.props.resizeMode
                                : 'cover'
                        }
                    />
                )}
                {this.state.status === FileState.DOWNLOADING ||
                    (this.state.status === FileState.REMOTE && (
                        <Image
                            onError={(e) => {
                                console.log('Image load error:', e);
                            }}
                            style={{
                                flex: 1,
                                height: 200,
                                width: '100%'
                            }}
                            source={images.imageTumbnail}
                        />
                    ))}
            </View>
        );
    }
}
