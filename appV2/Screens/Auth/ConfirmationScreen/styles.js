import { StyleSheet, Platform } from 'react-native';
import GlobalColors from '../../../config/styles';
import AppFonts from '../../../config/fontConfig';

export default StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: GlobalColors.appBackground
    },
    innerContainer: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,1)'
    },
    header: {
        width: 300,
        height: 40,
        textAlign: 'center',
        fontSize: 30,
        color: 'rgba(74,74,74,1)',
        fontWeight: AppFonts.LIGHT,
        marginTop: 82,
        marginBottom: 10
    },
    captionText: {
        flex: 1,
        alignItems: 'center'
    },
    emailText: {
        fontWeight: AppFonts.BOLD
    },
    firstTitle: {
        textAlign: 'center',
        fontSize: 22,
        fontWeight: AppFonts.LIGHT,
        marginBottom: 20,
        color: 'rgba(155,155,155,1)'
    },
    secondTitle: {
        textAlign: 'center',
        fontSize: 22,
        fontWeight: AppFonts.LIGHT,
        color: 'rgba(155,155,155,1)'
    },
    buttonContainer: {
        height: 40,
        width: 300,
        backgroundColor: GlobalColors.primaryButtonColor,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        bottom: 80
    },
    diableButton: {
        height: 40,
        width: 300,
        backgroundColor: 'rgba(155,155,155,1);',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        bottom: 80
    },
    buttonText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: AppFonts.NORMAL,
        fontSize: 16
    },
    pinCodeWithPassword: {
        flex: 1,
        alignItems: 'center',
        marginBottom: 5,
        marginTop: 10,
        justifyContent: 'center'
    },
    pinCode: {
        flex: 1,
        alignItems: 'center',
        marginBottom: 60,
        marginTop: 10,
        justifyContent: 'center'
    },
    textCode: {
        height: 40,
        width: 150,
        backgroundColor: 'rgba(244,244,244,1)',
        padding: 10,
        textAlign: 'center',
        color: 'rgba(155,155,155,1)',
        fontSize: 20,
        borderTopRightRadius: 0,
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
        borderTopLeftRadius: 10,
        letterSpacing: 1
    },
    textInput: {
        height: 40,
        width: 150,
        backgroundColor: 'rgba(244,244,244,1)',
        padding: 10,
        textAlign: 'center',
        color: 'rgba(155,155,155,1)',
        fontSize: 20,
        borderTopRightRadius: 0,
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
        borderTopLeftRadius: 10,
        letterSpacing: 1
    },
    codeButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 70
    },
    resendButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    textColor: {
        color: GlobalColors.frontmLightBlue,
        fontSize: 16,
        textAlign: 'center'
    },
    entryFields: Platform.select({
        ios: {
            position: 'relative',
            flex: 1,
            backgroundColor: 'transparent',
            marginBottom: 40,
            alignItems: 'center',
            marginTop: 10,
            justifyContent: 'center'
        },
        android: {
            flex: 1,
            backgroundColor: 'transparent',
            alignItems: 'center',
            marginBottom: 45,
            marginTop: 10,
            justifyContent: 'center'
        }
    }),
    input: {
        height: 40,
        width: 300,
        backgroundColor: 'rgba(244,244,244,1)',
        padding: 10,
        color: 'rgba(0,0,0,0.8)',
        fontSize: 16,
        borderTopRightRadius: 0,
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
        borderTopLeftRadius: 10
    },
    placeholderText: {
        fontWeight: AppFonts.LIGHT,
        color: 'rgba(74,74,74,1)',
        width: 300,
        padding: 4,
        letterSpacing: 1,
        lineHeight: 20,
        fontSize: 14,
        marginTop: 20
    }
});
