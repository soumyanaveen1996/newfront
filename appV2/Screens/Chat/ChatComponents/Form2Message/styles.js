import { Platform, StyleSheet, Dimensions } from 'react-native';
import GlobalColors from '../../../../config/styles';
import AppFonts from '../../../../config/fontConfig';

const ScreenSize = {
    w: Dimensions.get('window').width,
    h: Dimensions.get('window').height
};

export default stylesheet = StyleSheet.create({
    // MESSAGE
    container: {
        marginLeft: '10%',
        marginTop: 20,
        width: '80%',
        padding: 20,
        flexDirection: 'column',
        alignItems: 'stretch',
        backgroundColor: GlobalColors.appBackground,
        borderRadius: 10,
        borderWidth: 0.2,
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.08,
        shadowRadius: 4
    },
    containerArea: {
        height: '100%',
        width: '100%',
        backgroundColor: GlobalColors.appBackground
    },
    topArea: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderColor: GlobalColors.disabledGray
    },
    title: {
        fontSize: 18,
        color: GlobalColors.headerBlack
    },
    description: {
        fontSize: 14,
        color: GlobalColors.darkGray,
        paddingVertical: 12
    },
    buttonContinue: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: GlobalColors.primaryButtonColor,
        backgroundColor: GlobalColors.primaryButtonColor,
        borderRadius: 5
    },
    buttonSee: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: GlobalColors.primaryButtonColor,
        backgroundColor: GlobalColors.white,
        borderRadius: 5
    },
    buttonTextContinue: {
        fontSize: 14,
        color: GlobalColors.white
    },
    buttonTextSee: {
        fontSize: 16,
        color: GlobalColors.primaryButtonColor
    },
    completedCheck: {
        width: 25,
        height: 25,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: GlobalColors.disabledGray,
        borderRadius: 10
    },

    // FORM
    f2Container: {
        flex: 1,
        backgroundColor: GlobalColors.appBackground
    },

    f2Title: {
        marginTop: 25,
        marginHorizontal: ScreenSize.w * 0.1,
        // paddingStart: 12,
        fontSize: 20,
        color: GlobalColors.headerBlack
    },
    f2FieldContainer: {
        marginTop: 20,
        paddingBottom: 12,
        marginHorizontal: ScreenSize.w * 0.1
    },
    f2LabelTitle: {
        fontSize: 18,
        marginRight: 5,
        alignSelf: 'center',
        color: GlobalColors.formLable
    },
    f2BottomArea: {
        marginVertical: 16,
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 30,
        justifyContent: 'space-between'
    },
    form2FieldContainer: {
        paddingTop: 25,
        paddingBottom: 55
    },
    f2CancelButton: {
        height: 38,
        flex: 1,
        flexGrow: 1,
        marginHorizontal: 8,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: GlobalColors.secondaryButtonColor,
        borderRadius: 20
    },
    f2CancelButtonText: {
        fontSize: 14,
        letterSpacing: 0.51,
        fontWeight: AppFonts.BOLD,
        color: GlobalColors.secondaryButtonText
    },
    f2DoneButton: {
        height: 38,
        flex: 1,
        flexGrow: 1,
        marginHorizontal: 8,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: GlobalColors.primaryButtonColor,
        borderRadius: 20
    },
    f2DoneButtonDisabled: {
        backgroundColor: GlobalColors.primaryButtonColorDisabled
    },
    f2DoneButtonText: {
        fontSize: 14,
        letterSpacing: 0.51,
        fontWeight: AppFonts.BOLD,
        color: GlobalColors.primaryButtonText
    },
    f2DoneButtonTextDisabled: { color: GlobalColors.primaryButtonTextDisabled },

    // FORM FIELDS
    textField: {
        height: 45,
        paddingHorizontal: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: GlobalColors.formItemBackgroundColor,
        borderRadius: 6,
        fontSize: 18,
        color: GlobalColors.formText
    },
    disableField: {
        color: GlobalColors.formTextDisabled,
        backgroundColor: GlobalColors.formItemBackgroundColorDisabled
    },
    activeField: {
        color: GlobalColors.primaryButtonColor
    },
    dropdownAndroid: {
        height: 45,
        paddingHorizontal: 12,
        justifyContent: 'center',
        backgroundColor: GlobalColors.textField,
        borderRadius: 5
    },
    searchText: {
        height: '100%',
        flex: 1,
        fontSize: 18,
        color: GlobalColors.textBlack,
        alignSelf: 'center'
    },
    textArea: {
        height: 120,
        paddingHorizontal: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        backgroundColor: GlobalColors.textField,
        borderRadius: 5,
        borderTopRightRadius: 0,
        fontSize: 18,
        color: GlobalColors.textDarkGrey
    },
    checkbox: {
        backgroundColor: GlobalColors.transparent,
        borderWidth: 0,
        margin: 0,
        paddingHorizontal: 0
    },
    optionText: {
        fontSize: 18,
        color: GlobalColors.formText,
        fontWeight: AppFonts.NORMAL
    },
    dateField: {
        height: 42,
        // width: '45%',
        paddingHorizontal: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: GlobalColors.textField,
        borderRadius: 5,
        borderTopRightRadius: 0
    },
    multiselectionContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 20,
        marginHorizontal: '10%',
        borderBottomWidth: 1,
        borderColor: GlobalColors.disabledGray
    },
    callButton: {
        // flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        backgroundColor: GlobalColors.green,
        borderRadius: 25,
        // padding: 10,
        width: 50,
        height: 50
    },
    callButtonText: {
        color: GlobalColors.white,
        fontSize: 18,
        fontWeight: AppFonts.SEMIBOLD,
        marginHorizontal: 8
    },
    fieldButtonsContainer: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    fieldButton: {
        backgroundColor: GlobalColors.primaryButtonColor,
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 16,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center'
    },
    fieldButtonDisabled: {
        backgroundColor: GlobalColors.primaryButtonColorDisabled,
        paddingVertical: 8,
        height: 32,
        paddingHorizontal: 14,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center'
    },
    fieldButtonText: {
        color: GlobalColors.white,
        fontWeight: AppFonts.SEMIBOLD
    },

    // MODALS
    lookUpModalResults: {
        maxHeight: '80%',
        minHeight: '65%',
        width: '85%',
        paddingBottom: 5,
        marginTop: 10,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        borderRadius: 10,
        borderWidth: 0.2,
        overflow: 'hidden',
        backgroundColor: GlobalColors.appBackground
    },
    lookUpModalTopBar: {
        // backgroundColor: GlobalColors.frontmLightBlue,
        paddingHorizontal: 5,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center'
    },
    dateModalIOS: {
        justifyContent: 'flex-end',
        margin: 0
    },
    datePickerIOS: {
        // alignItems: 'center',
        width: '100%',
        backgroundColor: GlobalColors.white,
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.08,
        shadowRadius: 4
    },
    dateModalButtonArea: {
        flexDirection: 'row',
        justifyContent: 'center'
    },
    dateModalButton: {
        width: '45%',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 50,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: GlobalColors.primaryButtonColor,
        backgroundColor: GlobalColors.primaryButtonColor,
        borderRadius: 5
    },
    dropdownModal: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    dropdownPicker: {
        width: '100%',
        bottom: 0,
        backgroundColor: GlobalColors.white
    },
    dropdownModalTitle: {
        fontSize: 18,
        color: GlobalColors.primaryButtonColor,
        fontWeight: AppFonts.BOLD,
        textAlign: 'center'
    },
    dropdownModalButton: {
        justifyContent: 'center',
        alignItems: 'center',
        width: '80%',
        alignSelf: 'center',
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: GlobalColors.primaryButtonColor,
        backgroundColor: GlobalColors.primaryButtonColor,
        borderRadius: 5
    },
    dropDownModalList: {
        marginBottom: 12,
        marginTop: 8
    },
    modalBackground: {
        backgroundColor: 'black',
        opacity: 0.2,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
    },

    // INFO BUBBLE
    infoTip: {
        width: 0,
        height: 0,
        alignSelf: 'center',
        borderTopWidth: 5,
        borderRightWidth: 10,
        borderBottomWidth: 5,
        borderLeftWidth: 0,
        borderRightColor: GlobalColors.textBlack,
        borderBottomColor: 'transparent',
        borderTopColor: 'transparent'
    },
    infoBubble: {
        maxWidth: 150,
        paddingHorizontal: 5,
        paddingVertical: 8,
        backgroundColor: GlobalColors.textBlack,
        zIndex: 10
    },
    infoText: {
        fontSize: 12,
        color: GlobalColors.white
    },
    resultList: {
        backgroundColor: GlobalColors.textField,
        borderBottomLeftRadius: 15,
        borderBottomRightRadius: 15,
        maxHeight: 200,
        paddingHorizontal: 20
    },
    resultText: {
        fontSize: 18,
        color: GlobalColors.textBlack,
        flex: 1
    },

    // VALIDATION
    validationMessage: {
        justifyContent: 'center',
        alignSelf: 'flex-end',
        backgroundColor: GlobalColors.red,
        borderTopRightRadius: 5,
        borderTopLeftRadius: 0,
        borderBottomRightRadius: 5,
        borderBottomLeftRadius: 5,
        paddingHorizontal: 5,
        paddingVertical: 2,
        marginTop: 3
    },
    globalValidationMessage: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: GlobalColors.red,
        paddingHorizontal: 5,
        paddingVertical: 2,
        position: 'absolute',
        top: 0,
        width: '100%'
    },
    validationMessageText: {
        fontSize: 14,
        fontWeight: AppFonts.LIGHT,
        color: 'white'
    },

    // IMAGE PICKER
    imagePickerContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: ScreenSize.w * 0.8
    },
    imageContainer: {
        width: ScreenSize.w,
        height: ScreenSize.w * 0.8,
        position: 'absolute',
        left: -(ScreenSize.w * 0.1),
        backgroundColor: GlobalColors.textField,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden'
    },
    imageFieldContainer: {
        width: '92%',
        height: '92%',
        justifyContent: 'center',
        alignItems: 'center',
        borderStyle: 'dashed',
        borderWidth: 3,
        borderColor: GlobalColors.disabledGray
    },
    removeImage: {
        flexDirection: 'row',
        justifyContent: 'center',
        flex: 1
    },
    removeImageText: {
        fontSize: 16,
        color: GlobalColors.red,
        marginLeft: 10
    },
    image: {
        width: '100%',
        height: '100%'
    }
});
