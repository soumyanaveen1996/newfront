import React from 'react';
import { Icon } from '@rneui/themed';

import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp
} from 'react-native-responsive-screen';
import GlobalColors from './styles';

function icon(
    name,
    type,
    size,
    color,
    underlayColor = GlobalColors.primaryButtonColor,
    fontWeight = 'normal',
    containerStyle = {}
) {
    return function (options) {
        return renderIcon(
            name,
            type,
            size,
            color,
            underlayColor,
            fontWeight,
            containerStyle,
            options
        );
    };
}

function renderIcon(
    name,
    type,
    size,
    color,
    underlayColor = GlobalColors.primaryButtonColor,
    fontWeight = 'normal',
    containerStyle,
    options = {}
) {
    return (
        <Icon
            containerStyle={containerStyle}
            accessibilityLabel={`Icon ${name}`}
            testID={`icon-${name}`}
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
    missedCall: icon(
        'phone-missed',
        'material-community',
        20,
        GlobalColors.errorRed
    ),
    callEnded: icon(
        'call-end',
        'material',
        20,
        GlobalColors.toggleOnColor // green shade
    ),
    missedCallVideo: icon(
        'missed-video-call',
        'material',
        20,
        GlobalColors.errorRed
    ),
    callEndedVideo: icon(
        'video-outline',
        'material-community',
        20,
        GlobalColors.toggleOnColor // green shade
    ),
    addContacts: icon(
        'ios-person-add-outline',
        'ionicon',
        hp('4%'),
        GlobalColors.white,
        GlobalColors.white,
        '500'
    ),
    arrowBottomLeft: icon(
        'arrow-bottom-left',
        'material-community',
        20,
        GlobalColors.green
    ),
    arrowDown: icon(
        'ios-arrow-down',
        'ionicon',
        20,
        GlobalColors.primaryButtonColor
    ),
    arrowTopRight: icon(
        'arrow-top-right',
        'material-community',
        20,
        GlobalColors.green
    ),

    arrowUp: icon('ios-arrow-up', 'ionicon', 20, GlobalColors.headerBlack),
    keyboardArrowRight: icon(
        'keyboard-arrow-right',
        'material',
        30,
        GlobalColors.disabledGray
    ),
    keyboardArrowLeft: icon(
        'keyboard-arrow-left',
        'material',
        30,
        GlobalColors.disabledGray
    ),
    keyboardArrowDown: icon(
        'keyboard-arrow-down',
        'material',
        30,
        GlobalColors.disabledGray
    ),
    keyboardArrowUp: icon(
        'keyboard-arrow-up',
        'material',
        30,
        GlobalColors.disabledGray
    ),
    burgerMenu: icon('menu', 'ionicon', 30, GlobalColors.white),

    inCommingCall: icon(
        'arrow-down-circle',
        'ionicon',
        20,
        GlobalColors.headerBlack
    ),
    outGoingCall: icon(
        'arrow-up-circle',
        'ionicon',
        20,
        GlobalColors.headerBlack
    ),
    audioCircle: icon('circle', 'font-awesome', 16, GlobalColors.white),
    audioCircleSender: icon(
        'circle',
        'font-awesome',
        16,
        GlobalColors.frontmLightBlue
    ),
    automatic: icon(
        'ios-ionic',
        'ionicon',
        30,
        GlobalColors.primaryButtonColor,
        GlobalColors.translucentDark,
        '500'
    ),
    backArrow: icon(
        'arrow-back-ios',
        'material',
        24,
        GlobalColors.primaryButtonColor,
        GlobalColors.transparent,
        '500'
    ),
    back: icon(
        'arrow-back',
        'material',
        24,
        GlobalColors.primaryButtonColor,
        GlobalColors.transparent,
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
        GlobalColors.primaryButtonColor,
        GlobalColors.transparent,
        '500'
    ),
    callDisabled: icon(
        'ios-call',
        'ionicon',
        30,
        GlobalColors.primaryButtonColor,
        GlobalColors.transparent,
        '500'
    ),
    callW: icon(
        'ios-call-outline',
        'ionicon',
        20,
        GlobalColors.white,
        GlobalColors.white,
        '500'
    ),
    cameraFlash: icon(
        'ios-flash',
        'ionicon',
        32,
        GlobalColors.white,
        GlobalColors.transparent,
        '500'
    ),
    cameraFlashOutline: icon(
        'ios-flash-outline',
        'ionicon',
        32,
        GlobalColors.white,
        GlobalColors.transparent,
        '500'
    ),
    cameraFlip: icon(
        'camera-reverse-outline',
        'ionicon',
        32,
        GlobalColors.white,
        GlobalColors.transparent,
        '500'
    ),

    cancelRecording: icon(
        'ios-close-circle',
        'ionicon',
        32,
        GlobalColors.primaryColor,
        GlobalColors.accent,
        '500'
    ),
    favraouiteSelected: icon('star', 'antdesign', 20, GlobalColors.green),
    favraouite: icon('staro', 'antdesign', 20, '#dedede'),
    cardsFalse: icon('ios-close-circle', 'ionicon', 25, GlobalColors.red),
    cardsTrue: icon('ios-checkmark-circle', 'ionicon', 25, GlobalColors.green),
    chatW: icon(
        'ios-chatbubbles-outline',
        'ionicon',
        15,
        GlobalColors.white,
        GlobalColors.white,
        '500'
    ),
    circleSlice: icon('time-slot', 'entypo', 20, 'gold'),
    close: icon('ios-close', 'ionicon', 45),
    closeRouteSlider: icon('md-close', 'ionicon', 18, GlobalColors.white),
    delete: icon('md-trash', 'ionicon', 24, 'rgba(153, 153, 153,0.3)'),
    delivered: icon('check', 'feather', 12, `#28C76F`),
    deliveryFailed: icon(
        'exclamation-triangle',
        'font-awesome',
        12,
        GlobalColors.red
    ),
    downloadFile: icon(
        'arrow-collapse-down',
        'material-community',
        15,
        GlobalColors.white
    ),
    downloadIconNew: icon(
        'download-circle',
        'material-community',
        40,
        GlobalColors.primaryColor,
        GlobalColors.white
    ),
    editChannel: icon(
        'pencil',
        'material-community',
        20,
        GlobalColors.primaryButtonColor
    ),
    fileIcon: icon('ios-document', 'ionicon', 70, GlobalColors.disabledGray),
    fileIconSmall: icon('ios-document', 'ionicon', 30, GlobalColors.darkGray),
    formCalendar: icon(
        'calendar-clock',
        'material-community',
        20,
        GlobalColors.primaryButtonColor
    ),
    formCompletedCheck: icon('md-checkmark', 'ionicon', 20, GlobalColors.green),
    formMessageArrow: icon(
        'ios-arrow-forward',
        'ionicon',
        20,
        GlobalColors.primaryButtonColor,
        'red',
        '500'
    ),
    shareImage: icon('images-outline', 'ionicon', 22, '#cbd7e3', 500),
    shareImageNew: icon(
        'image-multiple-outline',
        'material-community',
        22,
        '#cbd7e3',
        undefined,
        500
    ),
    shareVideo: icon('video-library', 'material', 22, '#cbd7e3', 500),
    shareContact: icon('perm-contact-cal', 'material', 22, '#cbd7e3', 500),
    shareLocation: icon('location-outline', 'ionicon', 22, '#cbd7e3', 500),
    shareBarcode: icon(
        'barcode-scan',
        'material-community',
        22,
        '#cbd7e3',
        500
    ),
    shareCamera: icon('camera', 'entypo', 22, '#cbd7e3', 500),
    shareFile: icon('filetext1', 'antdesign', 22, '#cbd7e3', 500),

    greenCall: icon(
        'ios-call',
        'ionicon',
        50,
        GlobalColors.white,
        'green',
        '500'
    ),
    greenCallBlue: icon(
        'smartphone',
        'ios-call-outline',
        hp('3%'),
        GlobalColors.frontmLightBlue,
        'green',
        '500'
    ),
    greenCallLocal: icon(
        'phone',
        'ios-call-outline',
        hp('3%'),
        GlobalColors.frontmLightBlue,
        'green',
        '500'
    ),
    greenCallOutline: icon(
        'phone',
        'simple-line-icon',
        hp('4%'),
        GlobalColors.white,
        'green',
        '500'
    ),
    greenVideoCallOutline: icon(
        'camrecorder',
        'simple-line-icon',
        hp('4%'),
        GlobalColors.white,
        'green',
        '500'
    ),
    greenSatBlue: icon(
        'satellite',
        'ios-phone-portrait',
        hp('3%'),
        GlobalColors.frontmLightBlue,
        'green',
        '500'
    ),
    info: icon(
        'information-outline',
        'material-community',
        27,
        GlobalColors.primaryButtonColor,
        GlobalColors.transparent,
        '200'
    ),
    newInfoicon: icon(
        'dots-three-vertical',
        'entypo',
        20,
        '#c8ccd9',
        GlobalColors.transparent,
        '200'
    ),
    inviteContact: icon(
        'ios-mail-open-outline',
        'ionicon',
        hp('4%'),
        GlobalColors.white,
        GlobalColors.white,
        '500'
    ),
    lineChart: icon('md-git-commit', 'ionicon', 28, GlobalColors.red),
    listRightArrow: icon(
        'keyboard-arrow-right',
        undefined,
        30,
        GlobalColors.rightArrow,
        GlobalColors.rightArrow
    ),
    mapViewClose: icon(
        'ios-close',
        'ionicon',
        45,
        GlobalColors.accent,
        GlobalColors.accent,
        '500'
    ),
    messageRead: icon('check', 'font-awesome', 16, GlobalColors.accent),
    mic: icon('ios-mic', 'ionicon', 50, GlobalColors.darkGray, 'red', '500'),
    micOff: icon(
        'ios-mic-off',
        'ionicon',
        50,
        GlobalColors.darkGray,
        'red',
        '500'
    ),
    more: icon('ellipsis-v', 'font-awesome', 16, GlobalColors.accent),
    nonetworkChatStatusClose: icon(
        'ios-close',
        'ionicon',
        20,
        GlobalColors.black,
        GlobalColors.statusBarBackgroundColor,
        '500'
    ),
    numdial: icon(
        'ios-keypad',
        'ionicon',
        50,
        GlobalColors.darkGray,
        'red',
        '500',
        {
            alignSelf: 'center',
            paddingLeft: 4
        }
    ),
    pauseIconNew: icon(
        'pause-circle',
        'material-community',
        30,
        GlobalColors.textRippleColor
    ),
    pauseIcon: icon(
        'ios-pause',
        'ionicon',
        30,
        '#007495',
        GlobalColors.transparent
    ),
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
        GlobalColors.primaryButtonColor,
        'normal'
    ),
    planeRSWhite: icon(
        'airplane',
        'material-community',
        16,
        GlobalColors.white
    ),
    playIcon: icon(
        'ios-play',
        'ionicon',
        30,
        '#007495',
        GlobalColors.transparent
    ),
    playIconNew: icon('play', 'ionicon', 18, GlobalColors.textRippleColor),
    redClose: icon(
        'ios-close',
        'ionicon',
        50,
        GlobalColors.white,
        'red',
        '500'
    ),
    redWarning: icon('alert', 'material-community', 20, GlobalColors.red),
    refresh: icon(
        'ios-refresh',
        'ionicon',
        35,
        GlobalColors.primaryButtonColor,
        GlobalColors.translucentDark,
        '500'
    ),
    renderIcon,
    satelliteChatStatusClose: icon(
        'ios-close',
        'ionicon',
        20,
        GlobalColors.red,
        GlobalColors.statusBarBackgroundColor,
        '500'
    ),
    search: icon(
        'search',
        'evilicon',
        24,
        GlobalColors.primaryButtonColor,
        GlobalColors.transparent
    ),
    bookmark: icon(
        'bookmark',
        'evilicon',
        24,
        GlobalColors.primaryButtonColor,
        GlobalColors.transparent
    ),
    searchClear: icon(
        'search',
        'evilicon',
        24,
        GlobalColors.primaryButtonColor,
        GlobalColors.transparent
    ),
    sliderClose: icon(
        'ios-close-circle',
        'ionicon',
        24,
        GlobalColors.accent,
        GlobalColors.accent,
        '500'
    ),
    speakerOff: icon(
        'ios-volume-off',
        'ionicon',
        50,
        GlobalColors.darkGray,
        'red',
        '500'
    ),
    speakerOn: icon('unmute', 'octicon', 10, GlobalColors.darkGray, 'red'),
    square: icon('md-square', 'ionicon', 28, GlobalColors.red),
    time: icon('ios-time-outline', 'ionicon', 20, GlobalColors.frontmLightBlue),
    toolbarSave: icon('download', 'feather', 30, GlobalColors.frontmLightBlue),
    toolbarSaveDisbled: icon(
        'download',
        'feather',
        30,
        GlobalColors.frontmLightBlueTransparent
    ),
    userPosition: icon('md-locate', 'ionicon', 15, GlobalColors.headerBlack),
    videocam: icon('videocam', 'material', 30, GlobalColors.white),
    videocam_off: icon('videocam-off', 'material', 30, GlobalColors.white),
    videoRecordCircle: icon('circle', 'font-awesome', 46, '#F00'),
    videoRecorderClose: icon(
        'ios-close',
        'ionicon',
        45,
        GlobalColors.accent,
        GlobalColors.accent,
        '500'
    ),
    zoomIn: icon('md-add', 'ionicon', 15, GlobalColors.headerBlack),
    zoomOut: icon('md-remove', 'ionicon', 15, GlobalColors.headerBlack),
    location: icon('location', 'ionicon', 24, GlobalColors.grey),
    locationSelected: icon('location', 'ionicon', 28, GlobalColors.green),
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
    ),
    upload: icon('upload', 'material-community', 35, GlobalColors.disabledGray),
    dotsVertical: icon(
        'dots-vertical',
        'material-community',
        30,
        GlobalColors.disabledGray
    ),
    camera: icon('camera', 'feather', 35, GlobalColors.frontmLightBlue),
    minus: icon('minus', 'feather', 35, GlobalColors.white),
    squareOutline: icon(
        'ios-square-outline',
        'ionicon',
        16,
        GlobalColors.white
    ),
    checkbox: icon(
        'ios-checkbox-outline',
        'ionicon',
        16,
        GlobalColors.textBlack
    ),
    checkboxFilled: icon('ios-checkbox', 'ionicon', 16, GlobalColors.textBlack),
    checkboxStatus: icon(
        'indeterminate-check-box',
        'material',
        16,
        GlobalColors.white
    ),

    presentToAll: icon('present-to-all', 'material', 30, GlobalColors.white),
    videoCallCam: icon(
        'video-outline',
        'material-community',
        30,
        GlobalColors.white
    ),
    videoCallCamOff: icon(
        'video-off-outline',
        'material-community',
        30,
        GlobalColors.white
    ),
    videoCallMute: icon('keyboard-voice', 'material', 30, GlobalColors.white),
    videoCallRecord: icon(
        'circle-slice-8',
        'material-community',
        30,
        GlobalColors.white
    ),
    videoCallEnd: icon('logout', 'material-community', 30, GlobalColors.white),
    deleteAcc: icon(
        'close-box-outline',
        'material-community',
        30,
        GlobalColors.white
    ),
    headerGroupAdd: icon(
        'add-circle',
        'ionicon',
        30,
        GlobalColors.primaryColor
    ),
    newGroupAdd: icon(
        'account-group',
        'material-community',
        30,
        GlobalColors.white
    ),
    userIcon: icon(
        'user',
        'evilicon',
        GlobalColors.headerGreyBtn,
        GlobalColors.headerGreyBtn
    ),
    userCancel: icon('close', 'ionicon', 24, GlobalColors.white),
    userSelected: icon('checkmark', 'ionicon', 24, GlobalColors.primaryColor),
    timelineSearch: icon('ios-search-sharp', 'ionicon'),
    addParticipant: icon('plus-circle-outline', 'material-community'),
    contactCall: icon('call', 'material'),
    contactEmail: icon('email-outline', 'material-community'),
    arrowRight: icon('keyboard-arrow-right', 'material'),
    userConnect: icon('user-plus', 'feather', 20, GlobalColors.primaryColor)
}; // DATACARD //CHANNELS //FILES //SEARCH BOX //CALLSCREEN //FORM // MAP

export default Icons;
