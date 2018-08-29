import { StyleSheet, Platform } from 'react-native';
import { SCREEN_WIDTH } from './config'
import { GlobalColors } from '../../config/styles';
import Utils from '../../lib/utils';

export default StyleSheet.create({
    headerTitleStyle: {
        fontSize: 17,
        color: GlobalColors.white,
        fontWeight: '500'
    },
    searchBar: {
        flex: 1,
        backgroundColor: GlobalColors.accent,
        borderTopColor: GlobalColors.accent,
        borderBottomColor: GlobalColors.accent,
        paddingTop: 100
    },

    tabStyle: {
        backgroundColor: GlobalColors.accent,
        borderColor: GlobalColors.white
    },
    tabTextStyle: {
        color: GlobalColors.white,
        fontSize: 12
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
        width: SCREEN_WIDTH * 0.95
    },
    segmentedControlTab: {
        height: 40,
        backgroundColor: GlobalColors.accent,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
    },
    headerOuterContainerStyles: Platform.select({
        'ios': {
            position: 'relative',
            borderBottomColor: GlobalColors.accent,
            paddingLeft: 0,
            paddingBottom: 0,
            height: Utils.isiPhoneX() ? 70 : 50,
        },
        'android': {
            position: 'relative',
            borderBottomColor: GlobalColors.accent,
            paddingLeft: 0,
            paddingBottom: 0,
            height: 40
        }
    }),
    headerInnerContainerStyles: Platform.select({
        'ios':  {
            marginTop: 10,
        },
        'android':  {
            marginBottom: 5,
        }
    }),
    headerInnerContainerForSearch: {
        marginTop: 50,
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
})


