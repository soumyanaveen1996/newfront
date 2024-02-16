import { StyleSheet } from 'react-native';
import GlobalColors from '../../config/styles';
import AppFonts from '../../config/fontConfig';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: 'red'
    },
    text: {
        fontSize: 18,
        fontWeight: AppFonts.BOLD,
        fontStyle: 'italic',
        textAlign: 'center',
        color: GlobalColors.accent
    },
    closeButton: {
        flex: 0,
        position: 'absolute',
        top: 20,
        bottom: 20,
        width: 45,
        height: 45
    },
    preview: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center'
    }
});

export default styles;
