import moment from 'moment';
import PathParse from 'path-parse';
import config from '../../config/config.js';
import { Utils } from '../capability';
import _ from 'lodash';
import cmp from 'semver-compare';
import { AssetFetcher } from '../dce';

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

// TODO(expo): Replace this function
export async function copyFileAsync(uri, directory) {
    /*
    const result = await Expo.FileSystem.getInfoAsync(directory);
    if (!result.exists) {
        await Expo.FileSystem.makeDirectoryAsync(directory, { intermediates: true });
    }
    const parsedPath = PathParse(uri);
    const toUri = directory[directory.length - 1] === '/' ? directory + parsedPath.base : directory + '/' + parsedPath.base;
    await Expo.FileSystem.copyAsync({ from: uri, to: toUri });
    return toUri; */
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


export default {
    formattedDate,
    copyFileAsync,
    s3DownloadHeaders,
    checkBotStatus,
    downloadFileAsync,
    sessionStartFormattedDate,
}
