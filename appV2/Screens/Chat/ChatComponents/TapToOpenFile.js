import React from 'react';
import {
    Text,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    Platform,
    View,
    PermissionsAndroid,
    Dimensions
} from 'react-native';
import { Icon } from '@rneui/themed';
import Images from '../../../config/images';
import { createThumbnail } from 'react-native-create-thumbnail';
import RNFetchBlob from 'react-native-blob-util';
import RNFS from 'react-native-fs';
import mime from 'react-native-mime-types';
import styles from './styles';
import Icons from '../../../config/icons';
import Constants from '../../../config/constants';
import { AssetFetcher } from '../../../lib/dce';
import GlobalColors from '../../../config/styles';
import { Utils } from '../../../lib/capability';
import FileViewer from 'react-native-file-viewer';
import images from '../../../images';
import { Toast } from 'react-native-toast-message/lib/src/Toast';

const FileState = {
    REMOTE: 'remote',
    DOWNLOADING: 'downloading',
    SAVED: 'saved'
};
//TODO: review for optimization
export default class TapToOpenFile extends React.PureComponent {
    constructor(props) {
        super(props);
        this.url = this.props.source.url;
        this.headers = this.props.source.headers;
        this.fileName = this.url.split('/').pop();
        this.MIMEType = this.props.source.MIMEType
            ? this.props.source.MIMEType
            : mime.contentType(this.fileName);
        this.localPath = decodeURI(
            `${Constants.OTHER_FILE_DIRECTORY}/${this.fileName}`
        );
        this.checkDir = decodeURI(`${Constants.OTHER_FILE_DIRECTORY}`);
        AssetFetcher.existsOnDevice(this.checkDir).then((exist) => {
            if (exist) {
                // no need to create directory
            } else {
                RNFS.mkdir(Constants.OTHER_FILE_DIRECTORY);
            }
        });
        this.state = {
            status: FileState.REMOTE,
            videoThumbanailData: false
        };
    }

