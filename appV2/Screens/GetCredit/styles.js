import { Platform, StyleSheet, Dimensions } from 'react-native';
import GlobalColors from '../../config/styles';
import AppFonts from '../../config/fontConfig';

const screenSize = {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height
};

const buttonSize = 110;
export default stylesheet = StyleSheet.create({
    modal: {
        justifyContent: 'center',
        alignItems: 'center',
        margin: 0
    },
    container: {
        width: '100%',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        paddingTop: '10%',
        backgroundColor: GlobalColors.appBackground
    },
    topContainer: {
        width: '100%',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'stretch',
        paddingTop: '10%'
    },
    title: {
        fontSize: 24,
        alignSelf: 'center',
        marginBottom: 20,
        color: GlobalColors.textBlack
    },
    balance: {
        fontSize: 38,
        alignSelf: 'center',
        fontWeight: AppFonts.SEMIBOLD,
        color: GlobalColors.frontmLightBlue
    },
    creditContainer: {},
    creditRow: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        marginBottom: 25
    },
    creditButton: {
        width: buttonSize,
        height: buttonSize,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 5,
        borderRadius: buttonSize * 0.5,
        borderWidth: 1,
        borderColor: GlobalColors.primaryButtonColor,
        backgroundColor: GlobalColors.white
    },
    creditButtonSelected: {
        width: buttonSize,
        height: buttonSize,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 5,
        borderRadius: buttonSize * 0.5,
        borderWidth: 1,
        borderColor: GlobalColors.primaryButtonColor,
        backgroundColor: GlobalColors.primaryButtonColor
    },
    creditButtonText: {
        fontSize: 20,
        fontWeight: AppFonts.SEMIBOLD,
        color: GlobalColors.textBlack
    },
    creditButtonTextSelected: {
        fontSize: 20,
        fontWeight: AppFonts.SEMIBOLD,
        color: GlobalColors.white
    },
    currency: {
        fontSize: 12,
        fontWeight: AppFonts.LIGHT
    },
    buyButton: {
        alignSelf: 'center',
        width: '75%',
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 20,
        borderRadius: 10,
        backgroundColor: GlobalColors.primaryButtonColor
    },
    buyButtonDisabled: {
        alignSelf: 'center',
        width: '75%',
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 20,
        borderRadius: 10,
        backgroundColor: GlobalColors.primaryButtonColor,
        opacity: 0.2
    },
    buyButtonExecuted: {
        alignSelf: 'center',
        width: '75%',
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 20,
        backgroundColor: GlobalColors.transparent
    },
    buyButtonText: {
        fontSize: 18,
        color: GlobalColors.white
    },
    codeArea: {
        alignSelf: 'center',
        width: '75%',
        flexDirection: 'column',
        alignItems: 'flex-end',
        marginBottom: 15
    },
    codeText: {
        fontSize: 18,
        marginTop: 5,
        color: GlobalColors.textBlack
    },
    rightCodeArea: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'flex-end'
    },
    codeInput: {
        height: 45,
        flex: 1,
        paddingHorizontal: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        color: GlobalColors.formText,
        backgroundColor: GlobalColors.textField,
        borderRadius: 5,
        borderTopRightRadius: 0,
        borderColor: GlobalColors.textField,
        borderLeftWidth: 1,
        borderBottomWidth: 1,
        borderTopWidth: 1,
        borderRightWidth: 1,
        marginHorizontal: 10,
        fontSize: 16
    },
    codeInputApplied: {
        height: 45,
        flex: 1,
        color: GlobalColors.formText,
        paddingHorizontal: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        borderRadius: 5,
        borderTopRightRadius: 0,
        borderColor: GlobalColors.textField,
        borderLeftWidth: 1,
        borderBottomWidth: 1,
        borderTopWidth: 1,
        borderRightWidth: 1,
        marginHorizontal: 10
    },
    codeButton: {
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 10,
        backgroundColor: GlobalColors.primaryButtonColor
    },
    codeButtonDisabled: {
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 10,
        backgroundColor: GlobalColors.primaryButtonColor,
        opacity: 0.2
    },
    codeButtonText: {
        fontSize: 18,
        color: GlobalColors.white
    },
    infoTip: {
        marginLeft: 5,
        width: 0,
        height: 0,
        alignSelf: 'flex-start',
        borderTopWidth: 10,
        borderRightWidth: 5,
        borderBottomWidth: 0,
        borderLeftWidth: 5,
        borderTopColor: GlobalColors.textBlack,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent'
    },
    infoBubble: {
        maxWidth: 250,
        paddingHorizontal: 5,
        paddingVertical: 8,
        backgroundColor: GlobalColors.textBlack,
        zIndex: 10
    },
    infoText: {
        fontSize: 12,
        color: GlobalColors.white
    }
});
