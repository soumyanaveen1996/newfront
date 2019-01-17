import { Platform, StyleSheet, Dimensions } from 'react-native';
import { GlobalColors } from '../../config/styles';

export default (stylesheet = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: GlobalColors.white
    },
    list: {
        marginVertical: 25,
        marginHorizontal: '7%'
    },
    checkbox: {
        backgroundColor: GlobalColors.transparent,
        borderWidth: 0,
        margin: 0,
        paddingHorizontal: 0
    },
    optionText: {
        fontSize: 18,
        color: GlobalColors.headerBlack,
        fontWeight: 'normal'
    },
    buttonArea: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 15,
        marginHorizontal: '7%',
        borderTopWidth: 1,
        borderColor: GlobalColors.disabledGray
    },
    button: {
        width: '75%',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: GlobalColors.sideButtons,
        backgroundColor: GlobalColors.sideButtons,
        borderRadius: 5
    },
    buttonText: {
        fontSize: 20,
        color: GlobalColors.white
    }
}));
