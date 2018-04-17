import { StyleSheet } from 'react-native';
import { GlobalColors } from '../../config/styles';
import { Platform } from 'react-native';

const Styles = StyleSheet.create({
    containerStyle: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        backgroundColor: 'rgba(32, 32, 32, 0.6)',
    },
    formContainer:Platform.select({
        'ios': {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: GlobalColors.white,
            paddingBottom: 5,
            maxHeight: 340,
        },
        'android': {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: GlobalColors.white,
            paddingBottom: 5,
            maxHeight: 360,
        }
    }),
    headerContainer: {
        height: 58,
        flexDirection: 'row',
    },
    closeButton:{
        height:24,
        width:24
    },
    headerCloseButton: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: 40,
        height: 40,
        padding: 8,
        marginTop: 12,
        marginLeft: 5,
    },
    headerTitleContainer: {
        flex: 1,
        paddingLeft: 58,
        paddingRight: 58,
        justifyContent: 'center',
        alignItems: 'center'
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: 'bold',
        color: 'rgb(181,186,201)',
    },
    formScrollView: {
        backgroundColor: GlobalColors.white,
        paddingBottom: 20,
    },
    formTitleContainer: {
        padding: 20,
        height: 50,
        borderBottomWidth: 1,
        borderColor: GlobalColors.disabledGray,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    formTitle: {
        color: GlobalColors.black,
        fontWeight: '500',
        fontSize: 15,
    },
    formCloseButton: {
    },
    formCloseButtonText: {
        color: GlobalColors.botChatBubbleColor,
        fontWeight: '700',
    },
    formElementsContainer: {
        height: 60,
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    formInputContainer:Platform.select({
        'ios': {
            marginVertical: 5,
            height: 60,
            justifyContent: 'center',
            paddingHorizontal: 20,
        },
        'android': {
            marginVertical: 5,
            height: 72,
            justifyContent: 'center',
            paddingHorizontal: 20,
        }
    }),
    formTwoLineInputContainer:Platform.select({
        'ios': {
            marginVertical: 5,
            height: 70,
            justifyContent: 'center',
            paddingHorizontal: 20,
        },
        'android': {
            marginVertical: 5,
            height: 84,
            justifyContent: 'center',
            paddingHorizontal: 20,
        }
    }),
    titleContainer: {
        flex: 1,
        flexDirection: 'row'
    },
    formInputLabel: {
        fontSize: 14,
        fontWeight: '600',
    },
    formErrorLabel: {
        fontSize: 12,
        fontWeight: '300',
        color: GlobalColors.red,
    },
    formTextField: {
        padding: 10,
        borderWidth: 1,
        borderColor: GlobalColors.disabledGray,
        borderRadius: 4,
        width: '100%',
    },
    formButtonContainer: {
        height: 60,
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    formButton: {
        backgroundColor: GlobalColors.botChatBubbleColor,
        borderColor: GlobalColors.transparent,
        borderRadius: 4,
        shadowColor: GlobalColors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    formButtonDisabled: {
        backgroundColor: GlobalColors.disabledGray,
    },
    formButtonText: {
        color: GlobalColors.white,
        fontWeight: '400',
        fontSize: 16,
    },
    noBorder: {
        borderWidth: 0,
    },
    checkboxContainer: {
        width: 22,
        height: 22,
        marginRight:12.5,
        padding: 0,
        marginLeft: 0,
        marginVertical: 0,
        backgroundColor: GlobalColors.transparent,
        borderWidth: 0,
    },
    checkboxIconStyle: {
        height:22,
        width:22,
    },
    checkBoxText: {
        color: GlobalColors.black,
        fontWeight: '400',
        fontSize: 16,
    },
    checkBoxContainer: {
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
});

export default Styles;
