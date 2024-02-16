import { StyleSheet } from 'react-native';
import GlobalColors from '../../../../config/styles';
import AppFonts from '../../../../config/fontConfig';

export default StyleSheet.create({
    container: {
        flex: 1,
        padding: 22,
        width: '100%',
        backgroundColor: GlobalColors.appBackground
    },
    filterContainer: {
        flex: 1,
        padding: 12,
        flexDirection: 'row',
        flexWrap: 'wrap'
    },
    filterItem: {
        height: 32,
        margin: 4,
        borderColor: GlobalColors.socialFilterItemBorder,
        justifyContent: 'center',
        borderWidth: 1,
        borderRadius: 16
    },
    filterItemSelected: {
        height: 32,
        margin: 4,
        backgroundColor: GlobalColors.green,
        justifyContent: 'center',
        borderRadius: 16
    },
    filterItemText: {
        marginHorizontal: 8,
        color: GlobalColors.socialAuther,
        fontSize: 14
    },
    filterItemTextSelected: {
        marginHorizontal: 8,
        fontSize: 14,
        color: GlobalColors.white
    },
    tabIconStyle: {
        height: 36,
        width: 36,
        justifyContent: 'center'
    },
    surveyTitle: {
        fontSize: 24,
        fontWeight: AppFonts.BOLD,
        letterSpacing: -0.51,
        textAlign: 'left',
        color: GlobalColors.formText
    },
    surveyDescription: {
        fontSize: 16,
        fontWeight: 'normal',
        fontStyle: 'normal',
        marginTop: 33,
        textAlign: 'left',
        color: GlobalColors.formLable
    },
    surveyButtonNext: {
        height: 38,
        flex: 1,
        backgroundColor: GlobalColors.primaryButtonColor,
        borderRadius: 19,
        justifyContent: 'center',
        alignItems: 'center'
    },
    surveyButtonPrevious: {
        height: 38,
        flex: 1,
        backgroundColor: GlobalColors.secondaryButtonColor,
        borderRadius: 19,
        justifyContent: 'center',
        alignItems: 'center'
    },
    surveyButtonText: {
        fontSize: 14,
        fontWeight: AppFonts.BOLD,
        textAlign: 'center',
        color: GlobalColors.primaryButtonText
    },
    surveyButtonTextPrevious: {
        fontSize: 14,
        fontWeight: AppFonts.BOLD,
        textAlign: 'center',
        color: GlobalColors.secondaryButtonText
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
    surveyQuestion: {
        fontSize: 18,
        fontWeight: AppFonts.BOLD,
        fontStyle: 'normal',
        textAlign: 'left',
        color: GlobalColors.formText
    },
    surveyQuestionDetail: {
        fontSize: 14,
        marginTop: 33,
        marginBottom: 30,
        fontWeight: AppFonts.NORMAL,
        fontStyle: 'normal',
        textAlign: 'left',
        color: GlobalColors.formLable
    },
    progressText: {
        marginLeft: 24,
        fontSize: 14,
        fontWeight: AppFonts.BOLD,
        color: GlobalColors.formText
    },
    checkBoxContainer: {
        backgroundColor: GlobalColors.transparent,
        borderWidth: 0,
        margin: 0,
        paddingHorizontal: 0
    },
    checkboxText: {
        fontSize: 18,
        color: GlobalColors.formText,
        marginLeft: 30,
        fontWeight: AppFonts.NORMAL
    }
});
