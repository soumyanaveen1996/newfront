import { StyleSheet } from 'react-native';
import { GlobalColors } from '../../config/styles';

export default StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: GlobalColors.white,
        alignItems: 'center'
    },
    keyboardConatiner: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between'
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
    firstTitle: {
        textAlign: 'center',
        fontSize: 22,
        fontWeight: '300',
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
        backgroundColor: 'rgba(0,189,242,1)',
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
        fontWeight: 'normal',
        fontSize: 16
    },

    userError: {
        backgroundColor: 'rgba(229,69,59,1)',
        position: 'absolute',
        bottom: -30,
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
    }
});
