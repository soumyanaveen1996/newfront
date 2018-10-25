import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    ScrollView,
    KeyboardAvoidingView,
    Keyboard,
    Platform
} from 'react-native';
import Styles from './styles';
import { Actions } from 'react-native-router-flux';
import I18n from '../../config/i18n/i18n';
import { GlobalColors } from '../../config/styles';
import _ from 'lodash';
import { CheckBox } from 'react-native-elements';
import { isEmail } from '../../lib/utils';

export const CHECKBOX_CONFIG = {
    uncheckedIcon: 'ios-radio-button-off-outline',
    checkedIcon: 'ios-checkmark-circle',
    checkedColor: '#FF7F50',
    iconType: 'ionicon'
};

class FormTextInput extends React.Component {
    state = {
        borderColor: GlobalColors.disabledGray
    };

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
                });
            } else {
                this.setState({
                    borderColor: GlobalColors.disabledGray
                });
            }
        }
    }

    render() {
        const { formData, editable } = this.props;
        return (
            <TextInput
                numberOfLines={this.props.numberOfLines}
                multiline={this.props.multiline}
                editable={editable}
                onChangeText={this.onChangeText.bind(this)}
                onBlur={this.props.onBlur}
                style={[
                    Styles.formTextField,
                    { borderColor: this.state.borderColor },
                    this.props.style
                ]}
                placeholder={formData.title}
                defaultValue={this.value}
                containerStyle={Styles.noBorder}
                secureTextEntry={this.props.secureTextEntry}
                keyboardType={this.props.keyboardType || 'default'}
                autoCapitalize={this.props.autoCapitalize || 'none'}
                underlineColorAndroid="rgba(0,0,0,0)"
            />
        );
    }
}

class RetryFormTextInput extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    onPasswordChange(password) {
        this.password = password;
        if (this.password && this.password.length > 0) {
            this.setState({
                passwordError: false
            });
        }
        this.checkPasswordAndRetrymatch();
    }

    checkPasswordAndRetrymatch() {
        if (this.retryPassword && this.password !== this.retryPassword) {
            this.setState({
                retryPasswordError: true
            });
        }
    }

    onPasswordBlur() {
        if (!this.password) {
            this.setState({
                passwordError: true
            });
        }
    }

    onRetryPasswordChange(retryPassword) {
        this.retryPassword = retryPassword;
        if (this.password && this.password !== retryPassword) {
            this.setState({
                retryPasswordError: true
            });
        } else {
            this.setState({
                retryPasswordError: false
            });
            this.props.onPasswordMatch(retryPassword);
        }
    }

    onRetryPasswordBlur() {
        this.checkPasswordAndRetrymatch();
    }

    renderError(error, message) {
        if (error) {
            this.props.onPasswordMatch('');
            return (
                <View style={Styles.titleContainer}>
                    <Text
                        allowFontScaling={false}
                        style={Styles.formErrorLabel}
                    >
                        {message}
                    </Text>
                </View>
            );
        }
    }

    render() {
        const { formData } = this.props;
        return (
            <View>
                <View
                    style={
                        this.state.passwordError
                            ? Styles.formTwoLineInputContainer
                            : Styles.formInputContainer
                    }
                >
                    <View style={Styles.titleContainer}>
                        <Text
                            sallowFontScaling={false}
                            style={Styles.formInputLabel}
                        >
                            {formData.title
                                ? formData.title.toLocaleUpperCase()
                                : ''}
                        </Text>
                    </View>
                    {this.renderError(
                        this.state.passwordError,
                        I18n.t('Password_error')
                    )}
                    <FormTextInput
                        editable={this.props.editable}
                        formData={formData}
                        onChangeText={this.onPasswordChange.bind(this)}
                        onBlur={this.onPasswordBlur.bind(this)}
                        containerStyle={Styles.noBorder}
                        secureTextEntry={true}
                    />
                </View>
                <View
                    style={
                        this.state.retryPasswordError
                            ? Styles.formTwoLineInputContainer
                            : Styles.formInputContainer
                    }
                >
                    <View style={Styles.titleContainer}>
                        <Text
                            allowFontScaling={false}
                            style={Styles.formInputLabel}
                        >
                            {formData.title
                                ? I18n.t('Confirm').toLocaleUpperCase() +
                                  ' ' +
                                  formData.title.toLocaleUpperCase()
                                : ''}
                        </Text>
                    </View>
                    {this.renderError(
                        this.state.retryPasswordError,
                        I18n.t('Retry_Password_error')
                    )}
                    <FormTextInput
                        editable={this.props.editable}
                        formData={formData}
                        onChangeText={this.onRetryPasswordChange.bind(this)}
                        onBlur={this.onRetryPasswordBlur.bind(this)}
                        containerStyle={Styles.noBorder}
                        secureTextEntry={true}
                    />
                </View>
            </View>
        );
    }
}

