import React, { useState } from 'react';
import {
    Dimensions,
    Image,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ScrollView
} from 'react-native';
import GlobalColors from '../../../config/styles';
import { Auth } from '../../../lib/capability';
import { Loader } from '../../../widgets';
import config from '../../../config/config';
import NavigationAction from '../../../navigation/NavigationAction';
import images from '../../../images';
import AppFonts from '../../../config/fontConfig';
const { width } = Dimensions.get('window');

const ConfirmPassword = ({
    route: {
        params: { softwareMfaEnabled }
    }
}) => {
    console.log(
        'Confirm Password xxxxxxxxxxxxxxxxxxxxxxxx',
        softwareMfaEnabled
    );
    //States
    const [password, setPassword] = useState(false);
    const [isError, setError] = useState(false);
    const [isLoading, setLoading] = useState(false);
    const {
        app: { appType }
    } = config;

    const onButtonPress = () => {
        if (!password) {
            setError('Please enter password');
            return;
        }
        setLoading(true);
        const req = { appType: appType, password: password };
        if (!softwareMfaEnabled) {
            Auth.twoFactorAuth(req)
                .then((res) => {
                    if (res.success) {
                        setUserData(true);
                        NavigationAction.push(
                            NavigationAction.SCREENS.twoFactorScan,
                            {
                                password: password,
                                qrCodeUri: res.qrCodeUri
                            }
                        );
                    } else {
                        setError(res.message);
                    }
                    setLoading(false);
                })
                .catch((err) => {
                    setLoading(false);
                    console.log(err);
                });
        } else {
            Auth.disableTwoFactorAuth(req)
                .then((res) => {
                    if (res.success) {
                        setUserData(false);
                        NavigationAction.replace(
                            NavigationAction.SCREENS.twoFactorAuth,
                            { scanned: false }
                        );
                    } else {
                        setError(res.message);
                    }
                    setLoading(false);
                })
                .catch((err) => {
                    console.log(err);
                    setLoading(false);
                });
        }
    };

    const setUserData = async (flag) => {
        const user = Auth.getUserData();
        user['info'].softwareMfaEnabled = flag;
        await Auth.saveUser(user);
    };

    return (
        <SafeAreaView
            style={styles.mainContainer}
            keyboardShouldPersistTaps="handled"
        >
            <Loader loading={isLoading} />
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.topView}>
                    <Image
                        source={images.securityShield}
                        style={styles.imageStyle}
                        resizeMode="contain"
                    />
                    <View>
                        <Text style={styles.title}>
                            Authenticate your account to access
                        </Text>
                        <Text style={styles.subTitle}>
                            Please confirm your FrontM password
                        </Text>
                    </View>
                    <View>
                        <TextInput
                            placeholder={'Password'}
                            placeholderTextColor={
                                GlobalColors.formPlaceholderText
                            }
                            style={styles.textInput}
                            secureTextEntry
                            onChangeText={(text) => {
                                setError(false);
                                setPassword(text);
                            }}
                        />
                    </View>
                    <Text style={styles.errorMsg}>{isError}</Text>
                </View>
            </ScrollView>
            <View>
                <TouchableOpacity
                    style={styles.buttonContainer}
                    onPress={() => onButtonPress()}
                >
                    <Text style={styles.buttonText}>Continue</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default ConfirmPassword;

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: GlobalColors.appBackground,
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
        paddingTop: 10
    },
    buttonContainer: {
        height: 40,
        width: width - 60,
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
    },
    textInput: {
        height: 50,
        width: 150,
        borderWidth: 1,
        borderRadius: 7,
        borderColor: GlobalColors.deviderGrey,
        marginBottom: 15,
        marginTop: 30,
        textAlign: 'center',
        color: GlobalColors.formText
    },
    errorMsg: {
        fontSize: 13,
        color: GlobalColors.formDelete,
        textAlign: 'center',
        marginBottom: 20
    }
});
