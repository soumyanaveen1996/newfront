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
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'stretch',
        borderRadius: 20,
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        overflow: 'hidden',
        backgroundColor: GlobalColors.white
    },
    title: {
        color: GlobalColors.headerBlack,
        fontFamily: 'SF Pro Text',
        fontSize: 18,
        fontWeight: '400',
        textAlign: 'left',
        marginTop: 17,
        marginHorizontal: 20
    },
    description: {
        color: GlobalColors.headerBlack,
        fontFamily: 'SF Pro Text',
        fontSize: 14,
        fontWeight: '100',
        textAlign: 'left',
        marginBottom: 17,
        marginHorizontal: 20
    },
    mapSnapShot: {
        width: '100%',
        aspectRatio: 1,
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
