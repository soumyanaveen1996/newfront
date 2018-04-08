import {Platform, StyleSheet} from 'react-native';
import { GlobalColors } from '../../config/styles'
import Config from './config';
import { ButtonStyle } from '../../lib/capability';

const stylesheet = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: 'rgb(248, 248, 248)',
    },
    container: {
        flex: 1,
        backgroundColor: GlobalColors.white,
    },
    row: {
        marginTop: 12,
        flexDirection: 'row',
        alignItems: 'flex-end',
    },
    rightRow: {
        flexDirection: 'row-reverse',
    },
    avatar: {
        borderRadius: 20,
        width: 40,
        height: 40,
        marginRight: 10,
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
        borderRadius: 15,
    },
    bubble: {
        maxWidth: '90%',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        borderBottomRightRadius: 8,
        borderBottomLeftRadius: 8,
        backgroundColor: GlobalColors.botChatBubbleColor,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    rightBubble: {
        backgroundColor: GlobalColors.accent,
        borderBottomRightRadius: 8,
        borderBottomLeftRadius: 8,
    },
    videoContainer: {
        padding: 5,
        backgroundColor: GlobalColors.botChatBubbleColor,
    },
    rightVideoContainer: {
        backgroundColor: GlobalColors.accent,
    },
    ellipsisBubble: {
        height: 30,
        width: 75,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        borderBottomRightRadius: 8,
        borderBottomLeftRadius: 8,
        backgroundColor: GlobalColors.botChatBubbleColor,
        overflow: 'hidden',
    },
    ellipsis: {
        color: GlobalColors.white,
        fontSize: 50,
        top: -25,
        textAlign: 'left',
    },
    rightEllipsisBubble: {
        backgroundColor: GlobalColors.accent,
        borderBottomRightRadius: 0,
        borderBottomLeftRadius: 8,
    },
    message: {
        fontSize: 16,
        color: GlobalColors.white,
    },
    rightMessage: {
        color: GlobalColors.white,
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
        paddingRight: 10,
    },
    chatTextInput: {
        paddingHorizontal: 20,
        fontSize: 18,
        flex: 1,
        borderColor: 'rgb(202, 206, 204)',
        backgroundColor: GlobalColors.white,
        borderRadius: 18,
        borderWidth: 1,
        minHeight: 36,
    },
    chatBarMoreButton: {
        width: 32,
        height: 32,
        marginLeft: 10,
        marginRight: 5,
    },
    cancelButton: {
        width: 32,
        height: 32,
        marginLeft: 10,
        marginRight: 5,
    },
    recordingTimeContainer: {
        flex: 1,
    },
    recordingTime: {
        color: GlobalColors.accent,
        fontSize: 25,
        textAlign: 'center',
        width: '100%'
    },
    chatBarSpeakButton: {
        width: 32,
        height: 32,
        marginRight: 10,
        marginLeft: 10,
    },
    chatBarSendButton: {
        width: 32,
        height: 32,
        marginRight: 10,
        marginLeft: 10,
    },
    headerTitle: {
        fontSize: 17,
        color: GlobalColors.white,
        fontWeight: '500'
    },
    leftIcon: {
        fontSize: 26,
        color: 'rgb(115,119,134)',
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
    },
    metadataRightRow: {
        flexDirection: 'row-reverse',
    },
    date: {
        marginTop: 2,
        color: 'rgb(164, 164, 164)',
        fontSize: 11,
        marginHorizontal: 5,
    },
    dataNoMargin: {
        marginHorizontal: 0,
    },
    tapToLoadText: {
        textAlign: 'center',
        color: GlobalColors.accent,
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
        borderRightWidth: 10,
    },
    talkRightIcon: {
        borderLeftWidth: 10,
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
        borderBottomColor: 'transparent',
    },
    chatMsg: {
        flexDirection: 'row',
        width: '80%',
    },
    sessionStartMessage:Platform.select({
        'ios': {
            flexDirection: 'row',
            marginTop: 25,
            marginBottom: -5,
            alignItems: 'center',
        },
        'android': {
            flexDirection: 'row',
            marginTop: 25,
            alignItems: 'center',
        }
    }),
    sessionStartTextContainer: {
        borderBottomWidth: 1,
        borderColor: 'rgb(164, 164, 164)',
    },
    sessionStartHorizontalLine: {
        flex: 1,
        borderBottomColor: 'grey',
        borderBottomWidth: 0.35,
        marginRight: 5,
    },
    sessionStartHorizontalLineRight: {
        marginRight: 0,
        marginLeft: 5,
    },
    sessionStartText: {
        textAlign: 'center',
        color: 'rgb(164, 164, 164)',
        fontWeight: 'bold',
        fontStyle: 'italic',
        fontSize: 12,
    },
    buttonMsgParent: {
        flexDirection: 'row',
        marginTop: 20,
        width: '100%'
    },
    userNameStyle: {
        display: 'flex',
        color: GlobalColors.white,
        fontWeight: '600',
        fontSize: 12,
        marginBottom: 3,
        fontStyle: 'italic',
        height: 15,
    },
    buttonMessage: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'stretch',
        padding: 10,
    },
    buttonBright: {
        backgroundColor: GlobalColors.botChatBubbleColor,
        borderColor: GlobalColors.transparent,
        borderRadius: 4,
        shadowColor: GlobalColors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
    buttonLight: {
        borderColor: GlobalColors.botChatBubbleColor,
        borderWidth: 1,
        borderRadius: 4,
    },
    buttonLightText: {
        color: GlobalColors.botChatBubbleColor,
    },
    buttonBrightText: {
        color: GlobalColors.white,
    },
    formButtonWrapper: {
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        borderBottomRightRadius: 8,
        borderBottomLeftRadius: 8,
        backgroundColor: GlobalColors.botChatBubbleColor,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: '90%',
        height: 54,
    },
    formButton: {
        backgroundColor: GlobalColors.botChatBubbleColor,
        borderColor: GlobalColors.white,
        borderWidth: 1,
        borderRadius: 4,
        width: '80%',
        paddingVertical: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    formButtonText: {
        color: GlobalColors.white,
    },
    closeButton: {
        height:24,
        width:24,
        marginLeft:15,
        paddingTop: 8
    },
    statusBarNetOn: {
        flexDirection: 'row',
        height: 30,
        backgroundColor: 'rgb(255, 218, 185)',
    },
    statusBarNetOff: {
        flexDirection: 'row',
        height: 30,
        backgroundColor: 'rgb(248, 248, 248)',
    },
    chatBar: {
        minHeight: 50,
        maxHeight: 108,
        flexDirection: 'row',
        backgroundColor: 'rgb(248, 248, 248)',
        alignItems: 'center',
        paddingVertical: 7,
        borderTopWidth: 1,
        borderColor: 'rgb(202, 206, 204)',
    },
    chatBarSatellite: {
        backgroundColor: 'rgb(255, 218, 185)',
    },
    chatBarNoNetwork: {
        backgroundColor: 'rgb(192, 201, 208)',
    },
});


