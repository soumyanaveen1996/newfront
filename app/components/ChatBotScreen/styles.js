import { Platform, StyleSheet, Dimensions } from 'react-native';
import { GlobalColors } from '../../config/styles';
import Config from './config';
import { ButtonStyle } from '../../lib/capability';

import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp
} from 'react-native-responsive-screen';

var screen = Dimensions.get('window');

const stylesheet = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: 'rgb(248, 248, 248)'
    },
    container: {
        flex: 1,
        justifyContent: 'flex-end'
    },
    messagesList: {
        // height: hp('80%'),
        flexGrow: 0,
        overflow: 'visible'
        // flexDirection: 'column-reverse'
    },
    row: {
        marginTop: 12,
        flexDirection: 'row',
        alignItems: 'flex-end'
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
        width: 30,
        marginHorizontal: 10
    },
    placeholderProfilePic: {
        height: 30,
        width: 30,
        marginHorizontal: 10,
        borderRadius: 15
    },
    bubble: {
        maxWidth: '85%',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderTopLeftRadius: 0,
        borderTopRightRadius: 10,
        borderBottomRightRadius: 10,
        borderBottomLeftRadius: 10,
        backgroundColor: GlobalColors.white,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    rightBubble: {
        backgroundColor: GlobalColors.tabBackground,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 0,
        borderBottomRightRadius: 10,
        borderBottomLeftRadius: 10
    },
    stdNotifBubble: {
        backgroundColor: GlobalColors.stdNotifBlue,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        borderBottomRightRadius: 10,
        borderBottomLeftRadius: 10,
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
    criticalBubble: {
        backgroundColor: GlobalColors.criticalYellow,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        borderBottomRightRadius: 10,
        borderBottomLeftRadius: 10,
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
        backgroundColor: GlobalColors.botChatBubbleColor,
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
    message: {
        paddingLeft: 10,
        fontSize: 16,
        color: GlobalColors.chatLeftTextColor
    },
    rightMessage: {
        paddingLeft: 15,
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
        fontWeight: 'bold',
        paddingRight: 10
    },
    chatTextInput: {
        marginVertical: 7,
        paddingRight: 20,
        paddingLeft: 10,
        paddingTop: 7,
        paddingBottom: Platform.OS === 'android' ? 10 : 0,
        fontSize: 16,
        alignSelf: 'center',
        flex: 1,
        backgroundColor: GlobalColors.white,
        minHeight: 35,
        maxHeight: 110
    },
    moreOptionContainer: {
        position: 'absolute',
        left: 30,
        bottom: 70,
        width: wp('85%'),
        height: 180,
        borderRadius: 10,
        backgroundColor: 'white',
        paddingHorizontal: 15,
        paddingVertical: 15,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        flexWrap: 'wrap',
        alignContent: 'stretch',
        shadowOffset: { width: 0, height: 0 },
        shadowColor: 'black',
        shadowOpacity: 0.15
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
        width: '33.33%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    optionText: {
        color: 'rgba(158, 158, 158, 1)',
        fontFamily: 'SF Pro Text',
        fontSize: 12
    },
    chatBarMoreButton: {
        width: 16,
        height: 15,
        marginHorizontal: 10
    },
    closeMoreButton: {
        width: 16,
        height: 15,
        marginHorizontal: 10,
        transform: [{ rotate: '45deg' }]
    },
    cancelButton: {
        width: 32,
        height: 32,
        marginLeft: 10,
        marginRight: 5
    },
    recordingTimeContainer: {
        flex: 1
    },
    recordingTime: {
        color: GlobalColors.accent,
        fontSize: 25,
        textAlign: 'center',
        width: '100%'
    },
    micContainer: {
        width: 20,
        height: 20,
        marginRight: 5,
        marginLeft: 10
    },
    chatBarSpeakButton: {
        width: 11,
        height: 20
    },
    chatBarSendButton: Platform.select({
        ios: {
            width: 22,
            height: 20,
            marginRight: 10,
            marginLeft: 10
        },
        android: {
            width: 22,
            height: 20,
            marginRight: 10,
            marginLeft: 10
        }
    }),
    headerTitle: {
        fontSize: 17,
        color: GlobalColors.white,
        fontWeight: '500'
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
    metadataRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginVertical: 3
    },
    metadataRightRow: {
        flexDirection: 'row-reverse'
    },
    date: {
        marginTop: 2,
        color: 'rgb(164, 164, 164)',
        fontSize: 11,
        marginHorizontal: 5
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
        borderColor: 'rgb(164, 164, 164)'
    },
    sessionStartHorizontalLine: {
        flex: 1,
        borderBottomColor: 'grey',
        borderBottomWidth: 0.35,
        marginRight: 5
    },
    sessionStartHorizontalLineRight: {
        marginRight: 0,
        marginLeft: 5
    },
    sessionStartText: {
        textAlign: 'center',
        color: 'rgb(164, 164, 164)',
        fontWeight: 'bold',
        fontStyle: 'italic',
        marginBottom: 10,
        fontSize: 12
    },
    buttonMsgParent: {
        flexDirection: 'row',
        marginTop: 20,
        width: '100%'
    },
    userNameStyle: {
        display: 'flex',
        color: GlobalColors.chatLeftTextColor,
        fontWeight: '600',
        fontSize: 12,
        paddingLeft: 10,
        marginBottom: 3,
        fontStyle: 'italic',
        height: 15
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
        width: '85%',
        alignSelf: 'center',
        flexDirection: 'row',
        backgroundColor: 'rgb(255, 255, 255)',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 10,
        marginBottom: 10,
        borderColor: 'rgba(91,91,91,0.2)'
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

    //CONTACT_CARD
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
        borderWidth: 0.2,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.08,
        shadowRadius: 4
    },
    contactCardModalText: {
        textAlign: 'left',
        fontSize: 16,
        color: GlobalColors.headerBlack,
        fontWeight: '100'
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
        borderColor: GlobalColors.sideButtons,
        backgroundColor: GlobalColors.white,
        borderRadius: 5
    },
    contactCardModalCancelButtonText: {
        fontSize: 16,
        color: GlobalColors.sideButtons
    },
    contactCardModalOkButton: {
        width: '40%',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: GlobalColors.sideButtons,
        backgroundColor: GlobalColors.sideButtons,
        borderRadius: 5
    },
    contactCardModalOkButtonText: {
        fontSize: 16,
        color: GlobalColors.white
    },

    //TAPTOOPENFILE
    fileCard: {
        backgroundColor: GlobalColors.white,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: GlobalColors.disabledGray,
        width: 110,
        height: 110,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.08,
        shadowRadius: 2
    },
    fileCardSmall: {
        backgroundColor: GlobalColors.white,
        borderRadius: 5,
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center'
    },
    fileType: {
        position: 'absolute',
        alignSelf: 'center',
        color: GlobalColors.white,
        fontWeight: 'bold'
    },
    downloadIcon: {
        width: 30,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 15,
        position: 'absolute',
        right: '15%',
        bottom: '15%',
        backgroundColor: GlobalColors.sideButtons
    },
    downloadIconRight: {
        width: 30,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 15,
        backgroundColor: GlobalColors.sideButtons
    },
    //SEARCH BOX
    searchBoxContainer: {
        maxHeight: (Dimensions.get('screen').height / 100) * 40,
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
        color: GlobalColors.sideButtons
    },
    searchBoxText: {
        fontSize: 16,
        fontWeight: '200',
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
    }
});

export function chatBarStyle(network) {
    if (network === 'none') {
        return [stylesheet.chatBar, stylesheet.chatBarNoNetwork];
    } else if (network === 'satellite') {
        return [stylesheet.chatBar, stylesheet.chatBarSatellite];
    } else {
        return [stylesheet.chatBar];
    }
}

export function buttonStyle(style) {
    if (style === ButtonStyle.bright) {
        return [stylesheet.buttonMessage, stylesheet.buttonBright];
    } else {
        return [stylesheet.buttonMessage, stylesheet.buttonLight];
    }
}

export function buttonTextStyle(style) {
    if (style === ButtonStyle.bright) {
        return [stylesheet.buttonBrightText];
    } else {
        return [stylesheet.buttonLightText];
    }
}

export function chatMessageStyle(alignRight = false) {
    if (alignRight) {
        return [stylesheet.chatMsg, { justifyContent: 'flex-end' }];
    } else {
        return stylesheet.chatMsg;
    }
}

export function chatMessageTextStyle(alignRight = false) {
    if (alignRight) {
        return [stylesheet.message, stylesheet.rightMessage];
    } else {
        return stylesheet.message;
    }
}

export function chatMessageImageStyle(alignRight = false) {
    if (alignRight) {
        return [stylesheet.imageMessage, { borderColor: GlobalColors.accent }];
    } else {
        return stylesheet.imageMessage;
    }
}

export function tapToLoadTextContainerStyle(alignRight = false) {
    if (alignRight) {
        return stylesheet.tapToLoadTextContainer;
    } else {
        return stylesheet.tapToLoadTextContainer;
    }
}

export function chatMessageContainerStyle(alignRight = false) {
    if (alignRight) {
        return [stylesheet.row, stylesheet.rightRow];
    } else {
        return stylesheet.row;
    }
}

export function metadataContainerStyle(alignRight = false, hasImage = false) {
    var styles = [stylesheet.metadataRow];
    if (alignRight) {
        styles.push(stylesheet.metadataRightRow);
    }
    if (hasImage) {
        styles.push({ marginHorizontal: 50 });
    } else {
        styles.push({ marginHorizontal: 12 });
    }
    return styles;
}

export function videoContainerStyle(alignRight = false, imageSource) {
    if (alignRight) {
        return [stylesheet.videoContainer, stylesheet.rightVideoContainer];
    } else {
        return stylesheet.videoContainer;
    }
}

export function chatMessageBubbleStyle(alignRight = false, imageSource) {
    if (alignRight) {
        if (imageSource) {
            return [stylesheet.bubble, stylesheet.rightBubble];
        } else {
            return [stylesheet.bubble, stylesheet.rightBubble];
        }
    } else {
        if (imageSource) {
            return stylesheet.bubble;
        } else {
            return stylesheet.bubble;
        }
    }
}

export function talkIconSign(alignRight = false) {
    if (alignRight) {
        return [
            stylesheet.talkIcon,
            stylesheet.talkRightIcon,
            { borderLeftColor: GlobalColors.accent, marginRight: 15 }
        ];
    } else {
        return [
            stylesheet.talkIcon,
            stylesheet.talkLeftIcon,
            { borderRightColor: GlobalColors.botChatBubbleColor }
        ];
    }
}

export function ellipsisMessageBubbleStyle(alignRight = false, imageSource) {
    if (alignRight) {
        if (imageSource) {
            return [stylesheet.ellipsisBubble, stylesheet.rightEllipsisBubble];
        } else {
            return [
                stylesheet.ellipsisBubble,
                stylesheet.rightEllipsisBubble,
                { marginRight: 15 }
            ];
        }
    } else {
        if (imageSource) {
            return [stylesheet.ellipsisBubble];
        } else {
            return [stylesheet.ellipsisBubble, { marginLeft: 15 }];
        }
    }
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
    }
});

export function networkStatusBarStyle(network) {
    if (network === 'none') {
        return [ChatStatusBarStyles.chatStatusBar];
    } else if (network === 'satellite') {
        return [
            ChatStatusBarStyles.chatStatusBar,
            ChatStatusBarStyles.chatStatusBarSatellite
        ];
    } else {
    }
}

export function networkStatusBarTextStyle(network) {
    if (network === 'none') {
        return [ChatStatusBarStyles.statusMessage];
    } else if (network === 'satellite') {
        return [
            ChatStatusBarStyles.statusMessage,
            ChatStatusBarStyles.statusMessageSatellite
        ];
    } else {
    }
}

export const leftIconStyle = {
    type: 'ionicon',
    name: 'ios-arrow-back',
    size: 26,
    underlayColor: 'transparent',
    color: '#fff',
    fontWeight: '500'
};

export const imageLoader = {
    size: 'large',
    color: 'gray'
};

export default stylesheet;
