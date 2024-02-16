import { Dimensions } from 'react-native';
import I18n from '../../../../config/i18n/i18n';
export const SCREEN_HEIGHT = Dimensions.get('window').height;
export const SCREEN_WIDTH = Dimensions.get('window').width;
import GlobalColors from '../../../../config/styles';
import AppFonts from '../../../../config/fontConfig';

export const scrollViewConfig = {
    width: SCREEN_WIDTH * 0.98
};

export const headerConfig = {
    headerTitle: I18n.t('Installed_bots')
};

export const rightIconConfig = {
    type: 'Content',
    name: 'add',
    size: 30,
    underlayColor: 'transparent',
    color: '#fff',
    fontWeight: AppFonts.NORMAL
};
export const searchBarConfig = {
    placeholderTextColor: GlobalColors.headerTextInputPlaceholder
};
