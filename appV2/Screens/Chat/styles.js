import { Platform, StyleSheet, Dimensions } from 'react-native';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp
} from 'react-native-responsive-screen';
import GlobalColors from '../../config/styles';
import Config from './config';
import { ButtonStyle } from '../../lib/capability';
import AppFonts from '../../config/fontConfig';

const screen = Dimensions.get('screen');

const stylesheet = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: GlobalColors.appBackground
    },
    safeArea1to1: {
        flex: 1,
        backgroundColor: GlobalColors.chatBackground
    },
    container: {
        flex: 1,
        justifyContent: 'flex-end'
    },
    messagesList: {
        flex: 1,
        backgroundColor: GlobalColors.chatBackground,
        marginBottom: 20
    },
    mapViewWidth: {
        width: screen.width - 80
    },
    rowWithDateTime: {
        marginTop: 10,
        flexDirection: 'row',
        alignItems: 'flex-start'
    },
    rowNormalMsg: {
        // marginTop: 6,
        flexDirection: 'row',
        alignItems: 'flex-start'
    },
    rightRow: {
        flexDirection: 'row-reverse'
    },
    avatar: {
        borderRadius: 20,
        width: 40,
        height: 40,
        marginRight: 10
    },
    profilePic: {
        height: 40,
        width: 40,
        borderRadius: 20,
        marginHorizontal: 20
    },
    placeholderProfilePic: {
        height: 40,
        width: 40,
        borderRadius: 20,
        marginHorizontal: 20
    },
    chatProfilePic: {
        height: 24,
        width: 24,
        borderRadius: 15,
        marginHorizontal: 12
    },
    chatPlaceholderProfilePic: {
        height: 24,
        width: 24,
        borderRadius: 15,
        marginHorizontal: 12
    },
    bubble: {
        paddingVertical: 5,
        backgroundColor: GlobalColors.chatBackground,
        flexDirection: 'row',
        width: screen.width - 80
        // justifyContent: 'center',
        // alignItems: 'center'
    },
    showTimebubble: {
        paddingBottom: 5,
        paddingTop: 1,
        backgroundColor: GlobalColors.chatBackground,
        flexDirection: 'row',
        width: screen.width - 80

        // justifyContent: 'center',
        // alignItems: 'center'
    },
    rightBubble: {
        backgroundColor: GlobalColors.tabBackground
    },
    stdNotifBubble: {
        marginLeft: 48,
        marginRight: 30
    },
    criticalBubble: {
        backgroundColor: GlobalColors.criticalYellow,
        ...Platform.select({
            ios: {
                shadowColor: 'rgba(0,0,0,0.1)',
                shadowOffset: { width: 1, height: 2 },
                shadowOpacity: 0.3
            },
            android: {
                elevation: 1
            }
        })
    },
    callNotifWrapper: {
        justifyContent: 'space-between',
        flexDirection: 'row',
        width: '80%',
        marginLeft: 48,
        paddingRight: 45,
        alignItems: 'center',
        marginTop: 5
    },
    notificationNormalContainer: {
        alignItems: 'center',
        alignContent: 'center',
        flexDirection: 'row',
        justifyContent: 'center'
    },
    normalNotificationTxt: {
        fontSize: 14,
        color: GlobalColors.primaryTextColor,
        fontWeight: AppFonts.LIGHT,
        textAlign: 'center'
    },
    normalNotifWrapper: {
        justifyContent: 'space-between',
        marginTop: 15,
        marginHorizontal: 24
    },
    videoContainer: {
        padding: 5,
        backgroundColor: GlobalColors.botChatBubbleColor
    },
    rightVideoContainer: {
        backgroundColor: GlobalColors.accent
    },
    ellipsisBubble: {
        height: 30,
        width: 75,
        borderTopLeftRadius: 0,
        borderTopRightRadius: 10,
        borderBottomRightRadius: 10,
        borderBottomLeftRadius: 10,
        // backgroundColor: GlobalColors.botChatBubbleColor,
        overflow: 'hidden'
    },
    ellipsis: {
        color: GlobalColors.white,
        fontSize: 50,
        top: -25,
        textAlign: 'left'
    },
    rightEllipsisBubble: {
        backgroundColor: GlobalColors.accent,
        borderBottomRightRadius: 0,
        borderBottomLeftRadius: 8
    },
    textMsgWrapper: {
        flexDirection: 'row',
        width: screen.width - 60,
        color: GlobalColors.textBlack
    },
    audioMsgContainer: {
        marginLeft: 48,

        borderRadius: 6
    },
    imageDeliveryIcon: {
        bottom: 0,
        right: 0,
        margin: 8,
        opacity: 0.7,
        position: 'absolute',
        alignSelf: 'flex-end',
        marginLeft: 10
    },
    textMsgDeliveryICon: {
        paddingHorizontal: 10,
        opacity: 1,
        alignSelf: 'flex-end'
    },
    downloadIconStyle: {
        justifyContent: 'space-between'
        // alignItems: 'flex-start'
    },
    imageViewParent: {
        marginLeft: 46,
        alignItems: 'flex-start',
        flexDirection: 'column'
    },
    imageWithName: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        //   marginBottom:-6,
        justifyContent: 'flex-start'
    },
    message: {
        fontSize: 14,
        color: GlobalColors.chatTextColor,
        fontWeight: AppFonts.LIGHT // light
    },
    messageWithUsername: {
        fontSize: 14,
        color: GlobalColors.gunmetal,
        fontWeight: AppFonts.LIGHT,
        borderColor: 'green',
        borderWidth: 1,
        marginTop: -12
    },
    rightMessage: {
        marginLeft: 15,
        color: GlobalColors.chatRightTextColor
    },
    imageMessage: {
        width: Config.ChatImageOptions.width,
        height: Config.ChatImageOptions.height,
        alignItems: 'flex-end',
        borderWidth: 4,
        borderColor: GlobalColors.botChatBubbleColor
    },
    sender: {
        fontWeight: AppFonts.BOLD,
        paddingRight: 10
    },
    chatTextInput: {
        paddingLeft: 10,
        fontSize: 16,
        // alignSelf: 'center',
        // backgroundColor: GlobalColors.white,
        minHeight: 35,
        // maxHeight: 110,
        flex: 6.5,
        color: GlobalColors.primaryTextColor,
        paddingRight: 6
    },
    moreOptionContainer: {
        // position: 'absolute',
        // left: 30,
        // bottom: 0,
        // width: wp('85%'),
        // height: 180,
        // borderTopLeftRadius: 20,
        // borderTopRightRadius: 20,
        flex: 1,
        paddingHorizontal: 15,
        paddingTop: 15,
        // flexDirection: 'row',
        justifyContent: 'space-around',
        // flexWrap: 'wrap',
        alignContent: 'center'
    },
    moreOptionImageContainer: {
        width: 45,
        height: 45,
        borderRadius: 25,
        backgroundColor: 'rgba(244,244,244,1)',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99
    },
    moreOptionImageContainerHide: {
        width: 45,
        height: 45,
        borderRadius: 25,
        backgroundColor: GlobalColors.transparent,
        alignItems: 'center',
        justifyContent: 'center'
    },
    optionContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingLeft: 15,
        height: 40
    },
    optionImage: {
        width: '42%',
        height: '42%',
        resizeMode: 'contain'
    },
    optionText: {
        color: 'rgb(42,45,60)',
        fontSize: 14
    },
    chatBarMoreButton: {
        width: 18,
        height: 18
    },

    cancelButton: {
        width: 32,
        height: 32,
        marginLeft: 10,
        marginRight: 5,
        alignItems: 'center',
        justifyContent: 'center'
    },
    recordingTimeContainer: {
        flex: 1
    },
    recordingTime: {
        color: GlobalColors.primaryTextColor,
        fontSize: 25,
        textAlign: 'center',
        width: '100%'
    },
    micContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: GlobalColors.bgRippleColor,
        alignItems: 'center',
        justifyContent: 'center'
    },
    rightMediaIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center'
    },
    chatBarSpeakButton: {
        width: 11,
        height: 20
    },
    chatBarSendButton: {
        width: 22,
        height: 20,
        marginRight: 10,
        marginLeft: 10,
        tintColor: GlobalColors.primaryButtonColor
    },
    headerTitle: {
        fontSize: 17,
        color: GlobalColors.white,
        fontWeight: AppFonts.NORMAL
    },
    leftIcon: {
        fontSize: 26,
        color: 'rgb(115,119,134)'
    },
    loading: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center'
    },
    botLoadingStatusText: {
        position: 'absolute',
        top: '50%',
        color: GlobalColors.chatTitle,
        marginTop: 50
    },

    metadataRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginVertical: 3
    },
    metadataRightRow: {
        flexDirection: 'row-reverse'
    },
    date: {
        // marginTop: 2,
        color: '#98b0c8',
        fontSize: 12,
        marginHorizontal: 6,
        textAlign: 'center'
    },
    dataNoMargin: {
        marginHorizontal: 0
    },
    datawMargin: {
        marginHorizontal: 5
    },
    tapToLoadText: {
        textAlign: 'center',
        color: GlobalColors.accent
    },
    tapToLoadTextContainer: {
        width: Config.ChatImageOptions.width,
        height: Config.ChatImageOptions.height,
        backgroundColor: GlobalColors.disabledGray,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 4,
        borderColor: GlobalColors.botChatBubbleColor
    },
    favIcon: {
        flex: 1,
        marginLeft: 10,
        marginRight: 10
    },
    favIconImage: {
        width: 20,
        height: 30
    },
    htmlMessageImage: {
        width: 20,
        height: 20
    },
    talkLeftIcon: {
        borderRightWidth: 0
    },
    talkRightIcon: {
        borderLeftWidth: 0,
        alignItems: 'flex-start',
        justifyContent: 'flex-start'
    },
    talkIcon: {
        alignSelf: 'flex-end',
        marginBottom: 8,
        width: 10,
        height: 10,
        borderTopColor: 'transparent',
        borderTopWidth: 5,
        borderBottomWidth: 5,
        borderBottomColor: 'transparent'
    },
    chatMsg: {
        flexDirection: 'row',
        width: '80%'
    },
    sessionStartMessage: Platform.select({
        ios: {
            flexDirection: 'row',
            marginTop: 25,
            marginBottom: -5,
            alignItems: 'center'
        },
        android: {
            flexDirection: 'row',
            marginTop: 25,
            alignItems: 'center'
        }
    }),
    sessionStartTextContainer: {
        borderBottomWidth: 1,
        borderColor: '#cbd7e3'
    },
    sessionStartHorizontalLine: {
        flex: 1,
        borderBottomColor: GlobalColors.secondaryButtonColorDisabled,
        borderBottomWidth: 1
    },
    sessionStartHorizontalLineRight: {
        marginRight: 0
    },
    sessionStartText: {
        textAlign: 'center',
        color: GlobalColors.primaryTextColor,
        fontWeight: AppFonts.SEMIBOLD,
        fontSize: 11
    },
    sessionDeviderTxtContainer: {},
    buttonMsgParent: {
        flexDirection: 'row',
        marginTop: 20,
        width: '100%'
    },
    userNameStyle: {
        color: GlobalColors.chatUser,
        fontWeight: AppFonts.BOLD,
        lineHeight: 16,
        fontSize: 14,
        fontWeight: AppFonts.BOLD
    },
    buttonMessage: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'stretch',
        padding: 10
    },
    buttonBright: {
        backgroundColor: GlobalColors.botChatBubbleColor,
        borderColor: GlobalColors.transparent,
        borderRadius: 4,
        shadowColor: GlobalColors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 3
    },
    buttonLight: {
        borderColor: GlobalColors.botChatBubbleColor,
        borderWidth: 1,
        borderRadius: 4
    },
    buttonLightText: {
        color: GlobalColors.botChatBubbleColor
    },
    buttonBrightText: {
        color: GlobalColors.chatLeftTextColor
    },
    formButtonWrapper: {
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        borderBottomRightRadius: 8,
        borderBottomLeftRadius: 8,
        backgroundColor: GlobalColors.white,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: '90%',
        height: 54
    },

    formButton: {
        backgroundColor: GlobalColors.white,
        borderColor: GlobalColors.chatLeftTextColor,
        borderWidth: 1,
        borderRadius: 4,
        width: '80%',
        paddingVertical: 8,
        justifyContent: 'center',
        alignItems: 'center'
    },
    formButtonText: {
        color: GlobalColors.chatLeftTextColor
    },
    closeButton: {
        height: 24,
        width: 24,
        marginLeft: 15,
        paddingTop: 8
    },
    statusBarNetOn: {
        flexDirection: 'row',
        height: 30,
        backgroundColor: 'rgb(255, 218, 185)'
    },
    statusBarNetOff: {
        flexDirection: 'row',
        height: 30,
        backgroundColor: 'rgb(248, 248, 248)'
    },
    chatBar: {
        width: '100%',
        // alignSelf: 'center',
        flexDirection: 'row',
        backgroundColor: GlobalColors.appBackground,
        // alignItems: 'flex-end',
        // borderColor: 'rgba(91,91,91,0.2)',
        minHeight: 58,
        justifyContent: 'space-between',
        paddingVertical: 4,
        paddingHorizontal: 10,
        ...Platform.select({
            ios: {
                shadowColor: 'rgba(0,0,0,0.1)',
                shadowOffset: { width: 1, height: 2 },
                shadowOpacity: 0.3
            },
            android: {
                elevation: 5
            }
        })
    },
    chatBarSatellite: {
        backgroundColor: 'rgb(255, 218, 185)'
    },
    chatBarNoNetwork: {
        backgroundColor: 'rgb(192, 201, 208)'
    },
    headerRightView: {
        flexDirection: 'row',
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    callModal: {
        justifyContent: 'center',
        borderRadius: Platform.OS === 'ios' ? 30 : 0,
        shadowRadius: 10,
        width: screen.width - 100,
        height: 250
    },

    // CONTACT_CARD
    contactMessage: {
        padding: 15
    },
    contactCardModalContainer: {
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'stretch',
        paddingHorizontal: 20,
        paddingVertical: 25,
        backgroundColor: GlobalColors.white,
        borderRadius: 10,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.08,
        shadowRadius: 4
    },
    contactCardModalText: {
        textAlign: 'left',
        fontSize: 16,
        color: GlobalColors.headerBlack,
        fontWeight: AppFonts.THIN
    },
    contactCardModalBottomArea: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 50
    },
    contactCardModalCancelButton: {
        width: '40%',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: GlobalColors.primaryButtonColor,
        backgroundColor: GlobalColors.white,
        borderRadius: 5
    },
    contactCardModalCancelButtonText: {
        fontSize: 16,
        color: GlobalColors.primaryButtonColor
    },
    contactCardModalOkButton: {
        width: '40%',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: GlobalColors.primaryButtonColor,
        backgroundColor: GlobalColors.primaryButtonColor,
        borderRadius: 5
    },
    contactCardModalOkButtonText: {
        fontSize: 16,
        color: GlobalColors.white
    },
    contactContainerchat: {
        marginTop: 10,
        marginLeft: 48,
        marginRight: 20,
        width: '80%',
        alignItems: 'flex-start',
        flexDirection: 'row'
    },
    contactCardContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingVertical: 8,
        minHeight: 50,
        width: '100%',
        backgroundColor: GlobalColors.contentBackgroundColor,
        borderRadius: 6
    },
    contactCardTitleTxt: {
        fontSize: 14,
        color: GlobalColors.primaryTextColor,
        marginLeft: 1,
        minWidth: 120
    },

    // SEARCH BOX
    searchBoxContainer: {
        maxHeight: (screen.height / 100) * 40,
        alignItems: 'stretch',
        backgroundColor: GlobalColors.white
    },
    searchBoxTopBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: '5%'
    },
    searchBoxTopBarLine: {
        height: 4,
        width: 110,
        backgroundColor: GlobalColors.disabledGray
    },
    searchBoxTopBarButton: {
        width: '20%',
        overflow: 'visible'
    },
    searchBoxButtonText: {
        fontSize: 16,
        paddingVertical: 15,
        color: GlobalColors.primaryButtonColor
    },
    searchBoxText: {
        fontSize: 16,
        fontWeight: AppFonts.THIN,
        color: GlobalColors.headerBlack
    },
    searchBoxRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: '5%'
    },
    searchBoxCheckbox: {
        paddingHorizontal: 0,
        marginHorizontal: 0,
        borderWidth: 0,
        backgroundColor: GlobalColors.white
    },
    modal: {
        flex: 1,
        borderRadius: 10,
        backgroundColor: GlobalColors.appBackground
    },
    groupConfirm: {
        backgroundColor: '#ffffff',
        borderRadius: 10
    },
    groupModalInnerContainer: {
        paddingTop: 10,
        paddingBottom: 30,
        paddingHorizontal: 30
    },
    groupConfirmText: {
        fontWeight: AppFonts.BOLD,
        fontSize: 18,
        color: '#2a2d3c',
        textAlign: 'center'
    },
    adminSubMsg: {
        color: '#44485a',
        textAlign: 'center',
        fontSize: 15,
        marginVertical: 30
    },
    adminConfirmBtn: {
        backgroundColor: '#0096fb',
        paddingHorizontal: 35,
        paddingVertical: 12,
        borderRadius: 5
    },
    confirmText: {
        color: '#ffffff',
        fontSize: 14,
        textAlign: 'center'
    },
    closeModalContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingTop: 10,
        paddingRight: 10
    },
    modalCloseButton: {
        // height: hp('7%'),
        // width: wp('10%'),
        // paddingTop: hp('2%'),
        // paddingLeft: wp('1%')
    },
    closeImg: {
        height: 48,
        width: 48
    }
});

