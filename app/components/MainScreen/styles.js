import { StyleSheet, Platform } from 'react-native';
import { GlobalColors } from '../../config/styles';

export const MainScreenStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: GlobalColors.background,
    },
    botListContainer: {
        flex: 1,
    },
    floatingButton: {
        width: 50,
        height: 50,
        position: 'absolute',
        right: 15,
        bottom: 15,
    },
    activityIndicator: {
        flex: 1,
    },
});

export const BotListStyles = {
    container: {
        flexGrow: 1,
        backgroundColor: GlobalColors.background,
    },
    listViewStyle: {
        paddingTop: 10,
    },
    separator: {
        height: 2,
        backgroundColor: GlobalColors.background,
    },
    loading: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center'
    },
};

export const BotListItemColors = {
    titleColor: 'rgb(255, 82, 59)',
    subTitleColor: 'rgb(71, 72, 78)',
    dateColor: 'rgb(142, 142, 142)',
    backgroundColor: GlobalColors.white,
    countColor: 'rgb(62,137,252)',
    countTextColor: GlobalColors.white
};

export const BotListItemStyles = {
    container: {
        flex: 1,
        flexDirection: 'row',
        paddingHorizontal: 10,
        paddingVertical: 24,
        alignItems: 'stretch',
        backgroundColor: BotListItemColors.backgroundColor,
    },
    title: {
        color: BotListItemColors.titleColor,
        fontSize: 15,
        fontWeight: 'bold'
    },
    subTitle: {
        color: BotListItemColors.subTitleColor,
        fontSize: 15,
        marginTop: 5,
    },
    image: {
        height: 60,
        width: 60,
        marginTop: 5,
    },
    conversationImage: {
        height: 60,
        width: 60,
        marginTop: 5,
        borderRadius: 30,
    },
    textContainer: {
        flex: 1,
        marginLeft: 10,
    },
    time: {
        position: 'absolute',
        top: 5,
        right: 20,
        color: BotListItemColors.dateColor,
        fontSize: 11,
        fontWeight: '600',
        backgroundColor: 'rgba(0, 0, 0, 0)',
        textAlign: 'right'
    },
    rightContainer: {
        width: 60,
        flexDirection: 'row-reverse',
        alignItems: 'center',
        justifyContent: 'center',
    },
    hidden: {
        display: 'none',
    },
    count: Platform.select({
        'ios': {
            color: BotListItemColors.countTextColor,
            backgroundColor: BotListItemColors.countColor,
            height: 24,
            minWidth: 24,
            maxWidth: 48,
            lineHeight: 24,
            textAlign: 'center',
            borderRadius: 12,
            paddingLeft: 4,
            paddingRight: 4,
            overflow: 'hidden'
        },
        'android': {
            color: BotListItemColors.countTextColor,
            backgroundColor: BotListItemColors.countColor,
            height: 24,
            minWidth: 24,
            maxWidth: 48,
            textAlign: 'center',
            borderRadius: 12,
            paddingLeft: 4,
            paddingRight: 4,
            overflow: 'hidden',
            textAlignVertical: 'center',
        }
    }),
    chatImage: {
        marginTop: 5,
        borderRadius: 7,
        overflow: 'hidden',
        width: 40,
        height: 40,
    }
}


export default {
    MainScreenStyles,
    BotListStyles,
    BotListItemStyles
}
