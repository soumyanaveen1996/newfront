import { StyleSheet } from 'react-native';
import { GlobalColors } from '../../config/styles';

export default StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: GlobalColors.transparent
    },
    titleStyle: {
        color: GlobalColors.red
    },
    textStyle: {
        marginBottom: 30
    },
    buttonStyle: {
        borderRadius: 0,
        marginLeft: 0,
        marginRight: 0,
        marginBottom: 0,
        backgroundColor: GlobalColors.iosBlue
    }
});
