import { StyleSheet, Platform } from 'react-native';
import { GlobalColors } from '../../config/styles';

export default StyleSheet.create({
    suggestionButton: {
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: GlobalColors.accent,
        borderWidth: 1,
        borderRadius: 8,
        borderTopRightRadius: 0,
        backgroundColor: GlobalColors.white,
        paddingVertical: 10,
        paddingHorizontal: 10,
        marginBottom: 15,
        marginTop: 20,
        marginHorizontal: 15
    },
    smartSuggestionsIOS: {
        // paddingLeft: 64
        alignSelf: 'flex-end',
        overflow: 'visible'
    },
    smartSuggestionsAndroid: {
        // paddingLeft: 64
        alignSelf: 'flex-end'
    },
    emptyFooter: {
        // width: 64
    },
    suggestionText: {
        fontSize: 15,
        color: GlobalColors.textBlack
    }
});
