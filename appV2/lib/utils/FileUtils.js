import RNFetchBlob from 'react-native-blob-util';
import utils from '.';
import config from '../../config/config';
import constants from '../../config/constants';
import Store from '../../redux/store/configureStore';
import { Auth } from '../capability';
import { AssetFetcher } from '../dce';
import FileViewer from 'react-native-file-viewer';
import { Platform } from 'react-native';
import RNFS from 'react-native-fs';
import { Toast } from 'react-native-toast-message/lib/src/Toast';

const getImageUrlForBot = (fileName, scope) => {
    return new Promise((resolve, reject) => {
        const {
            proxy: { protocol, resource_host }
        } = config;
        const localPath = decodeURI(
            `${constants.OTHER_FILE_DIRECTORY}/${fileName}`
        );
        const directURL = `${config.proxy.protocol}${
            config.proxy.resource_host
        }${config.proxy.downloadFilePath}/${scope}/${getScopeId(
            scope
        )}/${fileName}`;
        const user = Auth.getUserData();
        if (user) {
            const headers = {
                sessionId: user.creds.sessionId,
                ContentType: 'image/jpeg'
            };

            const url = `${protocol}${resource_host}/downloadwithsignedurl/${scope}/${getScopeId(
                scope
            )}/${fileName}`;
            console.log('MAP: image signedUrl for ' + url);
            fetch(url, {
                method: 'GET',
                headers
            })
                .then((response) => {
                    console.log('MAP: image signedUrl response ', response);
                    response.json().then((parsedRes) => {
                        const {
                            signedUrl,
                            headers: { ContentType }
                        } = parsedRes;
                        console.log('MAP: image signedUrl is => ' + signedUrl);
                        resolve(signedUrl);
                    });
                })
                .catch((err) => {
                    console.log('MAP: image error', err);
                });
        }
    });
};

const getFileUrlForBot = (fileName, scope) => {
    return new Promise((resolve, reject) => {
        const {
            proxy: { protocol, resource_host }
        } = config;
        const user = Auth.getUserData();
        if (user) {
            const headers = {
                sessionId: user.creds.sessionId
            };

            const url = `${protocol}${resource_host}/downloadwithsignedurl/${scope}/${getScopeId(
                scope
            )}/${fileName}`;
            console.log('getFileUrlForBot: image signedUrl for ' + url);
            fetch(url, {
                method: 'GET',
                headers
            })
                .then((response) => {
                    console.log('~~~~ image signedUrl response ', response);
                    if (response.status === 404) {
                        resolve(null);
                    } else {
                        response
                            .json()
                            .then((parsedRes) => {
                                const {
                                    signedUrl,
                                    headers: { ContentType }
                                } = parsedRes;
                                console.log(
                                    'getFileUrlForBot: image signedUrl is => ' +
                                        signedUrl
                                );
                                resolve(signedUrl);
                            })
                            .catch((error) => {
                                console.log(
                                    'getFileUrlForBot: image error',
                                    err
                                );
                                resolve(null);
                            });
                    }
                })
                .catch((err) => {
                    console.log('getFileUrlForBot: image error', err);
                    resolve(null);
                });
        }
    });
};

/**
 * Downloads file using sigend URL
 * @param {String} fileName
 * @param {String} localPath
 * @param {String} scope
 * @returns Promise
 */
const downLoadBotFile = (fileName, localPath, scope) => {
    console.log('FILE: downLoadBotFile start', fileName);
    return new Promise(async (resolve, reject) => {
        const url = await getFileUrlForBot(fileName, scope);
        if (url) {
            RNFS.mkdir(constants.OTHER_FILE_DIRECTORY);

            const headers =
                utils.s3DownloadHeaders(url, Auth.getUserData()) || undefined;
            AssetFetcher.existsOnDevice(localPath)
                .then(async (exist) => {
                    console.log('FILE: downloading file', url, headers);
                    return AssetFetcher.downloadFile(
                        localPath,
                        url,
                        headers,
                        true,
                        false
                    );
                })
                .then((res) => {
                    resolve(res);
                })
                .catch((e) => {
                    AssetFetcher.deleteFile(localPath);
                    reject(e);
                });
        } else reject(new Error('File not found!'));
    });
};

const openBotFile = async (localPath) => {
    AssetFetcher.existsOnDevice(localPath)
        .then((exists) => {
            if (exists) {
                if (Platform.OS === 'android') {
                    const path = FileViewer.open(localPath.slice(7)) // absolute-path-to-my-local-file.
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
                    FileViewer.open(localPath)
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
            }
        })
        .catch((e) => {
            Toast.show({ text1: 'Could not open file' });
            console.log('FILE: ERROR while opening the file2', e);
        });
};

const getScopeId = (scope) => {
    switch (scope) {
        case 'bot': {
            return Store.getState()?.bots?.id;
        }

        case 'domain': {
            return Store.getState().bots?.domain;
        }

        case 'conversation':
        default: {
            return Store.getState().user?.currentConversationId;
        }
    }
};

export { downLoadBotFile, openBotFile, getScopeId };
