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
        flexDirection: 'column'
    },
    nameContainer: {},
    callingText: {
        color: GlobalColors.botChatBubbleColor,
        fontSize: 20,
        textAlign: 'center',
        height: 30
    },
    diallerNumberText: {
        color: GlobalColors.white,
        fontSize: 40,
        textAlign: 'left',
        height: 140,
        marginTop: 20,
        paddingHorizontal: 10
    },
    callingNumberText: {
        color: GlobalColors.black,
        fontSize: 40,
        textAlign: 'center',
        height: 50,
        marginTop: 20
    },
    callButtonContainer: {
        height: 70,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: GlobalColors.white
    },
    button: {
        borderRadius: 36,
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center'
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
        marginVertical: 6,
        borderWidth: 1,
        borderColor: GlobalColors.white
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-around'
    },
    roundButtonText: {
        color: GlobalColors.black,
        fontSize: 36,
        textAlign: 'center',
        flex: 0
    },
    swapButtonContainer: {
        backgroundColor: GlobalColors.white
    },
    closeButton: {
        padding: 10
    },
    closeButtonText: {
        fontSize: 17,
        color: GlobalColors.black
    },
    mainContainer: {
        paddingTop: 40,
        flex: 1,
        flexDirection: 'column',
        paddingBottom: 30,
        backgroundColor: 'white'
    },
    initialMainContainer: {
        backgroundColor: 'green',
        flex: 1,
        paddingTop: 40
    },
    diallerContainer: {
        height: 300,
        backgroundColor: GlobalColors.white
    },
    diallerButtonContainer: {
        flex: 1,
        flexDirection: 'column'
        //backgroundColor: 'red',
    },
    incallDiallerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    incallDiallerButtonContainer: {
        height: 300,
        flexDirection: 'row',
        width: '80%',
        justifyContent: 'space-around',
        alignItems: 'center'
    },
    incallButtonContainer: {
        height: 70,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: GlobalColors.white
    }
});

export default Styles;
