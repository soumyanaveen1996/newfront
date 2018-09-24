import React from 'react';
import { View, Text, Image, TextInput, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import styles from './styles';
import { Actions, ActionConst } from 'react-native-router-flux';
import I18n from '../../config/i18n/i18n';
import _ from 'lodash';
import { isEmail } from '../../lib/utils';
import images from '../../images';
import { Auth } from '../../lib/capability';
import Loader from '../Loader/Loader';
import { Button } from 'react-native-elements';
import { SYSTEM_BOT_MANIFEST } from '../../lib/bot/SystemBot';

const Icon = images.splash_page_logo;

export default class LoginScreen extends React.Component { 
    constructor(props) {
        super(props);
        this.state = {
            formData :[
                { id: 2, title: 'Email', type: 'email_field', optional: false },
                { id: 3, title: 'Password', type: 'password_field', optional: false },
                { id: 4, title: 'Login', type: 'button', action: 'signIn' }
            ],
            errorMessage: '',
            loading: false
        };

        this.formValuesArray = [];
        this.errorMessages = [];
    }

    async onFormSubmit() {
        this.setState({ loading : true});
        if (!this.isValid()) {
            this.setState({ errorMessage: this.errorMessages });
            this.setState({ loading: false });
            return;
        }

        let formInfo = this.state.formData;
        for (let i = 0; i < formInfo.length; i++) {
            let eachFormData = formInfo[i];
            eachFormData.value = _.trim(this.formValuesArray[i]);
            formInfo[i] = eachFormData;
        }

        const userDetails = {
            'email': formInfo[0].value,
            'password': formInfo[1].value
        };
        await Auth.loginWithFrontm(userDetails).then(() => {
            this.showMainScreen();
        }).catch(err => {
            this.setState({errorMessage: err.message});
        });     
    }

    showMainScreen = () => {
        Actions.timeline({ type: ActionConst.REPLACE });
        this.setState({ loading: false });
        return;
    }

    isValid() {
        let formData = this.state.formData
        for (var i = 0; i < formData.length; i++) {
            this.errorMessages[i] = undefined;
            if (formData[i].optional === false && _.trim(this.formValuesArray[i]) === '') {
                this.errorMessages[i] = I18n.t('Field_mandatory');
                return false;
            }

            if (formData[i].type === 'password_field' && _.trim(this.formValuesArray[i]) === '') {
                this.errorMessages[i] = I18n.t('Password_not_empty');
                return false;
            }

            if (formData[i].type === 'email_field' && !isEmail(_.trim(this.formValuesArray[i]))) {
                this.errorMessages[i] = I18n.t('Not_an_email');
                return false;
            }
        }
        return true;
    }


    onChangeEmailText(i, text) {
        this.formValuesArray[i] = text;
    }

    onChangePasswordText(i, text) {
        this.formValuesArray[i] = text;
    }

    loginWithGoogle = async () => {
        const conversationId = '';
        const botName = SYSTEM_BOT_MANIFEST['onboarding-bot'].botId;
        await Auth.loginWithGoogle(conversationId, botName).then(() => {
            console.log('logged in using google');
            this.setState({ loading: true });
            this.showMainScreen();
        }).catch(err => {
            this.setState({ errorMessage: err.message });
        });
    }


    loginWithFacebook = async () => {
        const conversationId = '';
        const botName = SYSTEM_BOT_MANIFEST['onboarding-bot'].botId;
        await Auth.loginWithFacebook(conversationId, botName).then(() => {
            console.log('logged in using facebook');
            this.setState({ loading: true });
            this.showMainScreen();
        }).catch(err => {
            this.setState({ errorMessage: err.message });
        });
    }

    goToSignupPage = () => {
        console.log('go to sign up page');
        Actions.signupScreen({ type: ActionConst.REPLACE });
        
    }

    render(){
        return (
            <View style={styles.container}>
                <Loader loading={this.state.loading} />
                <KeyboardAvoidingView style={styles.keyboardConatiner}>
                    <Image style={styles.imageStyle} source={Icon} resizeMode={'contain'} />
                    <Text style={styles.loginHeader}> Login </Text>
                    
                    <View style={styles.formContainer} behavior={(Platform.OS === 'ios') ? 'position' : null}>
                        <TextInput style={styles.input}
                            autoCapitalize="none"
                            autoCorrect={false}
                            onChangeText={this.onChangeEmailText.bind(this, 0)}
                            keyboardType="email-address"
                            returnKeyType="next"
                            placeholder="Email"
                            placeholderTextColor="rgba(0,0,0,0.6)" />

                        <TextInput style={styles.input}
                            returnKeyType="go"
                            onChangeText={this.onChangePasswordText.bind(this, 1)}
                            placeholder="Password"
                            placeholderTextColor="rgba(0,0,0,0.6)"
                            secureTextEntry />
                        <Text style={{ color: 'red' }}>
                            {this.state.errorMessage}
                        </Text>
                        <TouchableOpacity style={styles.buttonContainer}
                            onPress={this.onFormSubmit.bind(this)}>
                            <Text style={styles.buttonText}>LOGIN</Text>
                        </TouchableOpacity>
                    </View>
                    <Text style={{ alignItems: 'center', fontSize: 22, fontWeight: '600', marginBottom: 20 }}> Or Login using</Text>
                    <View style={{
                        flexDirection: 'row',
                        marginBottom: 50}}>
                        <Button
                            onPress={this.loginWithGoogle}
                            title="Login With Google"
                            backgroundColor="#db3236"
                        />
                        <Button
                            onPress={this.loginWithFacebook}
                            title="Login With Facebook"
                            backgroundColor="#3B5998"
                        />
                    </View>
                    <TouchableOpacity onPress={this.goToSignupPage} style={{alignItems:'center'}}>
                        <Text>Sign up </Text>
                    </TouchableOpacity>
                </KeyboardAvoidingView>
            </View>
        );
    }

}

