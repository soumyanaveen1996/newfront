import { Dimensions } from 'react-native';

export const SCREEN_HEIGHT = Dimensions.get('window').height;
export const SCREEN_WIDTH = Dimensions.get('window').width;

export const INFOPOPUP_HEIGHT =  SCREEN_HEIGHT * 0.7;

export const sliderAnimationConfig = {
    toValue : SCREEN_HEIGHT / 1.6,
    semiCloseValue: SCREEN_HEIGHT / 1.6 - 155,
    duration : 200,
    inputRange : [0, SCREEN_HEIGHT / 1.6],
    outputRange : [0, SCREEN_HEIGHT / 1.6],
    extrapolate : 'clamp',
    minimizedHeight: 50,

}

export const checkBoxConfig = {
    uncheckedIcon : 'ios-radio-button-off-outline',
    checkedIcon : 'ios-checkmark-circle',
    checkedColor : '#FF7F50',
    iconType : 'ionicon',
}

export const  gestureStateConfig = {
    distanceYForSliderAnimation : 100,
    velocityYForSliderAnimation : 1.5,
}
