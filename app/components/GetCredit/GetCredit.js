import React from 'react';
import {
    FlatList,
    Text,
    View,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    ActivityIndicator,
    Platform,
    TextInput,
    KeyboardAvoidingView,
    TouchableWithoutFeedback,
    Alert
} from 'react-native';
import styles from './styles';
import _ from 'lodash';
import { Icons } from '../../config/icons';
import Modal from 'react-native-modal';
import { Actions } from 'react-native-router-flux';
import EventEmitter, { CallQuotaEvents } from '../../lib/events';
import { Auth, InAppPurchase } from '../../lib/capability';
import GlobalColors from '../../config/styles';
import Toast, { DURATION } from 'react-native-easy-toast';
import ROUTER_SCENE_KEYS from '../../routes/RouterSceneKeyConstants';
import Bot from '../../lib/bot';
import * as RNIap from 'react-native-iap';
import formStyles from '../Form2Message/styles';
import UserServices from '../../api/UserServices';
import email from 'react-native-email';

const updateEventListener = [];

export default class GetCredit extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedCredit: undefined,
            updatingBalance: false,
            purchaseExecuted: false,
            codeApplied: false,
            code: '',
            showInfo: false,
            codeError: '',
            currentBalance: this.props.currentBalance.toFixed(2)
        };
    }

    componentDidMount() {
        this.updateEventListener = EventEmitter.addListener(
            CallQuotaEvents.UPDATED_QUOTA,
            this.onCallQuotaUpdateSuccess.bind(this)
        );
        this.errorEventListener = EventEmitter.addListener(
            CallQuotaEvents.UPD_QUOTA_ERROR,
            this.onCallQuotaUpdateFailure.bind(this)
        );
    }

    componentWillUnmount() {
        this.updateEventListener.remove();
        this.errorEventListener.remove();
    }

    onCallQuotaUpdateSuccess(newBalance) {
        this.setState({
            updatingBalance: false,
            purchaseExecuted: true,
            selectedCredit: undefined,
            currentBalance: newBalance.toFixed(2)
        });
        if (this.props.updateCallBack) {
            this.props.updateCallBack(newBalance);
        }
        this.close();
    }

    onCallQuotaUpdateFailure(error) {
        this.setState({ updatingBalance: false });
        this.sendEmailToSupport();
        this.refs.toast.show(
            'Could not update your balance',
            DURATION.LENGTH_SHORT
        );
    }

    async sendEmailToSupport() {
        Alert.alert(
            'An error occurred',
            'We are having problems updating your balance. Please contact support@frontm.com describing your problem.',
            [
                {
                    text: 'Ask me later',
                    onPress: () => console.log('Ask me later pressed')
                },
                {
                    text: 'Cancel',
                    style: 'cancel'
                },
                {
                    text: 'OK',
                    onPress: async () => {
                        try {
                            const user = await Auth.getUser();
                            const userEmail = user.info.emailAddress;
                            const userName = user.info.userName;
                            const to = ['support@frontm.com'];
                            await email(to, {
                                subject:
                                    'Failed balance update for ' + userName,
                                body:
                                    'Username: ' +
                                    userName +
                                    '\nEmail: ' +
                                    userEmail
                            });
                        } catch (error) {
                            console.log('Could not call email app');
                        }
                    }
                }
            ],
            { cancelable: false }
        );
    }

    close() {
        if (this.state.purchaseExecuted) {
            Actions.pop();
        }
    }

    buyCredit() {
        this.setState({ updatingBalance: true }, async () => {
            let productCode;
            const products = InAppPurchase.ProductCodes.Voip;
            switch (this.state.selectedCredit) {
            case '4.99':
                productCode = products.BALANCE_4_99;
                break;
            case '9.99':
                productCode = products.BALANCE_9_99;
                break;
            case '49.99':
                productCode = products.BALANCE_49_99;
                break;
            case '99.99':
                productCode = products.BALANCE_99_99;
                break;
            }
            try {
                await InAppPurchase.buyProduct({
                    productCode: productCode,
                    productName: InAppPurchase.ProductTypes.VOIP
                });
            } catch (error) {
                this.setState({ updatingBalance: false });
                this.refs.toast.show(error.message, DURATION.LENGTH_SHORT);
            }
        });
    }

    applyCode() {
        Bot.addNewProvider(this.state.code)
            .then(() => {
                this.setState({ codeApplied: true });
            })
            .catch(error => {
                this.setState({ codeError: error });
            });
    }

    renderTopUpButton(credit) {
        const isSelected = credit === this.state.selectedCredit;
        return (
            <TouchableOpacity
                disabled={
                    this.state.purchaseExecuted || this.state.updatingBalance
                }
                style={
                    isSelected
                        ? styles.creditButtonSelected
                        : styles.creditButton
                }
                onPress={() => {
                    if (!isSelected) {
                        this.setState({ selectedCredit: credit });
                    }
                }}
            >
                <Text
                    style={
                        isSelected
                            ? styles.creditButtonTextSelected
                            : styles.creditButtonText
                    }
                >
                    <Text style={styles.currency}>$ </Text>
                    {credit}
                </Text>
            </TouchableOpacity>
        );
    }

    renderToast() {
        if (Platform.OS === 'ios') {
            return <Toast ref="toast" position="bottom" positionValue={350} />;
        } else {
            return <Toast ref="toast" position="center" />;
        }
    }

    renderInfoBubble() {
        if (this.state.showInfo) {
            return (
                <View
                    style={{
                        flexDirection: 'column',
                        position: 'absolute',
                        left: 0,
                        bottom: 47
                    }}
                >
                    <View style={styles.infoBubble}>
                        <Text style={styles.infoText}>
                            Here you can use your code to activate discounted
                            minutes when you call to satellite numbers.
                        </Text>
                    </View>
                    <View style={styles.infoTip} />
                </View>
            );
        }
    }

    renderCodeInput() {
        return (
            <View style={styles.codeArea}>
                {/* <Text style={styles.codeText}>{this.state.codeApplied ? 'Your code has been applied.' : null}</Text> */}
                <View style={styles.rightCodeArea}>
                    {this.renderInfoBubble()}
                    {Icons.info({
                        size: 27,
                        color: GlobalColors.frontmLightBlue,
                        onPress: () => {
                            this.setState({
                                showInfo: !this.state.showInfo
                            });
                        }
                    })}
                    <TextInput
                        numberOfLines={1}
                        maxLength={30}
                        editable={!this.state.codeApplied}
                        style={
                            this.state.codeApplied
                                ? styles.codeInputApplied
                                : styles.codeInput
                        }
                        placeholder={'Partner code'}
                        placeholderTextColor={GlobalColors.darkGray}
                        value={this.state.code}
                        onChangeText={text => {
                            this.setState({ code: text, codeError: '' });
                        }}
                    />

                    <TouchableOpacity
                        style={
                            this.state.code.length < 2 || this.state.codeApplied
                                ? styles.codeButtonDisabled
                                : styles.codeButton
                        }
                        onPress={this.applyCode.bind(this)}
                        disabled={
                            this.state.code.length < 2 || this.state.codeApplied
                        }
                    >
                        <Text style={styles.codeButtonText}>Apply</Text>
                    </TouchableOpacity>
                </View>
                {this.state.codeError ? (
                    <View
                        style={[
                            formStyles.validationMessage,
                            {
                                position: 'absolute',
                                bottom: 0,
                                alignSelf: 'flex-start',
                                left: 30
                            }
                        ]}
                    >
                        <Text style={formStyles.validationMessageText}>
                            {this.state.codeError}
                        </Text>
                    </View>
                ) : null}
                <Text style={styles.codeText}>
                    {this.state.codeApplied
                        ? 'Your code has been applied.'
                        : ' '}
                </Text>
            </View>
        );
    }

    render() {
        return (
            <ScrollView
                style={{ height: '100%' }}
                // contentContainerStyle={
                //     Platform.OS === 'ios' ? { height: '100%' } : null
                // }
                bounces={false}
            >
                <KeyboardAvoidingView
                    style={styles.container}
                    behavior={Platform.OS === 'ios' ? 'position' : null}
                >
                    <TouchableOpacity
                        style={{ flex: 1 }}
                        onPress={() => {
                            this.setState({ showInfo: false });
                        }}
                        activeOpacity={1}
                    >
                        {this.renderToast()}
                        <View style={styles.topContainer}>
                            <View>
                                <Text style={styles.title}>Your balance:</Text>
                                {this.state.updatingBalance ? (
                                    <ActivityIndicator
                                        size="large"
                                        color={GlobalColors.frontmLightBlue}
                                    />
                                ) : (
                                    <Text style={styles.balance}>
                                        <Text
                                            style={[
                                                styles.currency,
                                                { fontSize: 18 }
                                            ]}
                                        >
                                            ${' '}
                                        </Text>
                                        {this.state.currentBalance}
                                    </Text>
                                )}
                            </View>
                            <View>
                                <Text style={styles.title}>Get credit</Text>
                                <View style={styles.creditRow}>
                                    {this.renderTopUpButton('4.99')}
                                    {this.renderTopUpButton('9.99')}
                                </View>
                                <View style={styles.creditRow}>
                                    {this.renderTopUpButton('49.99')}
                                    {this.renderTopUpButton('99.99')}
                                </View>
                                <Text
                                    style={[
                                        styles.currency,
                                        { alignSelf: 'center' }
                                    ]}
                                >
                                    The prices above are in US dollars.
                                </Text>
                                <Text
                                    style={[
                                        styles.currency,
                                        { alignSelf: 'center' }
                                    ]}
                                >
                                    You will be charged in your local currency.
                                </Text>
                            </View>
                        </View>
                        <View style={{ marginVertical: '15%' }}>
                            {this.renderCodeInput()}
                            <TouchableOpacity
                                style={
                                    this.state.selectedCredit
                                        ? styles.buyButton
                                        : this.state.purchaseExecuted
                                            ? styles.buyButtonExecuted
                                            : styles.buyButtonDisabled
                                }
                                disabled={
                                    !this.state.selectedCredit ||
                                    this.state.updatingBalance ||
                                    this.state.purchaseExecuted
                                }
                                onPress={
                                    this.state.purchaseExecuted
                                        ? this.close.bind(this)
                                        : this.buyCredit.bind(this)
                                }
                            >
                                {this.state.updatingBalance ? (
                                    <ActivityIndicator
                                        size="small"
                                        color={GlobalColors.white}
                                    />
                                ) : (
                                    <Text style={styles.buyButtonText}>
                                        {this.state.purchaseExecuted
                                            ? 'Done'
                                            : 'Buy'}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </KeyboardAvoidingView>
            </ScrollView>
        );
    }
}
