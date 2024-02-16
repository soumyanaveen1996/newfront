import { StyleSheet, Dimensions } from 'react-native';
import GlobalColors from '../../../../config/styles';
import AppFonts from '../../../../config/fontConfig';

export default StyleSheet.create({
    container: {
        alignItems: 'stretch',
        borderRadius: 10,
        overflow: 'hidden',
        backgroundColor: GlobalColors.appBackground,
        marginBottom: 5,
        borderWidth: 1,
        borderColor: GlobalColors.disabledGray,
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.08,
        shadowRadius: 4
    },
    topContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingLeft: 20,
        paddingVertical: 15,
        paddingRight: 5,
        borderBottomColor: GlobalColors.disabledGray
    },
    contentContainerOpen: {
        alignItems: 'stretch',
        maxHeight: Dimensions.get('window').height * 0.75
    },
    contentContainerClose: {
        alignItems: 'stretch',
        height: 0
    },
    titleText: {
        fontSize: 14,
        fontWeight: AppFonts.NORMAL,
        color: GlobalColors.textBlack
    },
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    button: {
        width: 18,
        height: 18,
        borderRadius: 9,
        justifyContent: 'center',
        alignItems: 'center'
    },

    //LIST
    listContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        alignItems: 'center'
    },
    listOpen: {
        width: '90%',
        maxHeight: Dimensions.get('window').height * 0.8,
        marginTop: 10
    },
    listClosed: {
        width: '90%',
        height: 0
    },
    listContentContainer: {
        alignItems: 'stretch'
    },
    listButton: {
        width: '30%',
        borderRadius: 5,
        backgroundColor: GlobalColors.white,
        marginTop: 10,
        paddingVertical: 3,
        borderWidth: 1,
        borderColor: GlobalColors.disabledGray,
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.08,
        shadowRadius: 4
    }
});
