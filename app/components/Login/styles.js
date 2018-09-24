import { StyleSheet } from 'react-native';
import { GlobalColors } from '../../config/styles';
import { Platform } from 'react-native';

export default StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: GlobalColors.white,
        alignItems: 'center'
    },

    keyboardConatiner:{
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center'
    },

    imageStyle: {
        width: 200,
        height: 200,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loginHeader: {
        width: '100%',
        height: 70,
        alignItems: 'center',
        fontSize: 18,
        fontWeight: '700'
    },
    formContainer: Platform.select({
        'ios': {
            marginBottom: 20,
            alignItems: 'center',
            justifyContent: 'center',
            
        },
        'android': {
            marginBottom: 20,
            alignItems: 'center',
            justifyContent: 'center',
            
        }
    }),
    input: {
        height: 40,
        width: 300,
        backgroundColor: 'rgba(225,225,225,0.2)',
        marginBottom: 10,
        padding: 10,
        color: '#222'
    },
    buttonContainer: {
        height: 40,
        width: 300,
        backgroundColor: '#1EAA41',
        paddingVertical: 15
    },
    buttonText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: '700'
    },
    loginButton: {
        backgroundColor: '#2980b6',
        color: '#fff'
    }
});
