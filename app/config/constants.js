import React from 'react';
import { Platform } from 'react-native';
import RNFS from 'react-native-fs';

console.log('RNFS Documents directory : ', RNFS.DocumentDirectoryPath);

export default {
    DEFAULT_HEADER_HEIGHT: Platform.OS === 'ios' ? 64 : 54,
    IMAGES_DIRECTORY: 'file://' + RNFS.DocumentDirectoryPath + '/images',
    AUDIO_DIRECTORY: 'file://' + RNFS.DocumentDirectoryPath + '/audio',
    VIDEO_DIRECTORY: 'file://' + RNFS.DocumentDirectoryPath + '/video',
}
