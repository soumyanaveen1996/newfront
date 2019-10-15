import React from 'react';
import {
    Text,
    View,
    TouchableOpacity,
    SafeAreaView,
    TextInput,
    Switch,
    Slider,
    DatePickerIOS,
    DatePickerAndroid,
    TimePickerAndroid,
    FlatList,
    ScrollView,
    Platform,
    Image,
    Alert,
    KeyboardAvoidingView,
    Keyboard,
    ActivityIndicator,
    TouchableWithoutFeedback
} from 'react-native';
import styles from './styles';
import _ from 'lodash';
import Icons from '../../config/icons';
import { Actions } from 'react-native-router-flux';
import { CheckBox } from 'react-native-elements';
import { GlobalColors } from '../../config/styles';
import Modal from 'react-native-modal';
import images from '../../config/images';
import { HeaderRightIcon, HeaderBack } from '../Header';
import I18n from '../../config/i18n/i18n';
import {
    Settings,
    PollingStrategyTypes,
    Media,
    Resource,
    ResourceTypes
} from '../../lib/capability';
import { formStatus, fieldType, formAction } from './config';
import { connect } from 'react-redux';
import { setCurrentForm } from '../../redux/actions/UserActions';
import ChatModal from '../ChatBotScreen/ChatModal';
import modalStyle from '../Cards/styles';
import NetworkButton from '../Header/NetworkButton';
import Constants from '../../config/constants';
import Toast, { DURATION } from 'react-native-easy-toast';
import RNFS from 'react-native-fs';

class Form2 extends React.Component {
    static navigationOptions({ navigation, screenProps }) {
        const { state } = navigation;
        let navigationOptions = {
            headerTitle: state.params.title
        };
        if (state.params.noBack === true) {
            navigationOptions.headerLeft = null;
        } else {
            navigationOptions.headerLeft = (
                <HeaderBack
                    onPress={() => {
                        if (state.params.botDone) {
                            state.params.botDone();
                        }
                        if (state.params.onBack) {
                            state.params.onBack();
                        } else {
                            Actions.pop();
                        }
                    }}
                />
            );
        }

        navigationOptions.headerRight = (
            <View style={{ marginHorizontal: 17 }}>
                <NetworkButton
                    manualAction={() => {
                        state.params.refresh();
                    }}
                    gsmAction={() => {
                        state.params.showConnectionMessage('gsm');
                    }}
                    satelliteAction={() => {
                        state.params.showConnectionMessage('satellite');
                    }}
                    disconnectedAction={() => {}}
                />
            </View>
        );
        return navigationOptions;
    }

    constructor(props) {
        super(props);
        this.answers = [];
        this.initializeAnswers();
        this.state = {
            answers: this.answers,
            dateModalVisible: false,
            dateModalValue: new Date(),
            dropdownModalVisible: false,
            dropdownModalValue: null,
            dropdownModalOptions: [],
            dropdownModalTitle: '',
            disabled: this.props.formStatus === formStatus.COMPLETED,
            showInfoOfIndex: null,
            lookupModalInfo: null,
            showLookupModal: false,
            currentDateModalFieldType: fieldType.date,
            dateModalMode: 'date',
            formIsCompleted: this.checkFormValidation()
        };
        this.uploadQueue = [];
        this.props.navigation.setParams({
            showConnectionMessage: this.showConnectionMessage,
            onBack: this.onCloseForm.bind(this)
        });
    }

    initializeAnswers() {
        this.answers = []; //used to store data to render the UI. This is not what the form will send to the bot
        _.map(this.props.formData, (fieldData, index) => {
            let answer = {
                id: fieldData.id,
                getResponse: () => {}
            };
            if (fieldData.validation) {
                answer.valid = fieldData.value
                    ? true
                    : fieldData.savedValidationResult;
                answer.validationMessage = fieldData.savedValidationMessage;
            } else {
                answer.valid = true;
            }
            if (fieldData.mandatory) {
                answer.filled = fieldData.value ? true : false;
            } else {
                answer.filled = true;
            }
            switch (fieldData.type) {
            case fieldType.textField:
                answer.value = fieldData.value || '';
                answer.getResponse = () => {
                    return answer.value;
                };
                break;
            case fieldType.number:
                answer.value = fieldData.value || '';
                answer.getResponse = () => {
                    return answer.value;
                };
                break;
            case fieldType.textArea:
                answer.value = fieldData.value || '';
                answer.getResponse = () => {
                    return answer.value;
                };
                break;
            case fieldType.checkbox:
                answer.value = _.map(fieldData.options, option => {
                    if (
                        fieldData.value &&
                            _.includes(fieldData.value, option)
                    ) {
                        return true;
                    } else {
                        return false;
                    }
                });
                answer.getResponse = () => {
                    return _.filter(fieldData.options, (option, i) => {
                        return answer.value[i];
                    });
                };
                break;
            case fieldType.radioButton:
                var v = fieldData.value;
                answer.value = fieldData.options.indexOf(v); //index
                answer.getResponse = () => {
                    return fieldData.options[answer.value];
                };
                break;
            case fieldType.dropdown:
                var v = fieldData.value;
                answer.value = fieldData.options.indexOf(v); //index
                answer.getResponse = () => {
                    return fieldData.options[answer.value];
                };
                break;
            case fieldType.switch:
                answer.value = fieldData.value || false;
                answer.getResponse = () => {
                    return answer.value;
                };
                break;
            case fieldType.slider:
                answer.value = fieldData.value || 0;
                answer.getResponse = () => {
                    return answer.value;
                };
                break;
            case fieldType.date:
                answer.value = fieldData.value
                    ? new Date(fieldData.value)
                    : null; //milliseconds. Use getTime() to get the milliseconds to send to backend
                answer.getResponse = () => {
                    return answer.value ? answer.value.getTime() : null;
                };
                break;
            case fieldType.time:
                answer.value = fieldData.value || null; //[hours, minutes]
                answer.getResponse = () => {
                    return answer.value || null;
                };
                break;
            case fieldType.dateTime:
                answer.value = fieldData.value
                    ? new Date(fieldData.value)
                    : null; //milliseconds. Use getTime() to get the milliseconds to send to backend
                answer.getResponse = () => {
                    return answer.value ? answer.value.getTime() : null;
                };
                break;
            case fieldType.multiselection:
                answer.value = _.map(fieldData.options, option => {
                    if (
                        fieldData.value &&
                            _.includes(fieldData.value, option)
                    ) {
                        return true;
                    } else {
                        return false;
                    }
                });
                answer.getResponse = () => {
                    return _.filter(fieldData.options, (option, i) => {
                        return answer.value[i];
                    });
                };
                break;
            case fieldType.passwordField:
                answer.value = fieldData.value || '';
                answer.getResponse = () => {
                    return answer.value;
                };
                break;
            case fieldType.lookup:
                answer.value = fieldData.value;
                answer.search = '';
                answer.getResponse = () => {
                    return answer.value;
                };
                break;
            case fieldType.imageField:
                answer.value = fieldData.value || '';
                answer.getResponse = action => {
                    this.uploadQueue.push(answer.value);
                    return answer.value;
                };
                answer.validationMessage = 'Could not upload the image';
                answer.valid = true;
                break;
            default:
            }
            this.answers.push(answer);
        });
    }

