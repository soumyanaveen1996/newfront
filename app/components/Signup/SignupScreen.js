import React from 'react';
import { View, Text, Image,FlatList, TextInput, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
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

export default class SignupScreen extends React.Component { 
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            passwordCriteria: [
                ' Must contain at least 1 lowercase alphabet',
                ' Must contain at least 1 uppercase alphabet',
                ' Must contain at least 1 numeric character',
                ' Must be 8 characters or longer'
            ],
            name: '',
            email: '',
            password: '',
            confirmPassword: ''
        }

    }

    validateEmail(email) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    passwordValidation = (string) => {
        var counter = 0;
        if (string.length >= 8) {
            if (/[a-z]/.test(string)) {
                counter++;
            }
            if (/[A-Z]/.test(string)) {
                counter++;
            }
            if (/[0-9]/.test(string)) {
                counter++;
            }
            if (/[!@#$&*_]/.test(string)) {
                counter++;
            }
        }
        return counter === 4;
    }

    passwordConfirm = () => {
        if (this.state.password !== this.state.confirmPassword) {
            return false;
        } else {
            return true
        };
    }

    goBackToLogin = () => {
        Actions.loginScreen({ type: ActionConst.REPLACE });
    }

    onSignup = () => {
        let emailResult = this.validateEmail(this.state.email);
        let passworResult = this.passwordValidation(this.state.password);
        let passwordConfirmResult = this.passwordConfirm();
        if (emailResult && passworResult && passwordConfirmResult) {
            console.log('call signup api');
        }
    }

    onChangeEmail(text){
        this.setState({email : text});
    }

    onChangePassword(text){
        this.setState({password : text});
    }
    onChangeConfirmPassword(text){
        this.setState({confirmPassword : text});
    }

    render(){
        return (
            <View style={styles.container}>
                <Loader loading={this.state.loading} />
                <KeyboardAvoidingView style={styles.keyboardConatiner}>
                    <Text>Signup Screen</Text>

                    <View style={styles.formContainer} behavior={(Platform.OS === 'ios') ? 'position' : null}>
                        <TextInput style={styles.input}
                            autoCorrect={false}
                            returnKeyType="next"
                            placeholder="Name"
                            placeholderTextColor="rgba(0,0,0,0.6)" />
                        <TextInput style={styles.input}
                            autoCapitalize="none"
                            autoCorrect={false}
                            keyboardType="email-address"
                            returnKeyType="next"
                            placeholder="Email"
                            onChangeText={this.onChangeEmail.bind(this)}
                            placeholderTextColor="rgba(0,0,0,0.6)" />

                        <TextInput style={styles.input}
                            returnKeyType="go"
                            placeholder="Password"
                            placeholderTextColor="rgba(0,0,0,0.6)"
                            onChangeText={this.onChangePassword.bind(this)}
                            secureTextEntry />
                        <TextInput style={styles.input}
                            returnKeyType="go"
                            placeholder="Confirm Password"
                            placeholderTextColor="rgba(0,0,0,0.6)"
                            onChangeText={this.onChangeConfirmPassword.bind(this)}
                            secureTextEntry />
                        <Text style={{ color: 'red' }}>
                            {this.state.errorMessage}
                        </Text>
                        <View style={{height : 100, backgroundColor: 'rgba(46, 193, 182, 0.2)', borderRadius: 10, marginBottom: 10, padding: 5}}>
                            <Text>Password Criteria:</Text>
                            <FlatList data={this.state.passwordCriteria}  renderItem={({item}) => <Text>{item}</Text>} />
                        </View>
                        <TouchableOpacity style={styles.buttonContainer} onPress={this.onSignup}>
                            <Text style={styles.buttonText}>SIGNUP</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity onPress={this.goBackToLogin}>
                        <Text>Go back to Login Page</Text>
                    </TouchableOpacity>
                </KeyboardAvoidingView>
            </View>
        );
    }
}