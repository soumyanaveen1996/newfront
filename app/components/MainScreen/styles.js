import { StyleSheet, Platform } from 'react-native';
import { GlobalColors } from '../../config/styles';

export const MainScreenStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: GlobalColors.background,
        paddingTop: 5
    },
    botListContainer: {
        flex: 1
    },
    statusBar: {
        paddingTop: 15
    },
    floatingButton: {
        width: 50,
        height: 50,
        position: 'absolute',
        right: 15,
        bottom: 15
    },
    activityIndicator: {
        flex: 1
    }
});

export const BotListStyles = {
    container: {
        flexGrow: 1,
        backgroundColor: GlobalColors.background
    },
    listViewStyle: {
        paddingTop: 15
    },
    separator: {
        height: 0,
        backgroundColor: GlobalColors.background
    },
    loading: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 10,
        bottom: 0
        // alignItems: 'center',
        // justifyContent: 'center'
    }
};

export const BotListItemColors = {
    titleColor: 'rgba(74, 74, 74, 1)',
    subTitleColor: 'rgba(153, 153, 153, 1)',
    dateColor: 'rgb(142, 142, 142)',
    backgroundColor: GlobalColors.white,
    countColor: 'rgba(0,167,214,1)',
    countTextColor: GlobalColors.white
};

export const BotListItemStyles = {
    container: {
        flex: 1,
        flexDirection: 'row',
        paddingHorizontal: 10,
        paddingVertical: 12,
        alignItems: 'stretch',
        marginBottom: 10,
        backgroundColor: BotListItemColors.backgroundColor
    },
    title: {
        color: BotListItemColors.titleColor,
        fontFamily: 'SF Pro Text',
        fontSize: 18,
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
        height: 50,
        width: 50,
        marginTop: 5
    },
    conversationImage: {
        height: 50,
        width: 50,
        marginTop: 5,
        borderRadius: 30
    },
    textContainer: {
        flex: 1,
        marginLeft: 10
    },
    time: {
        position: 'absolute',
        top: 5,
        right: 20,
        color: BotListItemColors.dateColor,
        fontSize: 9,
        fontWeight: '600',
        backgroundColor: 'rgba(0, 0, 0, 0)',
        textAlign: 'right'
    },
    rightContainer: {
        width: 60,
        flexDirection: 'row-reverse',
        alignItems: 'center',
        justifyContent: 'center'
    },
    hidden: {
        display: 'none'
    },
    count: Platform.select({
        ios: {
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
            overflow: 'hidden',
            marginRight: 5
        },
        android: {
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
            marginRight: 5
        }
    }),
    chatImage: {
        marginTop: 5,
        borderRadius: 7,
        overflow: 'hidden',
        width: 40,
        height: 40
    }
};

export default {
    MainScreenStyles,
    BotListStyles,
    BotListItemStyles
};
