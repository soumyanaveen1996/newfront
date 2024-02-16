import React, { useState } from 'react';
import {
    Dimensions,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import GlobalColors from '../../../config/styles';
import AppFonts from '../../../config/fontConfig';

const { height, width } = Dimensions.get('window');

const ConfirmOtp = ({ onDone, onSkip, errorMessage = '' }) => {
    console.log('2FA errorMessage', errorMessage);
    const [otp, setOtp] = useState('');
    const [error, setError] = useState(false);
    const onSubmit = () => {
        if (!otp) {
            setError('Please enter OTP');
            return;
        }
        if (otp.length < 6) {
            setError('Please enter 6 digit OTP');
            return;
        }
        setError(false);
        onDone(otp);
    };

    return (
        <SafeAreaView
            style={styles.mainContainer}
            keyboardShouldPersistTaps="handled"
        >
            <StatusBar backgroundColor="white" barStyle={'dark-content'} />
            <Text style={styles.confirmCode}>Confirmation code</Text>
            <Text style={styles.codeDesc}>
                Add extra security with{'\n'}
                two-factor authentification
            </Text>
            <TextInput
                style={{ ...styles.otpInput }}
                value={otp}
                placeholder={'------'}
                keyboardType={'numeric'}
                onChangeText={(text) => setOtp(text)}
                maxLength={6}
                returnKeyType="done"
            />

            {error && (
                <View style={styles.wrongOtpContainer}>
                    <Text style={styles.wrongOtpMsg}>{error}</Text>
                </View>
            )}
            {errorMessage?.length > 0 && (
                <View style={styles.wrongOtpContainer}>
                    <Text style={styles.wrongOtpMsg}>{errorMessage}</Text>
                </View>
            )}
            <View style={styles.btnContainer}>
                <TouchableOpacity
                    style={styles.buttonContainer}
                    onPress={onSubmit}
                >
                    <Text style={styles.buttonText}>Done</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onSkip} style={styles.backToLogin}>
                    <Text style={styles.backToText}>Back To Login</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default ConfirmOtp;

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: GlobalColors.white,
        paddingHorizontal: 20,
        justifyContent: 'center'
    },
    confirmCode: {
        fontSize: 30,
        fontWeight: AppFonts.LIGHT,
        fontStyle: 'normal',
        letterSpacing: -0.77,
        textAlign: 'center',
        color: '#4a4a4a'
    },
    codeDesc: {
        fontSize: 16,
        fontWeight: AppFonts.LIGHT,
        fontStyle: 'normal',
        lineHeight: 20,
        letterSpacing: -0.41,
        textAlign: 'center',
        color: '#666666',
        paddingVertical: 20
    },
    otpInput: {
        height: 55,
        width: 150,
        backgroundColor: '#f6f8fc',
        borderWidth: 0.5,
        borderColor: '#f6f8fc',
        borderRadius: 7,
        alignSelf: 'center',
        textAlign: 'center',
        marginTop: 20,
        fontSize: 24,
        letterSpacing: 5
    },
    buttonContainer: {
        height: 40,
        width: width - 120,
        backgroundColor: GlobalColors.primaryButtonColor,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 25,
        alignSelf: 'center'
    },
    buttonText: {
        color: '#fff',
        textAlign: 'center',
        fontSize: 16,
        fontWeight: AppFonts.NORMAL
    },
    btnContainer: {
        paddingVertical: 90
    },
    backToLogin: {
        display: 'flex',
        alignSelf: 'center'
    },
    backToText: {
        color: GlobalColors.primaryButtonColor
    },
    wrongOtpMsg: {
        fontSize: 13,
        color: GlobalColors.formDelete,
        textAlign: 'center'
    },
    wrongOtpContainer: { marginTop: 15 }
});
