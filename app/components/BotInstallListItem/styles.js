import { StyleSheet, Dimensions } from 'react-native';
import { GlobalColors } from '../../config/styles';

const SCREEN_WIDTH = Dimensions.get('window').width;

export const BotListItemColors = {
    titleColor: 'rgba(74,74,74,1)',
    subTitleColor: 'rgba(153,153,153,1)',
    dateColor: 'rgb(142, 142, 142)',
    backgroundColor: GlobalColors.white,
    countColor: 'rgb(62,137,252)',
    openButton: 'rgba(0,189,242,1)',
    installBorder: 'rgba(0,167,214,1)',
    countTextColor: GlobalColors.white,
    button: GlobalColors.iosBlue
};

export const BotListItemStyles = StyleSheet.create({
    container: {
        height: 110,
        width: SCREEN_WIDTH - 20,
        flexDirection: 'row',
        paddingHorizontal: 10,
        paddingVertical: 12,
        borderRadius: 6,
        alignItems: 'stretch',
        backgroundColor: 'transparent'
    },
    title: {
        color: BotListItemColors.titleColor,
        fontSize: 16,
        fontFamily: 'SF Pro Text',
        fontWeight: '300'
    },
    subTitle: {
        color: BotListItemColors.subTitleColor,
        fontSize: 14,
        fontFamily: 'Roboto',
        fontWeight: '300',
        marginTop: 5
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
        borderRadius: 6,
        borderColor: BotListItemColors.installBorder,
        borderWidth: 1,
        height: 30,
        width: 70,
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
    installButtonText: {
        color: BotListItemColors.installBorder,
        fontFamily: 'SF Pro Text',
        fontSize: 16,
        padding: 3
    },
    openButtonText: {
        color: BotListItemColors.backgroundColor,
        fontFamily: 'SF Pro Text',
        fontSize: 16,
        padding: 3
    }
});

export default BotListItemStyles;
