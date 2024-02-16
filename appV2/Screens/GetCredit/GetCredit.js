import React from 'react';
import {
    Text,
    View,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Platform,
    TextInput,
    KeyboardAvoidingView
} from 'react-native';
import _ from 'lodash';
import email from 'react-native-email';
import styles from './styles';
import { Icons } from '../../config/icons';
import EventEmitter, { CallQuotaEvents } from '../../lib/events';
import { Auth, InAppPurchase } from '../../lib/capability';
import GlobalColors from '../../config/styles';
import Bot from '../../lib/bot';
import formStyles from '../Chat/ChatComponents/Form2Message/styles';
import I18n from '../../config/i18n/i18n';
import config from '../../config/config';
import { HeaderBack, HeaderTitle } from '../../widgets/Header';
import NavigationAction from '../../navigation/NavigationAction';
import { Toast } from 'react-native-toast-message/lib/src/Toast';
import AlertDialog from '../../lib/utils/AlertDialog';

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
            codeError: null,
            currentBalance: this.props.route?.params?.currentBalance?.toFixed(2)
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
        this.userCancelledPurchase = EventEmitter.addListener(
            CallQuotaEvents.USER_PURCHASE_CANCELLED,
            this.onCallQuotaCancelledByUser.bind(this)
        );
    }

    componentWillUnmount() {
        this.updateEventListener.remove();
        this.errorEventListener.remove();
        this.userCancelledPurchase.remove();
    }

    onCallQuotaCancelledByUser(errMessage) {
        this.setState({ updatingBalance: false });
        Toast.show({ text1: `${errMessage}` });
    }

    onCallQuotaUpdateSuccess(newBalance) {
        this.setState({
            updatingBalance: false,
            purchaseExecuted: true,
            selectedCredit: undefined,
            currentBalance: newBalance.toFixed(2)
        });

        // for updating balance in parent screen where we willl pop
        if (this.props?.route?.params?.updateCallBack) {
            this.props.route.params.updateCallBack(newBalance);
        }
        this.close();
    }

    onCallQuotaUpdateFailure(error) {
        this.setState({ updatingBalance: false });
        this.sendEmailToSupport();
        Toast.show({ text1: 'Could not update your balance' });
    }

    async sendEmailToSupport() {
        AlertDialog.show(
            'An error occurred',
            `We are having problems updating your balance. Please contact ${config.supportEmail.address} describing your problem.`,
            [
                {
                    text: 'Cancel'
                },
                {
                    text: 'OK',
                    onPress: async () => {
                        try {
                            const user = Auth.getUserData();
                            const userEmail = user?.info?.emailAddress;
                            const { userName } = user?.info;
                            const to = config.supportEmail.address;
                            await email(to, {
                                subject: `Failed balance update for ${userName}`,
                                body: `Username: ${userName}\nEmail: ${userEmail}`
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
            NavigationAction.pop();
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
                    productCode,
                    productName: InAppPurchase.ProductTypes.VOIP
                });
            } catch (error) {
                this.setState({ updatingBalance: false });
                Toast.show({ text1: error.message });
            }
        });
    }

    applyCode() {
        Bot.addNewProvider(this.state.code)
            .then(() => {
                this.setState({ codeApplied: true });
            })
            .catch((error) => {
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
                        color: GlobalColors.primaryButtonColor,
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
                        placeholder="Partner code"
                        placeholderTextColor={GlobalColors.darkGray}
                        value={this.state.code}
                        onChangeText={(text) => {
                            this.setState({ code: text, codeError: null });
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
                {this.state.codeError && (
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
                )}
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
                                <Text style={styles.title}>
                                    {I18n.t('Top_Up')}
                                </Text>
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
