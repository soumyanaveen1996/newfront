import React from 'react';
import {
    Text,
    View,
    TouchableOpacity,
    SafeAreaView,
    Platform,
    ActivityIndicator,
    Keyboard
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import RNFS from 'react-native-fs';

import _ from 'lodash';
import moment from 'moment';
import GlobalColors from '../../../../config/styles';
import {
    Resource,
    ResourceTypes,
    Message,
    MessageTypeConstants,
    Auth
} from '../../../../lib/capability';
import { formStatus, fieldType, formAction } from './config';
import Constants from '../../../../config/constants';
import EventEmitter from '../../../../lib/events';
import FormsEvents from '../../../../lib/events/Forms';
import { ControlDAO } from '../../../../lib/persistence';
import styles from './styles';
import ContainersEvents from '../../../../lib/events/Containers';
import NavigationAction from '../../../../navigation/NavigationAction';
import FormView from './FormView';
import Store from '../../../../redux/store/configureStore';
import { PrimaryButton } from '../../../../widgets/PrimaryButton';
import { SecondaryButton } from '../../../../widgets/SecondaryButton';
import { Toast } from 'react-native-toast-message/lib/src/Toast';

export default class Form2 extends React.Component {
    constructor(props) {
        super(props);
        this.answers = [];
        // this.initializeAnswers();
        this.state = {
            initialized: false,
            formData: [],
            formMessage: {},
            answers: [],
            dateModalVisible: false,
            dateModalValue: new Date(),
            dropdownModalVisible: false,
            dropdownModalValue: null,
            dropdownModalOptions: [],
            dropdownModalTitle: '',
            disabled: true,
            lookupModalInfo: null,
            showLookupModal: false,
            currentDateModalFieldType: fieldType.date,
            dateModalMode: 'date',
            formIsCompleted: this.checkFormValidation(),
            globalValidationMessage: '',
            keepPickerOpen: false,
            showDateTimePicker: false,
            timeZone: Auth.getUserData().tz || moment.tz.guess(),
            keyBoadrVisible: false
        };
        // this.keyboardVerticalOffset = Platform.OS === 'ios' ? 0 : 150;
        this.parentTabId = props.parentMessageOptions
            ? props.parentMessageOptions.tabId
            : null;
        this.parentDocId = props.parentMessageOptions
            ? props.parentMessageOptions.docId
            : null;
        this.keyboardVerticalOffset = Platform.OS === 'ios' ? 10 : 150;
        this.keyboardAvoidingViewBehaivior =
            Platform.OS === 'ios' ? 'height' : 'padding';
        this.uploadQueue = [];
        if (this.props.conversational) {
            this.props.navigation.setParams({
                onBack: this.onCloseForm
            });
        }
        this.fileDB = {};
        this.callbacks = {};
    }

    initializeAnswers(formData) {
        console.log('**** form2 formdata:', formData);
        this.answers = []; // used to store data to render the UI. This is not what the form will send to the bot
        _.map(formData, (fieldData, index) => {
            const answer = {
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
            answer.valid = true;
            if (fieldData.mandatory) {
                answer.filled = !!fieldData.value;
            } else {
                answer.filled = true;
            }
            switch (fieldData.type) {
                case fieldType.textField:
                    answer.value = fieldData.value || '';
                    answer.getResponse = () => answer.value;
                    break;
                case fieldType.number:
                    answer.value = fieldData.value;
                    answer.getResponse = () => parseFloat(answer.value);
                    break;
                case fieldType.textArea:
                    answer.value = fieldData.value || '';
                    answer.getResponse = () => answer.value;
                    break;
                case fieldType.checkbox:
                    answer.value = _.map(fieldData.options, (option) => {
                        if (
                            fieldData.value &&
                            _.includes(fieldData.value, option)
                        ) {
                            return true;
                        }
                        return false;
                    });
                    answer.getResponse = () =>
                        _.filter(
                            fieldData.options,
                            (option, i) => answer.value[i]
                        );
                    break;
                case fieldType.radioButton:
                    var v = fieldData.value;
                    var presetValue = undefined;
                    if (fieldData.options && fieldData.options.length > 0) {
                        presetValue = fieldData.options.indexOf(v);
                    }
                    answer.value = presetValue; // index
                    answer.getResponse = () =>
                        fieldData.options
                            ? fieldData.options[answer.value]
                            : undefined;
                    break;
                case fieldType.dropdown:
                    answer.value = fieldData.value;
                    answer.getResponse = () =>
                        // return fieldData.options ? fieldData.options[answer.value] : undefined
                        answer.value;
                    break;
                case fieldType.buttonsField:
                    answer.value = fieldData.options;
                    answer.getResponse = () => fieldData.options;
                    break;
                case fieldType.switch:
                    answer.value = fieldData.value || false;
                    answer.getResponse = () => answer.value;
                    break;
                case fieldType.slider:
                    answer.value = fieldData.value || 0;
                    answer.getResponse = () => answer.value;
                    break;
                case fieldType.date:
                    answer.value = fieldData.value
                        ? moment(fieldData.value)
                        : null; // milliseconds. Use getTime() to get the milliseconds to send to backend
                    answer.getResponse = () =>
                        answer.value ? answer.value.valueOf() : null;
                    break;
                case fieldType.time:
                    answer.value = moment({
                        hour: fieldData.value?.[0],
                        minute: fieldData.value?.[1]
                    }); // [hours, minutes]
                    answer.getResponse = () =>
                        answer.value
                            ? [answer.value.hour(), answer.value.minute()]
                            : null;
                    break;
                case fieldType.dateTime:
                    answer.value = fieldData.value
                        ? moment(fieldData.value)
                        : null; // milliseconds. Use getTime() to get the milliseconds to send to backend
                    answer.getResponse = () =>
                        answer.value ? answer.value.valueOf() : null;
                    break;
                case fieldType.multiselection:
                    answer.value = fieldData.value;
                    answer.getResponse = () => answer.value;
                    break;
                case fieldType.object_multiselection:
                    answer.value = fieldData.value;
                    answer.getResponse = () => answer.value;
                    break;
                case fieldType.passwordField:
                    answer.value = fieldData.value || '';
                    answer.getResponse = () => answer.value;
                    break;
                case fieldType.lookup:
                    answer.value = fieldData.value;
                    answer.search = '';
                    answer.getResponse = () => answer.value;
                    break;
                case fieldType.imageField:
                    answer.value = fieldData.fileName
                        ? fieldData.fileName
                        : fieldData.value || '';
                    answer.getResponse = (action) => {
                        if (action === formAction.CONFIRM) {
                            this.uploadQueue.push({
                                file: answer.value,
                                type: 'IMAGE'
                            });
                        }
                        return answer.value;
                    };
                    answer.validationMessage = 'Could not upload the image';
                    answer.valid = true;
                    break;
                case fieldType.fileField:
                    answer.value = fieldData.fileName
                        ? fieldData.fileName
                        : fieldData.value || '';
                    answer.getResponse = (action) => {
                        if (action === formAction.CONFIRM) {
                            this.uploadQueue.push({
                                file: answer.value,
                                type: 'FILE'
                            });
                        }
                        return answer.value;
                    };
                    answer.validationMessage = 'Could not upload the file';
                    answer.valid = true;
                    break;
                case fieldType.voiceCallField:
                    const { number, userId } = fieldData;
                    answer.value = { number, userId };
                    answer.getResponse = () => answer.value;
                    break;
                default:
                    answer.value = fieldData.value;
            }
            this.answers.push(answer);
        });
    }

    async componentDidMount() {
        const formData =
            this.props.formData ||
            (await ControlDAO.getContentById(this.props.localControlId));
        const formMessage =
            this.props.formMessage ||
            (await ControlDAO.getOptionsById(this.props.localControlId));
        if (!formMessage.stage) {
            formMessage.stage = formStatus.OPENED;
        }
        console.log('*** Form2 - formMessage', formMessage);
        this.initializeAnswers(formData);
        this.setState({
            formData,
            formMessage,
            disabled:
                formMessage.stage === formStatus.COMPLETED ||
                formMessage.stage === formStatus.READ_ONLY ||
                formMessage.readOnly,
            initialized: true,
            answers: this.answers
        });

        this.eventListeners = [];
        this.eventListeners.push(
            EventEmitter.addListener(
                FormsEvents.change,
                this.changeForm.bind(this)
            )
        );
        this.eventListeners.push(
            EventEmitter.addListener(
                FormsEvents.results,
                this.updateCurrentResults.bind(this)
            )
        );
        this.eventListeners.push(
            EventEmitter.addListener(
                FormsEvents.validation,
                this.validateField.bind(this)
            )
        );
        this.eventListeners.push(
            EventEmitter.addListener(
                FormsEvents.complete,
                this.setDisabled.bind(this)
            )
        );
        this.eventListeners.push(
            EventEmitter.addListener(FormsEvents.update, this.update.bind(this))
        );
        this.onCloseControl = this.onCancelForm;

        this.eventListeners.push(
            EventEmitter.addListener(
                ContainersEvents.updateFormField,
                this.updateFormContainer.bind(this)
            )
        );
        this.eventListeners.push(
            Keyboard.addListener('keyboardDidShow', this.keyboardDidShow)
        );
        this.eventListeners.push(
            Keyboard.addListener('keyboardDidHide', this.keyboardDidHide)
        );
    }

    keyboardDidShow = () => {
        this.setState({ keyBoadrVisible: true });
    };

    keyboardDidHide = () => {
        this.setState({ keyBoadrVisible: false });
    };

    componentWillUnmount() {
        this.eventListeners?.forEach((listener) => {
            listener.remove();
        });
        // this.props.setCurrentForm(null);
    }

    /// //////////////////////////

    update(message) {
        console.log(
            '~~~ check form update',
            message.getMessageOptions().docId,
            this.state.formMessage.docId
        );
        const formMessage = message.getMessageOptions();
        if (
            formMessage.formId === this.state.formMessage.formId ||
            message.getMessageOptions().docId === this.state.formMessage.docId
        ) {
            const formData = message.getMessage();
            if (!formMessage.stage) {
                formMessage.stage = formStatus.OPENED;
            }
            this.initializeAnswers(formData);
            this.setState({
                formData,
                formMessage,
                disabled:
                    formMessage.stage === formStatus.COMPLETED ||
                    formMessage.stage === formStatus.READ_ONLY ||
                    formMessage.readOnly,
                initialized: true,
                answers: this.answers
            });
        }
    }

    updateFormContainer(message) {
        const formMessage = message.options;
        if (formMessage.formId === this.state.formMessage.formId) {
            const formData = message.fields;
            if (!formMessage.stage) {
                formMessage.stage = formStatus.OPENED;
            }
            this.initializeAnswers(formData);
            this.setState({
                formData,
                formMessage,
                disabled:
                    formMessage.stage === formStatus.COMPLETED ||
                    formMessage.stage === formStatus.READ_ONLY ||
                    formMessage.readOnly,
                initialized: true,
                answers: this.answers
            });
        }
    }

    getResponse(action) {
        let completed = true;
        const response = {
            formId: this.state.formMessage.formId,
            tabId: this.parentTabId
                ? this.parentTabId
                : this.state.formMessage.tabId,
            action,
            fields: _.map(this.answers, (answer, index) => {
                const responseValue = answer.getResponse(action);
                if (completed === true) {
                    if (this.state.formData[index].mandatory) {
                        if (
                            !responseValue ||
                            responseValue === '' ||
                            responseValue === []
                        ) {
                            completed = false;
                        }
                    }
                    if (
                        this.state.formData[index].validation &&
                        !answer.valid
                    ) {
                        completed = false;
                    }
                }
                let field = null;
                if (this.state.formData[index].type === fieldType.fileField) {
                    field = {
                        id: answer.id,
                        value: responseValue,
                        fileName:
                            responseValue === ''
                                ? ''
                                : this.fileDB[responseValue]?.file?.name
                    };
                } else {
                    field = { ...this.state.formData[index] };
                    field.value = responseValue;
                }

                return field;
            })
        };
        return { responseData: response, completed };
    }

    checkFormValidation() {
        const missingField = this.answers.find(
            (answer) => !(answer.valid && answer.filled)
        );
        if (missingField) {
            return false;
        }
        return true;
    }

    saveFormData() {
        const data = _.map(this.state.formData, (field, index) => {
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

    getCurrentState = (action = formAction.CANCEL) => {
        const response = this.getResponse(action);
        if (action === formAction.CONFIRM) this.uploadFiles();
        return response;
    };

    // WHEN PRESS CONFIRM
    onDone = async () => {
        try {
            const response = this.getResponse(
                this.props.inlineActions
                    ? formAction.ON_SAVE
                    : formAction.CONFIRM
            );
            if (response.completed) {
                EventEmitter.emit(
                    FormsEvents.complete,
                    this.state.formMessage.formId
                );
                const { formMessage } = this.state;
                formMessage.stage = formStatus.COMPLETED;
                this.props.localControlId &&
                    (await ControlDAO.updateControl(
                        this.props.localControlId,
                        this.saveFormData(),
                        MessageTypeConstants.MESSAGE_TYPE_FORM2,
                        Date.now(),
                        formMessage
                    ));
                this.sendResponse(response.responseData);
                // this.props.onDone(this.saveFormData(), response.responseData);
                await this.uploadFiles();
                if (this.props.conversational === false) {
                    if (this.props.nonConvOnConfirm) {
                        this.props.nonConvOnConfirm();
                    }
                } else {
                    NavigationAction.pop();
                }
            } else {
                console.log('FORM: you must fill all mandatory fields');
                Toast.show({
                    text1:
                        'You must fill all mandatory fields and the entered values must be valid'
                });
            }
        } catch (error) {
            this.answers[key].valid = false;
            this.setState({ answers: this.answers });
        }
    };

    async uploadFiles() {
        this.uploadQueue.forEach(async (file) => {
            const filedeatils = this.fileDB[file.file];
            const baseUri =
                file.type === 'IMAGE'
                    ? Constants.IMAGES_DIRECTORY
                    : Constants.OTHER_FILE_DIRECTORY;
            const plainName = file.file.substring(
                0,
                file.file.lastIndexOf('.')
            );
            let scopeId = this.props.conversationId;
            if (filedeatils.scope === 'domain')
                scopeId = Store.getState().user.currentDomain;
            if (filedeatils.scope === 'bot') scopeId = this.props.botId;
            await Resource.uploadFile(
                `${baseUri}/${file.file}`,
                scopeId,
                plainName,
                file.type === 'IMAGE'
                    ? ResourceTypes.Image
                    : ResourceTypes.OtherFile,
                filedeatils.file.type,
                filedeatils.scope
            );
        });
    }

    sendResponse(response) {
        response.tz = this.state.timeZone;
        if (this.props.inlineActions) {
            this.props.sendMessage(
                response,
                this.state.formMessage.docId,
                this.state.formMessage.newRow
            );
            return;
        }
        const message = new Message();
        message.messageByBot(false);
        response.docId = this.state.formMessage?.docId;
        if (this.parentTabId) response.tabId = this.parentTabId;
        response.parentDocId = this.parentDocId;
        response.content = { currentFieldValue: response.currentFieldValue };
        message.formResponseMessage(response, this.state.formMessage);
        message.setCreatedBy(this.props.userId);
        this.props.sendMessage(message);
    }

    onCloseForm = () => {
        this.props.localControlId &&
            ControlDAO.updateControl(
                this.props.localControlId,
                this.saveFormData(),
                MessageTypeConstants.MESSAGE_TYPE_FORM2,
                Date.now(),
                this.state.formMessage
            );
        // let response = this.getResponse(formAction.CLOSE);
        const response = {
            formId: this.state.formMessage.formId,
            action: formAction.CLOSE
        };
        this.sendResponse(response);
        this.props.conversational && NavigationAction.pop();
    };

    onCancelForm = async () => {
        if (
            this.state.formMessage.cancel &&
            this.state.formMessage.cancel.toLowerCase() === 'clear'
        ) {
            this.clearForm();
            // the below code will update all default answer when data is coming from bot, so now only readOnly and mandate =false will show after clicking clear CORE-1842
            const formData =
                this.props.formData ||
                (await ControlDAO.getContentById(this.props.localControlId)); // we need initial state as form opened so used it after clicking cancel
            this.initializeAnswers(formData);

            this.setState({ answers: this.answers });
            return;
        }

        if (this.state.disabled && this.props.conversational !== false) {
            NavigationAction.pop();
            return;
        }

        if (this.props.conversational === false) {
            if (this.props.minimize) {
                this.props.minimize();
            }
        }

        EventEmitter.emit(FormsEvents.complete, this.state.formMessage.formId);
        const { formMessage } = this.state;
        formMessage.stage = formStatus.COMPLETED;
        if (this.props.inlineActions) {
            const response = this.getResponse(formAction.ON_DISCARD);
            this.sendResponse(response.responseData);
        } else {
            const response = {
                formId: this.state.formMessage.formId,
                action: formAction.CANCEL
            };
            this.sendResponse(response);
        }
        this.props.localControlId &&
            ControlDAO.updateControl(
                this.props.localControlId,
                this.saveFormData(),
                MessageTypeConstants.MESSAGE_TYPE_FORM2,
                Date.now(),
                formMessage
            );
        if (
            this.state.formMessage.cancel &&
            this.state.formMessage.cancel.toLowerCase() === 'reset'
        ) {
            this.clearForm();
        }
        this.props.conversational !== false && NavigationAction.pop();
    };

    clearForm() {
        const resettedAnswers = this.answers.map((answer, index) => {
            if (this.state.formData[index].validation) {
                answer.valid = false;
            } else {
                answer.valid = true;
            }
            if (this.state.formData[index].mandatory) {
                answer.filled = false;
            } else {
                answer.filled = true;
            }
            switch (this.state.formData[index].type) {
                case fieldType.textField:
                    answer.value = '';
                    break;
                case fieldType.number:
                    answer.value = '';
                    break;
                case fieldType.textArea:
                    answer.value = '';
                    break;
                case fieldType.checkbox:
                    answer.value = this.state.formData[index].options.map(
                        (option) => false
                    );
                    break;
                case fieldType.radioButton:
                    answer.value = -1; // index
                    break;
                case fieldType.dropdown:
                    answer.value = ''; // index
                    break;
                case fieldType.buttonsField:
                    answer.value = ''; // index
                    break;
                case fieldType.switch:
                    answer.value = false;
                    break;
                case fieldType.slider:
                    answer.value = 0;
                    break;
                case fieldType.date:
                    answer.value = null;
                    break;
                case fieldType.time:
                    answer.value = null;
                    break;
                case fieldType.dateTime:
                    answer.value = null;
                    break;
                case fieldType.multiselection:
                    answer.value = _.map(
                        this.state.formData[index].options,
                        (option) => false
                    );
                    break;
                case fieldType.passwordField:
                    answer.value = '';
                    break;
                case fieldType.lookup:
                    answer.value = '';
                    answer.search = '';
                    break;
                case fieldType.imageField:
                    answer.value = '';
                    answer.validationMessage = 'Could not upload the image';
                    answer.valid = true;
                    break;
                case fieldType.fileField:
                    answer.value = '';
                    answer.validationMessage = 'Could not upload the file';
                    answer.valid = true;
                    break;
                default:
            }
            return answer;
        });
        this.answers = resettedAnswers;
        this.setState({
            answers: this.answers,
            disabled: false,
            globalValidationMessage: ''
        });
    }

    onSearchAction(fieldId, fieldValue) {
        const response = {
            formId: this.state.formMessage.formId,
            action: formAction.SEARCH,
            currentField: fieldId,
            currentFieldValue: fieldValue || '',
            content: { currentFieldValue: fieldValue || '' }
        };
        this.sendResponse(response);
    }

    onClickAction(fieldId, buttonLabel) {
        const response = {
            formId: this.state.formMessage.formId,
            action: formAction.CLICK,
            currentField: fieldId,
            currentFieldValue: buttonLabel,
            tabId: this.state.formMessage.tabId
        };
        this.sendResponse(response);
    }

    changeForm(changeMessage) {
        if (
            changeMessage.getMessageOptions().formId ===
                this.state.formMessage.formId ||
            changeMessage.getMessageOptions().docId ===
                this.state.formMessage.docId
        ) {
            const change = changeMessage.getMessage();
            const oldFormData = this.saveFormData();
            const newFormData = _.differenceWith(
                oldFormData,
                change.remove,
                (field, removeField) => field.id === removeField
            );
            change.fields.forEach((newField) => {
                const key = newFormData.findIndex(
                    (field) => field.id === newField.id
                );
                if (key >= 0) {
                    newFormData[key] = newField;
                } else {
                    newFormData.push(newField);
                }
            });
            this.initializeAnswers(newFormData);
            this.setState({
                formData: newFormData,
                answers: this.answers,
                formIsCompleted: this.checkFormValidation(),
                globalValidationMessage: ''
            });
        }
    }

    validateField(validationMessage) {
        const validation = validationMessage.getMessage();
        if (
            validationMessage.getMessageOptions().formId ===
                this.state.formMessage.formId ||
            validationMessage.getMessageOptions().docId ===
                this.state.formMessage.docId
        ) {
            if (validation.field) {
                const fieldToValidate = this.answers.findIndex(
                    (answer) => answer.id === validation.field
                );
                if (fieldToValidate >= 0) {
                    this.answers[fieldToValidate].valid =
                        validation.validationResult;
                    this.answers[fieldToValidate].validationMessage =
                        validation.validationMessage;
                    this.setState({ answers: this.answers });
                }
            } else {
                this.setState({
                    globalValidationMessage: validation.validationMessage
                });
            }
        }
    }

    setDisabled(formId) {
        if (formId === this.state.formMessage.formId) {
            this.setState({ disabled: true, globalValidationMessage: '' });
        }
    }

    updateCurrentResults(currentResults) {
        if (
            currentResults.getMessageOptions().formId ===
                this.state.formMessage.formId ||
            currentResults.getMessageOptions().docId ===
                this.state.formMessage.docId
        ) {
            const results = currentResults.getMessage();
            this.currentLookUpKey = this.answers.findIndex(
                (answer) => answer.id === results.field
            );
            if (this.currentLookUpKey >= 0) {
                this.callbacks[this.currentLookUpKey].searchCallBack(
                    results.results
                );
                if (results.results && results.results.length === 0)
                    Toast.show({ text1: 'No results found' });
                delete this.callbacks[this.currentLookUpKey];
                this.setState({
                    answers: this.answers
                });
            }
        }
    }

    processFileSelection = async (fieldData, result, key) => {
        const completeFilename =
            this.props.conversationId +
            this.state.formMessage.formId +
            fieldData.id +
            new Date().getTime().toString() +
            result.name;
        if (result.removed) {
            this.answers[key].value = '';
            this.answers[key].valid = true;
            delete this.fileDB[completeFilename];
            this.onMoveAction(
                key,
                this.answers[key].id,
                this.answers[key].value
            );
            this.setState({
                answers: this.answers
            });
            return;
        }
        if (!result.cancelled) {
            const fileDirectory =
                fieldData.type === fieldType.imageField
                    ? Constants.IMAGES_DIRECTORY
                    : Constants.OTHER_FILE_DIRECTORY;
            const imageUri = result.uri;

            const newUri = `${fileDirectory}/${completeFilename}`;
            const exist = await RNFS.exists(newUri);
            if (exist) {
                await RNFS.unlink(newUri);
            }
            await RNFS.mkdir(fileDirectory);
            await RNFS.copyFile(imageUri, newUri);
            this.answers[key].value = completeFilename;
            this.answers[key].valid = true;
            this.fileDB[completeFilename] = {
                name: completeFilename,
                file: result,
                scope: fieldData.fileScope
            };
            this.onMoveAction(
                key,
                this.answers[key].id,
                this.answers[key].value
            );
            this.setState({
                answers: this.answers
            });
        }
    };

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

    onMoveAction = (key, value = null) => {
        console.log('--------- onMoveAction', key, fieldId, fieldValue);
        const fieldValue = this.answers[key].getResponse();
        const fieldId = this.state.formData[key].id;
        if (!fieldValue && this.state.formData[key].mandatory) {
            this.answers[key].filled = false;
        } else {
            this.answers[key].filled = true;
        }
        const response = {
            formId: this.state.formMessage.formId,
            action: formAction.MOVE,
            currentField: fieldId,
            currentFieldValue: value || fieldValue || '',
            content: { currentFieldValue: value || fieldValue || '' },
            tabId: this.state.formMessage.tabId
        };
        this.sendResponse(response);
    };

    onFiledChnage = (key, value) => {
        console.log('--------- onFiledChnage', key, value);
        let sendMoveAction = false;
        switch (this.state.formData[key].type) {
            case fieldType.checkbox: {
                this.answers[key].value[value] = !this.answers[key].value[
                    value
                ];
                sendMoveAction = true;
                break;
            }
            case fieldType.radioButton: {
                this.answers[key].value = value;
                sendMoveAction = true;
                break;
            }

            //These filds work like deaault, but we need to set move action flag,
            //hence contue execution
            case fieldType.dropdown:
            case fieldType.multiselection:
            case fieldType.date:
            case fieldType.dateTime:
                sendMoveAction = true;
            default: {
                console.log('----- settign values  default mode');
                this.answers[key].value = value;
                if (this.state.formData[key].validation) {
                    this.answers[key].valid = undefined;
                }
                if (value === '' && this.state.formData[key].mandatory) {
                    this.answers[key].filled = false;
                } else {
                    this.answers[key].filled = true;
                }
            }
        }
        if (sendMoveAction) {
            this.onMoveAction(key);
        }
        this.setState({
            answers: this.answers,
            showInfoOfIndex: null
        });
    };

    getDataForLookup = (key, id, text, callback) => {
        this.onSearchAction(id, text);
        this.callbacks[key] = { searchCallBack: callback };
        this.setState({ answers: this.answers });
    };

    renderFields = () => {
        return (
            <FormView
                formData={this.state.formData}
                disabled={this.state.disabled}
                onFieldUpdate={this.onFiledChnage}
                currentAnswers={this.state.answers}
                conversationId={this.props.conversationId}
                onMoveAction={this.onMoveAction}
                getDataForLookup={this.getDataForLookup}
                onClickAction={(key, fieldId, label) => {
                    this.onClickAction(fieldId, label);
                }}
                fileDB={this.fileDB}
                processFileSelection={this.processFileSelection}
            />
        );
    };

    globalValidationMessage = () => {
        if (this.state.globalValidationMessage) {
            return (
                <View style={styles.globalValidationMessage}>
                    <Text style={styles.validationMessageText}>
                        {this.state.globalValidationMessage}
                    </Text>
                </View>
            );
        }
    };

    renderScrollContent() {
        const { keyBoadrVisible } = this.state;
        const formIsCompleted = this.checkFormValidation();
        const containerStyle =
            this.props.conversational === false
                ? { backgroundColor: GlobalColors.appBackground }
                : { flex: 1, backgroundColor: GlobalColors.appBackground };
        return (
            <View style={styles.form2FieldContainer}>
                {this.props.conversational !== false && (
                    <Text style={styles.f2Title}>
                        {this.state.formMessage.title}
                    </Text>
                )}
                {this.renderFields()}
                {!keyBoadrVisible && (
                    <View style={styles.f2BottomArea}>
                        {(this.state.formMessage.cancel ||
                            this.props.inlineActions) && (
                            <SecondaryButton
                                onPress={this.onCancelForm}
                                text={this.state.formMessage.cancel || 'Cancel'}
                            />
                        )}
                        {((this.state.formMessage.confirm &&
                            this.state.formMessage.confirm !== '') ||
                            this.props.inlineActions) && (
                            <PrimaryButton
                                text={this.state.formMessage.confirm || 'Done'}
                                disabled={!formIsCompleted}
                                onPress={this.onDone}
                            />
                        )}
                    </View>
                )}
            </View>
        );
    }

    pickScroll() {
        const { conversational } = this.props;
        const { dropdownModalVisible, showDateTimePicker } = this.state;
        let containerStyle = {
            height: '100%',
            backgroundColor: GlobalColors.appBackground
        };
        let nestedScrollEnabled = false;
        if (conversational === false) {
            containerStyle = { backgroundColor: GlobalColors.appBackground };
            nestedScrollEnabled = true;
        }

        return (
            <SafeAreaView style={styles.containerArea}>
                <KeyboardAwareScrollView
                    keyboardShouldPersistTaps="never"
                    style={styles.containerArea}
                    // extraScrollHeight={50}
                    keyboardOpeningTime={10}
                    enableOnAndroid
                    nestedScrollEnabled={nestedScrollEnabled}
                    enableResetScrollToCoords={false}
                >
                    {this.renderScrollContent()}
                </KeyboardAwareScrollView>
                {(dropdownModalVisible || showDateTimePicker) && (
                    <View style={styles.modalBackground} />
                )}
                {this.globalValidationMessage()}
            </SafeAreaView>
        );
    }

    render() {
        const { initialized, showDateTimePicker } = this.state;
        const containerStyle =
            this.props.conversational === false
                ? {
                      height: '100%',
                      backgroundColor: GlobalColors.appBackground
                  }
                : { flex: 1, backgroundColor: GlobalColors.appBackground };
        if (initialized) {
            return (
                <View key={this.props.key} style={styles.containerArea}>
                    {this.pickScroll()}
                </View>
            );
        }
        return (
            <View
                style={[
                    {
                        justifyContent: 'center',
                        alignItems: 'center'
                    },
                    containerStyle
                ]}
                key={this.props.key}
            >
                <ActivityIndicator size="large" />
            </View>
        );
    }
}
