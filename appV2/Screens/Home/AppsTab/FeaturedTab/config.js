import { Dimensions } from 'react-native';

export const SCREEN_HEIGHT = Dimensions.get('window').height;
export const SCREEN_WIDTH = Dimensions.get('window').width;

export const scrollViewConfig = {
    width: SCREEN_WIDTH * 0.98
};
//TODO: really reqired?
