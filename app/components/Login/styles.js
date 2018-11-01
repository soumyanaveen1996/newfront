import { StyleSheet } from 'react-native';
import { GlobalColors } from '../../config/styles';
import { Platform } from 'react-native';
import { SCREEN_HEIGHT } from './config';
import { SCREEN_WIDTH } from './config';

export default StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: GlobalColors.white
    },
    logoHeader: {
        width: SCREEN_WIDTH,
        height: 45,
        borderBottomColor: 'rgb(192, 192, 192)',
        borderBottomWidth: 0.2,
        alignItems: 'center',
        justifyContent: 'center'
    },
    keyboardConatiner: {
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center'
    },
    headerContainer: {
        width: 300,
        marginTop: '5%',
        alignItems: 'center'
    },
    loginHeader: {
        fontSize: 28,
        color: 'rgba(74,74,74,1)',
        fontWeight: '300'
    },
    loginSubHeader: {
        fontSize: 20,
        color: 'rgba(74,74,74,1)',
        fontWeight: '300'
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
        marginTop: 30,
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

    entryFields: Platform.select({
        ios: {
            position: 'relative',
            width: 300,
            backgroundColor: 'transparent'
        },
        android: {
            width: 300,
            backgroundColor: 'transparent'
        }
    }),
    errorContainer: Platform.select({
        ios: {
            position: 'absolute',
            minWidth: 180,
            bottom: -30,
            right: 0
        },
        android: {
            minWidth: 180,
            flex: 1,
            alignItems: 'flex-end'
        }
    }),

    userError: Platform.select({
        ios: {
            backgroundColor: 'rgba(229,69,59,1)',
            zIndex: 999999,
            minWidth: 180,
            borderTopRightRadius: 10,
            borderBottomLeftRadius: 10,
            borderBottomRightRadius: 10,
            borderTopLeftRadius: 0,
            alignItems: 'center'
        },
        android: {
            backgroundColor: 'rgba(229,69,59,1)',
            width: 180,
            borderTopRightRadius: 10,
            borderBottomLeftRadius: 10,
            borderBottomRightRadius: 10,
            borderTopLeftRadius: 0,
            alignItems: 'center'
        }
    }),
    errorText: {
        color: '#ffffff',
        textAlign: 'center',
        padding: 6
    }
});
