import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    ScrollView,
    KeyboardAvoidingView,
    Keyboard, Platform
} from 'react-native';
import Styles from './styles';
import { Actions } from 'react-native-router-flux';
import I18n from '../../config/i18n/i18n';
import { GlobalColors } from '../../config/styles';
import _ from 'lodash';
import { CheckBox } from 'react-native-elements';


export const CHECKBOX_CONFIG = {
    uncheckedIcon : 'ios-radio-button-off-outline',
    checkedIcon : 'ios-checkmark-circle',
    checkedColor : '#FF7F50',
    iconType : 'ionicon',
}

class FormTextInput extends React.Component {

    state = {
        borderColor: GlobalColors.disabledGray
    }

    constructor(props) {
        super(props);
        this.value = this.props.formData.value;
    }

    onChangeText(text) {
        this.value = text;
        this.props.onChangeText(text);
        const { formData } = this.props;
        if (formData.optional === false) {
            if (_.trim(text) === '') {
                this.setState({
                    borderColor: GlobalColors.red
                })
            } else {
                this.setState({
                    borderColor: GlobalColors.disabledGray
                })
            }
        }
    }

    render() {
        const { formData, editable } = this.props;
        return <TextInput
            numberOfLines={this.props.numberOfLines}
            editable={editable}
            onChangeText={this.onChangeText.bind(this)}
            style={[Styles.formTextField, {borderColor : this.state.borderColor}] }
            placeholder={formData.title}
            defaultValue={this.value}
            containerStyle={Styles.noBorder}
            secureTextEntry={this.props.secureTextEntry}
        />;
    }
}


class FormCheckBox extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            value: props.formData.value
        }
    }

    onRowSelect() {
        if (this.props.onValueChange) {
            this.props.onValueChange(!this.state.value);
        }
        this.setState({
            value: !this.state.value
        });
    }

    render() {
        const { formData, id } = this.props;
        return (
            <TouchableOpacity style={Styles.checkBoxContainer} key={id} onPress={this.onRowSelect.bind(this)}>
                <CheckBox
                    key={formData.id}
                    containerStyle={Styles.checkboxContainer}
                    style={Styles.checkboxIconStyle}
                    uncheckedIcon={CHECKBOX_CONFIG.uncheckedIcon}
                    checkedIcon={CHECKBOX_CONFIG.checkedIcon}
                    checkedColor={CHECKBOX_CONFIG.checkedColor}
                    iconType={CHECKBOX_CONFIG.iconType}
                    checked={this.state.value}
                    onPress={this.onRowSelect.bind(this)}
                />
                <Text style={Styles.checkBoxText}>
                    {formData.title}
                </Text>
            </TouchableOpacity>
        );
    }
}

export default class FormPopup extends React.Component {

    constructor(props) {
        super(props);
        this.formValuesArray = []
        this.errorMessages = []
    }

    onClose() {
        Keyboard.dismiss();
        if (this.props.onClose) {
            this.props.onClose();
        }
        Actions.pop();
    }
    componentDidMount() {
        this.keyboardWillShowListener = Keyboard.addListener('keyboardWillShow', this.keyboardWillShow.bind(this));
        //this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this.keyboardDidShow.bind(this));
    }

    componentWillUnmount() {
        if (this.keyboardWillShowListener) {
            this.keyboardWillShowListener.remove();
        }
    }

    keyboardWillShow(keyboard) {
        console.log(keyboard);
    }

    isValid() {
        var formData = this.props.formData
        for (var i = 0; i < formData.length; i++) {
            if (formData[i].optional === false && _.trim(this.formValuesArray[i]) === '') {
                this.errorMessages[i] = I18n.t('Field_mandatory');
                return false;
            }

            if (formData[i].type === 'number_field' && isNaN(+this.formValuesArray[i])) {
                this.errorMessages[i] = I18n.t('Not_a_number');
                return false;
            }

            if (formData[i].type === 'password_field' && _.trim(this.formValuesArray[i]) === '') {
                this.errorMessages[i] = I18n.t('Password_not_empty')
                return false;
            }
            this.errorMessages[i] = undefined;
        }
        return true;
    }


