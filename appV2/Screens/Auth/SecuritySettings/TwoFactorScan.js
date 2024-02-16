import React, { useState } from 'react';
import {
    Dimensions,
    Image,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { Icon } from '@rneui/themed';

import GlobalColors from '../../../config/styles';
import { HeaderBack, HeaderTitle } from '../Header';
import QRCode from 'react-native-qrcode-svg';
import Clipboard from '@react-native-clipboard/clipboard';
import { Auth } from '../../../lib/capability';
import Loader from '../../../widgets/Loader';
import config from '../../../config/config';
import NavigationAction from '../../../navigation/NavigationAction';
import images from '../../../images';
import AppFonts from '../../../config/fontConfig';

const { width } = Dimensions.get('window');

const TwoFactorScan = ({ password, qrCodeUri }) => {
    //States
    const [qrVisible, setQrVisible] = useState(false);
    const [qrScanned, setQrScanned] = useState(false);
    const [otp, setOtp] = useState('');
    const [wrongOtp, setWrongOtp] = useState(false);
    const [qrcode, setQrCode] = useState(true);
    const [isLoading, setLoading] = useState(false);
    const {
        app: { appType }
    } = config;

    //Methods
    const copyToClipboard = () => {
        Clipboard.setString(qrcode);
    };

    const renderView = () => {
        if (qrVisible) {
            return (
                <View style={{ alignItems: 'center' }}>
                    <Text style={styles.title}>Scan the QR to proceed</Text>
                    <View style={styles.qrContainer}>
                        <QRCode value={qrCodeUri} />
                    </View>

                    <View style={styles.codeContainer}>
                        <View style={styles.codeView}>
                            <Text numberOfLines={1} style={styles.qrCodeText}>
                                {qrcode}
                            </Text>
                        </View>

                        <TouchableOpacity
                            style={styles.codeBtnView}
                            onPress={copyToClipboard}
                        >
                            <Text style={styles.copyCodeText}>Copy code</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            );
        } else if (qrScanned) {
            return (
                <View>
                    <Text style={styles.title}>
                        Enter the validation number
                    </Text>

                    <TextInput
                        style={{
                            ...styles.otpInput,
                            borderColor: wrongOtp
                                ? GlobalColors.formDelete
                                : '#f6f8fc'
                        }}
                        value={otp}
                        placeholder={'------'}
                        keyboardType={'numeric'}
                        returnKeyType="done"
                        onChangeText={(text) => {
                            setOtp(text);
                            setWrongOtp(false);
                        }}
                        maxLength={6}
                    />

                    {wrongOtp ? (
                        <View style={styles.wrongOtpContainer}>
                            <Text style={styles.wrongOtpMsg}>{wrongOtp}</Text>

                            <TouchableOpacity
                                style={styles.backScan}
                                onPress={() => onGoBackScan()}
                            >
                                <Icon
                                    name={'west'}
                                    color={GlobalColors.primaryColor}
                                    size={17}
                                    style={styles.goBackIcon}
                                />
                                <Text style={styles.goBackText}>
                                    Go back to scan the code
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ) : null}
                </View>
            );
        } else {
            return (
                <View>
                    <Text style={styles.title}>
                        Add extra security with{'\n'} two-factor authentication
                    </Text>

                    <Text style={styles.subTitle}>
                        To receive a login code, download and set up{'\n'}{' '}
                        <Text style={{ color: GlobalColors.menuSubLable }}>
                            Google Authentication app.
                        </Text>
                    </Text>
                </View>
            );
        }
    };

    const confirmOtp = () => {
        if (!otp) {
            setWrongOtp('Please enter OTP');
            return;
        }
        if (otp.length < 6) {
            setWrongOtp('Please enter 6 digit OTP');
            return;
        }
        setLoading(true);
        const req = { appType: appType, password: password, otpToken: otp };
        Auth.validateCode(req)
            .then((res) => {
                if (res.success) {
                    NavigationAction.replace(
                        NavigationAction.SCREENS.twoFactorAuth,
                        { scanned: true }
                    );
                } else {
                    setWrongOtp(
                        'This code is not longer available.\n Scan again and enter it in the next 30 seconds'
                    );
                }
                setLoading(false);
            })
            .catch((err) => {
                console.log(err);
                setLoading(false);
            });
    };

    const onButtonPress = () => {
        if (qrVisible) {
            onScan();
        } else if (qrScanned) {
            confirmOtp();
        } else {
            onContinue();
        }
    };

    const onContinue = () => {
        const qrCode = qrCodeUri && qrCodeUri.split('&')[1].split('=');
        if (qrCode) {
            setQrCode(qrCode[1]);
            setQrVisible(true);
        }
    };

    const onScan = () => {
        setQrVisible(false);
        setQrScanned(true);
    };

    const onGoBackScan = () => {
        setQrScanned(false);
        setQrVisible(true);
        setWrongOtp(false);
    };

    return (
        <SafeAreaView
            style={styles.mainContainer}
            keyboardShouldPersistTaps="handled"
        >
            <Loader loading={isLoading} />
            <View style={styles.topView}>
                <Image
                    source={images.securityShield}
                    style={styles.imageStyle}
                />

                {renderView()}
            </View>

            <View>
                <TouchableOpacity
                    style={styles.buttonContainer}
                    onPress={() => onButtonPress()}
                >
                    <Text style={styles.buttonText}>
                        {qrVisible || qrScanned ? 'Done' : 'Ok, continue'}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: GlobalColors.white,
        paddingHorizontal: 20,
        paddingVertical: 20,
        alignItems: 'center'
    },
    topView: {
        flex: 1,
        alignItems: 'center'
    },
    imageStyle: {
        height: 100,
        width: 100,
        marginVertical: 50
    },
    title: {
        fontSize: 18,
        color: GlobalColors.formText,
        fontWeight: AppFonts.BOLD,
        textAlign: 'center'
    },
    subTitle: {
        fontSize: 15,
        color: GlobalColors.formLable,
        textAlign: 'center',
        paddingTop: 20
    },
    buttonContainer: {
        height: 40,
        width: width - 60,
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
    codeView: {
        paddingVertical: 10,
        paddingHorizontal: 17,
        backgroundColor: '#f6f8fc',
        borderRadius: 5,
        marginRight: 10,
        width: 200
    },
    codeBtnView: {
        paddingVertical: 10,
        paddingHorizontal: 17,
        backgroundColor: '#f6f8fc',
        borderRadius: 5
    },
    codeContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between'
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
    backScan: {
        flexDirection: 'row',
        marginTop: 20,
        alignSelf: 'center',
        alignItems: 'center'
    },
    qrContainer: {
        marginVertical: 20
    },
    qrCodeText: { color: '#9c9ea7' },
    copyCodeText: { color: GlobalColors.primaryColor },
    wrongOtpMsg: {
        fontSize: 13,
        color: GlobalColors.formDelete,
        textAlign: 'center'
    },
    wrongOtpContainer: { marginTop: 15 },
    goBackIcon: {
        marginRight: 5,
        marginTop: 2
    },
    goBackText: {
        fontSize: 13,
        color: GlobalColors.primaryColor
    }
});