    componentDidUpdate(prevProps) {
        if (prevProps.formStatus !== this.props.formStatus) {
            this.setState({
                disabled: this.props.formStatus === formStatus.COMPLETED
            });
        }
        if (this.props.change) {
            this.updateForm();
        } else if (this.props.validation) {
            this.validateField();
        }
    }

    componentDidMount() {
        this.checkPollingStrategy();
    }

    componentWillUnmount() {
        this.props.setCurrentForm(null);
    }

    showConnectionMessage = connectionType => {
        let message = I18n.t('Auto_Message');
        if (connectionType === 'gsm') {
            message = I18n.t('Gsm_Message');
        } else if (connectionType === 'satellite') {
            message = I18n.t('Satellite_Message');
        }
        Alert.alert(
            I18n.t('Automatic_Network'),
            message,
            [{ text: I18n.t('Ok'), style: 'cancel' }],
            { cancelable: false }
        );
    };

    showButton(pollingStrategy) {
        if (pollingStrategy === PollingStrategyTypes.manual) {
            this.props.navigation.setParams({ button: 'manual' });
        } else if (pollingStrategy === PollingStrategyTypes.automatic) {
            this.props.navigation.setParams({ button: 'none' });
        } else if (pollingStrategy === PollingStrategyTypes.gsm) {
            this.props.navigation.setParams({ button: 'gsm' });
        } else if (pollingStrategy === PollingStrategyTypes.satellite) {
            this.props.navigation.setParams({ button: 'satellite' });
        }
    }

    async checkPollingStrategy() {
        let pollingStrategy = await Settings.getPollingStrategy();
        this.showButton(pollingStrategy);
    }

    /////////////////////////////

    getResponse(action) {
        let completed = true;
        let response = {
            formId: this.props.id,
            action: action,
            fields: _.map(this.answers, (answer, index) => {
                const responseValue = answer.getResponse(action);
                if (completed === true) {
                    if (this.props.formData[index].mandatory) {
                        if (
                            !responseValue ||
                            responseValue === '' ||
                            responseValue === []
                        ) {
                            completed = false;
                        }
                    }
                    if (
                        this.props.formData[index].validation &&
                        !answer.valid
                    ) {
                        completed = false;
                    }
                }
                let field = {
                    id: answer.id,
                    value: responseValue
                };
                return field;
            })
        };
        return { responseData: response, completed: completed };
    }

    checkFormValidation() {
        const missingField = this.answers.find(answer => {
            return !(answer.valid && answer.filled);
        });
        if (missingField) {
            return false;
        } else {
            return true;
        }
    }

    saveFormData() {
        const data = _.map(this.props.formData, (field, index) => {
            field.value = this.answers[index].getResponse();
            if (field.validation) {
                field.savedValidationResult = this.answers[index].valid;
                if (this.answers[index].valid === false) {
                    field.savedValidationMessage = this.answers[
                        index
                    ].validationMessage;
                }
            }
            return field;
        });
        return data;
    }

    async onDone() {
        try {
            let response = await this.getResponse(formAction.CONFIRM);
            if (response.completed) {
                this.props.onDone(this.saveFormData(), response.responseData);
                await this.uploadFiles();
                Actions.pop();
            } else {
                console.log('FORM: you must fill all mandatory fields');
            }
        } catch (error) {
            this.answers[key].valid = false;
            this.setState({ answers: this.answers });
        }
    }

    async uploadFiles() {
        this.uploadQueue.forEach(async fileName => {
            try {
                await Resource.uploadFile(
                    Constants.IMAGES_DIRECTORY + '/' + fileName,
                    this.props.conversationId,
                    fileName.slice(0, -4),
                    ResourceTypes.Image
                );
            } catch (e) {
                throw e;
            }
        });
    }

