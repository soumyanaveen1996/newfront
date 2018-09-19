import { Dimensions } from 'react-native';

export const SCREEN_HEIGHT = Dimensions.get('window').height;

export const BOT_CONSTANTS = {
    BOT_NAME_EMIT: 'BOT_NAME_EMIT'
};

export const BotInputBarCapabilities = {
    camera: 'camera',
    video: 'video',
    file: 'file',
    photo_library: 'photo_library',
    bar_code_scanner: 'bar_code_scanner',
    add_contact: 'add_contact',
    reset_conversation: 'reset_conversation',
    pick_location: 'pick_location'
};

export const SLIDER_HEIGHT = SCREEN_HEIGHT / 2.4;

export default {
    BOT_CONSTANTS,
    BotInputBarCapabilities
};
