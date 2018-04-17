import { StyleSheet } from 'react-native';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from './config'
import { GlobalColors } from '../../config/styles';

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
        color: GlobalColors.white
    },
    activeTabStyle: {
        backgroundColor: GlobalColors.white,
        borderColor: GlobalColors.white
    },
    activeTabTextStyle: {
        color: GlobalColors.accent
    },
    tabsContainerStyle: {
        marginBottom: 10,
        alignSelf: 'center',
        width: SCREEN_WIDTH * 0.95
    },
    segmentedControlTab: {
        height: SCREEN_HEIGHT * 0.06,
        backgroundColor: GlobalColors.accent
    },
    headerOuterContainerStyles: {
        position: 'relative',
        borderBottomColor: GlobalColors.accent,
        paddingLeft: 0,
        paddingBottom: 0,
    },
    headerInnerContainerStyles: {
        marginTop:30,
    },
    headerinnerContainerForSearch: {
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
})