    onCloseForm() {
        if (!this.state.disabled) {
            this.props.saveMessage(this.saveFormData());
        }
        let response = this.getResponse(formAction.CLOSE);
        this.props.sendResponse(response.responseData);
        Actions.pop();
    }

    onCancelForm() {
        let response = this.getResponse(formAction.CANCEL);
        this.props.onDone(this.saveFormData(), response.responseData);
        // this.props.sendResponse(response.responseData);
        // this.props.setCompleted();
        // if (!this.state.disabled) {
        //     this.props.saveMessage(this.saveFormData());
        // }
        Actions.pop();
    }

    onMoveAction(key, fieldId, fieldValue) {
        if (!fieldValue && this.props.formData[key].mandatory) {
            this.answers[key].filled = false;
        } else {
            this.answers[key].filled = true;
        }
        const response = {
            formId: this.props.id,
            action: formAction.MOVE,
            currentField: fieldId,
            currentFieldValue: fieldValue
        };
        this.props.sendResponse(response);
    }

    onSearchAction(fieldId, fieldValue) {
        const response = {
            formId: this.props.id,
            action: formAction.SEARCH,
            currentField: fieldId,
            currentFieldValue: fieldValue
        };
        this.props.sendResponse(response);
    }

    updateForm() {
        let oldFormData = this.saveFormData();
        let newFormData = _.differenceWith(
            oldFormData,
            this.props.change.remove,
            (field, removeField) => {
                return field.id === removeField;
            }
        );
        this.props.change.fields.forEach(newField => {
            const key = newFormData.findIndex(field => {
                return field.id === newField.id;
            });
            if (key >= 0) {
                newFormData[key] = newField;
            } else {
                newFormData.push(newField);
            }
        });
        this.props.setCurrentForm({
            formData: newFormData,
            formMessage: this.props.formMessage,
            currentResults: null,
            change: null,
            validation: null
        });
        this.initializeAnswers();
        this.setState({
            answers: this.answers,
            formIsCompleted: this.checkFormValidation()
        });
    }

    validateField() {
        const fieldToValidate = this.answers.findIndex(answer => {
            return answer.id === this.props.validation.field;
        });
        if (fieldToValidate >= 0) {
            this.answers[
                fieldToValidate
            ].valid = this.props.validation.validationResult;
            this.answers[
                fieldToValidate
            ].validationMessage = this.props.validation.validationMessage;
            this.props.setCurrentForm({
                formData: this.props.formData,
                formMessage: this.props.formMessage,
                currentResults: null,
                change: null,
                validation: null
            });
            this.setState({ answers: this.answers });
        }
    }

    ////////////FIELDS RENDERER/////////////

    renderTextField(content, key) {
        return (
            <TextInput
                editable={!(this.state.disabled || content.readOnly)}
                style={styles.textField}
                onChangeText={text => {
                    this.answers[key].value = text;
                    if (this.props.formData[key].validation) {
                        this.answers[key].valid = undefined;
                    }
                    if (text === '' && content.mandatory) {
                        this.answers[key].filled = false;
                    } else {
                        this.answers[key].filled = true;
                    }
                    this.setState({
                        answers: this.answers,
                        showInfoOfIndex: null
                    });
                }}
                placeholderTextColor={GlobalColors.disabledGray}
                value={this.state.answers[key].value}
                onSubmitEditing={e => {
                    this.onMoveAction(
                        key,
                        this.answers[key].id,
                        e.nativeEvent.text
                    );
                }}
                onBlur={() => {
                    this.onMoveAction(
                        key,
                        this.answers[key].id,
                        this.answers[key].value
                    );
                }}
            />
        );
    }

    renderNumberField(content, key) {
        return (
            <TextInput
                editable={!(this.state.disabled || content.readOnly)}
                style={styles.textField}
                onChangeText={text => {
                    if (this.props.formData[key].validation) {
                        this.answers[key].valid = undefined;
                    }
                    if (text === '' && content.mandatory) {
                        this.answers[key].filled = false;
                    } else {
                        this.answers[key].filled = true;
                    }
                    this.answers[key].value = text;
                    this.setState({
                        answers: this.answers,
                        showInfoOfIndex: null
                    });
                }}
                placeholderTextColor={GlobalColors.disabledGray}
                keyboardType="numeric"
                value={this.state.answers[key].value}
                onSubmitEditing={e => {
                    this.onMoveAction(
                        key,
                        this.answers[key].id,
                        e.nativeEvent.text
                    );
                }}
                onBlur={() => {
                    this.onMoveAction(
                        key,
                        this.answers[key].id,
                        this.answers[key].value
                    );
                }}
            />
        );
    }

    renderTextArea(content, key) {
        return (
            <TextInput
                multiline={true}
                editable={!(this.state.disabled || content.readOnly)}
                style={styles.textArea}
                onChangeText={text => {
                    if (this.props.formData[key].validation) {
                        this.answers[key].valid = undefined;
                    }
                    if (text === '' && content.mandatory) {
                        this.answers[key].filled = false;
                    } else {
                        this.answers[key].filled = true;
                    }
                    this.answers[key].value = text;
                    this.setState({
                        answers: this.answers,
                        showInfoOfIndex: null
                    });
                }}
                placeholderTextColor={GlobalColors.disabledGray}
                value={this.state.answers[key].value}
                onSubmitEditing={e => {
                    this.onMoveAction(
                        key,
                        this.answers[key].id,
                        e.nativeEvent.text
                    );
                }}
                onBlur={() => {
                    this.onMoveAction(
                        key,
                        this.answers[key].id,
                        this.answers[key].value
                    );
                }}
            />
        );
    }

