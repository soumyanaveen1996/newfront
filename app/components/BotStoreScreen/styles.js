import { StyleSheet, Platform } from 'react-native';
import { SCREEN_WIDTH } from './config';
import { GlobalColors } from '../../config/styles';
import Utils from '../../lib/utils';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp
} from 'react-native-responsive-screen';

export default StyleSheet.create({
    headerTitleStyle: {
        fontSize: 14,
        color: GlobalColors.headerBlack,
        fontWeight: '400',
        fontFamily: 'SF Pro Text'
    },
    searchBar: {
        flex: 1,
        backgroundColor: GlobalColors.accent,
        borderTopColor: GlobalColors.accent,
        borderBottomColor: GlobalColors.accent,
        paddingTop: 100
    },

    tabStyle: {
        backgroundColor: GlobalColors.tabBackground,
        borderColor: GlobalColors.tabBackground,
        borderRadius: 0
    },
    tabTextStyle: {
        color: GlobalColors.tabText,
        fontSize: 14
    },
    activeTabStyle: {
        backgroundColor: GlobalColors.tabBackground,
        borderColor: GlobalColors.tabBackground
    },
    activeTabTextStyle: {
        color: GlobalColors.white
    },
    tabsContainerStyle: {
        alignSelf: 'center',
        width: SCREEN_WIDTH,
        borderRadius: 0,
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
        justifyContent: 'center'
    },
    searchSection: {
        width: wp('100%'),
        height: 40,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        marginTop: 3,
        paddingHorizontal: 20
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
