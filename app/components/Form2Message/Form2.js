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
    DatePickerAndroid
} from 'react-native';
import styles from './styles';
import _ from 'lodash';
import Icons from '../../config/icons';
import { Actions } from 'react-native-router-flux';
import { CheckBox } from 'react-native-elements';
import { GlobalColors } from '../../config/styles';
import Modal from 'react-native-modal';

export default class Form2 extends React.Component {
    constructor(props) {
        super(props);
        this.answers = []; //used to store data to render the UI. This is not what the form will send to the bot
        _.map(this.props.formData, (fieldData, index) => {
            let answer = {
                id: fieldData.id
            };
            switch (fieldData.type) {
            case 'text_field':
                answer.value = '';
                break;
            case 'text_area': //no answer
                break;
            case 'checkbox':
                answer.value = _.map(fieldData.options, () => {
                    return false;
                });
                break;
            case 'radiobutton':
                answer.value =
                        fieldData.options.indexOf(fieldData.value) || null;
                break;
            case 'dropdown':
                answer.value = 0;
                break;
            case 'switch':
                answer.value = fieldData.value || false;
                break;
            case 'slider':
                answer.value = fieldData.value || 0;
                break;
            case 'date':
                answer.value = new Date(fieldData.value) || new Date(); //milliseconds. Use getTime() to get the milliseconds to send to backend
                break;
            case 'multi_selection':
                answer.value = _.map(fieldData.value, () => {
                    return false;
                });
                break;
            case 'password_field':
                answer.value = '';
                break;
            default:
            }
            this.answers.push(answer);
        });
        this.state = {
            answers: this.answers,
            dateModalVisible: false,
            dateModalValue: new Date()
        };
    }

    renderTextField(content, key) {
        return (
            <TextInput
                style={styles.f2TextField}
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
                />
            );
        });
        return options;
    }

    renderDropdown(content, key) {}

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
            >
                <Text>
                    {this.state.answers[key].value.getDate() +
                        '/' +
                        this.state.answers[key].value.getMonth() +
                        '/' +
                        this.state.answers[key].value.getFullYear()}
                </Text>
            </TouchableOpacity>
        );
    }

    renderDateModalIOS() {
        return (
            <Modal
                isVisible={this.state.dateModalVisible}
                onBackdropPress={() => {
                    this.setState({
                        dateModalVisible: false,
                        answers: this.answers
                    });
                }}
                style={styles.dateModalIOS}
            >
                <DatePickerIOS
                    style={styles.datePickerIOS}
                    onDateChange={date => {
                        this.answers[this.currentDateModalKey].value = date;
                        this.setState({ dateModalValue: date });
                    }}
                    date={this.state.dateModalValue}
                    mode="date"
                />
            </Modal>
        );
    }

    renderMultiselection(content) {}

    renderPasswordField(key) {
        return (
            <TextInput
                onChangeText={text => {
                    this.answers[key].value = text;
                    // this.setState({ answers: this.answers })
                }}
                secureTextEntry={true}
                textContentType="password"
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
                <Text style={styles.f2Title}>{this.props.title}</Text>
                {this.renderFields()}
                <View style={styles.f2BottomArea}>
                    <TouchableOpacity style={styles.f2CancelButton}>
                        <Text style={styles.f2CancelButtonText}>
                            {this.props.cancel || 'Cancel'}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.f2DoneButton}>
                        <Text style={styles.f2DoneButtonText}>
                            {this.props.confirm || 'Done'}
                        </Text>
                    </TouchableOpacity>
                </View>
                {this.renderDateModalIOS()}
                {/* {this.renderDropdownModal()} */}
            </SafeAreaView>
        );
    }
}
