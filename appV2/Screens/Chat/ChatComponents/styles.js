import { StyleSheet, Dimensions } from 'react-native';
import GlobalColors from '../../../config/styles';
import AppFonts from '../../../config/fontConfig';
const screen = Dimensions.get('screen');

export const ModalCardSize = {
    WIDTH: Dimensions.get('window').width * 0.82,
    MARGIN: 10
};
export default StyleSheet.create({
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
    fieldText: {
        flex: 1,
        fontSize: 17,
        fontWeight: AppFonts.THIN,
        textAlign: 'right',
        color: GlobalColors.headerBlack
    },

    // TAPTOOPENFILE
    fileCard: {
        backgroundColor: GlobalColors.white,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: GlobalColors.disabledGray,
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.08,
        shadowRadius: 2
    },

    fileType: {
        fontSize: 14,
        // position: 'absolute',
        // alignSelf: 'center',
        color: GlobalColors.gunmetal,
        fontWeight: AppFonts.NORMAL
    },
    downloadIcon: {
        width: 30,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 15,
        position: 'absolute',
        right: '15%',
        bottom: '15%',
        backgroundColor: GlobalColors.primaryButtonColor
    },
    downloadIconRight: {
        width: 30,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 15,
        backgroundColor: GlobalColors.primaryButtonColor
    },
    videoThumbnailContainer: {
        width: screen.width - 80,
        height: parseInt((screen.width - 66) * (61 / 100)),
        borderRadius: 6,
        justifyContent: 'center'
    },
    videoThumbnailImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover'
    },
    filetypeImageContainer: { height: 36, width: 29 },
    fileTypeImage: { width: '100%', height: '100%' },
    playButtonContainer: {
        position: 'absolute',
        alignSelf: 'center',
        top: 66
    },
    downloadView: {
        height: 34,
        paddingHorizontal: 20,
        backgroundColor: 'rgba(42,45,60,0.7)',
        borderRadius: 40,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    downloadtext: {
        marginLeft: 10,
        fontSize: 12,
        color: '#fff',
        textAlign: 'center',
        marginTop: -2
    },
    fileContainer2: {
        paddingLeft: 8,

        flexDirection: 'row'
    },
    filecontainerview: {
        flexDirection: 'row',
        alignItems: 'center',
        width: Dimensions.get('screen').width - 140,
        justifyContent: 'space-between'
    },
    fileContainerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgb(237,241,247)',
        paddingLeft: 10,
        paddingVertical: 8,
        borderRadius: 6,
        width: Dimensions.get('screen').width - 80,
        height: 60
    }
});
