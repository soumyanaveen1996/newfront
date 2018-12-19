import { StyleSheet } from 'react-native';
import { SCREEN_WIDTH, scrollViewConfig } from './config';
import { GlobalColors } from '../../config/styles';
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
    titleBar: {
        width: SCREEN_WIDTH - 20,
        height: 45,
        backgroundColor: '#fff',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 10,
        borderColor: 'transparent',
        borderWidth: 1,
        borderBottomColor: GlobalColors.borderBottom,
        borderTopRightRadius: 10,
        borderTopLeftRadius: 10
    },
    categoryTitleStyle: {
        fontSize: 20,
        color: 'rgba(74,74,74,1)'
    },
    rowContainer: {
        width: SCREEN_WIDTH - 20,
        height: 110,
        borderBottomWidth: 1,
        backgroundColor: '#fff',
        borderColor: 'transparent',
        borderWidth: 1,
        borderBottomColor: GlobalColors.borderBottom
    },
    rowContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent'
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
        flex: 1
    },
    toast: {
        position: 'absolute',
        bottom: 15
    },
    exploreAllFooter: {
        width: SCREEN_WIDTH - 20,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        borderBottomRightRadius: 10,
        borderBottomLeftRadius: 10
    }
});