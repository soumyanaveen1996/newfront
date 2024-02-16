import { StyleSheet } from 'react-native';
import GlobalColors from '../../../../config/styles';

export default StyleSheet.create({
    backButton: {
        backgroundColor: GlobalColors.appBackground,
        width: 24,
        height: 24,
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 17
    },
    closeButton: {
        marginHorizontal: 10
    },
    tableContainer: {
        flex: 1,
        overflow: 'hidden'
    }
});
