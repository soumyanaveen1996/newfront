import { StyleSheet } from 'react-native';
import GlobalColors from '../../config/styles';
import AppFonts from '../../config/fontConfig';

const stylesheet = StyleSheet.create({
    headerStyles: {
        backgroundColor: GlobalColors.headerBlack
    },
    outerContainerStyles: {
        position: 'relative'
    },
    defaultHeaderRightButton: {
        fontSize: 17,
        color: GlobalColors.primaryButtonColor,
        fontWeight: AppFonts.SEMIBOLD,
        marginRight: 15
    },
    defaultHeaderLeftButton: {
        fontSize: 17,
        color: GlobalColors.primaryButtonColor,
        fontWeight: AppFonts.SEMIBOLD,
        marginLeft: 15
    },
    defaultHeaderLeftIcon: {
        height: 22,
        width: 22
        // marginHorizontal: 10
        // paddingHorizontal: 10
    },
    defaultHeaderRightIcon: {
        marginLeft: 5,
        // paddingHorizontal: 10,
        color: GlobalColors.primaryButtonColor
    },
    defaultHeaderRightIconImage: {
        maxWidth: 40,
        maxHeight: 40,
        marginRight: 20,
        color: GlobalColors.primaryButtonColor
    },
    headerTitleTxtStyle: {
        fontSize: 18,
        color: GlobalColors.white,
        fontWeight: AppFonts.BOLD
    }
});

export default stylesheet;