    CTAResponseOnPress() {
        if (!this.isValid() || !this.props.editable) {
            return;
        }
        var formData = this.props.formData
        for (var i = 0; i < formData.length; i++) {
            var eachFormData = formData[i]
            eachFormData.value = this.formValuesArray[i]
            formData[i] = eachFormData
        }
        if (this.props.onFormSubmit) {
            this.props.onFormSubmit(formData)
        }
        Actions.pop();
    }

    onChangeText(i, text) {
        this.formValuesArray[i] = text
    }

    onCheckBoxValueChange(i, value) {
        this.formValuesArray[i] = value;
    }

    renderForm() {
        var buttons = []
        var formData = this.props.formData

        for (var i = 0; i < formData.length; i++) {
            if (formData[i].type === 'text') {
                buttons.push(
                    <View style={Styles.formTitleContainer} key={i}>
                        <Text style={Styles.formTitle}>{formData[i].title}</Text>
                        <TouchableOpacity style={Styles.formCloseButton} onPress={this.onClose.bind(this)}>
                            <Text style={Styles.formCloseButtonText}>{I18n.t('Close').toLocaleUpperCase()}</Text>
                        </TouchableOpacity>
                    </View>
                )
            } else if (formData[i].type === 'text_field' || formData[i].type === 'number_field' || formData[i].type === 'password_field') {
                this.formValuesArray[i] = formData[i].value;
                buttons.push(
                    <View style={Styles.formInputContainer} key={i}>
                        <View style={Styles.titleContainer}>
                            <Text style={Styles.formInputLabel}>{formData[i].title ? formData[i].title.toLocaleUpperCase() : ''}</Text>
                            <Text style={Styles.formErrorLabel}>{this.errorMessages[i] ? this.errorMessages[i] : ''}</Text>
                        </View>
                        <FormTextInput
                            editable={this.props.editable}
                            formData={formData[i]}
                            onChangeText={this.onChangeText.bind(this, i)}
                            containerStyle={Styles.noBorder}
                            secureTextEntry={formData[i].type === 'password_field'}
                        />
                    </View>
                )
            } else if (formData[i].type === 'text_area') {
                this.formValuesArray[i] = formData[i].value;
                buttons.push(
                    <View style={Styles.formInputContainer} key={i}>
                        <Text style={Styles.formInputLabel}>{formData[i].title ? formData[i].title.toLocaleUpperCase() : ''}</Text>
                        <FormTextInput
                            numberOfLines={3}
                            editable={this.props.editable}
                            formData={formData[i]}
                            onChangeText={this.onChangeText.bind(this, i)}
                            containerStyle={Styles.noBorder}
                        />
                    </View>
                )
            } else if (formData[i].type === 'button') {
                const buttonStyle = this.props.editable ? Styles.formButton : [Styles.formButton, Styles.formButtonDisabled];
                buttons.push(
                    <View style={Styles.formButtonContainer} key={i}>
                        <TouchableOpacity
                            underlayColor="white"
                            onPress={this.CTAResponseOnPress.bind(this)}
                            style={buttonStyle}>
                            <Text style={Styles.formButtonText}>
                                {formData[i].title}
                            </Text>
                        </TouchableOpacity>
                    </View>
                )
            } else if (formData[i].type === 'checkbox') {
                const data = formData[i];
                this.formValuesArray[i] = true;
                buttons.push(
                    <FormCheckBox formData={data} key={i} id={i} onValueChange={this.onCheckBoxValueChange.bind(this, i)} />
                )
            }
        }
        return buttons;
    }

    render(){
        return (
            <View style={Styles.containerStyle}>
                <KeyboardAvoidingView
                    behavior={(Platform.OS === 'ios') ? "position": null}
                    style={Styles.formContainer}>
                    <ScrollView style={Styles.formScrollView} keyboardShouldPersistTaps="handled">
                        {this.renderForm()}
                    </ScrollView>
                </KeyboardAvoidingView>
            </View>
        );
    }
}
