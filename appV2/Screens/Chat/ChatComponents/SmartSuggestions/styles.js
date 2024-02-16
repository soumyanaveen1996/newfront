import { StyleSheet, Platform } from 'react-native';
import GlobalColors from '../../../../config/styles';

export default StyleSheet.create({
    suggestionButton: {
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: GlobalColors.bgRippleColor,
        borderWidth: 1,
        borderRadius: 20,
        // borderTopRightRadius: 0,
        backgroundColor: GlobalColors.bgRippleColor,
        paddingVertical: 12,
        paddingHorizontal: 20,
        marginBottom: 15,
        marginTop: 20,
        marginHorizontal: 6
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
        fontSize: 14,
        fontFamily: 'SF Pro Text Regular',
        color: GlobalColors.textRippleColor
    }
});
