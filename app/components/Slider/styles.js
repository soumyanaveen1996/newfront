import { StyleSheet, Platform } from 'react-native';
import { SCREEN_HEIGHT } from './config';
import { GlobalColors } from '../../config/styles';

export const HEADER_HEIGHT = 50;

export default StyleSheet.create({
    headerView: {
        height: HEADER_HEIGHT,
        flexDirection: 'row',
        alignItems: 'center',
        borderColor: 'lightgrey',
        backgroundColor: GlobalColors.white,
        justifyContent: 'space-between',
        borderTopRightRadius: 15,
        borderTopLeftRadius: 15,
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.08,
        shadowRadius: 4
    },
    closeButton: {
        height: 24,
        width: 24,
        marginLeft: 15
    },
    closeImg: {
        height: 24,
        width: 24
    },
    sliderIconView: {
        flex: 1,
        alignItems: 'center'
    },
    listContainer1: {
        paddingHorizontal: 15
    },
    scrollView: {
        backgroundColor: GlobalColors.white
    },
    listcontainer2: {
        flex: 1,
        borderBottomWidth: 1,
        borderColor: 'lightgrey',
        flexDirection: 'row',
        paddingVertical: 12
    },
    textContainer: {
        flex: 1,
        justifyContent: 'center'
    },
    textStyle: {
        fontSize: 16,
        color: '#24282f'
    },
    infoImageContainer: {
        width: 52,
        justifyContent: 'center',
        alignItems: 'center'
    },
    infoIconStyle: {
        height: 22,
        width: 22
    },
    rightButton: {
        flex: 1,
        paddingRight: 15,
        alignItems: 'flex-end'
    },
    rightButtonText: {
        fontSize: 17,
        color: GlobalColors.accent,
        fontWeight: '500'
    },
    checkboxContainer: {
        margin: 0,
        padding: 0,
        borderWidth: 0
    },
    checkboxIconStyle: {
        margin: 0,
        padding: 0
    },
    animatedView: {
        backgroundColor: GlobalColors.white,
        height: SCREEN_HEIGHT / 1.6,
        width: '100%'
    },
    sliderIconImg: {
        height: 18,
        width: 42
    },
    closeText: {
        color: GlobalColors.frontmLightBlue,
        width: '20%',
        paddingHorizontal: '5%',
        paddingVertical: 15,
        fontSize: 16
    },
    topBarLine: {
        height: 4,
        width: 110,
        backgroundColor: GlobalColors.disabledGray
    }
});
