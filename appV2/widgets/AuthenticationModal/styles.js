import { StyleSheet, Platform, Dimensions } from 'react-native';
import GlobalColors from '../../config/styles';
import AppFonts from '../../config/fontConfig';

const stylesheet = StyleSheet.create({
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
    redMsg: {
        color: GlobalColors.red,
        textAlign: 'center',
        fontSize: 15,
        marginVertical: 30
    },
    closeModalContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingTop: 10,
        paddingRight: 10
    },
    confirmBtnContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around'
    },
    socialBtnContainer: {
        flexDirection: 'row',
        paddingTop: 20
    },
    socialMediaButtons: {
        // width: '75%',
        marginBottom: 10,
        alignItems: 'center'
    },
    cancelModalBtn: {
        backgroundColor: '#e5f4fd',
        paddingHorizontal: 35,
        paddingVertical: 12,
        borderRadius: 5
    },
    cancelText: {
        color: '#0095f2',
        fontSize: 14,
        textAlign: 'center'
    },
    confirmBtn: {
        backgroundColor: '#0096fb',
        paddingHorizontal: 35,
        paddingVertical: 12,
        borderRadius: 5
    },
    socialConfirmBtn: {
        backgroundColor: '#0096fb',
        paddingHorizontal: 80,
        paddingVertical: 12,
        borderRadius: 5
    },

    confirmText: {
        color: '#ffffff',
        fontSize: 14,
        textAlign: 'center'
    },
    imageStyle: {
        height: 70,
        width: 70,
        alignSelf: 'center'
    },
    otpInput: {
        height: 40,
        width: 150,
        borderWidth: 1,
        borderColor: GlobalColors.translucentDark,
        borderRadius: 7,
        alignSelf: 'center',
        textAlign: 'center',
        fontSize: 18,
        letterSpacing: 5,
        marginTop: 20,
        marginBottom: 30
    },
    textInput: {
        height: 40,
        width: 150,
        borderWidth: 1,
        borderRadius: 7,
        borderColor: GlobalColors.translucentDark,
        marginTop: 20,
        textAlign: 'center',
        alignSelf: 'center'
    },
    title: {
        fontSize: 14,
        fontWeight: AppFonts.BOLD,
        fontStyle: 'normal',
        lineHeight: 20,
        letterSpacing: 0,
        textAlign: 'center',
        color: '#44485a',
        marginTop: 5
    },
    subTitle: {
        fontSize: 14,
        fontWeight: AppFonts.NORMAL,
        lineHeight: 20,
        letterSpacing: 0,
        textAlign: 'center',
        color: '#44485a'
    },
    socialSubTitle: {
        fontSize: 14,
        fontWeight: AppFonts.NORMAL,
        lineHeight: 20,
        letterSpacing: 0,
        textAlign: 'center',
        color: '#44485a',
        paddingBottom: 10
    },
    wrongOtpMsg: {
        fontSize: 13,
        color: GlobalColors.formDelete,
        textAlign: 'center'
    },
    wrongOtpContainer: { marginTop: 5, marginBottom: 15 }
});

export default stylesheet;
