import { Dimensions } from 'react-native';
import I18n from '../../../config/i18n/i18n';
import AppFonts from '../../../config/fontConfig';

export const SCREEN_HEIGHT = Dimensions.get('window').height;
export const SCREEN_WIDTH = Dimensions.get('window').width;

export const headerConfig = {
    headerTitle: I18n.t('Bot_Store')
};

export const leftIconConfig = {
    type: 'ionicon',
    name: 'ios-arrow-back',
    size: 26,
    underlayColor: 'transparent',
    color: '#fff',
    fontWeight: AppFonts.NORMAL
};

export const rightIconConfig = {
    type: 'ionicon',
    name: 'ios-search',
    size: 26,
    underlayColor: 'transparent',
    color: '#fff',
    fontWeight: AppFonts.NORMAL
};

/*
 * UPDATE: showing all bots instead of featured as per FC-1211
 * removing renaming 1st tab to All_Bots from Featured_Tab
 * */
export const tabConfig = {
    tabNames: [
        I18n.t('Installed'),
        I18n.t('All_Bots')
        // I18n.t('Categories_Tab'),
        // I18n.t('Developer_Tab'),
    ]
};

export const scrollViewConfig = {
    width: SCREEN_WIDTH * 0.98
};