    renderCheckbox(content, key) {
        let options = _.map(content.options, (option, index) => {
            return (
                <CheckBox
                    key={index}
                    title={option}
                    onIconPress={() => {
                        if (!(this.state.disabled || content.readOnly)) {
                            this.answers[key].value[index] = !this.answers[key]
                                .value[index];
                            this.setState({
                                answers: this.answers,
                                showInfoOfIndex: null
                            });
                            this.onMoveAction(
                                key,
                                this.answers[key].id,
                                this.answers[key].getResponse()
                            );
                        }
                    }}
                    checked={this.state.answers[key].value[index]}
                    textStyle={styles.optionText}
                    containerStyle={styles.checkbox}
                    size={20}
                    iconType="ionicon"
                    checkedIcon="ios-checkbox-outline"
                    uncheckedIcon="ios-square-outline"
                    checkedColor={GlobalColors.sideButtons}
                />
            );
        });
        return options;
    }

    renderRadioButton(content, key) {
        let options = _.map(content.options, (option, index) => {
            return (
                <CheckBox
                    key={index}
                    title={option}
                    onIconPress={() => {
                        if (!(this.state.disabled || content.readOnly)) {
                            this.answers[key].value = index;
                            this.setState({
                                answers: this.answers,
                                showInfoOfIndex: null
                            });
                            this.onMoveAction(
                                key,
                                this.answers[key].id,
                                option
                            );
                        }
                    }}
                    checked={this.state.answers[key].value === index}
                    textStyle={styles.optionText}
                    containerStyle={styles.checkbox}
                    size={20}
                    iconType="ionicon"
                    checkedIcon="ios-radio-button-on"
                    uncheckedIcon="ios-radio-button-off"
                    checkedColor={GlobalColors.sideButtons}
                />
            );
        });
        return options;
    }

    renderDropdown(content, key) {
        return (
            <TouchableOpacity
                disabled={this.state.disabled || content.readOnly}
                onPress={() => {
                    if (this.props.formData[key].validation) {
                        this.answers[key].valid = undefined;
                    }
                    this.currentDropdownModalKey = key;
                    this.setState({
                        dropdownModalOptions: content.options,
                        dropdownModalValue: this.answers[key].value, //index
                        dropdownModalVisible: true,
                        dropdownModalTitle: this.props.formData[key].title,
                        showInfoOfIndex: null
                    });
                }}
                style={styles.textField}
            >
                <Text>{content.options[this.state.answers[key].value]}</Text>
                {Icons.arrowDown()}
            </TouchableOpacity>
        );
    }

    renderDropdownModal() {
        return (
            <Modal
                isVisible={this.state.dropdownModalVisible}
                onBackdropPress={() => {
                    this.setState({
                        dropdownModalVisible: false,
                        showInfoOfIndex: null
                    });
                }}
                style={styles.dropdownModal}
                backdropOpacity={0.1}
            >
                <View style={styles.dropdownPicker}>
                    <View>
                        <Text style={styles.dropdownModalTitle}>
                            {this.state.dropdownModalTitle}
                        </Text>
                        <FlatList
                            data={this.state.dropdownModalOptions}
                            extraData={this.state}
                            renderItem={({ item, index }) => (
                                <CheckBox
                                    title={item}
                                    onIconPress={() => {
                                        this.setState({
                                            dropdownModalValue: index,
                                            showInfoOfIndex: null
                                        });
                                    }}
                                    checked={
                                        index === this.state.dropdownModalValue
                                    }
                                    textStyle={styles.optionText}
                                    containerStyle={styles.checkbox}
                                    size={20}
                                    iconType="ionicon"
                                    checkedIcon="ios-radio-button-on"
                                    uncheckedIcon="ios-radio-button-off"
                                    checkedColor={GlobalColors.sideButtons}
                                />
                            )}
                        />
                    </View>
                    <TouchableOpacity
                        style={styles.dropdownModalButton}
                        onPress={() => {
                            this.answers[
                                this.currentDropdownModalKey
                            ].value = this.state.dropdownModalValue;
                            this.setState({
                                dropdownModalVisible: false,
                                answers: this.answers,
                                showInfoOfIndex: null
                            });
                            this.onMoveAction(
                                this.currentDropdownModalKey,
                                this.answers[this.currentDropdownModalKey].id,
                                this.answers[
                                    this.currentDropdownModalKey
                                ].getResponse()
                            );
                        }}
                    >
                        <Text style={styles.buttonTextContinue}>Done</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        );
    }

    renderSwitch(content, key) {
        return (
            <Switch
                disabled={this.state.disabled || content.readOnly}
                onValueChange={value => {
                    this.answers[key].value = value;
                    this.setState({
                        answers: this.answers,
                        showInfoOfIndex: null
                    });
                    this.onMoveAction(key, this.answers[key].id, value);
                }}
                value={this.state.answers[key].value}
            />
        );
    }

    renderSlider(content, key) {
        return (
            <Slider
                disabled={this.state.disabled || content.readOnly}
                maximumValue={100}
                minimumValue={0}
                onValueChange={value => {
                    this.answers[key].value = value;
                    this.setState({
                        answers: this.answers,
                        showInfoOfIndex: null
                    });
                    this.onMoveAction(key, this.answers[key].id, value);
                }}
                value={this.state.answers[key].value}
                minimumTrackTintColor={GlobalColors.sideButtons}
                maximumTrackTintColor={GlobalColors.sideButtons}
                thumbTintColor={GlobalColors.sideButtons}
            />
        );
    }

