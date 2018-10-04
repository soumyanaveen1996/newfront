import { StyleSheet } from 'react-native';
import { GlobalColors } from '../../config/styles';

const Styles = StyleSheet.create({
    containerStyle: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        backgroundColor: 'rgba(4, 4, 4, 0.9)',
        flex: 1,
        flexDirection: 'column'
    },
    nameContainer: {
        flex: 1,
        flexDirection: 'row'
    },
    callingText: {
        color: 'rgb(161,238,53)',
        fontSize: 30,
        paddingTop: 30,
        flex: 1,
        textAlign: 'center'
    },
    nameText: {
        color: GlobalColors.white,
        fontSize: 40,
        flex: 1,
        textAlign: 'center'
    },
    buttonContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-around'
    },
    button: {
        borderRadius: 36,
        width: 72,
        height: 72,
        flex: 0,
        justifyContent: 'center',
        alignItems: 'center'
    },
    closeButton: {
        backgroundColor: 'red'
    },
    callButton: {
        backgroundColor: 'green'
    }
});

export default Styles;
