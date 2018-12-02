import { StyleSheet, Platform } from 'react-native';
import { GlobalColors } from '../../config/styles';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp
} from 'react-native-responsive-screen';

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
    },
    searchArea: {
        height: hp('5%'),
        width: wp('100%'),
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff'
    },
    buttonArea: {
        height: hp('9%'),
        width: wp('100%'),
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    buttonContainerChat: {
        height: hp('5.5%'),
        width: wp('40%'),
        backgroundColor: 'rgba(0,189,242,1)',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        margin: wp('5%'),
        flex: 1,
        flexDirection: 'row'
    },
    buttonContainerCall: {
        height: hp('5.5%'),
        width: wp('40%'),
        borderRadius: 10,
        backgroundColor: 'rgba(47,199,111,1)',
        justifyContent: 'center',
        alignItems: 'center',
        margin: wp('5%'),
        flex: 1,
        flexDirection: 'row'
    },
    buttonText: {
        color: '#fff',
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '500'
    },
    favArea: {
        height: hp('20%')
    },
    chatArea: {
        height: hp('60%')
    },
    chatAreaNoFav: {
        height: hp('80%')
    },
    searchIcon: { paddingHorizontal: 10 },
    input: {
        flex: 1,
        paddingTop: 10,
        paddingRight: 10,
        paddingBottom: 10,
        paddingLeft: 0,
        backgroundColor: '#fff',
        color: 'rgba(155,155,155,1)'
    }
});

export const BotListStyles = {
    container: {
        flexGrow: 1,
        backgroundColor: GlobalColors.background
    },
    listViewStyle: {},
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