    renderDate(content, key) {
        return (
            <TouchableOpacity
                disabled={this.state.disabled || content.readOnly}
                onPress={async () => {
                    if (this.props.formData[key].validation) {
                        this.answers[key].valid = undefined;
                    }
                    if (Platform.OS === 'android') {
                        this.openAndroidDateTimePicker(content, key);
                    } else {
                        this.openIOSDateTimePicker(content, key);
                    }
                }}
                style={styles.dateField}
            >
                {this.state.answers[key].value ? (
                    <Text>
                        {content.type === fieldType.dateTime ||
                        content.type === fieldType.date
                            ? this.state.answers[key].value.getDate() +
                              '/' +
                              (this.state.answers[key].value.getMonth() + 1) +
                              '/' +
                              this.state.answers[key].value.getFullYear()
                            : null}
                        {content.type === fieldType.dateTime
                            ? '  ' +
                              this.state.answers[key].value.getHours() +
                              ':' +
                              this.state.answers[key].value.getMinutes()
                            : null}
                        {content.type === fieldType.time
                            ? this.state.answers[key].value[0] +
                              ':' +
                              this.state.answers[key].value[1]
                            : null}
                    </Text>
                ) : null}
                {content.type === fieldType.time
                    ? Icons.time()
                    : Icons.formCalendar()}
            </TouchableOpacity>
        );
    }

    openAndroidDateTimePicker(content, key) {
        return new Promise((resolve, reject) => {
            let tempDate;
            let initialTime = new Date();
            if (content.type === fieldType.time) {
                if (this.answers[key].value) {
                    initialTime.setHours(this.answers[key].value[0]);
                    initialTime.setMinutes(this.answers[key].value[1]);
                }
                TimePickerAndroid.open({
                    hour: this.answers[key].value[0],
                    minute: this.answers[key].value[1],
                    mode: 'default',
                    is24Hour: true
                }).then(time => {
                    if (time.action !== TimePickerAndroid.dismissedAction) {
                        this.answers[key].value = [time.hour, time.minute];
                        this.setState({
                            answers: this.answers,
                            showInfoOfIndex: null
                        });
                        this.onMoveAction(
                            key,
                            this.answers[key].id,
                            this.answers[key].getResponse()
                        );
                    }
                    resolve();
                });
            } else if (content.type === fieldType.dateTime) {
                DatePickerAndroid.open({
                    date: this.answers[key].value || initialTime,
                    mode: 'default'
                })
                    .then(date => {
                        tempDate = date;
                        if (date.action !== DatePickerAndroid.dismissedAction) {
                            return TimePickerAndroid.open({
                                hour: this.answers[key].value.getHours(),
                                minute: this.answers[key].value.getMinutes(),
                                mode: 'default',
                                is24Hour: true
                            });
                        } else {
                            resolve();
                        }
                    })
                    .then(time => {
                        if (time.action !== TimePickerAndroid.dismissedAction) {
                            this.answers[key].value = new Date(
                                tempDate.year,
                                tempDate.month,
                                tempDate.day,
                                time.hour,
                                time.minute
                            );
                            this.setState({
                                answers: this.answers,
                                showInfoOfIndex: null
                            });
                            this.onMoveAction(
                                key,
                                this.answers[key].id,
                                this.answers[key].getResponse()
                            );
                        }
                        resolve();
                    });
            } else if (content.type === fieldType.date) {
                DatePickerAndroid.open({
                    date: this.answers[key].value || initialTime,
                    mode: 'default'
                }).then(date => {
                    if (date.action !== DatePickerAndroid.dismissedAction) {
                        this.answers[key].value = new Date(
                            date.year,
                            date.month,
                            date.day
                        );
                        this.setState({
                            answers: this.answers,
                            showInfoOfIndex: null
                        });
                        this.onMoveAction(
                            key,
                            this.answers[key].id,
                            this.answers[key].getResponse()
                        );
                    }
                    resolve();
                });
            }
        });
    }

    openIOSDateTimePicker(content, key) {
        this.currentDateModalKey = key;
        let initialTime = new Date();
        if (content.type === fieldType.time) {
            if (this.answers[key].value) {
                initialTime.setHours(this.answers[key].value[0]);
                initialTime.setMinutes(this.answers[key].value[1]);
            }
            this.setState({
                dateModalValue: initialTime,
                dateModalVisible: true,
                showInfoOfIndex: null,
                currentDateModalFieldType: content.type,
                dateModalMode: 'time'
            });
        } else {
            this.setState({
                dateModalValue: this.answers[key].value || initialTime,
                dateModalVisible: true,
                showInfoOfIndex: null,
                currentDateModalFieldType: content.type,
                dateModalMode: 'date'
            });
        }
    }

