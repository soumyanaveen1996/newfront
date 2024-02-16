import { StyleSheet } from 'react-native';
import GlobalColors from '../../../config/styles';
import AppFonts from '../../../config/fontConfig';

export default StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: GlobalColors.white
    },
    keyboardConatiner: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: GlobalColors.white
    },
    header: {
        width: 300,
        height: 40,
        textAlign: 'center',
        fontSize: 30,
        color: 'rgba(74,74,74,1)',
        fontWeight: AppFonts.LIGHT,
        marginTop: 82,
        marginBottom: 30
    },
    firstTitle: {
        textAlign: 'center',
        fontSize: 22,
        fontWeight: AppFonts.LIGHT,
        marginBottom: 20,
        color: 'rgba(155,155,155,1)'
    },
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
    buttonContainer: {
        height: 40,
        width: 300,
        backgroundColor: GlobalColors.primaryButtonColor,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center'
    },

    diableButton: {
        height: 40,
        width: 300,
        backgroundColor: 'rgba(155,155,155,1);',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center'
    },
    buttonText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: AppFonts.NORMAL,
        fontSize: 16
    },

    userError: {
        backgroundColor: 'rgba(229,69,59,1)',
        position: 'absolute',
        top: 40,
        zIndex: 999999,
        right: 0,
        width: 150,
        padding: 5,
        borderTopRightRadius: 10,
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
        borderTopLeftRadius: 0,
        alignItems: 'center'
    },
    errorText: {
        color: '#ffffff',
        textAlign: 'center'
    },
    captionText: {
        flex: 1,
        alignItems: 'center'
    },
    pinCode: {
        flex: 1,
        alignItems: 'center',
        paddingBottom: 60,
        marginTop: 10,
        justifyContent: 'center'
    },
    codeButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 40,
        marginBottom: 40
    },
    changeEmailTextStyle: {
        flex: 1,
        alignItems: 'center'
    },
    goToSignup: {
        color: GlobalColors.frontmLightBlue,
        fontSize: 16,
        textAlign: 'center'
    }
});
