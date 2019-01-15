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
            case 'text_field':
                answer.value = '';
                answer.getResponse = () => {
                    return answer.value;
                };
                break;
            case 'text_area': //no answer
                break;
            case 'checkbox':
                answer.value = _.map(fieldData.options, () => {
                    return false;
                });
                answer.getResponse = () => {
                    return _.filter(fieldData.options, (option, i) => {
                        return answer.value[i];
                    });
                };
                break;
            case 'radiobutton':
                var v = fieldData.value;
                answer.value = fieldData.options.indexOf(v); //index
                answer.getResponse = () => {
                    return fieldData.options[answer.value];
                };
                break;
            case 'dropdown':
                var v = fieldData.value;
                answer.value = fieldData.options.indexOf(v); //index
                answer.getResponse = () => {
                    return fieldData.options[answer.value];
                };
                break;
            case 'switch':
                answer.value = fieldData.value || false;
                answer.getResponse = () => {
                    return answer.value;
                };
                break;
            case 'slider':
                answer.value = fieldData.value || 0;
                answer.getResponse = () => {
                    return answer.value;
                };
                break;
            case 'date':
                answer.value = new Date(fieldData.value) || new Date(); //milliseconds. Use getTime() to get the milliseconds to send to backend
                answer.getResponse = () => {
                    return answer.value.getTime();
                };
                break;
            case 'multi_selection':
                answer.value = _.map(fieldData.options, () => {
                    return false;
                });
                answer.getResponse = () => {
                    return _.filter(fieldData.options, (option, i) => {
                        return answer.value[i];
                    });
                };
                break;
            case 'password_field':
                answer.value = '';
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
            dropdownModalTitle: ''
        };

        this.props.navigation.setParams({
            showConnectionMessage: this.showConnectionMessage
        });
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
        let response = {
            formId: this.props.id,
            fields: _.map(this.answers, answer => {
                let field = {
                    id: answer.id,
                    value: answer.getResponse()
                };
                return field;
            })
        };
        return response;
    }

    renderTextField(content, key) {
        return (
            <TextInput
                style={styles.textField}
                onChangeText={text => {
                    this.answers[key].value = text;
                    // this.setState({ answers: this.answers })
                }}
                placeholder={content}
                placeholderTextColor={GlobalColors.disabledGray}
                // value={this.state.answers[key].value}
            />
        );
    }

    renderCheckbox(content, key) {
        let options = _.map(content, (option, index) => {
            return (
                <CheckBox
                    key={index}
                    title={option}
                    onIconPress={() => {
                        this.answers[key].value[index] = !this.answers[key]
                            .value[index];
                        this.setState({ answers: this.answers });
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
        let options = _.map(content, (option, index) => {
            return (
                <CheckBox
                    key={index}
                    title={option}
                    onIconPress={() => {
                        this.answers[key].value = index;
                        this.setState({ answers: this.answers });
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
                onPress={() => {
                    this.currentDropdownModalKey = key;
                    this.setState({
                        dropdownModalOptions: content,
                        dropdownModalValue: this.answers[key].value, //index
                        dropdownModalVisible: true,
                        dropdownModalTitle: this.props.formData[key].title
                    });
                }}
                style={styles.textField}
            >
                <Text>{content[this.state.answers[key].value]}</Text>
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

    renderSwitch(key) {
        return (
            <Switch
                onValueChange={value => {
                    this.answers[key].value = value;
                    this.setState({ answers: this.answers });
                }}
                value={this.state.answers[key].value}
            />
        );
    }

    renderSlider(key) {
        return (
            <Slider
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

    renderDate(key) {
        return (
            <TouchableOpacity
                onPress={() => {
                    this.currentDateModalKey = key;
                    this.setState({
                        dateModalValue: this.answers[key].value,
                        dateModalVisible: true
                    });
                }}
                style={styles.dateField}
            >
                <Text>
                    {this.state.answers[key].value.getDate() +
                        '/' +
                        this.state.answers[key].value.getMonth() +
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

    renderMultiselection(content, key) {
        return (
            <TouchableOpacity
                onPress={() => {
                    Actions.multiselection({
                        index: key,
                        options: content,
                        response: this.answers[key].value,
                        onDone: this.onMultiselectionDone.bind(this)
                    });
                }}
                style={styles.multiselectionContainer}
            >
                <Text style={styles.optionText}>Multiple selection</Text>
                {Icons.formMessageArrow()}
            </TouchableOpacity>
        );
    }

    onMultiselectionDone(response, key) {
        this.answers[key].value = response;
        this.setState({ answers: this.answers });
    }

    renderPasswordField(key) {
        return (
            <TextInput
                onChangeText={text => {
                    this.answers[key].value = text;
                    // this.setState({ answers: this.answers })
                }}
                secureTextEntry={true}
                textContentType="password"
                style={styles.textField}
                // value={this.state.answers[key].value}
            />
        );
    }

    renderField(fieldData, key) {
        let field;
        switch (fieldData.type) {
        case 'text_field':
            field = this.renderTextField(fieldData.value, key);
            break;
        case 'text_area': //render only the label
            field = null;
            break;
        case 'checkbox':
            field = this.renderCheckbox(fieldData.options, key);
            break;
        case 'radiobutton':
            field = this.renderRadioButton(fieldData.options, key);
            break;
        case 'dropdown':
            field = this.renderDropdown(fieldData.options, key);
            break;
        case 'switch':
            field = this.renderSwitch(key);
            break;
        case 'slider':
            field = this.renderSlider(key);
            break;
        case 'date':
            field = this.renderDate(key);
            break;
        case 'multi_selection':
            field = this.renderMultiselection(fieldData.options, key);
            break;
        case 'password_field':
            field = this.renderPasswordField(key);
            break;
        default:
        }
        return (
            <View style={styles.f2FieldContainer} key={key}>
                <Text style={styles.f2LabelTitle}>{fieldData.title || ''}</Text>
                {field}
            </View>
        );
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
                                Actions.pop();
                            }}
                        >
                            <Text style={styles.f2CancelButtonText}>
                                {this.props.cancel || 'Cancel'}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.f2DoneButton}
                            onPress={() => {
                                let response = this.getResponse();
                                this.props.onDone(response);
                                Actions.pop();
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
