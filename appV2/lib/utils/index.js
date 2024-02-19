import moment from 'moment';
import PathParse from 'path-parse';
import config from '../../config/config.js';
import _ from 'lodash';
import cmp from 'semver-compare';
import { AssetFetcher } from '../dce';
import RNFS from 'react-native-fs';
import { Platform, Dimensions, PermissionsAndroid } from 'react-native';
import VersionCheck from 'react-native-version-check';
import versionCompare from 'semver-compare';
import sha1 from 'sha1';
import { InAppBrowser } from 'react-native-inappbrowser-reborn';
import GlobalColors from '../../config/styles';
import Toast from 'react-native-toast-message';

export function formattedDate(date) {
    if (!date) {
        return '';
    }
    let today = moment();
    if (moment(date).isSame(today, 'd')) {
        return moment(date).format('HH:mm');
    } else if (moment(date).isSame(today, 'y')) {
        return moment(date).format('DD MMM [at] HH:mm');
    } else {
        return moment(date).format('DD MMM YYYY [at] HH:mm');
    }
}
export function formattedDateTimeOnly(date) {
    if (!date) {
        return '';
    } else {
        return moment(date).format('HH:mm');
    }
}
export function formattedDateCheckOnly(date) {
    if (!date) {
        return false;
    }
    let today = moment();
    if (moment(date).isSame(today, 'd')) {
        return 'Today';
    } else if (moment(date).isSame(today, 'y')) {
        return moment(date).format('D MMMM');
    }
    return moment(date).format('DD MMM YYYY');
}

export function formattedDateChatList(date) {
    if (!date) {
        return '';
    }
    let today = moment();
    if (moment(date).isSame(today, 'd')) {
        return moment(date).format('HH:mm');
    } else if (moment(date).isSame(today, 'y')) {
        return moment(date).format('DD/MM');
    } else {
        return moment(date).format('DD/MM/YYYY');
    }
}

export function botLogoUrl(logoUrl) {
    return `${config.bot.baseProtocol}${config.bot.baseUrl}/${config.bot.s3bucket}/botLogos/${logoUrl}`;
}

export function channelLogoUrl(channelLogoName) {
    return `${config.bot.baseProtocol}${config.bot.baseUrl}/${config.bot.s3bucket}/botLogos/channelLogos/${channelLogoName}`;
}

export function userUploadedChannelLogoUrl(channelID) {
    return `${config.bot.baseProtocol}${config.bot.baseUrl}/${config.bot.s3bucket}/botLogos/channelLogos/${channelID}.png`;
}

function logoName(name) {
    return _.toLower(name).replace(' ', '_');
}

export function categoryLogoUrl(categoryName) {
    return `${config.bot.baseProtocol}${config.bot.baseUrl}/${
        config.bot.s3bucket
    }/botLogos/${logoName(categoryName)}.png`;
}

export function developerLogoUrl(developerName) {
    return `${config.bot.baseProtocol}${config.bot.baseUrl}/${
        config.bot.s3bucket
    }/botLogos/${logoName(developerName)}.png`;
}

export function userProfileUrl(userId) {
    return `${config.proxy.protocol}${config.proxy.resource_host}${config.proxy.downloadFilePath}/profile-pics/${userId}.png`;
}

export function userProfileUrlThumbnailImage(userId) {
    return `${config.proxy.protocol}${config.proxy.resource_host}${config.proxy.downloadFilePath}/profile-pics/${userId}_75x75.png`;
}

export function sessionStartFormattedDate(date) {
    if (!date) {
        return '';
    }
    const today = moment();
    if (moment(date).isSame(today, 'd')) {
        return 'Today';
    }
    if (moment(date).isSame(today, 'y')) {
        return moment(date).format('D MMMM');
    }
    return moment(date).format('D MMMM, YYYY');
}

/**
 * Async method that copy a file in a local directory. Can Also rename it.
 *
 * @param uri uri of the file
 * @param directory directory where to copy the file
 * @param raname new file name with extension
 *
 * @return new uri to the copied file
 */
