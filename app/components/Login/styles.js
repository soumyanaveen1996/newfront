import { StyleSheet } from 'react-native';
import { GlobalColors } from '../../config/styles';
import { Platform } from 'react-native';

export default StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: GlobalColors.white
    },
    keyboardConatiner: {
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center'
    },
    loginHeader: {
        width: 300,
        height: 45,
        textAlign: 'left',
        fontSize: 28,
        color: 'rgba(74,74,74,1)',
        fontWeight: '300',
        marginTop: '20%'
    },
    formContainer: Platform.select({
        ios: {
            marginBottom: 20,
            justifyContent: 'center',
            alignItems: 'flex-end'
        },
        android: {
            marginBottom: 20,
            justifyContent: 'center'
        }
    }),
    placeholderText: {
        fontWeight: '300',
        color: 'rgba(74,74,74,1)',
        width: 300,
        padding: 4,
        letterSpacing: 1,
        lineHeight: 20,
        fontSize: 14,
        marginTop: 20
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
    forgotPassowrd: {
        width: 290,
        height: 20,
        fontSize: 14,
        letterSpacing: 1,
        lineHeight: 20,
        color: 'rgba(0,167,214,1)',
        marginTop: 11,
        marginBottom: 25
    },
    buttonContainer: {
        height: 40,
        width: 300,
        backgroundColor: 'rgba(0,189,242,1)',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 25
    },
    buttonText: {
        color: '#fff',
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '500'
    },
    loginButton: {
        backgroundColor: '#2980b6',
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
        width: 300,
        flexDirection: 'row',
        marginBottom: 40,
        justifyContent: 'space-between'
    },
    goToSignup: {
        color: 'rgba(0,189,242,1)',
        textAlign: 'center',
        fontSize: 14,
        letterSpacing: 1,
        lineHeight: 20,
        fontWeight: 'bold'
    },
    userError: {
        backgroundColor: 'red',
        marginTop: 5,
        minWidth: 150,
        paddingTop: 5,
        paddingBottom: 5,
        paddingLeft: 10,
        paddingRight: 10,
        borderTopRightRadius: 10,
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
        borderTopLeftRadius: 0,
        alignItems: 'center',
        justifyContent: 'center'
    },
    errorText: {
        color: '#ffffff',
        textAlign: 'center'
    }
});
