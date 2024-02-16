// We are going to make lodash availalbe on the platform for making bot writing easier
import Lodash from 'lodash';
import moment from 'moment';
import AWSSignature from 'react-native-aws-signature';
import ShortUUID from 'short-uuid';
import config from '../../config/config';
import { Auth } from '.';
import UtilsService from '../../apiV2/UtilsService';
import FileService from '../../apiV2/FileService';

const createAuthHeader = function (
    host,
    method,
    path,
    service,
    body = '',
    user
) {
    const EMPTY_HASHED_PAYLOAD =
        'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
    const options = {
        path,
        method,
        service,
        headers: {
            'X-Amz-Date': getAmzDate(new Date().toISOString()),
            host,
            'X-Amz-Security-Token': user.creds.sessionId
        },
        region: config.aws.region,
        body: JSON.stringify(body),
        credentials: {
            SecretKey: '',
            AccessKeyId: ''
        }
    };
    // The conteny-type header will be ignored if body is empty - so add it only if body is not empty
    if (body) {
        options.headers['Content-Type'] = 'application/json';
    }
    if (service === 's3') {
        options.headers['X-Amz-Content-Sha256'] = EMPTY_HASHED_PAYLOAD;
    }
    const awsSignature = new AWSSignature();
    awsSignature.setParams(options);
    const authorization = awsSignature.getAuthorizationHeader();
    options.headers.authorization = authorization.Authorization;
    return options.headers;
};

const getAmzDate = function (dateStr) {
    const chars = [':', '-'];
    for (let i = 0; i < chars.length; i++) {
        while (dateStr.indexOf(chars[i]) !== -1) {
            dateStr = dateStr.replace(chars[i], '');
        }
    }
    dateStr = `${dateStr.split('.')[0]}Z`;
    return dateStr;
};

export function UUID() {
    const uuid = ShortUUID.uuid();
    return ShortUUID().fromUUID(uuid);
}

/**
 * prams should contain type and entry, optional - more,data
 * userEmail, userId, timestamp will be added to entry in this function
 * entry cas have - botId,client,conversationId,errorCode,intent,location,level,message,userDomain
 */
function addLogEntry(params) {
    // return;
    // console.log(
    //     '========>>>>> addLogEntry request to send log with 1:',
    //     params.entry.message
    // );
    try {
        const user = Auth.getUserData();
        if (user) {
            Object.keys(params.entry).forEach((field) => {
                if (params.entry[field]) {
                    params.entry[field] =
                        field === 'timeStamp'
                            ? params.entry[field]
                            : params.entry[field].toString();
                } else {
                    delete params.entry[field];
                }
            });
            if (!params.entry.userEmail) {
                params.entry.userEmail = user.info.emailAddress;
            }
            if (!params.entry.userId) {
                params.entry.userId = user.userId;
            }
            if (
                !params.entry.timestamp ||
                typeof params.entry.timestamp !== 'number'
            ) {
                params.entry.timestamp = Date.now();
            }
            if (!params.entry.entity) {
                params.entry.entity = 'MobileApp';
            }
            if (typeof params.data !== 'string') {
                params.data = JSON.stringify(params.data);
            }
            UtilsService.addLogEntry(params)
                .then((res) => {
                    console.log('Log result', res);
                })
                .catch((e) => {
                    console.log('log error', e);
                });
        }
    } catch (error) {
        console.log('+++ bot log cannot be sent ', error);
    }
}

function addBotLogs(botList, message) {
    try {
        console.log('(((((((( add bot logs:', message, botList);
        addLogEntry({
            type: 'SYSTEM',
            entry: {
                level: 'LOG',
                message
            },
            data: JSON.stringify({ BOT_LOGS: botList })
        });
    } catch (error) {
        console.log('+++ bot log cannot be sent ', error);
    }
}

function uploadFile(sessionId, fileName, conversationId, filePath, scope) {
    return FileService.uploadFile(fileName, conversationId, filePath, scope);
}
function uploadProfilePic(
    fileName,
    filePath,
    conversationId,
    scope,
    generateThumbnail
) {
    return FileService.uploadFileForThumbnail(
        fileName,
        filePath,
        conversationId,
        scope,
        generateThumbnail
    );
}
function uploadGroupImg(chennalId, filePath, fileName, generateThumbnail) {
    return FileService.uploadGroupImageForThumbnailAlso(
        chennalId,
        filePath,
        fileName,
        generateThumbnail
    );
}

export default {
    Lodash,
    UUID,
    moment,
    createAuthHeader,
    addLogEntry,
    addBotLogs,
    uploadFile,
    uploadGroupImg,
    uploadProfilePic
};
