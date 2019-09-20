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
    addContacts: icon(
        'ios-person-add-outline',
        'ionicon',
        hp('4%'),
        Colors.white,
        Colors.white,
        '500'
    ),
    arrowBottomLeft: icon(
        'arrow-bottom-left',
        'material-community',
        20,
        GlobalColors.green
    ),
    arrowDown: icon('ios-arrow-down', 'ionicon', 20, GlobalColors.sideButtons),
    arrowTopRight: icon(
        'arrow-top-right',
        'material-community',
        20,
        GlobalColors.green
    ),
    arrowUp: icon('ios-arrow-up', 'ionicon', 20, GlobalColors.headerBlack),
    audioCircle: icon('circle', 'font-awesome', 16, Colors.white),
    automatic: icon(
        'ios-ionic',
        'ionicon',
        30,
        Colors.sideButtons,
        Colors.translucentDark,
        '500'
    ),
    backArrow: icon(
        'ios-arrow-back',
        'ionicon',
        30,
        Colors.sideButtons,
        Colors.transparent,
        '500'
    ),
    backSpace: icon(
        'ios-backspace',
        'ionicon',
        hp('3%'),
        GlobalColors.grey,
        GlobalColors.white
    ),
    call: icon(
        'ios-call',
        'ionicon',
        30,
        Colors.sideButtons,
        Colors.transparent,
        '500'
    ),
    callDisabled: icon(
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
    cancelRecording: icon(
        'ios-close-circle',
        'ionicon',
        32,
        Colors.iosBlue,
        Colors.accent,
        '500'
    ),
    cardsFalse: icon('ios-close-circle', 'ionicon', 25, GlobalColors.red),
    //DATACARD
    cardsTrue: icon('ios-checkmark-circle', 'ionicon', 25, GlobalColors.green),
    chatW: icon(
        'ios-chatbubbles-outline',
        'ionicon',
        15,
        Colors.white,
        Colors.white,
        '500'
    ),
    circleSlice: icon('time-slot', 'entypo', 20, 'gold'),
    close: icon('ios-close', 'ionicon', 45),
    closeRouteSlider: icon('md-close', 'ionicon', 18, GlobalColors.white),
    delete: icon('md-trash', 'ionicon', 24, 'rgba(153, 153, 153,0.3)'),
    delivered: icon('check', 'font-awesome', 10, Colors.white),
    downloadFile: icon(
        'arrow-collapse-down',
        'material-community',
        15,
        GlobalColors.white
    ),
    //CHANNELS
    editChannel: icon(
        'pencil',
        'material-community',
        20,
        GlobalColors.sideButtons
    ),
    //FILES
    fileIcon: icon(
        'ios-document-outline',
        'ionicon',
        70,
        GlobalColors.disabledGray
    ),
    fileIconSmall: icon(
        'ios-document-outline',
        'ionicon',
        30,
        GlobalColors.darkGray
    ),
    formCalendar: icon(
        'ios-calendar-outline',
        'ionicon',
        20,
        GlobalColors.sideButtons
    ),
    formCompletedCheck: icon('md-checkmark', 'ionicon', 20, GlobalColors.green),
    formMessageArrow: icon(
        'ios-arrow-forward',
        'ionicon',
        20,
        GlobalColors.sideButtons,
        'red',
        '500'
    ),
    greenCall: icon('ios-call', 'ionicon', 50, Colors.white, 'green', '500'),
    greenCallBlue: icon(
        'smartphone',
        'ios-call-outline',
        hp('3%'),
        'rgba(0,189,242,1)',
        'green',
        '500'
    ),
    greenCallLocal: icon(
        'phone',
        'ios-call-outline',
        hp('3%'),
        'rgba(0,189,242,1)',
        'green',
        '500'
    ),
    greenCallOutline: icon(
        'phone',
        'simple-line-icon',
        hp('4%'),
        Colors.white,
        'green',
        '500'
    ),
    greenSatBlue: icon(
        'satellite',
        'ios-phone-portrait',
        hp('3%'),
        'rgba(0,189,242,1)',
        'green',
        '500'
    ),
    //SEARCH BOX
    info: icon(
        'information-outline',
        'material-community',
        27,
        GlobalColors.sideButtons,
        Colors.transparent,
        '200'
    ),
    inviteContact: icon(
        'ios-mail-open-outline',
        'ionicon',
        hp('4%'),
        Colors.white,
        Colors.white,
        '500'
    ),
    lineChart: icon('md-git-commit', 'ionicon', 28, GlobalColors.red),
    listRightArrow: icon(
        'keyboard-arrow-right',
        undefined,
        30,
        Colors.rightArrow,
        Colors.rightArrow
    ),
    mapViewClose: icon(
        'ios-close',
        'ionicon',
        45,
        Colors.accent,
        Colors.accent,
        '500'
    ),
    messageRead: icon('check', 'font-awesome', 16, Colors.accent),
    mic: icon('ios-mic', 'ionicon', 50, Colors.darkGray, 'red', '500'),
    micOff: icon('ios-mic-off', 'ionicon', 50, Colors.darkGray, 'red', '500'),
    more: icon('ellipsis-v', 'font-awesome', 16, Colors.accent),
    nonetworkChatStatusClose: icon(
        'ios-close',
        'ionicon',
        20,
        Colors.black,
        Colors.statusBarBackgroundColor,
        '500'
    ),
    numdial: icon('ios-keypad', 'ionicon', 50, Colors.darkGray, 'red', '500'),
    pauseIcon: icon(
        'ios-pause',
        'ionicon',
        30,
        Colors.white,
        Colors.transparent
    ),
    //CALLSCREEN
    phoneHangup: icon(
        'phone-hangup',
        'material-community',
        25,
        GlobalColors.white
    ),
    planeRSBlu: icon(
        'airplane',
        'material-community',
        14,
        GlobalColors.sideButtons,
        'normal'
    ),
    planeRSWhite: icon(
        'airplane',
        'material-community',
        16,
        GlobalColors.white
    ),
    playIcon: icon('ios-play', 'ionicon', 30, Colors.white, Colors.transparent),
    redClose: icon('ios-close', 'ionicon', 50, Colors.white, 'red', '500'),
    redWarning: icon('alert', 'material-community', 20, GlobalColors.red),
    refresh: icon(
        'ios-refresh',
        'ionicon',
        35,
        Colors.sideButtons,
        Colors.translucentDark,
        '500'
    ),
    renderIcon: renderIcon,
    satelliteChatStatusClose: icon(
        'ios-close',
        'ionicon',
        20,
        Colors.red,
        Colors.statusBarBackgroundColor,
        '500'
    ),
    search: icon(
        'search',
        'evilicon',
        24,
        Colors.sideButtons,
        Colors.transparent
    ),
    sliderClose: icon(
        'ios-close-circle',
        'ionicon',
        24,
        Colors.accent,
        Colors.accent,
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
    speakerOn: icon('unmute', 'octicon', 10, Colors.darkGray, 'red'),
    square: icon('md-square', 'ionicon', 28, GlobalColors.red),
    //FORM
    time: icon('ios-time-outline', 'ionicon', 20, GlobalColors.frontmLightBlue),
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
    userPosition: icon('md-locate', 'ionicon', 15, GlobalColors.headerBlack),
    videoRecordCircle: icon('circle', 'font-awesome', 46, '#F00'),
    videoRecorderClose: icon(
        'ios-close',
        'ionicon',
        45,
        Colors.accent,
        Colors.accent,
        '500'
    ),
    // MAP
    zoomIn: icon('md-add', 'ionicon', 15, GlobalColors.headerBlack),
    zoomOut: icon('md-remove', 'ionicon', 15, GlobalColors.headerBlack),
    satIcon: icon(
        'satellite-variant',
        'material_community',
        35,
        GlobalColors.frontmLightBlue
    ),
    antenna: icon(
        'video-input-antenna',
        'material-community',
        35,
        GlobalColors.frontmLightBlue
    )
};

export default Icons;