export async function copyFileAsync(uri, directory, rename) {
    // console.log('In copyFileAsync : ', uri, directory);
    const exists = await RNFS.exists(directory);
    if (!exists) {
        await RNFS.mkdir(directory);
    }
    const parsedPath = PathParse(uri);
    const fileName = rename || parsedPath.base;
    const toUri =
        directory[directory.length - 1] === '/'
            ? directory + fileName
            : `${directory}/${fileName}`;

    const destExists = await RNFS.exists(toUri);
    if (destExists) {
        await RNFS.unlink(toUri);
    }
    await RNFS.copyFile(uri, toUri);
    // console.log('In copyFileAsync : ', toUri);
    return toUri;
}

export function s3DownloadHeaders(s3Url, user, method = 'GET') {
    const host = config.bot.baseUrl;

    // TODO(amal): Check This.
    // We dont care about urls that are not S3 based
    // if (s3Url.indexOf(host) < 0) {
    //    return null;
    // }
    let headers = {};
    headers = _.merge(headers, {
        sessionId: user.creds.sessionId
    });

    return headers;
}

export function checkBotStatus(installedBots, newBot) {
    if (installedBots === undefined) {
        return { installed: true, update: false };
    }
    const installedBot = _.find(
        installedBots,
        (botItem) => botItem.botId === newBot.botId
    );
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
    if (
        !bot.minRequiredPlatformVersion ||
        versionCompare(
            VersionCheck.getCurrentVersion(),
            bot.minRequiredPlatformVersion
        ) > -1
    ) {
        return true;
    }
    return false;
}

// Note: need to use decodeURI on paths that Expo has created but not when pointing it back!
export async function downloadFileAsync(uri, headers, toDirectory) {
    // TODO: using name as a discriminator isnt the best idea - but works for custom S3 messages
    try {
        const fileName = uri.split('/').pop();
        const filePath = `${toDirectory}/${fileName}`;
        RNFS.mkdir(toDirectory);
        const exists = await AssetFetcher.existsOnDevice(decodeURI(filePath));

        // Download if not already downloaded
        if (!exists) {
            console.log(
                `Utils::downloadFileAsync::downloading ${fileName} from `,
                uri
            );
            await AssetFetcher.downloadFile(
                decodeURI(filePath),
                uri,
                headers,
                true,
                false
            );
        }
        return {
            uri: filePath,
            headers
        };
    } catch (error) {
        console.log(`Error getting file from source url${uri}`, error);
        return { uri, headers };
    }
}

