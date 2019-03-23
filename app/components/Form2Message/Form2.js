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
    FlatList,
    ScrollView,
    Platform,
    Image,
    Alert
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
import { Settings, PollingStrategyTypes } from '../../lib/capability';
import { formStatus, fieldType } from './config';

export default class Form2 extends React.Component {
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
                            Actions.pop();
                            state.params.onBack();
                        } else {
                            Actions.pop();
                        }
                    }}
                />
            );
        }

        if (state.params.button) {
            if (state.params.button === 'manual') {
                navigationOptions.headerRight = (
                    <HeaderRightIcon
                        onPress={() => {
                            state.params.refresh();
                        }}
                        icon={Icons.refresh()}
                    />
                );
            } else if (state.params.button === 'gsm') {
                navigationOptions.headerRight = (
                    <HeaderRightIcon
                        image={images.gsm}
                        onPress={() => {
                            state.params.showConnectionMessage('gsm');
                        }}
                    />
                );
            } else if (state.params.button === 'satellite') {
                navigationOptions.headerRight = (
                    <HeaderRightIcon
                        image={images.satellite}
                        onPress={() => {
                            state.params.showConnectionMessage('satellite');
                        }}
                    />
                );
            } else {
                navigationOptions.headerRight = (
                    <HeaderRightIcon
                        icon={Icons.automatic()}
                        onPress={() => {
                            state.params.showConnectionMessage('automatic');
                        }}
                    />
                );
            }
        }
        return navigationOptions;
    }

    constructor(props) {
        super(props);
        this.answers = []; //used to store data to render the UI. This is not what the form will send to the bot
        _.map(this.props.formData, (fieldData, index) => {
            let answer = {
                id: fieldData.id,
                getResponse: () => {}
            };
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
                answer.value = new Date(fieldData.value) || new Date(); //milliseconds. Use getTime() to get the milliseconds to send to backend
                answer.getResponse = () => {
                    return answer.value.getTime();
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
            default:
            }
            this.answers.push(answer);
        });
        this.state = {
            answers: this.answers,
            dateModalVisible: false,
            dateModalValue: new Date(),
            dropdownModalVisible: false,
            dropdownModalValue: null,
            dropdownModalOptions: [],
            dropdownModalTitle: '',
            disabled: this.props.formStatus === formStatus.COMPLETED
        };
        this.props.navigation.setParams({
            showConnectionMessage: this.showConnectionMessage
        });
    }

    componentDidUpdate(prevProps) {
        if (prevProps.formStatus !== this.props.formStatus) {
            this.setState({
                disabled: this.props.formStatus === formStatus.COMPLETED
            });
        }
    }

    componentDidMount() {
        this.checkPollingStrategy();
    }

    showConnectionMessage = connectionType => {
        let message = I18n.t('Auto_Message');
        if (connectionType === 'gsm') {
            message = I18n.t('Gsm_Message');
        } else if (connectionType === 'satellite') {
            message = I18n.t('Satellite_Message');
        }
        Alert.alert(
            I18n.t('Connection_Type'),
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

    getResponse() {
        try {
            let response = {
                formId: this.props.id,
                fields: _.map(this.answers, (answer, index) => {
                    const responseValue = answer.getResponse();
                    if (this.props.formData[index].mandatory) {
                        if (
                            !responseValue ||
                            responseValue === '' ||
                            responseValue === []
                        ) {
                            throw new Error('FORM: Mandatory answer not found');
                        }
                    }
                    let field = {
                        id: answer.id,
                        value: responseValue
                    };
                    return field;
                })
            };
            return response;
        } catch (e) {
            throw e;
        }
    }

    saveFormData() {
        const data = _.map(this.props.formData, (field, index) => {
            field.value = this.answers[index].getResponse();
            return field;
        });
        return data;
    }

    renderTextField(content, key) {
        return (
            <TextInput
                editable={!(this.state.disabled || content.readOnly)}
                style={styles.textField}
                onChangeText={text => {
                    this.answers[key].value = text;
                    this.setState({ answers: this.answers });
                }}
                placeholderTextColor={GlobalColors.disabledGray}
                value={this.state.answers[key].value}
            />
        );
    }
    renderNumberField(content, key) {
        return (
            <TextInput
                editable={!(this.state.disabled || content.readOnly)}
                style={styles.textField}
                onChangeText={text => {
                    this.answers[key].value = text;
                    this.setState({ answers: this.answers });
                }}
                placeholderTextColor={GlobalColors.disabledGray}
                keyboardType="numeric"
                value={this.state.answers[key].value}
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
                    this.answers[key].value = text;
                    this.setState({ answers: this.answers });
                }}
                placeholderTextColor={GlobalColors.disabledGray}
                value={this.state.answers[key].value}
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
                            this.setState({ answers: this.answers });
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
                            this.setState({ answers: this.answers });
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
                    this.currentDropdownModalKey = key;
                    this.setState({
                        dropdownModalOptions: content.options,
                        dropdownModalValue: this.answers[key].value, //index
                        dropdownModalVisible: true,
                        dropdownModalTitle: this.props.formData[key].title
                    });
                }}
                style={styles.textField}
            >
                <Text>{content.options[this.state.answers[key].value]}</Text>
                {Icons.formDownArrow()}
            </TouchableOpacity>
        );
    }

    renderDropdownModal() {
        return (
            <Modal
                isVisible={this.state.dropdownModalVisible}
                onBackdropPress={() => {
                    this.setState({
                        dropdownModalVisible: false
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
                                            dropdownModalValue: index
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
                                answers: this.answers
                            });
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
                    this.setState({ answers: this.answers });
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
                    this.setState({ answers: this.answers });
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
                    if (Platform.OS === 'android') {
                        DatePickerAndroid.open({
                            date: this.answers[key].value,
                            mode: 'calendar'
                        })
                            .then(date => {
                                if (
                                    date.action ===
                                    DatePickerAndroid.dateSetAction
                                ) {
                                    this.answers[key].value = new Date(
                                        date.year,
                                        date.month,
                                        date.day
                                    );
                                    this.setState({ answers: this.answers });
                                }
                            })
                            .then(() => {
                                resolve();
                            });
                    } else {
                        this.currentDateModalKey = key;
                        this.setState({
                            dateModalValue: this.answers[key].value,
                            dateModalVisible: true
                        });
                    }
                }}
                style={styles.dateField}
            >
                <Text>
                    {this.state.answers[key].value.getDate() +
                        '/' +
                        (this.state.answers[key].value.getMonth() + 1) +
                        '/' +
                        this.state.answers[key].value.getFullYear()}
                </Text>
                {Icons.formCalendar()}
            </TouchableOpacity>
        );
    }

    renderDateModalIOS() {
        return (
            <Modal
                isVisible={this.state.dateModalVisible}
                onBackdropPress={() => {
                    this.setState({
                        dateModalVisible: false
                    });
                }}
                style={styles.dateModalIOS}
                backdropOpacity={0.1}
            >
                <View style={styles.datePickerIOS}>
                    <DatePickerIOS
                        onDateChange={date => {
                            this.setState({ dateModalValue: date });
                        }}
                        date={this.state.dateModalValue}
                        mode="date"
                    />
                    <View style={styles.dateModalButtonArea}>
                        <TouchableOpacity
                            style={styles.dateModalButton}
                            onPress={() => {
                                this.answers[
                                    this.currentDateModalKey
                                ].value = this.state.dateModalValue;
                                this.setState({
                                    dateModalVisible: false,
                                    answers: this.answers
                                });
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
        this.setState({ answers: this.answers });
    }

    renderPasswordField(content, key) {
        return (
            <TextInput
                editable={!(this.state.disabled || content.readOnly)}
                onChangeText={text => {
                    this.answers[key].value = text;
                    this.setState({ answers: this.answers });
                }}
                secureTextEntry={true}
                textContentType="password"
                style={styles.textField}
                value={this.state.answers[key].value}
            />
        );
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
        default:
        }
        return (
            <View style={styles.f2FieldContainer} key={key}>
                <Text style={styles.f2LabelTitle}>
                    {fieldData.title || ''}
                    {this.renderMandatorySign(fieldData)}
                </Text>
                {field}
            </View>
        );
    }

    renderMandatorySign(fieldData) {
        if (fieldData.mandatory) {
            return <Text style={{ color: 'red' }}> *</Text>;
        }
    }

    renderFields() {
        let allFields = _.map(this.props.formData, (fieldData, index) => {
            return this.renderField(fieldData, index);
        });
        return allFields;
    }

    render() {
        return (
            <SafeAreaView style={styles.f2Container}>
                <ScrollView>
                    <Text style={styles.f2Title}>{this.props.title}</Text>
                    {this.renderFields()}
                    <View style={styles.f2BottomArea}>
                        <TouchableOpacity
                            style={styles.f2CancelButton}
                            onPress={() => {
                                if (!this.state.disabled) {
                                    this.props.saveMessage(this.saveFormData());
                                }
                                Actions.pop();
                            }}
                        >
                            <Text style={styles.f2CancelButtonText}>
                                {this.props.cancel || 'Cancel'}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            disabled={this.state.disabled}
                            style={styles.f2DoneButton}
                            onPress={() => {
                                try {
                                    let response = this.getResponse();
                                    this.props.onDone(
                                        this.saveFormData(),
                                        response
                                    );
                                    Actions.pop();
                                } catch (e) {
                                    console.log(e);
                                }
                            }}
                        >
                            <Text style={styles.f2DoneButtonText}>
                                {this.props.confirm || 'Done'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                    {this.renderDateModalIOS()}
                    {this.renderDropdownModal()}
                </ScrollView>
            </SafeAreaView>
        );
    }
}