    renderDateModalIOS() {
        return (
            <Modal
                isVisible={this.state.dateModalVisible}
                onBackdropPress={() => {
                    this.setState({
                        dateModalVisible: false,
                        showInfoOfIndex: null
                    });
                }}
                style={styles.dateModalIOS}
                backdropOpacity={0.1}
            >
                <View style={styles.datePickerIOS}>
                    <DatePickerIOS
                        onDateChange={date => {
                            this.setState({
                                dateModalValue: date,
                                showInfoOfIndex: null
                            });
                        }}
                        date={this.state.dateModalValue}
                        mode={this.state.dateModalMode}
                    />
                    <View style={styles.dateModalButtonArea}>
                        <TouchableOpacity
                            style={styles.dateModalButton}
                            onPress={() => {
                                if (
                                    this.state.currentDateModalFieldType ===
                                    fieldType.time
                                ) {
                                    this.answers[
                                        this.currentDateModalKey
                                    ].value = [
                                        this.state.dateModalValue.getHours(),
                                        this.state.dateModalValue.getMinutes()
                                    ];
                                } else {
                                    if (
                                        this.state.currentDateModalFieldType ===
                                            fieldType.dateTime &&
                                        this.state.dateModalMode === 'date'
                                    ) {
                                        this.setState({
                                            dateModalMode: 'time'
                                        });
                                        return;
                                    }
                                    this.answers[
                                        this.currentDateModalKey
                                    ].value = this.state.dateModalValue;
                                }
                                this.setState({
                                    dateModalVisible: false,
                                    answers: this.answers,
                                    showInfoOfIndex: null
                                });
                                this.onMoveAction(
                                    this.currentDateModalKey,
                                    this.answers[this.currentDateModalKey].id,
                                    this.answers[
                                        this.currentDateModalKey
                                    ].getResponse()
                                );
                            }}
                        >
                            <Text style={styles.buttonTextContinue}>Done</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        );
    }

    renderMultiselection(content, key, title) {
        return (
            <TouchableOpacity
                onPress={() => {
                    if (this.props.formData[key].validation) {
                        this.answers[key].valid = undefined;
                    }
                    Actions.multiselection({
                        index: key,
                        options: content.options,
                        response: this.answers[key].value,
                        onDone: this.onMultiselectionDone.bind(this),
                        disabled: this.state.disabled || content.readOnly
                    });
                }}
                style={styles.multiselectionContainer}
            >
                <Text style={styles.optionText}>
                    {title || 'Multiple selection'}
                    {this.renderMandatorySign(content)}
                </Text>
                {Icons.formMessageArrow()}
            </TouchableOpacity>
        );
    }

    onMultiselectionDone(response, key) {
        this.answers[key].value = response;
        this.setState({ answers: this.answers, showInfoOfIndex: null });
        this.onMoveAction(
            key,
            this.answers[key].id,
            this.answers[key].getResponse()
        );
    }

    renderPasswordField(content, key) {
        return (
            <TextInput
                editable={!(this.state.disabled || content.readOnly)}
                onChangeText={text => {
                    if (this.props.formData[key].validation) {
                        this.answers[key].valid = undefined;
                    }
                    if (text === '' && content.mandatory) {
                        this.answers[key].filled = false;
                    } else {
                        this.answers[key].filled = true;
                    }
                    this.answers[key].value = text;
                    this.setState({
                        answers: this.answers,
                        showInfoOfIndex: null
                    });
                }}
                secureTextEntry={true}
                textContentType="password"
                style={styles.textField}
                value={this.state.answers[key].value}
                onSubmitEditing={e => {
                    this.onMoveAction(
                        key,
                        this.answers[key].id,
                        e.nativeEvent.text
                    );
                }}
                onBlur={() => {
                    this.onMoveAction(
                        key,
                        this.answers[key].id,
                        this.answers[key].value
                    );
                }}
            />
        );
    }

