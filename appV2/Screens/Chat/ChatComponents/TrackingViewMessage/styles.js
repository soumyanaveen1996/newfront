import { StyleSheet } from 'react-native';
import GlobalColors from '../../../../config/styles';
import AppFonts from '../../../../config/fontConfig';

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: GlobalColors.white,
        alignItems: 'stretch',
        paddingHorizontal: 20
    },
    containerNonConv: {
        // height: Dimensions.get('window').height * 0.6,
        backgroundColor: GlobalColors.white,
        alignItems: 'stretch',
        paddingHorizontal: 20
    },
    infoContainer: {
        paddingTop: 25,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    trackerContainer: {
        width: '100%',
        justifyContent: 'space-between',
        alignItems: 'stretch',
        marginTop: 35,
        marginBottom: 30
    },
    selecteorContainer: {},
    refresherContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignSelf: 'center',
        alignItems: 'center'
    },
    originContainer: {
        width: '50%'
    },
    destinationContainer: {
        width: '50%',
        alignItems: 'flex-end'
    },
    separator: {
        width: '80%',
        height: 0.5,
        marginVertical: 12,
        backgroundColor: GlobalColors.disabledGray
    },
    titleText: {
        fontSize: 12,
        marginBottom: 12,
        fontWeight: AppFonts.LIGHT,
        color: GlobalColors.textDarkGrey
    },
    refreshText: {
        fontSize: 12,
        marginBottom: 12,
        marginLeft: 8,
        marginVertical: 12,
        fontWeight: AppFonts.LIGHT,
        color: GlobalColors.textDarkGrey,
        textDecorationLine: 'underline'
    },
    codeText: {
        fontSize: 32,
        fontWeight: AppFonts.BOLDER,
        color: GlobalColors.frontmLightBlue
    },
    placeText: {
        fontSize: 14,
        marginBottom: 5,
        color: GlobalColors.frontmLightBlue
    },
    lightText: {
        fontSize: 14,
        color: GlobalColors.textBlack
    },
    boldText: {
        fontSize: 14,
        color: GlobalColors.textBlack,
        fontWeight: AppFonts.NORMAL
    },
    sliderTrack: {
        width: '100%',
        height: 3,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: GlobalColors.disabledGray,
        overflow: 'visible'
    },
    leftTrack: {
        height: '100%',
        backgroundColor: GlobalColors.frontmLightBlue
    },
    trackIcon: {
        width: 30,
        height: 30,
        marginLeft: -15
    },
    trackerText: {
        marginTop: 18,
        fontSize: 12,
        color: GlobalColors.frontmLightBlue
    }
});
