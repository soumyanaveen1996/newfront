import { StyleSheet } from 'react-native';
import { GlobalColors } from '../../config/styles';
import { Platform } from 'react-native';
import { SCREEN_HEIGHT } from './config';
import { SCREEN_WIDTH } from './config';

export default StyleSheet.create({
    container: {
        flex: 1,
        height: SCREEN_HEIGHT - 100,
        padding: 20,
        backgroundColor: GlobalColors.white
    },
    keyboardConatiner: {
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center'
    },
    signupHeader: {
        width: 300,
        height: 40,
        textAlign: 'left',
        fontSize: 30,
        color: 'rgba(74,74,74,1)',
        fontWeight: '300',
        marginTop: 82
    },
    formContainer: Platform.select({
        ios: {
            marginBottom: 20,
            alignItems: 'center',
            justifyContent: 'center'
        },
        android: {
            marginBottom: 20,
            alignItems: 'center',
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
        color: 'rgba(155,155,155,1)',
        fontSize: 16,
        borderTopRightRadius: 0,
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
        borderTopLeftRadius: 10
    },
    buttonContainer: {
        height: 40,
        width: 300,
        backgroundColor: 'rgba(0,189,242,1)',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 38
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
        fontWeight: '700'
    },
    loginButton: {
        backgroundColor: '#2980b6',
        color: '#fff'
    },
    criteriaWrapper: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    passwordText: {
        color: 'rgba(74,74,74,1)',
        fontSize: 14,
        fontWeight: '500',
        letterSpacing: 1,
        lineHeight: 16,
        marginBottom: 10
    },
    passwordCriteriaList: {
        color: 'rgba(74,74,74,1)',
        fontSize: 14,
        fontWeight: '300',
        letterSpacing: 1,
        lineHeight: 28
    }
});
