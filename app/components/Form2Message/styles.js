import { Platform, StyleSheet, Dimensions } from 'react-native';
import { GlobalColors } from '../../config/styles';

export default (stylesheet = StyleSheet.create({
    //MESSAGE
    container: {
        marginLeft: '10%',
        marginTop: 20,
        width: '80%',
        padding: 20,
        flexDirection: 'column',
        alignItems: 'stretch',
        backgroundColor: GlobalColors.white,
        borderRadius: 10,
        borderWidth: 0.2,
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.08,
        shadowRadius: 4
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
        borderColor: GlobalColors.sideButtons,
        backgroundColor: GlobalColors.sideButtons,
        borderRadius: 5
    },
    buttonSee: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: GlobalColors.sideButtons,
        backgroundColor: GlobalColors.white,
        borderRadius: 5
    },
    buttonTextContinue: {
        fontSize: 16,
        color: GlobalColors.white
    },
    buttonTextSee: {
        fontSize: 16,
        color: GlobalColors.sideButtons
    },
    completedCheck: {
        width: 25,
        height: 25,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: GlobalColors.disabledGray,
        borderRadius: 10
    },

    //FORM
    f2Container: {
        backgroundColor: GlobalColors.white
    },
    f2Title: {
        marginTop: 25,
        marginHorizontal: '8%',
        fontSize: 27,
        color: GlobalColors.headerBlack
    },
    f2FieldContainer: {
        marginTop: 25,
        marginHorizontal: '10%'
    },
    f2LabelTitle: {
        marginBottom: 13,
        fontSize: 16,
        color: GlobalColors.headerBlack
    },
    f2BottomArea: {
        marginVertical: 35,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center'
    },
    f2CancelButton: {
        width: '35%',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: GlobalColors.sideButtons,
        backgroundColor: GlobalColors.white,
        borderRadius: 5
    },
    f2CancelButtonText: {
        fontSize: 20,
        color: GlobalColors.sideButtons
    },
    f2DoneButton: {
        width: '35%',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: GlobalColors.sideButtons,
        backgroundColor: GlobalColors.sideButtons,
        borderRadius: 5
    },
    f2DoneButtonText: {
        fontSize: 20,
        color: GlobalColors.white
    },

    //FORM FIELDS
    textField: {
        height: 45,
        paddingHorizontal: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: GlobalColors.textField,
        borderRadius: 5,
        borderTopRightRadius: 0
    },
    checkbox: {
        backgroundColor: GlobalColors.transparent,
        borderWidth: 0,
        margin: 0,
        paddingHorizontal: 0
    },
    optionText: {
        fontSize: 18,
        color: GlobalColors.headerBlack,
        fontWeight: 'normal'
    },
    dateField: {
        height: 42,
        width: '40%',
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
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: GlobalColors.disabledGray
    },

    //MODALS
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
        borderColor: GlobalColors.sideButtons,
        backgroundColor: GlobalColors.sideButtons,
        borderRadius: 5
    },
    dropdownModal: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    dropdownPicker: {
        width: '80%',
        height: '50%',
        flexDirection: 'column',
        justifyContent: 'space-between',
        paddingHorizontal: 30,
        paddingVertical: 35,
        borderRadius: 10,
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        backgroundColor: GlobalColors.white
    },
    dropdownModalTitle: {
        fontSize: 18,
        color: GlobalColors.sideButtons,
        fontWeight: 'bold',
        textAlign: 'center'
    },
    dropdownModalButton: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: GlobalColors.sideButtons,
        backgroundColor: GlobalColors.sideButtons,
        borderRadius: 5
    }
}));
