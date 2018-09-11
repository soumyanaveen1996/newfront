import { StyleSheet } from 'react-native';
import { GlobalColors } from '../../config/styles';

const Styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        backgroundColor: 'rgba(4, 4, 4, 0.9)',
        flex: 1,
        flexDirection: 'column',
    },
    nameContainer: {

    },
    callingText: {
        color: GlobalColors.white,
        fontSize: 20,
        textAlign: 'center',
        height: 30
    },
    nameText: {
        color: GlobalColors.white,
        fontSize: 40,
        textAlign: 'center',
        height: 50,
        marginTop: 20,
    },
    buttonContainer: {
        height: 50,
        flexDirection: 'row',
        padding: 36,
        justifyContent: 'space-around',
        marginBottom: 36,
    },
    button: {
        borderRadius: 36,
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    callCloseButton: {
        backgroundColor: 'red'
    },
    callButton: {
        backgroundColor: 'green'
    },
    roundButton: {
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 30,
        marginVertical: 6,
        borderWidth: 1,
        borderColor: GlobalColors.white
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-around'
    },
    roundButtonText: {
        color: GlobalColors.white,
        fontSize: 24,
        textAlign: 'center',
        flex: 0,
    },
    closeButton: {
        position: 'absolute',
        bottom: 10,
        right: 15,
        padding: 10,
    },
    closeButtonText: {
        fontSize: 17,
        color: GlobalColors.white,
    },
    mainContainer: {
        paddingTop: 40,
        flex: 1,
        flexDirection: 'column',
        paddingBottom: 30,
    },
    diallerContainer: {
        paddingTop: 20,
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
    },
    diallerButtonContainer: {
        width: 240,
        height: 300,
    }
});

export default Styles;
