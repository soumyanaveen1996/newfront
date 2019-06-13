import { StyleSheet, Dimensions } from 'react-native';
import { GlobalColors } from '../../config/styles';
import { ModalCardSize } from './config';

export default StyleSheet.create({
    cards: {
        paddingLeft: 60,
        marginVertical: 30
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
        height: 250,
        width: 250,
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'stretch',
        overflow: 'hidden',
        marginHorizontal: 10,
        paddingBottom: 20,
        borderRadius: 12,
        borderColor: 'gray',
        borderWidth: 0.1,
        backgroundColor: GlobalColors.white
    },
    verticalContainer: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'stretch'
    },
    image: {
        height: 125
    },
    title: {
        marginHorizontal: 18,
        paddingTop: 20,
        fontSize: 16,
        fontWeight: '200',
        color: GlobalColors.headerBlack
    },
    description: {
        marginHorizontal: 18,
        marginVertical: 15,
        fontSize: 14,
        fontWeight: '100',
        color: GlobalColors.darkGray
    },
    action: {
        marginHorizontal: 18,
        marginTop: 7,
        fontSize: 16,
        fontWeight: '100',
        textAlign: 'center',
        color: GlobalColors.sideButtons
    },

    //MODAL
    slideshowContainer: {
        height: '65%'
    },
    modalSlideshow: {
        paddingHorizontal: 10
    },
    imageModal: {
        height: 150
    },
    fieldsModal: {
        alignItems: 'flex-start',
        paddingHorizontal: 20
    },
    modalCard: {
        width: ModalCardSize.WIDTH,
        flexDirection: 'column',
        alignItems: 'stretch',
        marginHorizontal: ModalCardSize.MARGIN,
        paddingBottom: 40,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        borderRadius: 10,
        borderWidth: 0.2,
        overflow: 'hidden',
        backgroundColor: GlobalColors.white
    },
    emptyFooterModal: {
        width: 20
    },
    titleModal: {
        textAlign: 'left',
        fontSize: 19,
        marginTop: 40,
        marginBottom: 15,
        color: GlobalColors.sideButtons,
        textTransform: 'uppercase'
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
    },
    descriptionModal: {
        marginVertical: 15,
        fontSize: 14,
        fontWeight: '100',
        color: GlobalColors.darkGray,
        textAlign: 'justify'
    },
    urlModal: {
        fontSize: 16,
        fontWeight: '100',
        lineHeight: 25,
        textDecorationLine: 'underline',
        color: GlobalColors.sideButtons
    }
});