export function chatBarStyle(network) {
    if (network === 'none') {
        return [ stylesheet.chatBar, stylesheet.chatBarNoNetwork ];
    } else if (network === 'satellite') {
        return [ stylesheet.chatBar, stylesheet.chatBarSatellite ];
    } else {
        return [ stylesheet.chatBar ];
    }
}

export function buttonStyle(style) {
    if (style === ButtonStyle.bright) {
        return [stylesheet.buttonMessage, stylesheet.buttonBright]
    } else {
        return [stylesheet.buttonMessage, stylesheet.buttonLight];
    }
}

export function buttonTextStyle(style) {
    if (style === ButtonStyle.bright) {
        return [stylesheet.buttonBrightText]
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
        styles.push({ marginHorizontal: 50 })
    } else {
        styles.push({ marginHorizontal: 12 })
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
        return [stylesheet.talkIcon, stylesheet.talkRightIcon, { borderLeftColor: GlobalColors.accent, marginRight: 15 }];
    } else {
        return [stylesheet.talkIcon, stylesheet.talkLeftIcon, { borderRightColor: GlobalColors.botChatBubbleColor }];
    }
}

export function ellipsisMessageBubbleStyle(alignRight = false, imageSource) {
    if (alignRight) {
        if (imageSource) {
            return [stylesheet.ellipsisBubble, stylesheet.rightEllipsisBubble];
        } else {
            return [stylesheet.ellipsisBubble, stylesheet.rightEllipsisBubble, { marginRight: 15 }];
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
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 24,
        flexDirection: 'row',
        backgroundColor: 'rgb(192, 201, 208)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    chatStatusBarSatellite: {
        backgroundColor: 'rgb(254, 214, 203)',
    },
    closeButton: {
        height: 24,
        width: 24,
        position: 'absolute',
        top: 2,
        right: 3,
    },
    statusMessage: {
        textAlign: 'center',
        color: 'rgb(122, 127, 135)',
    },
    statusMessageSatellite: {
        color: 'rgb(243, 115, 78)',
    }
})

export function networkStatusBarStyle(network) {
    if (network === 'none') {
        return [ChatStatusBarStyles.chatStatusBar];
    } else if (network === 'satellite') {
        return [ChatStatusBarStyles.chatStatusBar, ChatStatusBarStyles.chatStatusBarSatellite];
    } else {
    }
}

export function networkStatusBarTextStyle(network) {
    if (network === 'none') {
        return [ChatStatusBarStyles.statusMessage];
    } else if (network === 'satellite') {
        return [ChatStatusBarStyles.statusMessage, ChatStatusBarStyles.statusMessageSatellite];
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
