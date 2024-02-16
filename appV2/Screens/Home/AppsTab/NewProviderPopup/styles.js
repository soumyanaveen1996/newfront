import { StyleSheet, Platform, Dimensions } from 'react-native';
import GlobalColors from '../../../../config/styles';
import AppFonts from '../../../../config/fontConfig';

export const SCREEN_WIDTH = Dimensions.get('window').width;
export const SCREEN_HEIGHT = Dimensions.get('window').height;

export default StyleSheet.create({
    modalBackground: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: 'rgba(0,0,0,0.4)',
        alignItems: 'center',
        justifyContent: 'center'
    },
    container: {
        position: 'relative',
        width: 320,
        height: 300,
        backgroundColor: GlobalColors.appBackground,
        borderRadius: 10,
        paddingVertical: 40,
        paddingHorizontal: 20,
        alignItems: 'center'
    },
    headerText: {
        color: GlobalColors.primaryTextColor,
        fontSize: 16,
        fontWeight: AppFonts.BOLD,
        textAlign: 'center'
    },
    descriptionText: {
        marginTop: 20,
        color: GlobalColors.primaryTextColor,
        fontSize: 12,
        textAlign: 'center'
    },
    inputBoxContainer: {
        width: '100%',
        height: 40,
        padding: 0,
        flexDirection: 'row',
        marginTop: 20,
        marginBottom: 2,
        alignItems: 'center',
        justifyContent: 'space-evenly'
    },
    input: {
        height: 35,
        width: 230,
        textAlignVertical: 'center',
        paddingVertical: 0,
        backgroundColor: GlobalColors.formItemBackgroundColor,
        paddingHorizontal: 10,
        color: GlobalColors.formText,
        fontSize: 14,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: GlobalColors.formBorderColor
    },
    cancelBtn: {
        height: 32,
        width: 136,
        backgroundColor: GlobalColors.secondaryButtonColor,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8
    },
    cancelText: {
        color: GlobalColors.secondaryButtonText,
        fontWeight: AppFonts.BOLD,
        fontSize: 14
    },
    submitBtn: {
        height: 32,
        width: 136,
        backgroundColor: GlobalColors.primaryButtonColor,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center'
    },

    buttonContainer: {
        flexDirection: 'row',
        height: 40,
        justifyContent: 'center',
        marginTop: 15
    },
    emptyBtn: {
        height: 32,
        width: 136,
        backgroundColor: GlobalColors.primaryButtonColorDisabled,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center'
    },
    submitText: {
        color: GlobalColors.primaryButtonText,
        fontWeight: AppFonts.BOLD,
        fontSize: 14
    },
    containerError: {
        width: '100%',
        height: 25,
        alignItems: 'flex-end',
        justifyContent: 'flex-end'
    },
    errorContainer: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    userError: {
        backgroundColor: GlobalColors.red,
        zIndex: 999999,
        padding: 2,
        borderTopRightRadius: 6,
        borderBottomLeftRadius: 6,
        borderBottomRightRadius: 6,
        borderTopLeftRadius: 0,
        alignItems: 'center'
    },
    errorText: Platform.select({
        ios: {
            color: '#ffffff',
            textAlign: 'center'
        },
        android: {
            color: '#ffffff',
            textAlign: 'center'
        }
    }),
    barCodeIcon: {
        width: 35,
        height: 35,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 6,
        borderWidth: 1,
        borderColor: GlobalColors.formBorderColor
    }
});
