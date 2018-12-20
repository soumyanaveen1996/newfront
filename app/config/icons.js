import React from 'react';
import { Icon } from 'react-native-elements';
import Colors, { GlobalColors } from './styles';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp
} from 'react-native-responsive-screen';

function icon(
    name,
    type,
    size,
    color,
    underlayColor = Colors.sideButtons,
    fontWeight = 'normal'
) {
    return function(options) {
        return renderIcon(
            name,
            type,
            size,
            color,
            underlayColor,
            fontWeight,
            options
        );
    };
}

function renderIcon(
    name,
    type,
    size,
    color,
    underlayColor = Colors.sideButtons,
    fontWeight = 'normal',
    options = {}
) {
    return (
        <Icon
            accessibilityLabel={'Icon ' + name}
            testID={'icon-' + name}
            name={name}
            type={type}
            color={color}
            underlayColor={underlayColor}
            size={size}
            fontWeight={fontWeight}
            {...options}
        />
    );
}

export const Icons = {
    renderIcon: renderIcon,
    backSpace: icon(
        'ios-backspace',
        'ionicon',
        hp('3%'),
        GlobalColors.grey,
        GlobalColors.white
    ),
    addContacts: icon(
        'ios-person-add-outline',
        'ionicon',
        hp('4%'),
        Colors.white,
        Colors.white,
        '500'
    ),
    inviteContact: icon(
        'ios-mail-open-outline',
        'ionicon',
        hp('4%'),
        Colors.white,
        Colors.white,
        '500'
    ),
    search: icon(
        'search',
        'evilicon',
        24,
        Colors.sideButtons,
        Colors.transparent
    ),
    messageRead: icon('check', 'font-awesome', 16, Colors.accent),
    more: icon('ellipsis-v', 'font-awesome', 16, Colors.accent),
    backArrow: icon(
        'ios-arrow-back',
        'ionicon',
        30,
        Colors.sideButtons,
        Colors.transparent,
        '500'
    ),
    mapViewClose: icon(
        'ios-close',
        'ionicon',
        45,
        Colors.accent,
        Colors.accent,
        '500'
    ),
    videoRecorderClose: icon(
        'ios-close',
        'ionicon',
        45,
        Colors.accent,
        Colors.accent,
        '500'
    ),
    listRightArrow: icon(
        'keyboard-arrow-right',
        undefined,
        30,
        Colors.rightArrow,
        Colors.rightArrow
    ),
    toolbarSave: icon(
        'ios-download-outline',
        'ionicon',
        30,
        Colors.iosBlue,
        Colors.iosBlue
    ),
    toolbarSaveDisbled: icon(
        'ios-download-outline',
        'ionicon',
        30,
        Colors.disabledGray,
        Colors.disabledGray
    ),
    sliderClose: icon(
        'ios-close-circle',
        'ionicon',
        24,
        Colors.accent,
        Colors.accent,
        '500'
    ),
    playIcon: icon('ios-play', 'ionicon', 30, Colors.white, Colors.transparent),
    pauseIcon: icon(
        'ios-pause',
        'ionicon',
        30,
        Colors.white,
        Colors.transparent
    ),
    audioCircle: icon('circle', 'font-awesome', 16, Colors.white),
    cancelRecording: icon(
        'ios-close-circle',
        'ionicon',
        32,
        Colors.iosBlue,
        Colors.accent,
        '500'
    ),
    cameraFlash: icon(
        'ios-flash',
        'ionicon',
        32,
        Colors.white,
        Colors.transparent,
        '500'
    ),
    cameraFlashOutline: icon(
        'ios-flash-outline',
        'ionicon',
        32,
        Colors.white,
        Colors.transparent,
        '500'
    ),
    cameraFlip: icon(
        'ios-reverse-camera',
        'ionicon',
        32,
        Colors.white,
        Colors.transparent,
        '500'
    ),
    videoRecordCircle: icon('circle', 'font-awesome', 46, '#F00'),
    delete: icon('md-trash', 'ionicon', 24, 'rgba(153, 153, 153,0.3)'),
    satelliteChatStatusClose: icon(
        'ios-close',
        'ionicon',
        20,
        Colors.red,
        Colors.statusBarBackgroundColor,
        '500'
    ),
    nonetworkChatStatusClose: icon(
        'ios-close',
        'ionicon',
        20,
        Colors.black,
        Colors.statusBarBackgroundColor,
        '500'
    ),
    refresh: icon(
        'ios-refresh',
        'ionicon',
        30,
        Colors.sideButtons,
        Colors.translucentDark,
        '500'
    ),
    call: icon(
        'ios-call',
        'ionicon',
        30,
        Colors.sideButtons,
        Colors.transparent,
        '500'
    ),
    callW: icon(
        'ios-call-outline',
        'ionicon',
        20,
        Colors.white,
        Colors.white,
        '500'
    ),
    chatW: icon(
        'ios-chatbubbles-outline',
        'ionicon',
        15,
        Colors.white,
        Colors.white,
        '500'
    ),
    callDisabled: icon(
        'ios-call',
        'ionicon',
        30,
        Colors.disabledButton,
        Colors.transparent,
        '500'
    ),
    automatic: icon(
        'ios-ionic',
        'ionicon',
        30,
        Colors.sideButtons,
        Colors.translucentDark,
        '500'
    ),
    greenCall: icon('ios-call', 'ionicon', 50, Colors.white, 'green', '500'),
    greenCallOutline: icon(
        'ios-call-outline',
        'ionicon',
        hp('4%'),
        Colors.white,
        'green',
        '500'
    ),
    greenCallBlue: icon(
        'ios-call-outline',
        'ionicon',
        hp('3%'),
        'rgba(0,189,242,1)',
        'green',
        '500'
    ),
    greenSatBlue: icon(
        'ios-phone-portrait',
        'ionicon',
        hp('3%'),
        'rgba(0,189,242,1)',
        'green',
        '500'
    ),
    redClose: icon('ios-close', 'ionicon', 50, Colors.white, 'red', '500'),
    delivered: icon('check', 'font-awesome', 10, Colors.white),
    mic: icon('ios-mic', 'ionicon', 50, Colors.darkGray, 'red', '500'),
    micOff: icon('ios-mic-off', 'ionicon', 50, Colors.darkGray, 'red', '500'),
    numdial: icon('ios-keypad', 'ionicon', 50, Colors.darkGray, 'red', '500'),
    speakerOn: icon(
        'ios-volume-up',
        'ionicon',
        50,
        Colors.darkGray,
        'red',
        '500'
    ),
    speakerOff: icon(
        'ios-volume-off',
        'ionicon',
        50,
        Colors.darkGray,
        'red',
        '500'
    ),

    // MAP
    zoomIn: icon('md-add', 'ionicon', 15, GlobalColors.headerBlack),
    zoomOut: icon('md-remove', 'ionicon', 15, GlobalColors.headerBlack),
    userPosition: icon('md-locate', 'ionicon', 15, GlobalColors.headerBlack),
    userPositionActive: icon(
        'md-locate',
        'ionicon',
        15,
        GlobalColors.sideButtons
    )
};

export default Icons;