export function chatBarStyle(network) {
    if (network === 'none') {
        return [stylesheet.chatBar, stylesheet.chatBarNoNetwork];
    }
    if (network === 'satellite') {
        return [stylesheet.chatBar, stylesheet.chatBarSatellite];
    }
    return [stylesheet.chatBar];
}

export function buttonStyle(style) {
    if (style === ButtonStyle.bright) {
        return [stylesheet.buttonMessage, stylesheet.buttonBright];
    }
    return [stylesheet.buttonMessage, stylesheet.buttonLight];
}

export function buttonTextStyle(style) {
    if (style === ButtonStyle.bright) {
        return [stylesheet.buttonBrightText];
    }
    return [stylesheet.buttonLightText];
}

export function chatMessageStyle(alignRight = false) {
    // if (alignRight) {
    //     return [stylesheet.chatMsg, { justifyContent: 'flex-end' }];
    // }
    return stylesheet.chatMsg;
}

export function chatMessageTextStyle(alignRight = false) {
    if (alignRight) {
        return [stylesheet.message, stylesheet.rightMessage];
    }
    return stylesheet.message;
}

export function chatMessageImageStyle(alignRight = false) {
    if (alignRight) {
        return [stylesheet.imageMessage, { borderColor: GlobalColors.accent }];
    }
    return stylesheet.imageMessage;
}

