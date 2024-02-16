import { StyleSheet, Platform } from 'react-native';
import { SCREEN_WIDTH } from './config';
import GlobalColors from '../../../config/styles';
import Utils from '../../../lib/utils';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp
} from 'react-native-responsive-screen';
import AppFonts from '../../../config/fontConfig';

export default StyleSheet.create({
    headerTitleStyle: {
        fontSize: 14,
        color: GlobalColors.headerBlack,
        fontWeight: AppFonts.LIGHT
    },
    searchTextInput: {
        flex: 1,
        paddingTop: 10,
        paddingRight: 10,
        paddingBottom: 10,
        paddingLeft: 10,
        fontSize: 14,
        // backgroundColor: '#fff',
        color: GlobalColors.textDarkGrey
    },

    searchBar: {
        margin: 10,
        height: 40
    },

    tabStyle: {
        backgroundColor: GlobalColors.white,
        borderColor: GlobalColors.white,
        borderRadius: 0
    },
    tabTextStyle: {
        color: GlobalColors.chatTitle,
        fontWeight: AppFonts.BOLD,
        fontSize: 12
    },
    activeTabStyle: {
        backgroundColor: GlobalColors.innerTabBackground,
        borderBottomColor: GlobalColors.primaryButtonColor,
        borderBottomWidth: 3
    },
    activeTabTextStyle: {
        color: GlobalColors.primaryButtonColor,
        fontWeight: AppFonts.BOLD,
        fontSize: 12
    },
    tabsContainerStyle: {
        backgroundColor: GlobalColors.innerTabBackground,
        alignSelf: 'center',
        width: SCREEN_WIDTH,
        borderRadius: 0,
        borderColor: 'transparent',
        height: 40
    },
    segmentedControlTab: {
        position: 'relative',
        backgroundColor: 'transparent',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 0
    },
    headerOuterContainerStyles: Platform.select({
        ios: {
            position: 'relative',
            borderBottomColor: GlobalColors.borderBottom,
            paddingLeft: 0,
            paddingBottom: 10,
            height: Utils.isiPhoneX() ? 80 : 70
        },
        android: {
            position: 'relative',
            borderBottomColor: GlobalColors.borderBottom,
            paddingLeft: 0,
            paddingBottom: 0,
            height: 40
        }
    }),
    headerInnerContainerStyles: Platform.select({
        ios: {
            marginTop: 10
        },
        android: {
            marginBottom: 5
        }
    }),

    badgeContainer: {
        position: 'absolute',
        backgroundColor: 'transparent',
        width: 4,
        height: 6,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        borderBottomRightRadius: 0,
        borderBottomLeftRadius: 0,
        bottom: -15,
        left: SCREEN_WIDTH / 18
    },

    activeTabBadgeContainer: {
        backgroundColor: GlobalColors.white
    },
    headerInnerContainerForSearch: {
        marginTop: 50
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
    searchSection: {
        // width: wp('100%'),
        // height: 40,
        // flexDirection: 'row',
        // justifyContent: 'center',
        // alignItems: 'center',
        // backgroundColor: '#fff',
        // marginTop: 3,
        // paddingHorizontal: 20

        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        backgroundColor: GlobalColors.appBackground,
        borderBottomWidth: 1,
        borderBottomColor: GlobalColors.borderBottom,
        height: 40,
        // marginVertical: 3,
        paddingHorizontal: 15,
        borderWidth: 1,
        // borderColor: GlobalColors.textDarkGrey,
        // marginBottom: 10,
        borderColor: 'transparent',
        marginHorizontal: 20,
        marginVertical: 10,
        borderRadius: 33,
        ...Platform.select({
            ios: {},
            android: { elevation: 5 }
        })
    },
    searchIcon: {
        padding: 10
    },

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
