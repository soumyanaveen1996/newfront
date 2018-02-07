import React from 'react';
import { View,
    Text,
    TouchableOpacity,
    TextInput,
    ScrollView,
    KeyboardAvoidingView,
    Keyboard } from 'react-native';
import Styles from './styles';
import { Actions } from 'react-native-router-flux';
import I18n from '../../config/i18n/i18n';
import { GlobalColors } from '../../config/styles';
import _ from 'lodash';


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
        const { formData } = this.props;
        return <TextInput
            onChangeText={this.onChangeText.bind(this)}
            style={[Styles.formTextField, {borderColor : this.state.borderColor}] }
            placeholder={formData.title}
            defaultValue={this.value}
            containerStyle={Styles.noBorder}
        />;
    }
}

export default class FormPopup extends React.Component {

    constructor(props) {
        super(props);
        this.formTextArr = []
    }

    onClose() {
        console.log('close');
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
            if (formData[i].optional === false && _.trim(this.formTextArr[i]) === '') {
                return false;
            }
        }
        return true;
    }


    CTAResponseOnPress() {
        if (!this.isValid()) {
            return;
        }
        var formData = this.props.formData
        for (var i = 0; i < formData.length; i++) {
            var eachFormData = formData[i]
            eachFormData.value = this.formTextArr[i]
            formData[i] = eachFormData
        }
        if (this.props.onFormSubmit) {
            this.props.onFormSubmit(formData)
        }
        Actions.pop();
    }

    onChangeText(i, text) {
        this.formTextArr[i] = text
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
            } else if (formData[i].type === 'text_field') {
                this.formTextArr[i] = formData[i].value;
                buttons.push(
                    <View style={Styles.formElementsContainer} key={i}>
                        <FormTextInput
                            formData={formData[i]}
                            onChangeText={this.onChangeText.bind(this, i)}
                            containerStyle={Styles.noBorder}
                        />
                    </View>
                )
            } else if (formData[i].type === 'button') {
                buttons.push(
                    <View style={Styles.formButtonContainer} key={i}>
                        <TouchableOpacity
                            underlayColor="white"
                            onPress={this.CTAResponseOnPress.bind(this)}
                            style={Styles.formButton}>
                            <Text style={Styles.formButtonText}>
                                {formData[i].title}
                            </Text>
                        </TouchableOpacity>
                    </View>
                )
            }
        }
        return buttons;
    }

    render(){
        return (
            <View style={Styles.containerStyle}>
                <KeyboardAvoidingView behavior="position" style={Styles.formContainer}>
                    <ScrollView style={Styles.formScrollView} keyboardShouldPersistTaps="handled">
                        {this.renderForm()}
                    </ScrollView>
                </KeyboardAvoidingView>
            </View>
        );
    }
}
