import { StyleSheet } from 'react-native';
import { SCREEN_WIDTH, scrollViewConfig } from './config';
import { GlobalColors } from '../../config/styles';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp
} from 'react-native-responsive-screen';

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
        fontWeight: 'bold',
        color: GlobalColors.red,
        fontSize: 15
    },
    titleContainerStyle: {
        paddingLeft: 5
    },
    subtitleStyle: {
        fontWeight: '400',
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
        fontWeight: '500'
    },

    headerOuterContainerStyles: {
        position: 'relative',
        borderBottomColor: GlobalColors.accent
    },
    headerinnerContainerForSearch: {
        marginTop: 50
    },
    flatList: {
        height: '100%'
    },
    searchSection: {
        width: wp('100%'),
        height: 40,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        marginTop: 3,
        marginBottom: 20,
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
