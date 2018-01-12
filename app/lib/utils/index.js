import moment from 'moment';
import PathParse from 'path-parse';
import config from '../../config/config.js';
import { Utils } from '../capability';
import _ from 'lodash';
import cmp from 'semver-compare';
import { AssetFetcher } from '../dce';
import RNFS from 'react-native-fs';
import { Platform } from 'react-native';

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


export function s3DownloadHeaders(s3Url, user) {
    const host = config.bot.baseUrl;

    // We dont care about urls that are not S3 based
    if (s3Url.indexOf(host) < 0) {
        return null;
    }
    const path = s3Url.substring(s3Url.indexOf(host) + host.length);
    const headers = Utils.createAuthHeader(host, 'GET', path, config.bot.s3ServiceApi, '', user);

    console.log(`Utils::s3DownloadHeaders::headers created for s3 download for host :: ${host} path: ${path}.`);

    return headers;
}

export function checkBotStatus(installedBots, newBot) {
    if (installedBots === undefined) {
        return { installed: true, update: false };
    }
    const installedBot = _.find(installedBots, (botItem) => botItem.id === newBot.id);
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

// Note: need to use decodeURI on paths that Expo has created but not when pointing it back!
export async function downloadFileAsync(uri, headers, toDirectory) {
    // TODO: using name as a discriminator isnt the best idea - but works for custom S3 messages
    try {
        const fileName = uri.split('/').pop();
        const filePath = toDirectory + '/' + fileName;
        const exists = await AssetFetcher.existsOnDevice(decodeURI(filePath));
        console.log('Utils::downloadFileAsync::fileName ' + fileName + ' exists = ', exists);

        // Download if not already downloaded
        if (!exists) {
            console.log('Utils::downloadFileAsync::downloading ' + fileName + ' from ', uri);
            await AssetFetcher.downloadFile(decodeURI(filePath), uri, headers, true);
        }
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
            if (!exists) {
                console.log(`File Copying ${stat.path} to ${toPath}`);
                await copyFile(stat.path, toPath);
            } else {
                console.log(`File ${toPath} exists`);
            }
        } else if (stat.isDirectory()) {
            if (!exists) {
                console.log(`Copying ${stat.path} to ${toPath}`);
                await RNFS.mkdir(toPath);
                await copyDir(stat.path, toPath);
            } else {
                console.log(`${toPath} exists`);
            }
        }
    }
}

export async function copyIntialBots() {
    console.log('Main Bundle Path : ', RNFS.MainBundlePath);
    console.log('Documents Directory Path : ', RNFS.DocumentDirectoryPath);

    const botFromDir = RNFS.MainBundlePath + '/bots';
    const botToDir = RNFS.DocumentDirectoryPath + '/bots';
    await RNFS.mkdir(botToDir);
    await copyDir(botFromDir, botToDir);

    const botDependenciesFromDir = RNFS.MainBundlePath + '/bot_dependencies';
    const botDependenciesToDir = RNFS.DocumentDirectoryPath + '/bot_dependencies';
    await RNFS.mkdir(botDependenciesToDir);
    await copyDir(botDependenciesFromDir, botDependenciesToDir);
}


export default {
    formattedDate,
    copyFileAsync,
    s3DownloadHeaders,
    checkBotStatus,
    downloadFileAsync,
    sessionStartFormattedDate,
    addArrayToSqlResults,
    copyIntialBots
}
