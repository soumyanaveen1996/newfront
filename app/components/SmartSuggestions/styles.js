import { StyleSheet, Platform } from 'react-native';
import { GlobalColors } from '../../config/styles';

export const FONT_COLOR = GlobalColors.accent;
export const FONT_SIZE = 15;

export default StyleSheet.create({
    suggestionButton: {
        borderColor: GlobalColors.accent,
        borderWidth: 1,
        borderRadius: 8,
        borderTopRightRadius: 0,
        backgroundColor: GlobalColors.white,
        paddingVertical: 5,
        paddingHorizontal: 10,
        marginVertical: 9
    },
    smartSuggestions: {
        paddingLeft: 60
    }
});
