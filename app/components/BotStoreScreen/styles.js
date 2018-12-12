import { StyleSheet, Platform } from 'react-native';
import { SCREEN_WIDTH } from './config';
import { GlobalColors } from '../../config/styles';
import Utils from '../../lib/utils';

export default StyleSheet.create({
    headerTitleStyle: {
        fontSize: 18,
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
        borderColor: GlobalColors.white,
        borderRadius: 0
    },
    tabTextStyle: {
        color: GlobalColors.white,
        fontSize: 14
    },
    activeTabStyle: {
        backgroundColor: GlobalColors.white,
        borderColor: GlobalColors.white
    },
    activeTabTextStyle: {
        color: GlobalColors.accent
    },
    tabsContainerStyle: {
        alignSelf: 'center',
        width: SCREEN_WIDTH,
        borderRadius: 0,
        height: 40
    },
    segmentedControlTab: {
        backgroundColor: 'transparent',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
    },
    headerOuterContainerStyles: Platform.select({
        ios: {
            position: 'relative',
            borderBottomColor: GlobalColors.borderBottom,
            paddingLeft: 0,
            paddingBottom: 10,
            height: Utils.isiPhoneX() ? 70 : 60
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
    }
});
