import { Image, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Modal from 'react-native-modal';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import styles from './styles';
import Icons from '../../config/icons';
import { Auth } from '../../lib/capability';
import { ActivityIndicator } from 'react-native-paper';
import NavigationAction from '../../navigation/NavigationAction';
import images from '../../images';

const AuthenticationModal = ({ isModalVisible, setBotAccessible, botId }) => {
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);
    const [socialName, setSocialName] = useState('');
    const softwareMfaEnabled = useSelector(
        (state) => state.session?.user?.info?.softwareMfaEnabled
    );
    const [isLoading, setIsLoading] = useState(false);
    useEffect(() => {
        setOtp('');
        setPassword('');
        setError('');
        getName();
    }, [isModalVisible]);

    const getName = () => {
        const {
            provider: { name }
        } = Auth.getUserData();
        setSocialName(name);
    };

    const confirmOtp = () => {
        if (!password) {
            setError('Please enter Password');
            return;
        }
        if (!otp) {
            setError('Please enter OTP');
            return;
        }
        if (otp.length < 6) {
            setError('Please enter 6 digit OTP');
            return;
        }
        setIsLoading(true);
        Auth.resetUserActivity(botId, password, otp)
            .then((res) => {
                setIsLoading(false);
                if (res.success) {
                    setBotAccessible(true);
                } else {
                    if (res.errorCode === 'CodeMismatchException') {
                        setError('Please enter valid password and valid OTP');
                    } else if (res.errorCode === 'NotAuthorizedException') {
                        setError('Please entered valid password');
                    } else {
                        setError(res.message);
                    }
                }
            })
            .catch((err) => {
                setIsLoading(false);
                setError(err.message || 'Somethig went wrong.');
            });
    };

    if (softwareMfaEnabled) {
        return (
            <Modal isVisible={isModalVisible}>
                <View style={styles.groupConfirm}>
                    <TouchableOpacity
                        style={styles.closeModalContainer}
                        onPress={() => setBotAccessible(false)}
                    >
                        {Icons.close({
                            color: '#9c9ea7',
                            size: 35
                        })}
                    </TouchableOpacity>
                    <View style={styles.groupModalInnerContainer}>
                        <Image
                            source={images.securityShield}
                            style={styles.imageStyle}
                        />
                        <Text style={styles.title}>
                            Authenticate your account to access
                        </Text>
                        <Text style={styles.subTitle}>
                            Please confirm your FrontM password {'\n'} And Enter
                            OTP{' '}
                        </Text>
                        <View>
                            <TextInput
                                placeholder={'Password'}
                                style={styles.textInput}
                                secureTextEntry
                                value={password}
                                onChangeText={(text) => {
                                    // setError(false);
                                    setPassword(text);
                                }}
                            />
                            <TextInput
                                style={{
                                    ...styles.otpInput
                                    // borderColor: wrongOtp ? GlobalColors.formDelete : "#f6f8fc"
                                }}
                                value={otp}
                                placeholder={'------'}
                                keyboardType={'numeric'}
                                onChangeText={(text) => {
                                    setOtp(text);
                                    // setWrongOtp(false);
                                }}
                                returnKeyType="done"
                                maxLength={6}
                            />
                        </View>
                        {Boolean(error) && (
                            <View style={styles.wrongOtpContainer}>
                                <Text style={styles.wrongOtpMsg}>{error}</Text>
                            </View>
                        )}
                        <View style={styles.confirmBtnContainer}>
                            <TouchableOpacity
                                style={styles.cancelModalBtn}
                                onPress={() => setBotAccessible(false)}
                            >
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                title="Yes"
                                style={styles.confirmBtn}
                                onPress={confirmOtp}
                            >
                                {isLoading ? (
                                    <ActivityIndicator />
                                ) : (
                                    <Text style={styles.confirmText}>
                                        Continue
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        );
    } else if (softwareMfaEnabled && socialName === 'FrontM') {
        <Modal isVisible={isModalVisible}>
            <View style={styles.groupConfirm}>
                <TouchableOpacity
                    style={styles.closeModalContainer}
                    onPress={() => setBotAccessible(false)}
                >
                    {Icons.close({
                        color: '#9c9ea7',
                        size: 35
                    })}
                </TouchableOpacity>
                <View style={styles.groupModalInnerContainer}>
                    <Image
                        source={images.securityShield}
                        style={styles.imageStyle}
                    />
                    <Text style={styles.title}>
                        Authenticate your account to access
                    </Text>
                    <Text style={styles.subTitle}>
                        Please confirm your FrontM password {'\n'} And Enter OTP{' '}
                    </Text>
                    <View>
                        <TextInput
                            placeholder={'Password'}
                            style={styles.textInput}
                            secureTextEntry
                            value={password}
                            onChangeText={(text) => {
                                // setError(false);
                                setPassword(text);
                            }}
                        />
                        <TextInput
                            style={{
                                ...styles.otpInput
                                // borderColor: wrongOtp ? GlobalColors.formDelete : "#f6f8fc"
                            }}
                            value={otp}
                            placeholder={'------'}
                            keyboardType={'numeric'}
                            onChangeText={(text) => {
                                setOtp(text);
                                // setWrongOtp(false);
                            }}
                            returnKeyType="done"
                            maxLength={6}
                        />
                    </View>
                    {Boolean(error) && (
                        <View style={styles.wrongOtpContainer}>
                            <Text style={styles.wrongOtpMsg}>{error}</Text>
                        </View>
                    )}
                    <View style={styles.confirmBtnContainer}>
                        <TouchableOpacity
                            style={styles.cancelModalBtn}
                            onPress={() => setBotAccessible(false)}
                        >
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            title="Yes"
                            style={styles.confirmBtn}
                            onPress={confirmOtp}
                        >
                            {isLoading ? (
                                <ActivityIndicator />
                            ) : (
                                <Text style={styles.confirmText}>Continue</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>;
    } else
        return (
            <Modal isVisible={isModalVisible}>
                {socialName === 'google' || socialName === 'Apple' ? (
                    <View style={styles.groupConfirm}>
                        <TouchableOpacity
                            style={styles.closeModalContainer}
                            onPress={() => setBotAccessible(false)}
                        >
                            {Icons.close({
                                color: '#9c9ea7',
                                size: 35
                            })}
                        </TouchableOpacity>
                        <View style={styles.groupModalInnerContainer}>
                            <Text style={styles.title}>
                                Only users with two factor authentication set
                                can access this application
                            </Text>
                            <Text style={styles.subTitle}>
                                {socialName.toUpperCase()} based users cannot
                                activate two factor authentication.
                            </Text>
                            <View style={styles.confirmBtnContainer}>
                                <TouchableOpacity
                                    title="Yes"
                                    style={[
                                        styles.confirmBtn,
                                        { marginTop: 14 }
                                    ]}
                                    onPress={() => setBotAccessible(false)}
                                >
                                    <Text style={styles.confirmText}>OK</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                ) : (
                    <View style={styles.groupConfirm}>
                        <TouchableOpacity
                            style={styles.closeModalContainer}
                            onPress={() => setBotAccessible(false)}
                        >
                            {Icons.close({
                                color: '#9c9ea7',
                                size: 35
                            })}
                        </TouchableOpacity>
                        <View style={styles.groupModalInnerContainer}>
                            <Text style={styles.title}>
                                Only users with two factor authentication set
                                can access this application
                            </Text>
                            <Text style={styles.subTitle}>
                                Please activate the two-factor authentication
                                from settings to open this app
                            </Text>
                            <View style={styles.confirmBtnContainer}>
                                <TouchableOpacity
                                    title="Yes"
                                    style={[
                                        styles.confirmBtn,
                                        { marginTop: 14 }
                                    ]}
                                    onPress={() => {
                                        setBotAccessible(false);
                                        NavigationAction.push(
                                            NavigationAction.SCREENS
                                                .twoFactorAuth
                                        );
                                    }}
                                >
                                    <Text style={styles.confirmText}>
                                        Go to Settings
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                )}
            </Modal>
        );
};

export default AuthenticationModal;
