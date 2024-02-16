import { StyleSheet, Dimensions } from 'react-native';
import GlobalColors from '../../config/styles';
import AppFonts from '../../config/fontConfig';

const SCREEN_WIDTH = Dimensions.get('window').width;

export const BotListItemColors = {
    titleColor: GlobalColors.chatTitle,
    subTitleColor: GlobalColors.chatSubTitle,
    dateColor: 'rgb(142, 142, 142)',
    backgroundColor: GlobalColors.appBackground,
    countColor: 'rgb(62,137,252)',
    openButton: GlobalColors.primaryButtonColor,
    installBorder: GlobalColors.primaryButtonColor,
    countTextColor: GlobalColors.white,
    button: GlobalColors.primaryColor
};

export const BotListItemStyles = StyleSheet.create({
    container: {
        width: SCREEN_WIDTH - 20,
        flexDirection: 'row',
        paddingHorizontal: 10,
        paddingVertical: 12,
        borderRadius: 6,
        alignItems: 'stretch',
        backgroundColor: GlobalColors.appBackground
    },
    title: {
        color: BotListItemColors.titleColor,
        fontSize: 14,
        fontWeight: AppFonts.SEMIBOLD
    },
    priceText: {
        color: GlobalColors.primaryColor,
        fontSize: 12
    },
    developerName: {
        color: GlobalColors.chatSubTitle,
        fontWeight: AppFonts.SEMIBOLD,
        fontSize: 12
    },
    description: {
        color: BotListItemColors.subTitleColor,
        fontSize: 12,
        marginTop: 12,
        marginLeft: 10
    },
    image: {
        height: 40,
        width: 40,
        marginTop: 5
    },
    textContainer: {
        flex: 1,
        marginHorizontal: 10
    },
    rightContainer: {
        flexDirection: 'row-reverse',
        alignItems: 'flex-start',
        alignContent: 'center',
        justifyContent: 'flex-start'
    },
    hidden: {
        display: 'none'
    },
    chatImage: {
        marginTop: 5,
        borderRadius: 7,
        overflow: 'hidden',
        width: 40,
        height: 40
    },
    installButton: {
        borderRadius: 20,
        borderColor: BotListItemColors.installBorder,
        borderWidth: 1,
        height: 32,
        width: 70,
        justifyContent: 'center',
        alignItems: 'center'
    },
    openButton: {
        borderRadius: 20,
        backgroundColor: BotListItemColors.openButton,
        height: 30,
        width: 70,
        alignItems: 'center',
        justifyContent: 'center'
    },
    installButtonText: {
        color: BotListItemColors.installBorder,
        fontSize: 14,
        padding: 3,
        fontWeight: AppFonts.BOLD
    },
    openButtonText: {
        color: BotListItemColors.backgroundColor,
        fontSize: 14,
        padding: 3,
        fontWeight: AppFonts.BOLD
    }
});

export default BotListItemStyles;
