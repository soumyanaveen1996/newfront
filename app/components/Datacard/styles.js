import { StyleSheet } from 'react-native';
import { GlobalColors } from '../../config/styles';

export default StyleSheet.create({
    dataCards: {
        paddingLeft: 60
    },
    card: {
        backgroundColor: GlobalColors.white,
        borderRadius: 10,
        borderWidth: 0.2,
        width: 250,
        height: 200,
        marginRight: 10,
        marginVertical: 30,
        padding: 19,
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'stretch',
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.08,
        shadowRadius: 4
    },
    topArea: {
        alignItems: 'flex-start'
    },
    cardTitle: {
        textAlign: 'left',
        fontSize: 19,
        marginBottom: 13,
        color: GlobalColors.sideButtons,
        textTransform: 'uppercase'
    },
    field: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginVertical: 6
    },
    fieldLabel: {
        fontSize: 17,
        color: GlobalColors.headerBlack
    },
    fieldText: {
        fontSize: 17,
        fontWeight: '100',
        color: GlobalColors.headerBlack
    },
    info: {
        textAlign: 'center',
        fontSize: 19,
        color: GlobalColors.sideButtons
    },
    emptyFooter: {
        width: 64
    },

    //MODAL

    modal: {
        width: '90%',
        height: '65%',
        flexDirection: 'column',
        alignItems: 'stretch',
        paddingHorizontal: 20,
        paddingVertical: 40,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        borderRadius: 10,
        borderWidth: 0.2,
        backgroundColor: GlobalColors.white
    },
    fieldModal: {
        width: '100%',
        paddingVertical: 18,
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderColor: GlobalColors.disabledGray
    },
    fieldLabelModal: {
        width: '45%',
        fontSize: 17,
        color: GlobalColors.headerBlack
    }
});
