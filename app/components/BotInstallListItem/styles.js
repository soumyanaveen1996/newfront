import { StyleSheet } from 'react-native';
import { GlobalColors } from '../../config/styles';

export const BotListItemColors = {
    titleColor: 'rgb(255, 82, 59)',
    subTitleColor: 'rgb(169,169,169)',
    dateColor: 'rgb(142, 142, 142)',
    backgroundColor: GlobalColors.white,
    countColor: 'rgb(62,137,252)',
    countTextColor: GlobalColors.white,
    button: GlobalColors.iosBlue
};

export const BotListItemStyles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        paddingHorizontal: 10,
        paddingVertical: 12,
        alignItems: 'stretch',
        backgroundColor: BotListItemColors.backgroundColor
    },
    title: {
        color: BotListItemColors.titleColor,
        fontSize: 14,
        fontWeight: 'bold'
    },
    subTitle: {
        color: BotListItemColors.subTitleColor,
        fontSize: 14,
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
        alignItems: 'center',
        alignContent: 'center'
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
        borderRadius: 3,
        borderColor: BotListItemColors.button,
        borderWidth: 2,
        width: 67,
        alignItems: 'center'
    },
    installButtonText: {
        color: BotListItemColors.button,
        fontSize: 12,
        padding: 3
    }
});

export default BotListItemStyles;