export function tapToLoadTextContainerStyle(alignRight = false) {
    if (alignRight) {
        return stylesheet.tapToLoadTextContainer;
    }
    return stylesheet.tapToLoadTextContainer;
}

export function chatMessageContainerStyle(showTime = false) {
    if (showTime) {
        return stylesheet.rowWithDateTime;
    }
    return stylesheet.rowNormalMsg;
}

export function metadataContainerStyle(alignRight = false, hasImage = false) {
    const styles = [stylesheet.metadataRow];

    styles.push({ marginHorizontal: 12 });

    return styles;
}

export function videoContainerStyle(alignRight = false, imageSource) {
    if (alignRight) {
        return [stylesheet.videoContainer, stylesheet.rightVideoContainer];
    }
    return stylesheet.videoContainer;
}

export function chatMessageBubbleStyle(showTime) {
    if (showTime) {
        return stylesheet.showTimebubble;
    }
    return stylesheet.bubble;
}

export function talkIconSign(alignRight = false) {
    if (alignRight) {
        return [
            stylesheet.talkIcon,
            stylesheet.talkRightIcon,
            { borderLeftColor: GlobalColors.accent, marginRight: 15 }
        ];
    }
    return [
        stylesheet.talkIcon,
        stylesheet.talkLeftIcon,
        { borderRightColor: GlobalColors.botChatBubbleColor }
    ];
}

