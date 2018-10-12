import { StyleSheet } from 'react-native';
import { GlobalColors } from '../../config/styles';
import { Platform } from 'react-native';
import { SCREEN_HEIGHT } from './config';

export default StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: GlobalColors.white
    },
    innerContainer: {
        flex: 1,
        textAlign: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff'
    },
    header: {
        width: 300,
        height: 40,
        textAlign: 'center',
        fontSize: 30,
        color: 'rgba(74,74,74,1)',
        fontWeight: '300',
        marginTop: 82,
        marginBottom: 30
    },
    captionText: {
        alignItems: 'center'
    },
    emailText: {
        fontWeight: 'bold'
    },
    firstTitle: {
        textAlign: 'center',
        fontSize: 22,
        fontWeight: '300',
        marginBottom: 20,
        color: 'rgba(155,155,155,1)'
    },
    secondTitle: {
        textAlign: 'center',
        fontSize: 22,
        fontWeight: '300',
        color: 'rgba(155,155,155,1)'
    },
    buttonContainer: {
        height: 40,
        width: 300,
        backgroundColor: 'rgba(0,189,242,1)',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        bottom: 80
    },
    buttonText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'normal',
        fontSize: 16
    },
    pinCode: {
        paddingBottom: 60,
        marginTop: 10
    },
    textInput: {
        height: 40,
        width: 150,
        backgroundColor: 'rgba(244,244,244,1)',
        padding: 10,
        color: 'rgba(155,155,155,1)',
        fontSize: 20,
        borderTopRightRadius: 0,
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
        borderTopLeftRadius: 10,
        textAlign: 'center',
        letterSpacing: 1
    },
    codeButton: {
        marginTop: 40
    },
    resendButton: {
        flex: 1,
        bottom: 10
    },
    textColor: {
        color: 'rgba(0, 189, 242, 1)',
        fontSize: 16,
        textAlign: 'center',
        bottom: 20
    }
});
