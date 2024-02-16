import { StyleSheet, Platform } from 'react-native';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp
} from 'react-native-responsive-screen';
import GlobalColors from '../../../config/styles';
import AppFonts from '../../../config/fontConfig';

export const BotListItemColors = {
    titleColor: GlobalColors.chatTitle,
    subTitleColor: GlobalColors.chatSubTitle,
    dateColor: GlobalColors.chatTitle,
    backgroundColor: GlobalColors.appBackground,
    countColor: 'rgba(229,69,59,1)',
    countTextColor: GlobalColors.white,
    borderColor: GlobalColors.itemDevider
};

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
        // flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        margin: 12,
        backgroundColor: GlobalColors.appBackground
    },
    iosSearchArea: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 22,
        marginVertical: 15
    },
    iosSearchIcon: {
        paddingHorizontal: 10
    },
    swipeBtnStyle: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    buttonArea: {
        width: wp('100%'),
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    buttonContainerChat: {
        height: hp('6.5%'),
        width: wp('20%'),
        backgroundColor: GlobalColors.frontmLightBlue,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        margin: wp('5%'),
        // flex: 1,
        flexDirection: 'row',
        shadowOffset: { width: 1, height: 1 },
        shadowColor: 'black',
        shadowOpacity: 0.7
    },
    buttonContainerCall: {
        height: hp('6.5%'),
        width: wp('20%'),
        borderRadius: 10,
        backgroundColor: 'rgba(47,199,111,1)',
        justifyContent: 'center',
        alignItems: 'center',
        margin: wp('5%'),
        // flex: 1,
        flexDirection: 'row',
        shadowOffset: { width: 2, height: 2 },
        shadowColor: 'black',
        shadowOpacity: 0.7
    },
    buttonText: {
        color: '#fff',
        textAlign: 'center',
        fontSize: 16,
        fontWeight: AppFonts.NORMAL
    },
    favArea: {
        height: hp('20%'),
        display: 'flex',
        flexDirection: 'column'
    },
    chatArea: {
        height: hp('50%'),
        display: 'flex',
        flexDirection: 'column'
    },
    chatAreaNoFav: {
        height: hp('70%'),
        display: 'flex',
        flexDirection: 'column'
    },
    titleText: {
        color: GlobalColors.frontmLightBlue,
        marginLeft: 14
    },
    searchIcon: {
        marginHorizontal: 10,
        tintColor: GlobalColors.primaryButtonColor
    },
    input: {
        flex: 1,
        color: 'rgba(155,155,155,1)',
        ...Platform.select({
            ios: {
                height: 50
            },
            android: {
                borderWidth: 1,
                borderColor: GlobalColors.searchBorder,
                borderRadius: 10,
                marginHorizontal: 22,
                marginVertical: 15,
                paddingLeft: 10,
                backgroundColor: '#fff'
            }
        })
    },
    headerRightChat: {
        display: 'flex',
        width: 26,
        height: 26,
        borderRadius: 13,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 5,
        marginBottom: 5,
        backgroundColor: GlobalColors.frontmLightBlue
    },
    headerRightCall: {
        marginRight: 17
    },
    creditBar: {
        backgroundColor: GlobalColors.appBackground,
        paddingHorizontal: 20,
        paddingVertical: 9,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomColor: 'rgba(0, 0, 0, 0.1)',
        borderBottomWidth: 4
    },
    creditBarText: {
        color: 'rgba(153, 153, 153, 1)',
        fontSize: 16
    },
    creditText: {
        color: GlobalColors.frontmLightBlue,
        fontSize: 18
    },
    getCredit: {
        color: GlobalColors.frontmLightBlue,
        fontSize: 18,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: GlobalColors.primaryButtonColor,
        paddingHorizontal: 24,
        paddingVertical: 7
    },
    getCreditDisabled: {
        color: GlobalColors.primaryButtonColorDisabled,
        fontSize: 18,
        paddingHorizontal: 24,
        paddingVertical: 7
    },
    // header icons styles for navigation in bot and chat chennal
    callDisabledStyle: {
        // marginRight: 16,
        paddingHorizontal: 0
    },
    callEnabledIcon: {
        marginRight: 16,
        paddingHorizontal: 0
    },
    voiceCallDisabled: {
        paddingHorizontal: 0,
        marginRight: 2
    },
    leftIconWithTitle: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        alignItems: 'center',
        marginLeft: -22
    }
});

