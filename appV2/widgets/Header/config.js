import AppFonts from '../../config/fontConfig';
import GlobalColors from '../../config/styles';
import { Platform } from 'react-native';

export const backArrowConfig = Platform.select({
    ios: {
        type: 'ionicon',
        name: 'ios-arrow-back',
        size: 30,
        underlayColor: GlobalColors.transparent,
        color: GlobalColors.primaryButtonColor,
        fontWeight: AppFonts.NORMAL
    },
    android: {
        type: 'ionicon',
        name: 'md-arrow-back',
        size: 30,
        underlayColor: GlobalColors.transparent,
        color: GlobalColors.primaryButtonColor,
        fontWeight: AppFonts.NORMAL
    }
});

export default {
    backArrowConfig
};
