import React, { useState } from 'react';
import {
    Dimensions,
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    SafeAreaView
} from 'react-native';

import GlobalColors from '../../../config/styles';
import { Divider } from 'react-native-paper';
import { Icon } from '@rneui/themed';
import { Auth } from '../../../lib/capability';
import Loader from '../../../widgets/Loader';
import NavigationAction from '../../../navigation/NavigationAction';
import { Toast } from 'react-native-toast-message/lib/src/Toast';
import AppFonts from '../../../config/fontConfig';

const { height, width } = Dimensions.get('window');

const ChangePassword = (props) => {
    //STATES
    const [uppercase, setUppercaseFlag] = useState(false);
    const [lowercase, setLowercaseflag] = useState(false);
    const [specialCharacter, setSpecialFlag] = useState(false);
    const [number, setNumberFlag] = useState(false);
    const [currentPass, setCurrentPassword] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [saveDisable, setSaveDisable] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const [isLoading, setLoading] = useState(false);
    //CONSTANTS
    const passwordCons = [
        { title: 'One uppercase letter', checked: uppercase },
        { title: 'One lowercase letter', checked: lowercase },
        { title: 'One special letter', checked: specialCharacter },
        { title: 'One number', checked: number },
        { title: '8 characters minimum', checked: password.length >= 8 }
    ];

    const onChangePassword = (text) => {
        setSaveDisable(false);
        setErrorMessage(null);
        setPassword(text);

        if (/[A-Z]/.test(text)) {
            console.log('upper case');
            setUppercaseFlag(true);
        }

        if (/[a-z]/.test(text)) {
            console.log('lowercase');
            setLowercaseflag(true);
        }

        if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(text)) {
            console.log('speacial character');
            setSpecialFlag(true);
        }

        if (/\d/.test(text)) {
            console.log('number available');
            setNumberFlag(true);
        }
    };

    const onSave = () => {
        // showAlertAndExit();
        // return;
        if (!currentPass || !password || !confirmPassword) {
            setErrorMessage('Please fill all fields');
            return;
        }
        if (/\s/.test(password)) {
            setSaveDisable(true);
            setErrorMessage('Password should not contain white space.');
            return;
        }

        if (password !== confirmPassword) {
            setSaveDisable(true);
            setErrorMessage('Both password must be same.');
            return;
        }
        setLoading(true);
        const user = Auth.getUserData();
        Auth.updatePassword({
            oldPassword: currentPass,
            newPassword: password,
            email: user?.info?.emailAddress
        })
            .then(() => {
                setLoading(false);
                Toast.show({
                    text1: 'Password changed successfully.',
                    type: 'success'
                });
                NavigationAction.pop();
            })
            .catch((err) => {
                console.log('update password error in screen: ', err);
                setErrorMessage(err.message);
                setLoading(false);
            });
    };

    const renderItem = ({ item, index }) => {
        return (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View
                    style={{
                        ...styles.outerCircle,
                        backgroundColor: item.checked
                            ? GlobalColors.primaryColor
                            : GlobalColors.deviderGrey
                    }}
                >
                    {item.checked ? (
                        <Icon name={'done'} size={11} color={'white'} />
                    ) : null}
                </View>
                <Text style={styles.title}>{item.title}</Text>
            </View>
        );
    };

    return (
        <SafeAreaView
            style={styles.mainContainer}
            keyboardShouldPersistTaps="handled"
        >
            <Loader loading={isLoading} />
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollViewContainer}
            >
                <TextInput
                    placeholder={'Current password'}
                    placeholderTextColor={GlobalColors.formPlaceholderText}
                    style={styles.textInput}
                    selectionColor={GlobalColors.cursorColor}
                    secureTextEntry
                    onChangeText={(text) => {
                        setCurrentPassword(text);
                        setSaveDisable(false);
                    }}
                />

                <TextInput
                    placeholder={'New password'}
                    secureTextEntry
                    style={styles.textInput}
                    placeholderTextColor={GlobalColors.formPlaceholderText}
                    onChangeText={(text) => onChangePassword(text)}
                    selectionColor={GlobalColors.cursorColor}
                />

                <TextInput
                    placeholder={'Confirm new password'}
                    placeholderTextColor={GlobalColors.formPlaceholderText}
                    secureTextEntry
                    style={styles.textInput}
                    selectionColor={GlobalColors.cursorColor}
                    onChangeText={(text) => {
                        setConfirmPassword(text);
                        setErrorMessage(null);
                        setSaveDisable(false);
                    }}
                />
                {errorMessage && (
                    <Text style={{ color: GlobalColors.red, marginBottom: 12 }}>
                        {errorMessage}
                    </Text>
                )}
                {/* <TouchableOpacity onPress={() => {}} style={{ marginTop: 5 }}>
                    <Text
                        style={{
                            fontSize: 15,
                            color: GlobalColors.primaryColor
                        }}
                    >
                        Forgot password?
                    </Text>
                </TouchableOpacity> */}

                <Divider style={styles.divider} />
                <Text style={styles.text}>Password must contain</Text>

                <FlatList
                    data={passwordCons}
                    renderItem={renderItem}
                    ItemSeparatorComponent={() => (
                        <View style={{ height: 7 }} />
                    )}
                    contentContainerStyle={{ marginTop: 20 }}
                />
            </ScrollView>

            <View
                style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    paddingHorizontal: 30
                }}
            >
                <View>
                    <TouchableOpacity
                        style={{
                            ...styles.buttonContainer,
                            backgroundColor: GlobalColors.secondaryButtonColor
                        }}
                        onPress={() => NavigationAction.pop()}
                    >
                        <Text
                            style={{
                                ...styles.buttonText,
                                color: GlobalColors.secondaryButtonText
                            }}
                        >
                            {'Cancel'}
                        </Text>
                    </TouchableOpacity>
                </View>

                <View>
                    <TouchableOpacity
                        style={{
                            ...styles.buttonContainer,
                            backgroundColor: saveDisable
                                ? GlobalColors.primaryButtonColorDisabled
                                : GlobalColors.primaryButtonColor
                        }}
                        onPress={() => onSave()}
                        disabled={saveDisable}
                    >
                        <Text style={styles.buttonText}>{'Save'}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

export default ChangePassword;

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: GlobalColors.appBackground
    },
    scrollViewContainer: {
        paddingHorizontal: 20,
        paddingVertical: 20
    },
    textInput: {
        height: 45,
        borderWidth: 1,
        borderRadius: 6,
        borderColor: GlobalColors.itemDevider,
        color: GlobalColors.primaryTextColor,
        paddingHorizontal: 10,
        marginBottom: 15
    },
    divider: {
        backgroundColor: GlobalColors.itemDevider,
        height: 1,
        marginBottom: 20,
        marginTop: 24
    },
    text: {
        fontSize: 15,
        color: GlobalColors.primaryTextColor
    },
    title: {
        fontSize: 15,
        color: GlobalColors.descriptionText
    },
    outerCircle: {
        backgroundColor: GlobalColors.deviderGrey,
        height: 15,
        width: 15,
        borderRadius: 20,
        marginTop: 2,
        marginRight: 10,
        justifyContent: 'center',
        alignItems: 'center'
    },
    buttonContainer: {
        height: 40,
        width: width / 2 - 40,
        backgroundColor: GlobalColors.primaryButtonColor,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 25,
        alignSelf: 'center'
    },
    buttonText: {
        color: GlobalColors.primaryButtonText,
        textAlign: 'center',
        fontSize: 16,
        fontWeight: AppFonts.NORMAL
    }
});
