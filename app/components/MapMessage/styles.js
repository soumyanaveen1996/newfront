import { StyleSheet } from 'react-native';
import { GlobalColors } from '../../config/styles';

export default StyleSheet.create({
    leftMapMessage: {
        paddingHorizontal: 25,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        marginTop: 12
    },
    centerMapMessage: {
        paddingHorizontal: 25,
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 12
    },
    rightMapMessage: {
        paddingHorizontal: 25,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 12
    },
    container: {
        width: '75%',
        aspectRatio: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        overflow: 'hidden'
    },
    mapSnapShot: {
        width: '100%',
        height: '100%',
        borderRadius: 20,
        justifyContent: 'flex-end',
        overflow: 'hidden'
    },
    textContainerUser: {
        paddingVertical: 10,
        backgroundColor: GlobalColors.tabBackground
    },
    textContainerNotUser: {
        paddingVertical: 10,
        backgroundColor: GlobalColors.white
    },
    textUser: {
        fontSize: 16,
        textAlign: 'center',
        color: GlobalColors.white
    },
    textNotUser: {
        fontSize: 16,
        textAlign: 'center',
        color: GlobalColors.sideButtons
    }
});
