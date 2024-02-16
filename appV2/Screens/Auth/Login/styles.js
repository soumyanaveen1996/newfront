import { StyleSheet, Platform } from 'react-native';

import GlobalColors from '../../../config/styles';

import { SCREEN_HEIGHT, SCREEN_WIDTH } from './config';
import AppFonts from '../../../config/fontConfig';

export default StyleSheet.create({
    container: {
        flex: 1,
        paddingVertical: 20
        // paddingHorizontal: 30,
        // backgroundColor: GlobalColors.white
    },
    logoHeader: {
        width: SCREEN_WIDTH,
        height: 45,
        borderStyle: 'solid',
        borderBottomColor: 'rgb(192, 192, 192)',
        borderBottomWidth: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    keyboardConatiner: {
        width: '100%',
        paddingVertical: 10,
        alignItems: 'center',
        justifyContent: 'center'
    },
    headerContainer: {
        width: 300,
        marginTop: '5%',
        alignItems: 'center'
    },
    loginHeader: {
        fontSize: 24,
        color: GlobalColors.primaryTextColor,
        fontWeight: AppFonts.BOLD,
        textAlign: 'center'
    },
    loginSubHeader: {
        fontSize: 20,
        color: GlobalColors.primaryTextColor,
        fontWeight: AppFonts.LIGHT
    },
    formContainer: {
        marginBottom: 20,
        width: '75%',
        justifyContent: 'center',
        alignItems: 'stretch'
    },
    placeholderText: {
        fontWeight: AppFonts.LIGHT,
        color: GlobalColors.formLable,
        width: 300,
        paddingVertical: 4,
        paddingHorizontal: 8,
        letterSpacing: 1,
        lineHeight: 20,
        fontSize: 14,
        marginTop: 20
    },
    input: {
        height: 40,
        width: '100%',
        backgroundColor: GlobalColors.formItemBackgroundColor,
        // marginLeft: wp('1%'),
        paddingVertical: 10,
        paddingHorizontal: 15,
        color: GlobalColors.formText,
        fontSize: 16,
        borderRadius: 6,
        borderColor: GlobalColors.appBackground,
        borderWidth: 1
    },
    forgotPassowrd: {
        height: 20,
        fontSize: 14,
        letterSpacing: 1,
        lineHeight: 20,
        color: GlobalColors.formText,
        textDecorationLine: 'underline',
        marginTop: 30,
        marginBottom: 25,
        alignSelf: 'flex-start'
    },
    buttonContainer: {
        height: 40,
        width: '100%',

        backgroundColor: GlobalColors.primaryButtonColor,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 25,
        alignSelf: 'center'
    },
    buttonText: {
        color: GlobalColors.primaryButtonText,
        textAlign: 'center',
        fontSize: 16,
        fontWeight: AppFonts.BOLD
    },
    loginButton: {
        backgroundColor: GlobalColors.primaryButtonColor,
        color: '#fff'
    },
    socialMediaText: {
        color: 'rgba(74,74,74,1)',
        fontSize: 14,
        letterSpacing: 1,
        lineHeight: 20,
        marginBottom: 20
    },
    socialMediaButtons: {
        width: '75%',
        marginBottom: 40,
        alignItems: 'center'
    },
    goToSignup: {
        color: GlobalColors.primaryButtonColor,
        textAlign: 'center',
        fontSize: 14,
        letterSpacing: 1,
        lineHeight: 20,
        fontWeight: AppFonts.BOLD
    },

    entryFields: {
        width: '100%'
    },
    errorContainer: {
        minWidth: 180,
        alignSelf: 'flex-end',
        backgroundColor: GlobalColors.red,
        borderRadius: 6
    },

    userError: {
        alignItems: 'center'
    },

    errorText: {
        color: '#ffffff',
        textAlign: 'center',
        padding: 6
    },
    appleEmailTitle: {
        marginBottom: 16,
        fontSize: 18,
        fontWeight: AppFonts.BOLD,
        color: GlobalColors.grey
    },
    appleEmailMessage: {
        marginBottom: 16,
        fontSize: 12,
        fontWeight: AppFonts.BOLD,
        color: GlobalColors.darkGray
    },
    appleEmailErrorText: {
        color: GlobalColors.red,
        textAlign: 'center',
        padding: 6
    },
    modalContainer: {
        padding: 24,
        alignItems: 'center',
        backgroundColor: 'white'
    }
});
