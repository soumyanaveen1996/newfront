import React from 'react';
import { Icon } from 'react-native-elements';
import Colors from './styles';

function icon(name, type, size, color, underlayColor = Colors.white, fontWeight = 'normal') {
    return function(options) {
        return renderIcon(name, type, size, color, underlayColor, fontWeight, options);
    }
}

function renderIcon(name, type, size, color, underlayColor = Colors.white, fontWeight = 'normal', options = {}) {
    return ( <Icon accessibilityLabel={'Icon ' + name} testID={'icon-' + name} name={name}
        type={type}
        color={color}
        underlayColor={underlayColor}
        size={size}
        fontWeight={fontWeight}
        {...options} />
    );
}

export const Icons = {
    renderIcon: renderIcon,
    messageRead : icon('check', 'font-awesome', 16, Colors.accent),
    backArrow  : icon('ios-arrow-back', 'ionicon', 30, Colors.white, Colors.transparent, '500'),
    mapViewClose: icon('ios-close', 'ionicon', 45, Colors.accent, Colors.accent, '500'),
    videoRecorderClose: icon('ios-close', 'ionicon', 45, Colors.accent, Colors.accent, '500'),
    listRightArrow: icon('keyboard-arrow-right', undefined, 30, Colors.rightArrow, Colors.rightArrow),
    toolbarSave: icon('ios-download-outline', 'ionicon', 30, Colors.iosBlue, Colors.iosBlue),
    toolbarSaveDisbled: icon('ios-download-outline', 'ionicon', 30, Colors.disabledGray, Colors.disabledGray),
    sliderClose: icon('ios-close-circle', 'ionicon', 24, Colors.accent, Colors.accent, '500'),
    playIcon: icon('ios-play', 'ionicon', 30, Colors.white, Colors.transparent),
    pauseIcon: icon('ios-pause', 'ionicon', 30, Colors.white, Colors.transparent),
    audioCircle: icon('circle', 'font-awesome', 16, Colors.white),
    cancelRecording: icon('ios-close-circle', 'ionicon', 32, Colors.iosBlue, Colors.accent, '500'),
    cameraFlash: icon('ios-flash', 'ionicon', 32, Colors.white, Colors.transparent, '500'),
    cameraFlashOutline: icon('ios-flash-outline', 'ionicon', 32, Colors.white, Colors.transparent, '500'),
    cameraFlip: icon('ios-reverse-camera', 'ionicon', 32, Colors.white, Colors.transparent, '500'),
    videoRecordCircle: icon('circle', 'font-awesome', 46, '#F00'),
    delete: icon('md-trash', 'ionicon', 32, 'rgb(198, 198, 198)'),
    satelliteChatStatusClose: icon('ios-close', 'ionicon', 20, Colors.red, Colors.statusBarBackgroundColor, '500'),
    nonetworkChatStatusClose: icon('ios-close', 'ionicon', 20, Colors.black, Colors.statusBarBackgroundColor, '500'),
    refresh: icon('ios-refresh', 'ionicon', 30, Colors.white, Colors.translucentDark, '500'),
    call: icon('ios-call', 'ionicon', 30, Colors.white, Colors.transparent, '500'),
    callDisabled: icon('ios-call', 'ionicon', 30, Colors.disabledButton, Colors.transparent, '500'),
    automatic: icon('ios-ionic', 'ionicon', 30, Colors.white, Colors.translucentDark, '500'),
    greenCall: icon('ios-call', 'ionicon', 50, Colors.white, 'green', '500'),
    redClose: icon('ios-close', 'ionicon', 50, Colors.white, 'red', '500'),
};

export default Icons;

