import { StyleSheet } from 'react-native';
import GlobalColors from '../../../../config/styles';
import AppFonts from '../../../../config/fontConfig';

export default StyleSheet.create({
    leftMapMessage: {
        // paddingHorizontal: 25,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        marginTop: 8,
        marginLeft: 48,
        marginBottom: 6
    },
    centerMapMessage: {
        paddingHorizontal: 25,
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 8,
        marginBottom: 6
    },
    rightMapMessage: {
        // paddingHorizontal: 25,
        flexDirection: 'column',
        justifyContent: 'flex-start',
        marginLeft: 48,
        marginTop: 8,
        marginBottom: 6
    },
    container: {
        width: '90%',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'stretch',
        borderRadius: 20,
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        overflow: 'hidden',
        backgroundColor: GlobalColors.appBackground,
        alignItems: 'center'
    },
    title: {
        color: GlobalColors.headerBlack,
        fontSize: 14,
        fontWeight: AppFonts.BOLD,
        textAlign: 'left',
        marginVertical: 8,
        marginHorizontal: 10
    },
    description: {
        color: GlobalColors.headerBlack,
        fontSize: 14,
        fontWeight: AppFonts.THIN,
        textAlign: 'left',
        marginVertical: 6,
        marginHorizontal: 20
    },
    mapSnapShot: {
        width: '100%',
        aspectRatio: 3 / 2,
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
        color: GlobalColors.primaryButtonColor
    }
});
