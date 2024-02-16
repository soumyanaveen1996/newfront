import React from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import GlobalColors from '../../../../../config/styles';
import AppFonts from '../../../../../config/fontConfig';

export default Survey = ({ survey, startSurvey, surveyStatusMap }) => {
    let buttonText = 'Start survey';
    if (surveyStatusMap[survey.surveyId]) {
        if (surveyStatusMap[survey.surveyId] === 'START')
            buttonText = 'Continue';
        else if (surveyStatusMap[survey.surveyId] === 'DONE')
            buttonText = 'Completed';
    } else {
        if (survey.surveyStatus === 'done') buttonText = 'Completed';
        else if (survey.surveyStatus === 'inProgress') buttonText = 'Continue';
    }
    return (
        <View style={styles.container}>
            <Text style={styles.surveyText}>SURVEY</Text>
            <Text style={styles.surveyTitle}>{survey?.surveyTitle}</Text>
            <View style={{ alignSelf: 'flex-start' }}>
                <TouchableOpacity
                    style={styles.surveyButton}
                    onPress={() => {
                        startSurvey(survey.surveyId);
                    }}
                >
                    <Text style={styles.surveyButtonText}>{buttonText}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginHorizontal: 10,
        flexDirection: 'column',
        padding: 32,
        borderRadius: 8,
        backgroundColor: GlobalColors.contentBackgroundColorSecondary
    },
    surveyText: {
        fontSize: 16,
        color: GlobalColors.chatSubTitle,
        alignSelf: 'flex-start'
    },
    surveyTitle: {
        marginVertical: 8,
        fontSize: 16,
        alignSelf: 'flex-start',
        color: GlobalColors.primaryTextColor
    },
    surveyButton: {
        height: 38,
        paddingHorizontal: 19,
        justifyContent: 'center',
        borderRadius: 19,
        backgroundColor: GlobalColors.primaryButtonColor
    },
    surveyButtonText: {
        fontSize: 14,
        fontWeight: AppFonts.BOLD,
        color: GlobalColors.primaryButtonText
    }
});
