import { StyleSheet, Dimensions } from 'react-native';
import { GlobalColors } from '../../config/styles';
import { ModalCardSize } from './config';

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
        flex: 1,
        fontSize: 17,
        fontWeight: '100',
        textAlign: 'right',
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
    bigCard: {
        height: 200,
        width: 280,
        overflow: 'hidden',
        marginHorizontal: 10,
        borderRadius: 12,
        borderColor: 'gray',
        borderWidth: 0.1,
        backgroundColor: GlobalColors.white
    },
    verticalContainer: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-between'
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: GlobalColors.sideButtons
    },
    description: {
        fontSize: 16,
        fontWeight: '200',
        color: GlobalColors.headerBlack
    },
    footer: {
        fontSize: 14,
        fontWeight: '100',
        color: GlobalColors.translucentDark
    },
    seeMore: {
        fontSize: 16,
        fontWeight: '100',
        color: GlobalColors.sideButtons
    },

    //MODAL
    slideshowContainer: {
        height: '65%'
    },
    modalSlideshow: {
        paddingHorizontal: 10
    },
    modalCard: {
        width: ModalCardSize.WIDTH,
        flexDirection: 'column',
        alignItems: 'stretch',
        marginHorizontal: ModalCardSize.MARGIN,
        paddingHorizontal: 20,
        paddingVertical: 40,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        borderRadius: 10,
        borderWidth: 0.2,
        backgroundColor: GlobalColors.white
    },
    emptyFooterModal: {
        width: 20
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
