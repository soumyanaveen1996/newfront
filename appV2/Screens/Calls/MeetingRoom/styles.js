import { StyleSheet, PixelRatio, Platform } from 'react-native';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp
} from 'react-native-responsive-screen';
import GlobalColors from '../../../config/styles';

const bigButtonSize = hp('8%');
const smallButtonSize = hp('6%');
const bigButtonRadius = bigButtonSize / 2;
const smallButtonRadius = smallButtonSize / 2;

export default StyleSheet.create({
    container: {
        width: '100%',
        height: '100%',
        backgroundColor: GlobalColors.textBlack,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    rtcview: {
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        flex: 1
    },
    androidRtcView: {
        justifyContent: 'center',
        alignItems: 'flex-end',
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        flex: 1
    },
    rtc: {
        flex: 1,
        width: '100%',
        height: '100%',
        alignItems: 'flex-end',
        resizeMode: 'cover'
    },
    localStream: {
        height: '20%',
        width: '25%',
        margin: 10,
        borderRadius: 5,
        position: 'absolute',
        bottom: hp('10%'),
        left: 0,
        borderColor: 'white',
        borderWidth: 2,
        zIndex: 10
    },
    videoCallerName: {
        margin: 10,
        position: 'absolute',
        bottom: hp('31%'),
        left: 0,
        backgroundColor: GlobalColors.videoControlBackground,
        zIndex: 10,
        padding: 10,
        borderRadius: 10
    },
    videoCallNameText: {
        color: GlobalColors.white
    },
    androidLocalStream: {
        height: '20%',
        width: '25%',
        margin: 15,
        borderRadius: 5,
        position: 'absolute',
        borderColor: 'white',
        borderWidth: 2
    },
    loadingArea: {
        width: '100%',
        marginTop: 48,
        alignItems: 'center',
        justifyContent: 'center'
    },
    waitingMessage: {
        fontSize: PixelRatio.getPixelSizeForLayoutSize(10),
        alignSelf: 'center',
        color: GlobalColors.white,
        margin: 16
    },
    loading: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent'
    },
    callingContainer: {
        display: 'flex',

        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-around'
        // ...Platform.select({
        //     android: {
        //         marginTop: hp('5%')
        //     },
        //     ios: {
        //         marginTop: hp('10%')
        //     }
        // })
    },
    callingNumberText: {
        color: 'rgba(255,255,255,1)',
        fontSize: 26,
        textAlign: 'center'
    },
    callStatusText: {
        color: 'rgba(47,199,111,1)',
        fontSize: hp('2%'),
        textAlign: 'center',
        marginTop: hp('3%')
    },
    videoAvatar: {
        flex: 1,
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 3
    },
    videoAvatarImage: {
        height: hp('30%'),
        width: hp('100%'),
        position: 'absolute'
    },
    avatar: {
        height: hp('20%'),
        width: hp('20%'),
        borderRadius: hp('20%') / 2,
        zIndex: 3
    },
    avatarImage: {
        height: '100%',
        width: '100%'
    },
    buttonLayout: {
        width: '100%',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'transparent',
        ...Platform.select({
            ios: {},
            android: { elevation: 5 }
        })
    },
    callingToggleButtonsArea: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'center',
        alignContent: 'center'
    },
    callingVideoButtonsArea: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
        alignContent: 'flex-end',
        backgroundColor: GlobalColors.videoControlBackground,
        paddingVertical: 10
    },
    button: {
        backgroundColor: GlobalColors.white,
        marginVertical: 10,
        marginHorizontal: 14,
        aspectRatio: 1,
        height: bigButtonSize,
        borderRadius: bigButtonRadius,
        justifyContent: 'center',
        alignItems: 'center'
    },
    buttonDisabled: {
        backgroundColor: GlobalColors.darkGray,
        marginVertical: 10,
        marginHorizontal: 14,
        aspectRatio: 1,
        height: bigButtonSize,
        borderRadius: bigButtonRadius,
        justifyContent: 'center',
        alignItems: 'center'
    },
    videoButton: {
        backgroundColor: GlobalColors.videoCallIconBackground,
        marginVertical: 10,
        marginHorizontal: 15,
        aspectRatio: 1,
        height: smallButtonSize,
        borderRadius: smallButtonRadius,
        justifyContent: 'center',
        alignItems: 'center'
    },
    videoButtonDisabled: {
        backgroundColor: GlobalColors.white,
        marginVertical: 10,
        marginHorizontal: 15,
        aspectRatio: 1,
        height: smallButtonSize,
        borderRadius: smallButtonRadius,
        justifyContent: 'center',
        alignItems: 'center'
    },
    videoPhoneHangupButton: {
        backgroundColor: GlobalColors.red,
        marginVertical: 10,
        marginHorizontal: 15,
        aspectRatio: 1,
        height: smallButtonSize,
        borderRadius: smallButtonRadius,
        justifyContent: 'center',
        alignItems: 'center'
    },
    phoneHangupButton: {
        backgroundColor: GlobalColors.red,
        margin: 10,
        marginTop: 15,
        aspectRatio: 1,
        height: bigButtonSize,
        borderRadius: bigButtonRadius,
        justifyContent: 'center',
        alignItems: 'center'
    },
    videoDurationContainer: {
        backgroundColor: GlobalColors.videoControlBackground,
        width: '100%',
        paddingVertical: 10,
        paddingHorizontal: 10
    },
    videoCallDuration: {
        color: GlobalColors.white,
        fontSize: 15
    }
});
