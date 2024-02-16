import React from 'react';
import { View, Text, Alert, TouchableOpacity, ScrollView } from 'react-native';
import { Message } from '../../../../lib/capability';
import EventEmitter, { TablesEvents } from '../../../../lib/events';
import { ControlDAO } from '../../../../lib/persistence';
import styles from './styles';
import { CheckBox } from '@rneui/themed';
import GlobalColors from '../../../../config/styles';
import * as Progress from 'react-native-progress';
import { TextInput } from '../../../../widgets/TextInput';
import NavigationAction from '../../../../navigation/NavigationAction';
import eventEmitter from '../../../../lib/events/EventEmitter';
import { SocialTimelineEvents } from '../../../../lib/events/Tables';

const SURVEY_ACTION = {
    START: 'start',
    NEXT_QUESTION: 'nextQuestion',
    END: 'end',
    PREVIOUS_QUESTION: 'previousQuestion'
};

const SURVEY_FIELD_TYPE = {
    TEXT_FIELD: 'text_field',
    TEXT_AREA: 'text_area',
    RADIOBUTTON: 'radiobutton',
    CHECKBOX: 'checkbox'
};

const SURVEY_EVENTS = {};

export default class SurveyMessage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: {},
            numberOfQuestion: 0,
            currentQuestion: null,
            currentAnswer: null,
            surveyEnd: false,
            validAnswer: false,
            errorMessage: null
        };
    }

    componentDidMount() {
        ControlDAO.getOptionsById(this.props.localControlId).then((o) => {
            console.log(`~~~~ survey options`, o);

            ControlDAO.getContentById(this.props.localControlId).then(
                (data) => {
                    this.setState({
                        data,
                        options: o,
                        numberOfQuestion: data.numberOfQuestion
                    });
                    eventEmitter.emit(SocialTimelineEvents.sutveyStatus, {
                        status: 'START',
                        id: o.surveyId
                    });
                    console.log(`~~~~ survey data`, data);
                }
            );
        });
        this.listener = EventEmitter.addListener(
            TablesEvents.updateTable,
            this.surveyUpdate
        );
    }
    componentWillUnmount() {
        this.listener?.remove();
    }

    getDefaultAnswer = (field) => {
        switch (field.type) {
            case SURVEY_FIELD_TYPE.TEXT_FIELD:
            case SURVEY_FIELD_TYPE.TEXT_AREA:

            case SURVEY_FIELD_TYPE.RADIOBUTTON:
                return null;
            case SURVEY_FIELD_TYPE.CHECKBOX:
                return [];
        }
    };

    surveyUpdate = (message) => {
        if (
            this.state.options.tabId &&
            message.getMessageOptions()?.tabId === this.state.options.tabId
        ) {
            if (
                this.state.options.controlId &&
                message.getMessageOptions()?.controlId ===
                    this.state.options.controlId
            ) {
                const newData = message.getMessage();
                const newOptions = message.getMessageOptions();
                console.log(`~~~~ survey update`, newData, newOptions);
                if (newOptions.action === 'addQuestion') {
                    if (newData?.questionData) {
                        const question = newData.questionData.fields.find(
                            (f) => f.id === 'system_answerTitle'
                        );
                        const description = newData.questionData.fields.find(
                            (f) => f.id === 'system_answerDescription'
                        );
                        const answer = newData.questionData.fields.find(
                            (f) => f.id === 'system_answer'
                        );
                        this.setState({
                            currentQuestion: newData,
                            question,
                            description,
                            answer,
                            currentAnswer: answer.value
                                ? answer.value
                                : this.getDefaultAnswer(answer),
                            validAnswer: answer.mandatory ? false : true,
                            errorMessage: null
                        });
                    }
                } else if (newOptions.action === 'showClosePage') {
                    this.setState({ surveyEnd: true });
                }
                //TODO
            } else {
                //TODO
            }
        }
    };

    getResponseMessage = (msg, options) => {
        const message = new Message();
        message.messageByBot(false);
        message.surveyResponseMessage(msg, options);
        return message;
    };

    sendMessageToBot = (msg, options) => {
        const message = this.getResponseMessage(msg, options);
        message.setCreatedBy(this.props.userId);
        this.props.sendMessage(message);
    };

    generateAnswerValue = (answer) => {
        if (answer.type === 'checkbox') {
            const selectedAnswer = [];
            this.state.currentAnswer.forEach((element, index) => {
                if (element) selectedAnswer.push(answer.options[index]);
            });
            answer.value = selectedAnswer;
        } else {
            answer.value = this.state.currentAnswer;
        }

        if (
            answer.mandatory &&
            (answer.value === null ||
                answer.value === undefined ||
                answer.value === [])
        )
            return null;
        return answer;
    };

    onNextPress = () => {
        if (this.state.surveyEnd) {
            const msg = {
                action: SURVEY_ACTION.END,
                surveyId: this.state.options.surveyId,
                controlId: this.state.options.controlId,
                tabId: this.state.options.tabId
            };
            this.sendMessageToBot(msg);
            eventEmitter.emit(SocialTimelineEvents.sutveyStatus, {
                status: 'DONE',
                id: this.state.options.surveyId
            });
            NavigationAction.pop();
        } else if (this.state.currentQuestion) {
            const { currentQuestion } = this.state;
            const answerToSend =
                this.state.currentQuestion.questionData.fields.filter(
                    (f) => f.id != 'system_answer'
                );
            const userAnswer = this.generateAnswerValue(this.state.answer);
            if (userAnswer === null) {
                return;
            }
            answerToSend.push(userAnswer);
            const msg = {
                action: SURVEY_ACTION.NEXT_QUESTION,
                surveyId: this.state.options.surveyId,
                controlId: this.state.options.controlId,
                tabId: this.state.options.tabId,
                currentQuestionIndex: this.state.currentQuestion.questionIndex,
                currentQuestionAnswer: {
                    fields: answerToSend
                }
            };
            this.sendMessageToBot(msg);
        } else {
            const msg = {
                action: SURVEY_ACTION.START,
                surveyId: this.state.options.surveyId,
                controlId: this.state.options.controlId,
                tabId: this.state.options.tabId,
                status: this.state.options.status
            };
            this.sendMessageToBot(msg);
        }
    };

    onPreviousPress = () => {
        const { currentQuestion } = this.state;
        const answerToSend =
            this.state.currentQuestion.questionData.fields.filter(
                (f) => f.id != 'system_answer'
            );

        answerToSend.push(this.state.answer);
        const msg = {
            action: SURVEY_ACTION.PREVIOUS_QUESTION,
            surveyId: this.state.options.surveyId,
            controlId: this.state.options.controlId,
            tabId: this.state.options.tabId,
            currentQuestionIndex: this.state.currentQuestion.questionIndex,
            currentQuestionAnswer: {
                fields: answerToSend
            }
        };
        this.sendMessageToBot(msg);
    };

    setCurrentAnswerWithCheck = (answervalue) => {
        let validAnswer = true;
        if (this.state.answer.mandatory) {
            switch (answer.type) {
                case SURVEY_FIELD_TYPE.TEXT_FIELD:
                case SURVEY_FIELD_TYPE.RADIOBUTTON:
                case SURVEY_FIELD_TYPE.TEXT_AREA: {
                    if (
                        answervalue === '' ||
                        answervalue == null ||
                        answervalue == undefined
                    )
                        validAnswer = false;
                    break;
                }

                case SURVEY_FIELD_TYPE.CHECKBOX:
                    if (answervalue.legth == 0) validAnswer = false;
            }
        }
        this.setState({
            currentAnswer: answervalue,
            validAnswer: validAnswer,
            errorMessage: null
        });
    };

    getInputField = (field) => {
        const { answer, currentAnswer } = this.state;
        switch (field.type) {
            case 'text_field':
            case 'text_area':
                return (
                    <TextInput
                        style={{
                            height: 45,
                            paddingHorizontal: 12,
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            backgroundColor: GlobalColors.textField,
                            borderRadius: 6,
                            fontSize: 18,
                            color: GlobalColors.formText
                        }}
                        numberOfLines={6}
                        multiline={field.type === 'text_area'}
                        placeholder={field.title}
                        placeholderTextColor={GlobalColors.formLable}
                        onChangeText={(text) => {
                            this.setCurrentAnswerWithCheck(text);
                        }}
                        value={currentAnswer || null}
                        onSubmitEditing={() => {}}
                        theme={{
                            colors: {
                                primary: GlobalColors.primaryButtonColor,
                                placeholder: GlobalColors.darkGray
                            },
                            roundness: 6
                        }}
                    />
                );
            case 'checkbox':
                return (
                    <View>
                        {field.options.map((option, index) => (
                            <CheckBox
                                key={index}
                                title={option}
                                onPress={() => {
                                    if (currentAnswer[index]) {
                                        currentAnswer[index] = false;
                                    } else {
                                        if (
                                            currentAnswer.filter((a) => a)
                                                .length >=
                                            answer.maxSelectionOptions
                                        ) {
                                            this.setState({
                                                errorMessage:
                                                    'You can select upto ' +
                                                    answer.maxSelectionOptions +
                                                    ' option(s)'
                                            });
                                            return;
                                        }
                                        currentAnswer[index] = true;
                                    }
                                    this.setCurrentAnswerWithCheck(
                                        currentAnswer
                                    );
                                }}
                                checked={currentAnswer[index]}
                                textStyle={styles.checkboxText}
                                containerStyle={styles.checkBoxContainer}
                                size={20}
                                iconType="ionicon"
                                checkedIcon="ios-checkbox"
                                uncheckedIcon="ios-square-outline"
                                checkedColor={GlobalColors.primaryButtonColor}
                                activeOpacity={1}
                            />
                        ))}
                    </View>
                );
            case 'radiobutton':
                return (
                    <View>
                        {field.options.map((option, index) => (
                            <CheckBox
                                key={index}
                                title={option}
                                onPress={() => {
                                    this.setCurrentAnswerWithCheck(option);
                                }}
                                checked={currentAnswer === option}
                                textStyle={styles.checkboxText}
                                containerStyle={styles.checkBoxContainer}
                                size={20}
                                iconType="ionicon"
                                checkedIcon="ios-radio-button-on"
                                uncheckedIcon="ios-radio-button-off"
                                checkedColor={GlobalColors.primaryButtonColor}
                                activeOpacity={1}
                            />
                        ))}
                    </View>
                );
        }
    };

    getContent = () => {
        const {
            data,
            currentQuestion,
            question,
            description,
            answer,
            surveyEnd,
            errorMessage
        } = this.state;
        if (surveyEnd) {
            return (
                <View>
                    <Text style={styles.surveyTitle}>{data.closeTitle}</Text>
                    <Text style={styles.surveyDescription}>
                        {data.closeText}
                    </Text>
                </View>
            );
        }
        if (currentQuestion) {
            return (
                <View>
                    <Text style={styles.surveyQuestion}>{question.value}</Text>
                    <Text style={styles.surveyQuestionDetail}>
                        {description.value}
                    </Text>
                    {this.getInputField(answer)}
                    {errorMessage && (
                        <Text
                            style={{
                                fontSize: 12,
                                color: GlobalColors.errorRed
                            }}
                        >
                            {errorMessage}
                        </Text>
                    )}
                </View>
            );
        }
        return (
            <View>
                <Text style={styles.surveyTitle}>{data.title}</Text>
                <Text style={styles.surveyDescription}>
                    {data.introductionText}
                </Text>
            </View>
        );
    };

    getButtonText = () => {
        return 'Next';
    };

    render() {
        const { currentQuestion, validAnswer, numberOfQuestion, surveyEnd } =
            this.state;
        let currentProgress = currentQuestion
            ? parseFloat(
                  currentQuestion.questionIndex / numberOfQuestion
              ).toFixed(2)
            : 0;
        if (surveyEnd) currentProgress = 1;
        return (
            <View style={styles.container}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ flexGrow: 1 }}>
                        <Progress.Bar
                            width={null}
                            style={{ height: 8 }}
                            height={8}
                            progress={currentProgress}
                            borderRadius={4}
                            unfilledColor={'#e7eefd'}
                            borderWidth={0}
                            color={GlobalColors.primaryButtonColor}
                        />
                    </View>

                    <Text style={styles.progressText}>
                        {currentProgress * 100 + '%'}
                    </Text>
                </View>

                {/* Survey content */}
                <View style={{ flex: 1 }}>
                    <ScrollView style={{ marginTop: 40 }}>
                        {this.getContent()}
                    </ScrollView>
                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between'
                        }}
                    >
                        {currentQuestion != null &&
                            currentQuestion.questionIndex > 0 && (
                                <TouchableOpacity
                                    style={styles.surveyButtonPrevious}
                                    onPress={this.onPreviousPress}
                                >
                                    <Text
                                        style={styles.surveyButtonTextPrevious}
                                    >
                                        Previous
                                    </Text>
                                </TouchableOpacity>
                            )}
                        {currentQuestion != null &&
                            currentQuestion != null &&
                            currentQuestion.questionIndex > 0 && (
                                <View style={{ width: 8 }} />
                            )}
                        <TouchableOpacity
                            disabled={currentQuestion && !validAnswer}
                            style={styles.surveyButtonNext}
                            onPress={this.onNextPress}
                        >
                            <Text style={styles.surveyButtonText}>
                                {surveyEnd
                                    ? 'Submit'
                                    : currentQuestion
                                    ? 'Next'
                                    : 'Start'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    }
}