    componentDidUpdate(prevProp) {
        if (prevProp?.source?.url !== this.props?.source?.url) {
            this.url = this.props?.source.url;
            this.headers = this.props.source.headers;
            this.fileName = this.url.split('/').pop();
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
                if (this.props.isVideoFile) this.renderFileExtensionForVideo();
            }
        });
    }

    async downloadFile() {
        this.setState({ status: FileState.DOWNLOADING });
        AssetFetcher.existsOnDevice(this.localPath)
            .then(async (exist) => {
                const url = this.props.source.url;
                console.log('FILE: downloading file', url, this.headers);
                const response = await fetch(url, {
                    method: 'GET',
                    headers: this.headers
                }).then((res) => {
                    return res.json();
                });
                if (this.props.isVideoFile) {
                    await createThumbnail({
                        url: response.signedUrl,
                        headers: this.headers,
                        timeStamp: 2
                    })
                        .then((response) => {
                            console.log('this thumbnail data ', { response });
                            this.setState({
                                videoThumbanailData: response.path
                            });
                        })
                        .catch((err) =>
                            console.log('EEROR IN CREATETHUMBNAIL', { err })
                        );
                }
                if (!exist) {
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
                        message: 'FILE download failure'
                    },
                    type: 'SYSTEM',
                    more: JSON.stringify(e)
                };
                Utils.addLogEntry(params);
                console.log('FILE: ERROR while downloading the file', e);
                this.setState({
                    status: FileState.REMOTE,
                    videoThumbanailData: false
                });
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
            <View style={styles.fileCard}>
                <ActivityIndicator
                    size="small"
                    color={GlobalColors.primaryButtonColor}
                />
            </View>
        );
    }
    renderActivityIndicatorFile() {
        return (
            <View style={{ height: 20, width: 20 }}>
                <ActivityIndicator
                    size="small"
                    color={GlobalColors.primaryButtonColor}
                />
            </View>
        );
    }

    renderFileExtension() {
        let ext = mime.extension(this.MIMEType);
        ext = ext || this.MIMEType;
        return <Text style={styles.fileType}>{ext}</Text>;
    }

    renderFileTypeImage = () => {
        let ext = mime.extension(this.MIMEType);
        ext = ext || this.MIMEType;
        console.log('the ext-------', ext);
        if (ext == 'doc')
            return (
                <View style={styles.filetypeImageContainer}>
                    <Image
                        source={images.doc_File_Img}
                        style={styles.fileTypeImage}
                    />
                </View>
            );
        if (ext == 'pdf')
            return (
                <View style={styles.filetypeImageContainer}>
                    <Image
                        source={images.pdf_File_Img}
                        style={styles.fileTypeImage}
                    />
                </View>
            );
        if (ext == 'xls')
            return (
                <View style={styles.filetypeImageContainer}>
                    <Image
                        source={images.xls_File_Img}
                        style={styles.fileTypeImage}
                    />
                </View>
            );
        return (
            <View style={styles.filetypeImageContainer}>
                {Icons.fileIconSmall({ size: 30 })}
            </View>
        );
    };

    renderDownloadIcon(isFileStyle = false) {
        return (
            <View>
                <Icon
                    name="download-circle"
                    type={'material-community'}
                    size={40}
                    color={GlobalColors.primaryColor}
                    underlayColor={GlobalColors.white}
                    containerStyle={styles.downloadIcon}
                />
            </View>
        );
    }

    renderSmallCard() {
        if (this.state.status === FileState.REMOTE) {
            return this.renderDownloadIcon();
        }
        if (this.state.status === FileState.DOWNLOADING) {
            return this.renderActivityIndicator();
        }
        if (this.state.status === FileState.SAVED) {
            return this.renderFileExtension();
        }
        if (this.state.status === FileState.SAVED) {
        }
    }

    renderFileExtensionForVideo() {
        createThumbnail({
            url: this.localPath,
            timeStamp: 2
        })
            .then((response) => {
                console.log('this thumbnail data ', { response });
                this.setState({
                    videoThumbanailData: response.path,
                    status: FileState.SAVED
                });
            })
            .catch((err) => console.log('EEROR IN CREATETHUMBNAIL', { err }));
    }

    render() {
        if (this.props.alignRight) {
            return (
                <TouchableOpacity
                    onPress={this.onTap.bind(this)}
                    disabled={this.state.status === FileState.DOWNLOADING}
                    style={styles.fileCard}
                >
                    {/* {this.renderSmallCard()} */}
                    {this.state.status === FileState.DOWNLOADING
                        ? this.renderActivityIndicator()
                        : Icons.fileIconSmall()}
                    {this.state.status === FileState.SAVED
                        ? this.renderFileExtension()
                        : null}
                    {this.state.status === FileState.REMOTE
                        ? this.renderDownloadIcon()
                        : null}
                </TouchableOpacity>
            );
        }
        return (
            <>
                {this.props.isVideoFile ? (
                    <View>
                        {this.state.videoThumbanailData &&
                        this.state.status === FileState.SAVED ? (
                            <TouchableOpacity
                                onPress={this.onTap.bind(this)}
                                style={styles.videoThumbnailContainer}
                            >
                                <Image
                                    source={{
                                        uri: this.state.videoThumbanailData
                                    }}
                                    style={[
                                        styles.videoThumbnailImage,
                                        {
                                            borderRadius: 6
                                        }
                                    ]}
                                />
                                <View style={styles.playButtonContainer}>
                                    <Icon
                                        name="play-circle"
                                        type="ionicon"
                                        size={48}
                                        color={GlobalColors.textRippleColor}
                                    />
                                </View>
                            </TouchableOpacity>
                        ) : (
                            <>
                                <View style={styles.videoThumbnailContainer}>
                                    <Image
                                        source={Images.videoThumbnailImage}
                                        // style={styles.videoThumbnailImage}
                                        style={[styles.videoThumbnailImage]}
                                        resizeMode={'contain'}
                                    />
                                    <View
                                        style={{
                                            position: 'absolute',
                                            alignSelf: 'center'
                                        }}
                                    >
                                        <TouchableOpacity
                                            onPress={this.onTap.bind(this)}
                                            disabled={
                                                this.state.status ===
                                                FileState.DOWNLOADING
                                            }
                                        >
                                            {this.state.status ===
                                            FileState.DOWNLOADING
                                                ? this.renderActivityIndicator()
                                                : null}
                                            {this.state.status ===
                                            FileState.REMOTE ? (
                                                <View>
                                                    <View
                                                        style={
                                                            styles.downloadView
                                                        }
                                                    >
                                                        <Icon
                                                            name="file-download"
                                                            type={'material'}
                                                            size={18}
                                                            color={
                                                                GlobalColors.white
                                                            }
                                                        />
                                                        <Text
                                                            style={
                                                                styles.downloadtext
                                                            }
                                                        >
                                                            Download
                                                        </Text>
                                                    </View>
                                                </View>
                                            ) : null}
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </>
                        )}
                    </View>
                ) : (
                    <TouchableOpacity
                        onPress={this.onTap.bind(this)}
                        disabled={this.state.status === FileState.DOWNLOADING}
                        style={styles.fileContainerButton}
                    >
                        <View>{this.renderFileTypeImage()}</View>
                        <View style={styles.filecontainerview}>
                            <View style={styles.fileContainer2}>
                                <Text
                                    style={[{ maxWidth: 140 }, styles.fileType]}
                                    overflow="hidden"
                                    numberOfLines={1}
                                    ellipsizeMode="tail"
                                >
                                    {this.props?.source?.name
                                        .charAt(0)
                                        .toUpperCase() +
                                        this.props?.source?.name
                                            .slice(1)
                                            .toLowerCase()}
                                </Text>
                                {this.props.source?.name?.length > 20
                                    ? this.renderFileExtension()
                                    : null}
                            </View>
                            <View>
                                {this.state.status === FileState.REMOTE ? (
                                    <Icon
                                        name="file-download"
                                        type={'material'}
                                        size={22}
                                        color={GlobalColors.primaryColor}
                                    />
                                ) : this.state.status ===
                                  FileState.DOWNLOADING ? (
                                    this.renderActivityIndicatorFile()
                                ) : (
                                    <View />
                                )}
                            </View>
                        </View>
                    </TouchableOpacity>
                )}
            </>
        );
    }
}
