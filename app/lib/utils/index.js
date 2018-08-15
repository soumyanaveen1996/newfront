import moment from 'moment';
import PathParse from 'path-parse';
import config from '../../config/config.js';
import { Utils } from '../capability';
import _ from 'lodash';
import cmp from 'semver-compare';
import { AssetFetcher } from '../dce';
import RNFS from 'react-native-fs';
import {Platform, Dimensions, PermissionsAndroid} from 'react-native';
import VersionCheck from 'react-native-version-check';
import versionCompare from 'semver-compare';
import SystemBot from '../bot/SystemBot.js';
import { UUID } from '../capability/Utils.js';
import sha1 from 'sha1';

export function formattedDate(date) {
    if (!date) {
        return '';
    }
    let today = moment();
    if (moment(date).isSame(today, 'd')) {
        return moment(date).format('HH:mm A');
    } else if (moment(date).isSame(today, 'y')) {
        return moment(date).format('DD MMM [at] HH:mm A');
    } else {
        return moment(date).format('DD MMM YYYY [at] HH:mm A');
    }
}

export function botLogoUrl(logoUrl) {
    return `${config.bot.baseProtocol}${config.bot.baseUrl}/${config.bot.s3bucket}/botLogos/${logoUrl}`
}

export function channelLogoUrl(channelLogoName) {
    return `${config.bot.baseProtocol}${config.bot.baseUrl}/${config.bot.s3bucket}/botLogos/${channelLogoName}`
}

function logoName(name) {
    return _.toLower(name).replace(' ', '_');
}

export function categoryLogoUrl(categoryName) {
    return `${config.bot.baseProtocol}${config.bot.baseUrl}/${config.bot.s3bucket}/botLogos/${logoName(categoryName)}.png`
}

export function developerLogoUrl(developerName) {
    return `${config.bot.baseProtocol}${config.bot.baseUrl}/${config.bot.s3bucket}/botLogos/${logoName(developerName)}.png`
}

export function userProfileUrl(userId) {
    return `${config.proxy.protocol}${config.proxy.host}${config.proxy.downloadFilePath}/profile-pics/${userId}.png`
}

export function sessionStartFormattedDate(date) {
    if (!date) {
        return '';
    }
    let today = moment();
    if (moment(date).isSame(today, 'd')) {
        return 'Today';
    } else if (moment(date).isSame(today, 'y')) {
        return moment(date).format('D MMMM');
    } else {
        return moment(date).format('D MMMM, YYYY');
    }
}

export async function copyFileAsync(uri, directory) {
    console.log('In copyFileAsync : ', uri, directory);
    const exists = await RNFS.exists(directory);
    if (!exists) {
        await RNFS.mkdir(directory);
    }
    const parsedPath = PathParse(uri);
    const toUri = directory[directory.length - 1] === '/' ? directory + parsedPath.base : directory + '/' + parsedPath.base;

    const destExists = await RNFS.exists(toUri);
    if (destExists) {
        await RNFS.unlink(toUri);
    }
    await RNFS.copyFile(uri, toUri);
    console.log('In copyFileAsync : ', toUri);
    return toUri;
}


export function s3DownloadHeaders(s3Url, user, method = 'GET') {
    const host = config.bot.baseUrl;

    // TODO(amal): Check This.
    // We dont care about urls that are not S3 based
    //if (s3Url.indexOf(host) < 0) {
    //    return null;
    //}
    const path = s3Url.substring(s3Url.indexOf(host) + host.length);
    var headers = Utils.createAuthHeader(host, method, path, config.bot.s3ServiceApi, '', user);
    headers = _.merge(headers, {
        'accesskeyid': user.aws.accessKeyId,
        'secretaccesskey': user.aws.secretAccessKey,
        'sessiontoken': user.aws.sessionToken,
    });

    console.log(`Utils::s3DownloadHeaders::headers created for s3 download for host :: ${host} path: ${path}.`);

    return headers;
}

export function checkBotStatus(installedBots, newBot) {
    if (installedBots === undefined) {
        return { installed: true, update: false };
    }
    const installedBot = _.find(installedBots, (botItem) => botItem.botId === newBot.botId);
    let installed = false;
    let update = false;

    // Bot exists in the intalled list
    if (installedBot) {
        installed = true;
        // If current catalog version is greater than installed version - update is an option
        if (cmp(newBot.version, installedBot.version) > 0) {
            update = true;
        }
    }
    return { installed, update };
}

