import { StyleSheet, Platform } from 'react-native';
import { GlobalColors } from '../../config/styles';

export const FONT_COLOR = GlobalColors.black;
export const FONT_SIZE = 15;

export default StyleSheet.create({
    suggestionButton: {
        borderColor: GlobalColors.accent,
        borderWidth: 1,
        borderRadius: 8,
        borderTopRightRadius: 0,
        backgroundColor: GlobalColors.white,
        paddingVertical: 10,
        paddingHorizontal: 10,
        marginBottom: 15,
        marginTop: 20
    },
    smartSuggestions: {
        paddingLeft: 64
    },
    emptyFooter: {
        width: 64
    }
});
