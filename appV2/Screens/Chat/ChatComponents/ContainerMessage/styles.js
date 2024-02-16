import { Platform, StyleSheet, Dimensions } from 'react-native';
import GlobalColors from '../../../../config/styles';
import AppFonts from '../../../../config/fontConfig';

// const ScreenSize = {
//     w: Dimensions.get('window').width,
//     h: Dimensions.get('window').height
// };

export default StyleSheet.create({
    tableContainer: {
        flex: 1,
        padding: 15,
        borderRadius: 5
    },
    tabBarContainer: { flexDirection: 'row' },
    tabBar: {
        // backgroundColor: GlobalColors.innerTabBackground
        width: '100%'
    },
    actionsButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        width: '100%',
        borderTopColor: GlobalColors.itemDevider,
        borderTopWidth: 1,
        paddingVertical: 20,
        backgroundColor: GlobalColors.appBackground
    },
    button: {
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 10,
        marginHorizontal: 15,
        flex: 1,
        backgroundColor: GlobalColors.primaryButtonColor,
        borderRadius: 20
    },
    buttonText: {
        fontSize: 14,
        fontWeight: AppFonts.BOLD,
        color: GlobalColors.primaryButtonText
    }
});