class FormCheckBox extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: props.value
        };
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
            <TouchableOpacity
                style={Styles.checkBoxContainer}
                key={id}
                onPress={this.onRowSelect.bind(this)}
            >
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
                <Text allowFontScaling={false} style={Styles.checkBoxText}>
                    {formData.title}
                </Text>
            </TouchableOpacity>
        );
    }
}

export default class FormPopup extends React.Component {
    constructor(props) {
        super(props);
        this.formValuesArray = [];
        this.errorMessages = [];
    }

    onClose() {
        Keyboard.dismiss();
        if (this.props.onFormCancel && this.props.editable) {
            this.props.onFormCancel();
        }
        Actions.pop();
    }
    componentDidMount() {
        this.keyboardWillShowListener = Keyboard.addListener(
            'keyboardWillShow',
            this.keyboardWillShow.bind(this)
        );
        //this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this.keyboardDidShow.bind(this));
    }

    componentWillUnmount() {
        if (this.keyboardWillShowListener) {
            this.keyboardWillShowListener.remove();
        }
    }

    keyboardWillShow(keyboard) {}

    isValid() {
        var formData = this.props.formData;
        for (var i = 0; i < formData.length; i++) {
            this.errorMessages[i] = undefined;
            if (
                formData[i].optional === false &&
                _.trim(this.formValuesArray[i]) === ''
            ) {
                this.errorMessages[i] = I18n.t('Field_mandatory');
                return false;
            }

            if (
                formData[i].type === 'number_field' &&
                isNaN(+this.formValuesArray[i])
            ) {
                this.errorMessages[i] = I18n.t('Not_a_number');
                return false;
            }

            if (
                formData[i].type === 'password_field' &&
                _.trim(this.formValuesArray[i]) === ''
            ) {
                this.errorMessages[i] = I18n.t('Password_not_empty');
                return false;
            }

            if (
                formData[i].type === 'email_field' &&
                !isEmail(_.trim(this.formValuesArray[i]))
            ) {
                this.errorMessages[i] = I18n.t('Not_an_email');
                return false;
            }
        }
        return true;
    }

    CTAResponseOnPress() {
        if (!this.isValid() || !this.props.editable) {
            this.setState({ errorMessages: this.errorMessages });
            return;
        }
        var formData = this.props.formData;
        for (var i = 0; i < formData.length; i++) {
            var eachFormData = formData[i];
            eachFormData.value = _.trim(this.formValuesArray[i]);
            formData[i] = eachFormData;
        }
        if (this.props.onFormSubmit) {
            this.props.onFormSubmit(formData);
        }
        Actions.pop();
    }

    onChangeText(i, text) {
        this.formValuesArray[i] = text;
    }

    onPasswordMatch(index, password) {
        this.formValuesArray[index] = password;
    }

    onCheckBoxValueChange(i, value) {
        this.formValuesArray[i] = value;
    }