export function ellipsisMessageBubbleStyle(alignRight = false, imageSource) {
    if (alignRight) {
        if (imageSource) {
            return [stylesheet.ellipsisBubble, stylesheet.rightEllipsisBubble];
        }
        return [
            stylesheet.ellipsisBubble,
            stylesheet.rightEllipsisBubble,
            { marginRight: 15 }
        ];
    }
    if (imageSource) {
        return [stylesheet.ellipsisBubble];
    }
    return [stylesheet.ellipsisBubble, { marginLeft: 15 }];
}

export const ChatStatusBarStyles = StyleSheet.create({
    chatStatusBar: {
        height: 25,
        flexDirection: 'row',
        backgroundColor: 'rgb(192, 201, 208)',
        alignItems: 'center',
        justifyContent: 'center'
    },
    chatStatusBarSatellite: {
        backgroundColor: 'rgb(254, 214, 203)'
    },
    closeButton: {
        height: 24,
        width: 24,
        position: 'absolute',
        top: 2,
        right: 3
    },
    statusMessage: {
        textAlign: 'center',
        color: 'rgb(122, 127, 135)'
    },
    statusMessageSatellite: {
        color: 'rgb(243, 115, 78)'
    },
    filetypeImageContainer: { height: 36, width: 29 },
    fileTypeImage: { width: '100%', height: '100%' },
    playButtonContainer: {
        position: 'absolute',
        alignSelf: 'center',
        top: 66
    },
    downloadIcon: {
        backgroundColor: '#fff',
        borderRadius: 20,
        borderWidth: 0
    }
});

export function networkStatusBarStyle(network) {
    if (network === 'none') {
        return [ChatStatusBarStyles.chatStatusBar];
    }
    if (network === 'satellite') {
        return [
            ChatStatusBarStyles.chatStatusBar,
            ChatStatusBarStyles.chatStatusBarSatellite
        ];
    }
}

export function networkStatusBarTextStyle(network) {
    if (network === 'none') {
        return [ChatStatusBarStyles.statusMessage];
    }
    if (network === 'satellite') {
        return [
            ChatStatusBarStyles.statusMessage,
            ChatStatusBarStyles.statusMessageSatellite
        ];
    }
}

export const leftIconStyle = {
    type: 'ionicon',
    name: 'ios-arrow-back',
    size: 26,
    underlayColor: 'transparent',
    color: '#fff',
    fontWeight: AppFonts.NORMAL
};

export const imageLoader = {
    size: 'large',
    color: 'gray'
};

export default stylesheet;