export function isClientSupportedByBot(bot) {
    if (!bot.minRequiredPlatformVersion ||  (versionCompare(VersionCheck.getCurrentVersion(), bot.minRequiredPlatformVersion) > -1)) {
        return true;
    }
    return false;
}

// Note: need to use decodeURI on paths that Expo has created but not when pointing it back!
export async function downloadFileAsync(uri, headers, toDirectory) {
    // TODO: using name as a discriminator isnt the best idea - but works for custom S3 messages
    try {
        const fileName = uri.split('/').pop();
        const filePath = toDirectory + '/' + fileName;
        RNFS.mkdir(toDirectory);
        const exists = await AssetFetcher.existsOnDevice(decodeURI(filePath));
        console.log('Utils::downloadFileAsync::fileName ' + fileName + ' exists = ', exists);

        // Download if not already downloaded
        if (!exists) {
            console.log('Utils::downloadFileAsync::downloading ' + fileName + ' from ', uri);
            await AssetFetcher.downloadFile(decodeURI(filePath), uri, headers, true, false);
        }
        console.log('File downloaded');
        return {
            uri: filePath,
            headers: headers
        }

    } catch (error) {
        console.log('Error getting file from source url' + uri, error);
        return { uri, headers };
    }
}

export function addArrayToSqlResults(results) {
    var returnRes = {}
    if (!results || !results.rows) {
        return results;
    }
    returnRes.rows = results.rows;
    returnRes.rows._array = []
    var len = results.rows.length;
    for (let i = 0; i < len; i++) {
        let row = results.rows.item(i);
        returnRes.rows._array.push(row);
    }
    return returnRes;
}

async function copyFile(fromPath, toPath) {
    const toExists = await RNFS.exists(toPath);
    if (toExists) {
        await RNFS.unlink(toPath);
    }
    await RNFS.copyFile(fromPath, toPath);
}

async function copyDir(fromDir, toDir, overwrite = false) {
    const fromExists = await RNFS.exists(fromDir);
    if (!fromExists) {
        return;
    }

    let fromResources = await RNFS.readDir(fromDir);

    for (let i = 0; i < fromResources.length; ++i) {
        let stat = fromResources[i];
        console.log(`Checking for ${stat.path}`);
        const toPath = toDir + '/' + stat.name;
        const exists = await RNFS.exists(toPath);
        if (stat.isFile()) {
            if (!exists || overwrite) {
                console.log(`File Copying ${stat.path} to ${toPath}`);
                await copyFile(stat.path, toPath);
            } else {
                console.log(`File ${toPath} exists`);
            }
        } else if (stat.isDirectory()) {
            if (!exists || overwrite) {
                console.log(`Copying ${stat.path} to ${toPath}`);
                await RNFS.mkdir(toPath);
                await copyDir(stat.path, toPath);
            } else {
                console.log(`${toPath} exists`);
            }
        }
    }
}


async function copyAssetFile(fromPath, toPath) {
    await RNFS.copyFileAssets(fromPath, toPath);
}

async function copyAssetsDir(assetsPath, toDir, overwrite = false) {
    const dirItems = await RNFS.readDirAssets(assetsPath);
    if (dirItems.length === 0) {
        return;
    }

    let fromResources = dirItems;

    for (let i = 0; i < fromResources.length; ++i) {
        let stat = fromResources[i];
        console.log(`Checking for ${stat.path}`);
        const toPath = toDir + '/' + stat.name;
        const exists = await RNFS.exists(toPath);
        if (stat.isFile()) {
            if (!exists || overwrite) {
                console.log(`File Copying ${stat.path} to ${toPath}`);
                await copyAssetFile(stat.path, toPath);
            } else {
                console.log(`File ${toPath} exists`);
            }
        } else if (stat.isDirectory()) {
            if (!exists || overwrite) {
                console.log(`Copying ${stat.path} to ${toPath}`);
                await RNFS.mkdir(toPath);
                await copyAssetsDir(stat.path, toPath);
            } else {
                console.log(`${toPath} exists`);
            }
        }
    }
}

