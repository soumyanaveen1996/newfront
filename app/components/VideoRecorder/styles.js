import { StyleSheet } from 'react-native';
import { GlobalColors } from '../../config/styles';


const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
    },
    preview: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center'
    },
    bottomBar: {
        position: 'absolute',
        height: 80,
        flexDirection: 'row',
        backgroundColor: GlobalColors.modalBackground,
        bottom: 0,
        right: 0,
        left: 0,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    topBar: {
        position: 'absolute',
        height: 60,
        flexDirection: 'row',
        backgroundColor: GlobalColors.modalBackground,
        top: 0,
        right: 0,
        left: 0,
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    bottomButton: {
        flex: 0,
        backgroundColor: GlobalColors.transparent,
        borderRadius: 5,
        color: GlobalColors.white,
        padding: 10,
        marginHorizontal: 10,
        width: 100,
        fontSize: 16,
        fontWeight: 'bold'
    },
    useButton: {
        marginRight: 20,
        textAlign: 'right',
    },
    cancelButton: {
        marginLeft: 20,
        textAlign: 'left',
    },
    recordButtonContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        borderWidth: 5,
        borderColor: GlobalColors.white,
        justifyContent: 'center',
        alignItems: 'center'
    },
    button: {
        width: 40,
        height: 40,
        backgroundColor: GlobalColors.transparent,
        justifyContent: 'center',
        alignItems: 'center'
    },
    stopButton: {
        width: 24,
        height: 24,
        borderRadius: 5,
        backgroundColor: GlobalColors.white
    }
});

export default styles;
