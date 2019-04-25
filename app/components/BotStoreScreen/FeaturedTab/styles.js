import { StyleSheet } from 'react-native';
import { SCREEN_WIDTH, scrollViewConfig } from './config';
import { GlobalColors } from '../../../config/styles';
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
        marginBottom: 10
    },
    rowContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        marginTop: 20
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
    flatList: {
        flex: 1,
        paddingTop: 15
    },
    toast: {
        position: 'absolute',
        bottom: 15
    }
});