export async function copyInitialBotsFromAssetsDirectory(overwrite) {
    console.log('Documents Directory Path from Assets : ', RNFS.DocumentDirectoryPath);

    const botToDir = RNFS.DocumentDirectoryPath + '/bots';
    await RNFS.mkdir(botToDir);
    await copyAssetsDir('bots/initial_bots/bots', botToDir, overwrite);

    const botDependenciesToDir = RNFS.DocumentDirectoryPath + '/bot_dependencies';
    await RNFS.mkdir(botDependenciesToDir);
    await copyAssetsDir('bots/initial_bots/bot_dependencies', botDependenciesToDir, overwrite);
}

export async function copyIntialBots(overwrite) {
    console.log('Main Bundle Path : ', RNFS.MainBundlePath);
    console.log('Documents Directory Path : ', RNFS.DocumentDirectoryPath);

    if (Platform.OS === 'android') {
        copyInitialBotsFromAssetsDirectory(overwrite);
        return;
    }

    const botFromDir = RNFS.MainBundlePath + '/bots';
    const botToDir = RNFS.DocumentDirectoryPath + '/bots';
    await RNFS.mkdir(botToDir);
    await copyDir(botFromDir, botToDir, overwrite);

    const botDependenciesFromDir = RNFS.MainBundlePath + '/bot_dependencies';
    const botDependenciesToDir = RNFS.DocumentDirectoryPath + '/bot_dependencies';
    await RNFS.mkdir(botDependenciesToDir);
    await copyDir(botDependenciesFromDir, botDependenciesToDir, overwrite);
}

export function isiPhoneX() {
    const dimen = Dimensions.get('window');
    return (
        Platform.OS === 'ios' &&
        !Platform.isPad &&
        !Platform.isTVOS &&
        (dimen.height === 812 || dimen.width === 812)
    );
}



export function isEmail(email) {
    var tester = /^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-?\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;
    if (!email || email.length > 254) {
        return false;
    }

    var valid = tester.test(email);
    if (!valid) {
        return false;
    }

    // Further checking of some things regex can't handle
    var parts = email.split('@');
    if (parts[0].length > 64) {
        return false;
    }

    var domainParts = parts[1].split('.');
    if (domainParts.some(function(part) { return part.length > 63; })) {
        return false;
    }
    return true;

}

export function padStartForAndroid() {
    //padStart() is not available natively in android
    if (!String.prototype.padStart) {
        String.prototype.padStart = function padStart(targetLength,padString) {
            targetLength = targetLength >> 0;
            padString = String((typeof padString !== 'undefined' ? padString : ' '));
            if (this.length > targetLength) {
                return String(this);
            }
            else {
                targetLength = targetLength - this.length;
                if (targetLength > padString.length) {
                    padString += padString.repeat(targetLength / padString.length);
                }
                return padString.slice(0,targetLength) + String(this);
            }
        };
    }
}

export function requestReadContactsPermission() {
    if (Platform.OS === 'ios') {
        return Promise.resolve(true);
    } else {
        //Request runtime permission to access contacts
        return PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_CONTACTS).then((result) => {
            return (result === 'granted' ? true : false);
        });
    }
}

export function newBotConversationId(userId, botId) {
    if (SystemBot.isSystemBot(botId) || !userId) {
        return UUID();
    } else {
        let ids = [userId, botId];
        const text = _.join(_.sortBy(ids), '-');
        return userId.substr(0, 10) + '-' + sha1(text).substr(0, 12);
    }
}

export function objectToQueryString(obj) {
    const results = [];
    _.forOwn(obj, (value, key) => {
        if (Array.isArray(value)) {
            _.forOwn(value, (v) => {
                results.push(`${key}=${encodeURI(v)}`);
            });
        } else {
            results.push(`${key}=${encodeURI(value)}`);
        }
    });
    return results.join('&');
}

export default {
    formattedDate,
    copyFileAsync,
    s3DownloadHeaders,
    checkBotStatus,
    downloadFileAsync,
    sessionStartFormattedDate,
    addArrayToSqlResults,
    copyIntialBots,
    userProfileUrl,
    isiPhoneX,
    isEmail,
    developerLogoUrl,
    categoryLogoUrl,
    botLogoUrl,
    channelLogoUrl,
    padStartForAndroid,
    requestReadContactsPermission,
    isClientSupportedByBot,
    newBotConversationId,
    objectToQueryString
}