    renderForm() {
        var buttons = [];
        var formData = this.props.formData;

        for (var i = 0; i < formData.length; i++) {
            if (formData[i].type === 'title') {
                buttons.push(
                    <View style={Styles.formTitleContainer} key={i}>
                        <Text allowFontScaling={false} style={Styles.formTitle}>
                            {formData[i].title}
                        </Text>
                        <TouchableOpacity
                            style={Styles.formCloseButton}
                            onPress={this.onClose.bind(this)}
                        >
                            <Text
                                allowFontScaling={false}
                                style={Styles.formCloseButtonText}
                            >
                                {I18n.t('Close').toLocaleUpperCase()}
                            </Text>
                        </TouchableOpacity>
                    </View>
                );
            } else if (formData[i].type === 'text') {
                buttons.push(
                    <View
                        style={[
                            Styles.formTextContainer,
                            { borderBottomWidth: 0 }
                        ]}
                        key={i}
                    >
                        <Text allowFontScaling={false} style={Styles.formText}>
                            {formData[i].text}
                        </Text>
                    </View>
                );
            } else if (
                formData[i].type === 'text_field' ||
                formData[i].type === 'number_field' ||
                formData[i].type === 'password_field' ||
                formData[i].type === 'email_field'
            ) {
                this.formValuesArray[i] =
                    this.formValuesArray[i] || formData[i].value;
                let notEditable =
                    !this.props.editable || formData[i].editable === false;
                if (formData[i].retry === true && this.props.editable) {
                    buttons.push(
                        <RetryFormTextInput
                            editable={!notEditable}
                            formData={formData[i]}
                            key={i}
                            keyIndex={i}
                            onPasswordMatch={this.onPasswordMatch.bind(this, i)}
                        />
                    );
                } else {
                    this.formValuesArray[i] =
                        this.formValuesArray[i] || formData[i].value;
                    buttons.push(
                        <View style={Styles.formInputContainer} key={i}>
                            <View style={Styles.titleContainer}>
                                <Text
                                    allowFontScaling={false}
                                    style={Styles.formInputLabel}
                                >
                                    {formData[i].title
                                        ? formData[i].title.toLocaleUpperCase()
                                        : ''}
                                </Text>
                                <Text
                                    allowFontScaling={false}
                                    style={Styles.formErrorLabel}
                                >
                                    {this.errorMessages[i]
                                        ? this.errorMessages[i]
                                        : ''}
                                </Text>
                            </View>
                            <FormTextInput
                                editable={!notEditable}
                                formData={formData[i]}
                                onChangeText={this.onChangeText.bind(this, i)}
                                containerStyle={Styles.noBorder}
                                secureTextEntry={
                                    formData[i].type === 'password_field'
                                }
                                keyboardType={
                                    formData[i].type === 'email_field'
                                        ? 'email-address'
                                        : 'default'
                                }
                            />
                        </View>
                    );
                }
            } else if (formData[i].type === 'text_area') {
                this.formValuesArray[i] =
                    this.formValuesArray[i] || formData[i].value;
                let notEditable =
                    !this.props.editable || formData[i].editable === false;
                buttons.push(
                    <View style={Styles.formInputTextAreaContainer} key={i}>
                        <Text
                            allowFontScaling={false}
                            style={Styles.formInputLabel}
                        >
                            {formData[i].title
                                ? formData[i].title.toLocaleUpperCase()
                                : ''}
                        </Text>
                        <Text
                            allowFontScaling={false}
                            style={Styles.formErrorLabel}
                        >
                            {this.errorMessages[i] ? this.errorMessages[i] : ''}
                        </Text>
                        <FormTextInput
                            numberOfLines={3}
                            multiline={true}
                            editable={!notEditable}
                            formData={formData[i]}
                            onChangeText={this.onChangeText.bind(this, i)}
                            containerStyle={Styles.noBorder}
                            style={{ height: 70 }}
                        />
                    </View>
                );
            } else if (formData[i].type === 'button') {
                const buttonStyle = this.props.editable
                    ? Styles.formButton
                    : [Styles.formButton, Styles.formButtonDisabled];
                const disableButton = this.props.editable ? false : true;
                buttons.push(
                    <View style={Styles.formButtonContainer} key={i}>
                        <TouchableOpacity
                            disabled={disableButton}
                            underlayColor="white"
                            onPress={this.CTAResponseOnPress.bind(this)}
                            style={buttonStyle}
                        >
                            <Text
                                allowFontScaling={false}
                                style={Styles.formButtonText}
                            >
                                {formData[i].title}
                            </Text>
                        </TouchableOpacity>
                    </View>
                );
            } else if (formData[i].type === 'checkbox') {
                const data = formData[i];
                if (this.formValuesArray[i] === undefined) {
                    const value =
                        formData[i].value === true ||
                        formData[i].value === 'true'
                            ? true
                            : false;
                    this.formValuesArray[i] = value;
                }
                buttons.push(
                    <FormCheckBox
                        value={this.formValuesArray[i]}
                        formData={data}
                        key={i}
                        id={i}
                        onValueChange={this.onCheckBoxValueChange.bind(this, i)}
                    />
                );
            }
        }
        return buttons;
    }

    render() {
        return (
            <View style={Styles.containerStyle}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'position' : null}
                    style={Styles.formContainer}
                >
                    <ScrollView
                        style={Styles.formScrollView}
                        keyboardShouldPersistTaps="handled"
                    >
                        {this.renderForm()}
                    </ScrollView>
                </KeyboardAvoidingView>
            </View>
        );
    }
}