export function addArrayToSqlResults(results) {
    const returnRes = {};
    if (!results || !results.rows) {
        return results;
    }
    returnRes.rows = results.rows;
    returnRes.rows._array = [];
    const len = results.rows.length;
    for (let i = 0; i < len; i++) {
        const row = results.rows.item(i);
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

    const fromResources = await RNFS.readDir(fromDir);

    for (let i = 0; i < fromResources.length; ++i) {
        const stat = fromResources[i];
        const toPath = `${toDir}/${stat.name}`;
        const exists = await RNFS.exists(toPath);
        if (stat.isFile()) {
            if (!exists || overwrite) {
                await copyFile(stat.path, toPath);
            } else {
                console.log(`File ${toPath} exists`);
            }
        } else if (stat.isDirectory()) {
            if (!exists || overwrite) {
                await RNFS.mkdir(toPath);
                await copyDir(stat.path, toPath);
            } else {
                console.log(`${toPath} exists`);
            }
        }
    }
}

async function copyAssetFile(fromPath, toPath) {
    console.log(`copying ${fromPath}  ---> ${toPath}`);
    await RNFS.copyFileAssets(fromPath, toPath);
}

async function copyAssetsDir(assetsPath, toDir, overwrite = false) {
    const dirItems = await RNFS.readDirAssets(assetsPath);
    if (dirItems.length === 0) {
        return;
    }
    const fromResources = dirItems;
    for (let i = 0; i < fromResources.length; ++i) {
        const stat = fromResources[i];
        const toPath = `${toDir}/${stat.name}`;
        const exists = await RNFS.exists(toPath);
        if (stat.isFile()) {
            if (!exists || overwrite) {
                await copyAssetFile(stat.path, toPath);
            } else {
                console.log(`File ${toPath} exists`);
            }
        } else if (stat.isDirectory()) {
            if (!exists || overwrite) {
                await RNFS.mkdir(toPath);
                await copyAssetsDir(stat.path, toPath, overwrite);
            } else {
                console.log(`${toPath} exists`);
            }
        }
    }
}

export async function copyInitialBotsFromAssetsDirectory(overwrite) {
    console.log(
        'Documents Directory Path from Assets : ',
        RNFS.DocumentDirectoryPath
    );

    const botToDir = `${RNFS.DocumentDirectoryPath}/bots`;
    await RNFS.mkdir(botToDir);
    await copyAssetsDir('bots', botToDir, overwrite);

    const botDependenciesToDir = `${RNFS.DocumentDirectoryPath}/bot_dependencies`;
    await RNFS.mkdir(botDependenciesToDir);
    await copyAssetsDir('bot_dependencies', botDependenciesToDir, overwrite);
}

export async function copyIntialBots(overwrite) {
    // console.log('Main Bundle Path : ', RNFS.MainBundlePath);
    // console.log('Documents Directory Path : ', RNFS.DocumentDirectoryPath);

    if (Platform.OS === 'android') {
        copyInitialBotsFromAssetsDirectory(overwrite);
        return;
    }

    try {
        const botFromDir = `${RNFS.MainBundlePath}/bots`;
        const botToDir = `${RNFS.DocumentDirectoryPath}/bots`;
        await RNFS.mkdir(botToDir);
        console.log(`||||||||| copying bot: ${botFromDir} to ${botToDir}`);
        await copyDir(botFromDir, botToDir, overwrite);

        const botDependenciesFromDir = `${RNFS.MainBundlePath}/bot_dependencies`;
        const botDependenciesToDir = `${RNFS.DocumentDirectoryPath}/bot_dependencies`;
        await RNFS.mkdir(botDependenciesToDir);
        console.log(
            `||||||||| copying bot: ${botDependenciesFromDir} to ${botDependenciesToDir}`
        );
        await copyDir(botDependenciesFromDir, botDependenciesToDir, overwrite);
    } catch (err) {
        console.log(`||||||||| copying bot: errror`, err);
    }
}

export function isiPhoneX() {
    const dimen = Dimensions.get('window');
    return (
        (Platform.OS === 'ios' &&
            !Platform.isPad &&
            !Platform.isTVOS &&
            (dimen.height === 812 || dimen.width === 812)) ||
        dimen.height === 896 ||
        dimen.width === 896
    );
}

export function isEmail(email) {
    const tester =
        /^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-?\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;
    if (!email || email.length > 254) {
        return false;
    }

    const valid = tester.test(email);
    if (!valid) {
        return false;
    }

    // Further checking of some things regex can't handle
    const parts = email.split('@');
    if (parts[0].length > 64) {
        return false;
    }

    const domainParts = parts[1].split('.');
    if (domainParts.some((part) => part.length > 63)) {
        return false;
    }
    return true;
}

export function padStartForAndroid() {
    // padStart() is not available natively in android
    if (!String.prototype.padStart) {
        String.prototype.padStart = function padStart(targetLength, padString) {
            targetLength >>= 0;
            padString = String(
                typeof padString !== 'undefined' ? padString : ' '
            );
            if (this.length > targetLength) {
                return String(this);
            }
            targetLength -= this.length;
            if (targetLength > padString.length) {
                padString += padString.repeat(targetLength / padString.length);
            }
            return padString.slice(0, targetLength) + String(this);
        };
    }
}

export function requestReadContactsPermission() {
    if (Platform.OS === 'ios') {
        return Promise.resolve(true);
    }
    // Request runtime permission to access contacts
    return PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_CONTACTS
    ).then((result) => result === 'granted');
}

