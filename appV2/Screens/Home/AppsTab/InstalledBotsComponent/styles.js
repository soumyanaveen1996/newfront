import { StyleSheet } from 'react-native';
import { SCREEN_WIDTH, scrollViewConfig } from './config';
import GlobalColors from '../../../../config/styles';
import BotListItemStyles from '../../../../widgets/BotInstallListItem/styles';
import AppFonts from '../../../../config/fontConfig';

export const BotListItemColors = {
    titleColor: 'rgba(74,74,74,1)',
    subTitleColor: 'rgba(153,153,153,1)',
    dateColor: 'rgb(142, 142, 142)',
    backgroundColor: GlobalColors.appBackground,
    countColor: 'rgb(62,137,252)',
    openButton: GlobalColors.primaryButtonColor,
    installBorder: 'rgba(0,167,214,1)',
    countTextColor: GlobalColors.white,
    button: GlobalColors.primaryColor
};

export default StyleSheet.create({
    tileContainer: {
        width: scrollViewConfig.width * 0.5,
        height: SCREEN_WIDTH * 0.5,
        borderWidth: 4,
        borderTopWidth: 8,
        borderBottomWidth: 2,
        borderColor: 'transparent',
        borderRadius: 15
    },
    separator: {
        backgroundColor: GlobalColors.itemDevider,
        height: 1,
        width: '100%',
        margin: 0
    },
    rowContainer: {
        width: SCREEN_WIDTH - 20,
        height: 100,
        borderRadius: 6,
        backgroundColor: '#fff'
    },
    rowContent: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'white'
    },
    avatarContainerStyle: {
        height: 50,
        width: 40
    },
    avatarStyle: {
        height: 40,
        width: 30
    },
    containerStyle: {
        height: 100,
        borderBottomColor: 'transparent',
        justifyContent: 'center'
    },
    titleStyle: {
        fontWeight: AppFonts.BOLD,
        color: GlobalColors.red,
        fontSize: 15
    },
    titleContainerStyle: {
        paddingLeft: 5
    },
    subtitleStyle: {
        fontWeight: AppFonts.LIGHT,
        fontSize: 13
    },
    avatarOverlayContainerStyle: {
        backgroundColor: 'transparent'
    },
    subtitleContainerStyle: {
        padding: 5
    },
    gridStyle: {
        flex: 1
    },
    headerTitleStyle: {
        fontSize: 17,
        color: GlobalColors.white,
        fontWeight: AppFonts.NORMAL
    },
    headerOuterContainerStyles: {
        position: 'relative',
        borderBottomColor: GlobalColors.accent
    },
    headerinnerContainerForSearch: {
        marginTop: 50
    },

    searchBar: {
        backgroundColor: GlobalColors.accent,
        height: 36
    },
    searchTextInput: {
        marginHorizontal: 20,
        justifyContent: 'flex-start',
        fontSize: 13,
        paddingHorizontal: 5,
        borderRadius: 2,
        height: 27,
        color: GlobalColors.white
    },
    flatList: {
        alignItems: 'center',
        paddingVertical: 15
    },
    loading: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: GlobalColors.appBackground
    },
    image: {
        height: 40,
        width: 40,
        marginTop: 5
    },
    swipeBtnStyle: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    openButton: {
        borderRadius: 6,
        backgroundColor: BotListItemColors.openButton,
        height: 30,
        width: 70,
        alignItems: 'center',
        justifyContent: 'center'
    },
    openButtonText: {
        color: BotListItemColors.backgroundColor,
        fontSize: 16,
        padding: 3
    },
    botDevinfo: {
        flexDirection: 'row',
        height: 20,
        alignItems: 'center'
    },
    textFree: {
        color: GlobalColors.primaryColor,
        fontSize: 12
    },
    botDevInfoDevider: {
        color: 'rgba(216,216,216,1)',
        fontSize: 16,
        fontWeight: AppFonts.THIN,
        marginHorizontal: 4
    },
    botDevName: {
        color: GlobalColors.chatSubTitle,
        fontWeight: AppFonts.SEMIBOLD,
        fontSize: 12
    }
});

export { BotListItemStyles };