export const BotListStyles = {
    container: {
        flexGrow: 1,
        backgroundColor: GlobalColors.background
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
    },
    favItemContainer: {
        display: 'flex',
        backgroundColor: '#ffb55b',
        flexDirection: 'column',
        justifyContent: 'center',
        height: '100%'
    },
    favItemView: {
        width: 80,
        flexDirection: 'column',
        justifyContent: 'center',
        alignContent: 'center',
        alignItems: 'center'
    },
    favText: {
        marginTop: 4,
        color: GlobalColors.white,
        fontSize: 12
    },
    favIcon: {
        height: 24,
        width: 24,
        resizeMode: 'contain'
    },
    itemSelerator: {
        marginLeft: 74,
        marginRight: 12,
        height: 1,
        backgroundColor: BotListItemColors.borderColor
    }
};

export const BotListItemStyles = {
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: BotListItemColors.backgroundColor,
        paddingVertical: 12,
        paddingHorizontal: 20
    },
    innerContainer: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginLeft: 18,
        marginRight: 18
    },
    botContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: BotListItemColors.backgroundColor,
        paddingVertical: 12,
        paddingHorizontal: 15
    },
    botInnerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1
    },
    containerLast: {
        flex: 1,
        paddingHorizontal: 10,
        paddingVertical: 12,
        justifyContent: 'center',
        backgroundColor: BotListItemColors.backgroundColor
    },
    title: {
        color: BotListItemColors.titleColor,
        fontWeight: AppFonts.BOLD,
        fontSize: 14
    },
    subTitle: {
        color: BotListItemColors.subTitleColor,
        fontSize: 12,
        width: '100%',
        marginTop: 5
    },
    image: {
        height: 44,
        width: 44,
        borderRadius: 6
    },
    conversationImage: {
        height: 44,
        width: 44,
        borderRadius: 22,
        alignSelf: 'center'
    },
    headerImage: {
        height: 32,
        width: 32,
        borderRadius: 16,
        alignSelf: 'center'
    },
    textContainer: {
        alignItems: 'flex-start',
        justifyContent: 'center',
        flex: 1
    },
    botTextContainer: {
        width: '88%'
    },
    time: {
        color: BotListItemColors.dateColor,
        fontSize: 12,
        fontWeight: AppFonts.LIGHT,
        backgroundColor: 'rgba(0, 0, 0, 0)',
        textAlign: 'right'
    },
    rightContainer: {
        flexDirection: 'column',
        marginLeft: 10,
        justifyContent: 'center'
    },
    botRightContainer: {
        flexDirection: 'column',
        alignItems: 'space-between',
        justifyContent: 'center'
    },
    borderBottomContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flex: 1,
        marginLeft: 15
    },
    borderBottom: {
        height: 1,
        width: '100%',
        backgroundColor: BotListItemColors.borderColor,
        flex: 1,
        marginLeft: 90,
        marginRight: 10,
        alignSelf: 'center',
        justifyContent: 'center'
    },
    hidden: {
        display: 'none'
    },
    count: Platform.select({
        ios: {
            backgroundColor: BotListItemColors.countColor,
            height: 24,
            width: 24,
            textAlign: 'center',
            borderRadius: 50,
            paddingLeft: 4,
            paddingRight: 4,
            justifyContent: 'center',
            marginTop: 5
        },
        android: {
            backgroundColor: BotListItemColors.countColor,
            height: 20,
            width: 20,
            textAlign: 'center',
            borderRadius: 50,
            paddingHorizontal: 4,
            display: 'flex',
            justifyContent: 'center'
        }
    }),
    countText: {
        color: BotListItemColors.countTextColor,
        fontSize: 10,
        alignSelf: 'center'
    },
    tabBadge: {
        backgroundColor: BotListItemColors.countColor,
        borderRadius: 16,
        paddingHorizontal: 6,
        paddingVertical: 2,
        zIndex: 2,
        alignSelf: 'flex-end',
        textAlign: 'center'
    },
    tabBadgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: AppFonts.SEMIBOLD
    },
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
