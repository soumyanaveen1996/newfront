import React from 'react';
import { Text, Image, TouchableOpacity, Platform, View } from 'react-native';
import RNFetchBlob from 'react-native-blob-util';
import RNFS from 'react-native-fs';
import mime from 'react-native-mime-types';
import { Icon } from '@rneui/themed';
import { ActivityIndicator } from 'react-native-paper';
import GlobalColors from '../../../../config/styles';
import { AssetFetcher } from '../../../../lib/dce';
import { Utils } from '../../../../lib/capability';
import Constants from '../../../../config/constants';
import utils from '../../../../lib/utils';
import { Auth } from '../../../../lib/capability';
import config from '../../../../config/config';
import styles from './styles';
import Icons from '../../../../config/icons';
import NavigationAction from '../../../../navigation/NavigationAction';
import images from '../../../../images';

const FileState = {
    REMOTE: 'remote',
    DOWNLOADING: 'downloading',
    SAVED: 'saved'
};

export default class ImageMessage extends React.PureComponent {
    constructor(props) {
        super(props);
        this.url = this.props.source.url;
        this.headers = this.props.source.headers;
        this.fileName = this.url.split('/').pop();
        this.MIMEType = this.props.source.MIMEType
            ? this.props.source.MIMEType
            : mime.contentType(this.fileName);
        let checkPath = decodeURI(`${Constants.IMAGES_DIRECTORY}`);
        AssetFetcher.existsOnDevice(checkPath).then((exist) => {
            if (exist) {
                // no need to create directory
            } else {
                RNFS.mkdir(Constants.IMAGES_DIRECTORY);
            }
        });
        this.localPath = decodeURI(
            `${Constants.IMAGES_DIRECTORY}/${this.props.fileName}`
        );
        this.remoteUrl = `${config.proxy.protocol}${config.proxy.resource_host}${config.proxy.downloadFilePath}/${this.props.conversationContext.conversationId}/${this.props.fileName}`;
        this.state = {
            status: FileState.REMOTE
        };
    }

    async componentDidMount() {
        AssetFetcher.existsOnDevice(this.localPath).then((exist) => {
            if (exist) {
                this.setState({ status: FileState.SAVED });
            } else {
                if (
                    this.props.message.getCreatedBy() === this.props.user.userId
                ) {
                    this.downloadFile();
                } else {
                    this.setState({ status: FileState.REMOTE });
                }
            }
        });
    }
    // componentDidUpdate(prevProp) {
    //     if (prevProp.fileName !== this.props?.fileName) {
    //         // this.url = this.props?.source.url;
    //         // this.headers = this.props.source.headers;
    //         // this.fileName = this.url.split('/').pop();
    //         this.localPath = decodeURI(
    //             `${Constants.IMAGES_DIRECTORY}/${this.fileName}`
    //         );
    //         AssetFetcher.existsOnDevice(this.localPath).then((exist) => {
    //             if (exist) {
    //                 this.setState({ status: FileState.SAVED });
    //             } else {
    //                 this.downloadFile();
    //             }
    //         });
    //     }
    // }

    async downloadFile() {
        // const user = Auth.getUserData();

        this.setState({ status: FileState.DOWNLOADING });
        AssetFetcher.existsOnDevice(this.localPath)
            .then(async (exist) => {
                if (!exist) {
                    const response = await fetch(this.url, {
                        method: 'GET',
                        headers: this.headers
                    }).then((res) => {
                        return res.json();
                    });
                    return AssetFetcher.downloadFile(
                        this.localPath,
                        response.signedUrl,
                        this.headers,
                        true,
                        false
                    );
                }
            })
            .then((res) => {
                this.setState({ status: FileState.SAVED });
            })
            .catch((e) => {
                const params = {
                    entry: {
                        level: 'LOG',
                        message: 'Image download failure'
                    },
                    type: 'SYSTEM',
                    more: JSON.stringify(e)
                };
                Utils.addLogEntry(params);
                console.log('Image: ERROR while downloading the file', e);
                this.setState({
                    status: FileState.REMOTE
                });
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
        AssetFetcher.existsOnDevice(this.localPath).then((exists) => {
            if (exists) {
                NavigationAction.push(NavigationAction.SCREENS.imageViewer, {
                    uri: this.localPath
                });
            } else {
                this.setState({ status: FileState.REMOTE });
            }
        });
    }

    render() {
        return (
            <View>
                <TouchableOpacity
                    style={[styles.message, { borderRadius: 6 }]}
                    disabled={this.state.status === FileState.DOWNLOADING}
                    onPress={this.onTap.bind(this)}
                >
                    {this.state.status === FileState.SAVED ? (
                        <Image
                            source={{ uri: this.localPath }}
                            style={[styles.image, { borderRadius: 6 }]}
                            resizeMode={'cover'}
                            // aspectRatio={3 / 2}
                        />
                    ) : (
                        this.props.message.getStatus() !== 0 && (
                            <View
                                style={[
                                    styles.message,
                                    {
                                        backgroundColor:
                                            GlobalColors.chatBackground,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        borderRadius: 6
                                    }
                                ]}
                            >
                                {this.state.status === FileState.DOWNLOADING ? (
                                    <ActivityIndicator
                                        size="large"
                                        animating
                                        color={GlobalColors.frontmLightBlue}
                                    />
                                ) : (
                                    <>
                                        <Image
                                            source={images.chatImgPlaceHolder}
                                            style={[
                                                styles.image,
                                                { borderRadius: 6 }
                                            ]}
                                            resizeMode={'cover'}
                                            // aspectRatio={3 / 2}
                                        />
                                        <View
                                            style={{
                                                position: 'absolute',
                                                alignSelf: 'center'
                                            }}
                                        >
                                            <View
                                                style={{
                                                    height: 34,
                                                    paddingHorizontal: 20,
                                                    backgroundColor:
                                                        'rgba(42,45,60,0.7)',
                                                    borderRadius: 40,
                                                    flexDirection: 'row',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                            >
                                                <Icon
                                                    name="file-download"
                                                    type={'material'}
                                                    size={18}
                                                    color={GlobalColors.white}
                                                />
                                                <Text
                                                    style={{
                                                        marginLeft: 10,
                                                        fontSize: 12,
                                                        color: '#fff',
                                                        textAlign: 'center',
                                                        marginTop: -2
                                                    }}
                                                >
                                                    Download
                                                </Text>
                                            </View>
                                        </View>
                                    </>
                                )}
                            </View>
                        )
                    )}

                    {this.props.user !== undefined &&
                        this.props.message.getCreatedBy() ===
                            this.props.user.userId &&
                        this.props.message.getStatus() === 0 && (
                            <ActivityIndicator
                                animating
                                color={GlobalColors.white}
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    backgroundColor: '#992a2d3c'
                                }}
                            />
                        )}
                </TouchableOpacity>
            </View>
        );
    }
}
