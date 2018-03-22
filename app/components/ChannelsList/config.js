import {Dimensions} from 'react-native';
import I18n from '../../config/i18n/i18n';
export const SCREEN_HEIGHT = Dimensions.get('window').height;
export const SCREEN_WIDTH = Dimensions.get('window').width;

export const scrollViewConfig = {
    width : SCREEN_WIDTH * 0.98
}

export const headerConfig = {
    headerTitle : I18n.t('Channels'),
}

export const addButtonConfig = {
    type: 'Content',
    name: 'add',
    size: 30,
    underlayColor: 'transparent',
    color: '#fff',
    fontWeight: '500'
}