export function newBotConversationId(userId, botId) {
    if (!userId || userId === '') {
        throw new Error('Cannot Create Conversation Id as there is no User');
    }
    if (!botId || botId === '') {
        throw new Error('Cannot Create Conversation Id as there is no BotId');
    }
    const ids = [userId, botId];
    const text = _.join(_.sortBy(ids), '-');
    const newConvId = `${userId.substr(0, 10)}-${sha1(text).substr(0, 12)}`;
    console.log('Sourav Logging:::: Created CONV ID', newConvId);
    return newConvId;

    // if (SystemBot.isSystemBot(botId) || !userId) {
    //     return UUID();
    // } else {
    // }
}

export function objectToQueryString(obj) {
    const results = [];
    _.forOwn(obj, (value, key) => {
        if (Array.isArray(value)) {
            _.forOwn(value, (v) => {
                results.push(`${key}=${encodeURIComponent(v)}`);
            });
        } else {
            results.push(`${key}=${encodeURIComponent(value)}`);
        }
    });
    return results.join('&');
}

export function getTimeZones() {
    try {
        const momentTZ = require('moment-timezone');
        const zones = momentTZ.tz.names();
        const timeZones = [];
        for (const i in zones) {
            const obj = {
                code: zones[i],
                name: ` (GMT${momentTZ.tz(zones[i]).format('Z')})${zones[i]}`
            };
            timeZones.push(obj);
        }
        timeZones.sort((a, b) => {
            if (a.name < b.name) {
                return -1;
            }
            if (a.name > b.name) {
                return 1;
            }
        });
        return timeZones;
    } catch (e) {
        console.log('getTimeZones eror', e);
        return [];
    }
}

async function openURL(url) {
    if (url) {
        try {
            if (await InAppBrowser.isAvailable()) {
                await InAppBrowser.open(url, {
                    // iOS Properties
                    dismissButtonStyle: 'close',
                    preferredBarTintColor: GlobalColors.frontmLightBlue,
                    preferredControlTintColor: GlobalColors.white,
                    readerMode: false,
                    animated: true,
                    modalPresentationStyle: 'fullScreen',
                    modalTransitionStyle: 'coverVertical',
                    modalEnabled: true,
                    enableBarCollapsing: false,
                    // Android Properties
                    showTitle: true,
                    toolbarColor: GlobalColors.frontmLightBlue,
                    // secondaryToolbarColor: GlobalColors.white,
                    enableUrlBarHiding: true,
                    enableDefaultShare: true,
                    forceCloseOnRedirection: false,
                    // Specify full animation resource identifier(package:anim/name)
                    // or only resource name(in case of animation bundled with app).
                    animations: {
                        startEnter: 'slide_in_right',
                        startExit: 'slide_out_left',
                        endEnter: 'slide_in_left',
                        endExit: 'slide_out_right'
                    }
                });
            } else Linking.openURL(url);
        } catch (error) {
            console.log('>>>>>>>msg e', error.message);
            Toast.show({ text1: error.message });
        }
        return;
    }
}

function urlify(text) {
    var urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, function (url) {
        return '<a href="' + url + '">' + url + '</a>';
    });
}

function isHTML(text) {
    const urlRegex = /(<\/[a-zA-Z]+>)/;
    return urlRegex.test(text);
}

export default {
    formattedDate,
    formattedDateTimeOnly,
    formattedDateCheckOnly,
    formattedDateChatList,
    copyFileAsync,
    s3DownloadHeaders,
    checkBotStatus,
    downloadFileAsync,
    sessionStartFormattedDate,
    addArrayToSqlResults,
    copyIntialBots,
    userProfileUrl,
    userProfileUrlThumbnailImage,
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
    objectToQueryString,
    getTimeZones,
    userUploadedChannelLogoUrl,
    openURL,
    urlify,
    isHTML
};