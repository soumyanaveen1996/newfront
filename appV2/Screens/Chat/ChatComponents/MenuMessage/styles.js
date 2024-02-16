import { PixelRatio, StyleSheet } from 'react-native';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp
} from 'react-native-responsive-screen';
import GlobalColors from '../../../../config/styles';

export default StyleSheet.create({
    fullScreenContainer: {
        // flex: 1,
        height: '100%',
        width: '100%',
        backgroundColor: GlobalColors.appBackground,
        overflow: 'visible'
    },
    menusList: {
        width: '100%',
        height: '100%',
        overflow: 'visible'
    },
    menuContainer: {
        width: wp('90%'),
        borderRadius: 10,
        borderWidth: 1,
        borderColor: GlobalColors.frontmLightBlue
    },
    menu: {
        overflow: 'visible',
        flex: 1
    },
    menuContentContainer: {
        borderRadius: 10,
        borderWidth: 1,
        borderColor: GlobalColors.frontmLightBlue
    },
    entry: {
        alignItems: 'center',
        paddingHorizontal: 15,
        backgroundColor: 'red',
        flexDirection: 'row'
    },
    backButton: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingHorizontal: 15,
        borderBottomColor: GlobalColors.disabledGray,
        borderBottomWidth: 1
    },
    entryText: {
        fontSize: 16,
        marginVertical: 15,
        marginLeft: 15,
        color: GlobalColors.textBlack
    },
    entryTextSelected: {
        fontSize: 16,
        marginVertical: 15,
        marginLeft: 15,
        color: GlobalColors.frontmLightBlue
    },
    separator: {
        width: '99%',
        height: 1,
        backgroundColor: GlobalColors.disabledGray
    },
    separatorHorizontal: {
        width: 10
    },
    separatorHorizontalEdge: {
        width: 30
    }
});