    renderLookup(fieldData, key) {
        if (
            this.props.currentResults &&
            this.props.currentResults.field === this.answers[key].id
        ) {
            this.answers[key].searching = false;
        }
        return (
            <View>
                <View
                    style={[
                        styles.textField,
                        { backgroundColor: GlobalColors.white }
                    ]}
                >
                    {this.answers[key].value ? (
                        <Text numberOfLines={1} ellipsizeMode={'tail'}>
                            {this.answers[key].value.text}
                        </Text>
                    ) : (
                        <TextInput
                            style={{ flex: 1 }}
                            editable={
                                !(this.state.disabled || fieldData.readOnly)
                            }
                            onChangeText={text => {
                                this.answers[key].search = text;
                                this.setState({
                                    answers: this.answers,
                                    showInfoOfIndex: null
                                });
                            }}
                            placeholderTextColor={GlobalColors.disabledGray}
                            placeholder="Search"
                            value={this.answers[key].search}
                            onSubmitEditing={e => {
                                this.onSearchAction(
                                    this.answers[key].id,
                                    e.nativeEvent.text
                                );
                            }}
                        />
                    )}
                    {!(this.state.disabled || fieldData.readOnly) ? (
                        this.answers[key].value ? (
                            Icons.close({
                                size: 24,
                                color: GlobalColors.frontmLightBlue,
                                onPress: () => {
                                    if (this.props.formData[key].validation) {
                                        this.answers[key].valid = undefined;
                                    }
                                    Keyboard.dismiss();
                                    this.answers[key].value = null;
                                    this.setState({ answers: this.answers });
                                    this.onMoveAction(
                                        key,
                                        this.answers[key].id,
                                        null
                                    );
                                }
                            })
                        ) : this.answers[key].searching ? (
                            <ActivityIndicator size={'small'} />
                        ) : (
                            Icons.search({
                                onPress: () => {
                                    this.onSearchAction(
                                        this.answers[key].id,
                                        this.answers[key].search
                                    );
                                    this.answers[key].searching = true;
                                    this.setState({ answers: this.answers });
                                }
                            })
                        )
                    ) : null}
                </View>
                {this.props.currentResults &&
                this.props.currentResults.field === this.answers[key].id ? (
                        <FlatList
                            data={this.props.currentResults.results}
                            style={styles.resultList}
                            keyboardShouldPersistTaps="handled"
                            renderItem={({ item }) => (
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        justifyContent: 'space-between'
                                    }}
                                >
                                    <Text
                                        numberOfLines={1}
                                        ellipsizeMode={'tail'}
                                        style={styles.resultText}
                                        onPress={() => {
                                            this.answers[key].value = item;
                                            this.answers[key].search = '';
                                            this.setState({
                                                answers: this.answers
                                            });
                                            this.props.setCurrentForm({
                                                formData: this.props.formData,
                                                formMessage: this.props.formMessage,
                                                currentResults: null,
                                                change: null
                                            });
                                            this.onMoveAction(
                                                key,
                                                this.answers[key].id,
                                                item
                                            );
                                        }}
                                    >
                                        {item.text}
                                    </Text>
                                    {item.info
                                        ? Icons.info({
                                            size: 24,
                                            onPress: () => {
                                                this.setState({
                                                    showLookupModal: true,
                                                    lookupModalInfo: item.info
                                                });
                                            }
                                        })
                                        : null}
                                </View>
                            )}
                        />
                    ) : null}
            </View>
        );
    }

    renderLookupInfoModalContent(info) {
        let fields;
        if (info) {
            let keys = Object.keys(info);
            keys = keys.slice(1, keys.length);
            fields = _.map(keys, key => {
                return (
                    <View style={modalStyle.fieldModal}>
                        <Text style={modalStyle.fieldLabelModal}>
                            {key + ': '}
                        </Text>
                        {this.renderModalInfoValue(info[key], true)}
                    </View>
                );
            });
        }
        return (
            <View style={[modalStyle.modalCard, { height: '65%' }]}>
                <ScrollView>
                    <View style={modalStyle.fieldsModal}>{fields}</View>
                </ScrollView>
            </View>
        );
    }

    renderImagePicker(fieldData, key) {
        const imageUri =
            Constants.IMAGES_DIRECTORY + '/' + this.state.answers[key].value;
        return (
            <View style={styles.imagePickerContainer}>
                <TouchableOpacity
                    style={styles.imageContainer}
                    disabled={this.state.answers[key].value}
                    onPress={() => {
                        this.pickImage(fieldData, key);
                    }}
                >
                    {this.state.answers[key].value ? (
                        <Image
                            source={{ uri: imageUri }}
                            style={styles.image}
                            resizeMode="cover"
                            onError={() => {
                                this.answers[key].value = '';
                                this.answers[key].valid = true;
                                this.setState({
                                    answers: this.answers,
                                    showInfoOfIndex: null
                                });
                            }}
                        />
                    ) : (
                        Icons.upload()
                    )}
                </TouchableOpacity>
                {this.state.answers[key].value ? (
                    <TouchableOpacity
                        style={styles.removeImage}
                        onPress={() => {
                            this.answers[key].valid = true;
                            this.answers[key].value = '';
                            this.answers[key].filled = false;
                            this.onMoveAction(
                                key,
                                this.answers[key].id,
                                this.answers[key].value
                            );
                            this.setState({
                                answers: this.answers,
                                showInfoOfIndex: null
                            });
                        }}
                    >
                        <Image source={images.delete_icon_trash} />
                        <Text style={styles.removeImageText}>Remove</Text>
                    </TouchableOpacity>
                ) : null}
            </View>
        );
    }

    async pickImage(fieldData, key) {
        let result = await Media.pickMediaFromLibrary({
            allowsEditing: false,
            exif: true,
            base64: true
        });
        if (!result.cancelled) {
            let imageUri = result.uri;
            const fileName =
                this.props.conversationId + this.props.id + fieldData.id;
            const completeFilename = fileName + '.png';
            const newUri = Constants.IMAGES_DIRECTORY + '/' + completeFilename;
            const exist = await RNFS.exists(newUri);
            if (exist) {
                await RNFS.unlink(newUri);
            }
            await RNFS.mkdir(Constants.IMAGES_DIRECTORY);
            await RNFS.copyFile(imageUri, newUri);
            this.answers[key].value = completeFilename;
            this.answers[key].valid = true;
            this.onMoveAction(
                key,
                this.answers[key].id,
                this.answers[key].value
            );
            this.setState({
                answers: this.answers,
                showInfoOfIndex: null
            });
        }
    }

    renderModalInfoValue(value, isModal) {
        if (value === null || value === undefined) {
            return <Text style={modalStyle.fieldText}>-</Text>;
        } else if (typeof value === 'boolean') {
            if (value) {
                return Icons.cardsTrue();
            } else {
                return Icons.cardsFalse();
            }
        } else {
            if (isModal) {
                return (
                    <Text style={modalStyle.fieldText}>{value.toString()}</Text>
                );
            } else {
                return (
                    <Text
                        style={[modalStyle.fieldText, { textAlign: 'left' }]}
                        numberOfLines={1}
                        ellipsizeMode={'tail'}
                    >
                        {value.toString()}
                    </Text>
                );
            }
        }
    }

    renderField(fieldData, key) {
        let field;
        switch (fieldData.type) {
        case fieldType.textField:
            field = this.renderTextField(fieldData, key);
            break;
        case fieldType.number:
            field = this.renderNumberField(fieldData, key);
            break;
        case fieldType.textArea:
            field = this.renderTextArea(fieldData, key);
            break;
        case fieldType.checkbox:
            field = this.renderCheckbox(fieldData, key);
            break;
        case fieldType.radioButton:
            field = this.renderRadioButton(fieldData, key);
            break;
        case fieldType.dropdown:
            field = this.renderDropdown(fieldData, key);
            break;
        case fieldType.switch:
            field = this.renderSwitch(fieldData, key);
            break;
        case fieldType.slider:
            field = this.renderSlider(fieldData, key);
            break;
        case fieldType.date:
            field = this.renderDate(fieldData, key);
            break;
        case fieldType.time:
            field = this.renderDate(fieldData, key);
            break;
        case fieldType.dateTime:
            field = this.renderDate(fieldData, key);
            break;
        case fieldType.multiselection:
            return this.renderMultiselection(
                fieldData,
                key,
                fieldData.title
            );
            break;
        case fieldType.passwordField:
            field = this.renderPasswordField(fieldData, key);
            break;
        case fieldType.lookup:
            field = this.renderLookup(fieldData, key);
            break;
        case fieldType.imageField:
            field = this.renderImagePicker(fieldData, key);
            break;
        default:
        }
        return (
            <View style={styles.f2FieldContainer} key={key}>
                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginBottom: 13
                    }}
                >
                    <Text style={styles.f2LabelTitle}>
                        {fieldData.title || ''}
                        {this.renderMandatorySign(fieldData)}
                    </Text>
                    {fieldData.info
                        ? Icons.info({
                            size: 18,
                            onPress: () =>
                                this.setState({ showInfoOfIndex: key })
                        })
                        : null}
                    <View style={{ justifyContent: 'center' }}>
                        {this.state.showInfoOfIndex === key
                            ? this.renderInfoBubble(fieldData.info)
                            : null}
                    </View>
                </View>
                {field}
                {(fieldData.validation ||
                    fieldData.type === fieldType.imageField) &&
                this.answers[key].valid === false
                    ? this.renderValidationMessage(
                        this.answers[key].validationMessage ||
                              'Validation error'
                    )
                    : null}
            </View>
        );
    }

    renderInfoBubble(info) {
        return (
            <View style={{ flexDirection: 'row', position: 'absolute' }}>
                <View style={styles.infoTip} />
                <View style={styles.infoBubble}>
                    <Text style={styles.infoText}>{info}</Text>
                </View>
            </View>
        );
    }

    renderMandatorySign(fieldData) {
        if (fieldData.mandatory) {
            return <Text style={{ color: 'red' }}> *</Text>;
        }
    }

    renderValidationMessage(message) {
        return (
            <View style={styles.validationMessage}>
                <Text style={styles.validationMessageText}>{message}</Text>
            </View>
        );
    }

    renderFields() {
        let allFields = _.map(this.props.formData, (fieldData, index) => {
            return this.renderField(fieldData, index);
        });
        return allFields;
    }

    renderToast() {
        if (Platform.OS === 'ios') {
            return <Toast ref="toast" position="bottom" positionValue={350} />;
        } else {
            return <Toast ref="toast" position="center" />;
        }
    }

    render() {
        const formIsCompleted = this.checkFormValidation();
        return (
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.f2Container}
            >
                <TouchableWithoutFeedback
                    disabled={this.state.showInfoOfIndex === null}
                    onPress={() => this.setState({ showInfoOfIndex: null })}
                    style={{ flex: 1 }}
                >
                    <SafeAreaView style={{ flex: 1 }}>
                        <ScrollView
                            keyboardShouldPersistTaps="handled"
                            style={{ flex: 1 }}
                        >
                            <Text style={styles.f2Title}>
                                {this.props.title}
                            </Text>
                            {this.renderFields()}
                            <View style={styles.f2BottomArea}>
                                <TouchableOpacity
                                    style={styles.f2CancelButton}
                                    onPress={
                                        this.state.disabled
                                            ? () => Actions.pop()
                                            : this.onCancelForm.bind(this)
                                    }
                                >
                                    <Text style={styles.f2CancelButtonText}>
                                        {this.props.cancel || 'Cancel'}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    disabled={
                                        this.state.disabled || !formIsCompleted
                                    }
                                    style={[
                                        styles.f2DoneButton,
                                        {
                                            opacity:
                                                this.state.disabled ||
                                                !formIsCompleted
                                                    ? 0.2
                                                    : 1
                                        }
                                    ]}
                                    onPress={this.onDone.bind(this)}
                                >
                                    <Text style={styles.f2DoneButtonText}>
                                        {this.props.confirm || 'Done'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            {this.renderDateModalIOS()}
                            {this.renderDropdownModal()}
                            <ChatModal
                                content={this.renderLookupInfoModalContent(
                                    this.state.lookupModalInfo
                                )}
                                isVisible={this.state.showLookupModal}
                                backdropOpacity={0.1}
                                onBackButtonPress={() =>
                                    this.setState({
                                        showLookupModal: false,
                                        lookupModalInfo: null
                                    })
                                }
                                onBackdropPress={() =>
                                    this.setState({
                                        showLookupModal: false,
                                        lookupModalInfo: null
                                    })
                                }
                                style={{
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    margin: 0
                                }}
                            />
                        </ScrollView>
                    </SafeAreaView>
                </TouchableWithoutFeedback>
                {this.renderToast()}
            </KeyboardAvoidingView>
        );
    }
}

const mapStateToProps = state => {
    return {
        formData: state.user.currentForm.formData,
        formMessage: state.user.currentForm.formMessage,
        currentResults: state.user.currentForm.currentResults,
        change: state.user.currentForm.change,
        validation: state.user.currentForm.validation
    };
};

const mapDispatchToProps = dispatch => {
    return {
        setCurrentForm: currentForm => dispatch(setCurrentForm(currentForm))
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Form2);
