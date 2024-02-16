import { StyleSheet } from 'react-native';
import { SCREEN_WIDTH, scrollViewConfig } from './config';
import GlobalColors from '../../../../config/styles';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp
} from 'react-native-responsive-screen';
import AppFonts from '../../../../config/fontConfig';

export default StyleSheet.create({
    tileContainer: {
        width: scrollViewConfig.width * 0.5,
        height: SCREEN_WIDTH * 0.5,
        borderWidth: 4,
        borderTopWidth: 8,
        borderBottomWidth: 2,
        borderColor: 'transparent',
        borderRadius: 15
    },

    rowContainer: {
        justifyContent: 'center',
        alignItems: 'stretch',
        borderRadius: 6,
        overflow: 'hidden',
        marginBottom: 20
    },
    rowContent: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'white',
        borderRadius: 6
    },
    avatarContainerStyle: {
        height: 50,
        width: 40
    },
    avatarStyle: {
        height: 40,
        width: 30
    },
    containerStyle: {
        height: 100,
        borderBottomColor: 'transparent',
        justifyContent: 'center'
    },
    titleStyle: {
        fontWeight: AppFonts.BOLD,
        color: GlobalColors.red,
        fontSize: 15
    },
    titleContainerStyle: {
        paddingLeft: 5
    },
    subtitleStyle: {
        fontWeight: AppFonts.LIGHT,
        fontSize: 13
    },
    avatarOverlayContainerStyle: {
        backgroundColor: 'transparent'
    },
    subtitleContainerStyle: {
        padding: 5
    },
    gridStyle: {
        flex: 1
    },
    headerTitleStyle: {
        fontSize: 17,
        color: GlobalColors.white,
        fontWeight: AppFonts.NORMAL
    },

    headerOuterContainerStyles: {
        position: 'relative',
        borderBottomColor: GlobalColors.accent
    },
    headerinnerContainerForSearch: {
        marginTop: 50
    },
    flatList: {
        height: '100%',
        marginTop: 10
    },
    searchSection: {
        width: '100%',
        margin: 10
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
    },
    appsCount: {
        color: GlobalColors.primaryTextColor,
        fontSize: 22,
        fontWeight: AppFonts.SEMIBOLD,
        marginBottom: 20,
        marginTop: 10,
        marginLeft: 10
    },
    appsCountSlim: {
        color: GlobalColors.primaryTextColor,
        fontSize: 22,
        fontWeight: AppFonts.LIGHT,
        marginBottom: 20
    }
});
