import { StyleSheet } from 'react-native';
import { GlobalColors } from '../../config/styles';
import { Platform } from 'react-native';
import { SCREEN_HEIGHT } from './config';
import { SCREEN_WIDTH } from './config';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp
} from 'react-native-responsive-screen';
export default StyleSheet.create({
    container: {
        flex: 1,
        paddingVertical: 20,
        // paddingHorizontal: 30,
        backgroundColor: GlobalColors.white
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
        fontSize: 28,
        color: 'rgba(74,74,74,1)',
        fontWeight: '300'
    },
    loginSubHeader: {
        fontSize: 20,
        color: 'rgba(74,74,74,1)',
        fontWeight: '300'
    },
    formContainer: {
        marginBottom: 20,
        width: '75%',
        justifyContent: 'center',
        alignItems: 'stretch'
    },
    placeholderText: {
        fontWeight: '300',
        color: 'rgba(74,74,74,1)',
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
        backgroundColor: 'rgba(244,244,244,1)',
        // marginLeft: wp('1%'),
        paddingVertical: 10,
        paddingHorizontal: 15,
        color: 'rgba(0,0,0,0.8)',
        fontSize: 16,
        borderTopRightRadius: 0,
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
        borderTopLeftRadius: 10
    },
    forgotPassowrd: {
        height: 20,
        fontSize: 14,
        letterSpacing: 1,
        lineHeight: 20,
        color: 'rgba(0,167,214,1)',
        marginTop: 30,
        marginBottom: 25,
        alignSelf: 'flex-start'
    },
    buttonContainer: {
        height: 40,
        width: '100%',
        backgroundColor: 'rgba(0,189,242,1)',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 25,
        alignSelf: 'center'
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
        justifyContent: 'space-evenly'
    },
    goToSignup: {
        color: 'rgba(0,189,242,1)',
        textAlign: 'center',
        fontSize: 14,
        letterSpacing: 1,
        lineHeight: 20,
        fontWeight: 'bold'
    },

    entryFields: {
        width: '100%'
    },
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
