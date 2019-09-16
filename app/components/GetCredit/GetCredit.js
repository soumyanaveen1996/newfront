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
    TouchableWithoutFeedback
} from 'react-native';
import styles from './styles';
import _ from 'lodash';
import { Icons } from '../../config/icons';
import Modal from 'react-native-modal';
import { Actions } from 'react-native-router-flux';
import EventEmitter from '../../lib/events';
import { InAppPurchase } from '../../lib/capability';
import GlobalColors from '../../config/styles';
import Toast, { DURATION } from 'react-native-easy-toast';
import ROUTER_SCENE_KEYS from '../../routes/RouterSceneKeyConstants';
import Bot from '../../lib/bot';
import * as RNIap from 'react-native-iap';

const EventListeners = [];

export default class GetCredit extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedCredit: undefined,
            updatingBalance: false,
            purchaseExecuted: false,
            codeApplied: false,
            code: '',
            showInfo: false
        };
    }

    componentDidMount() {
        this.purchaseUpdateSubscription = RNIap.purchaseUpdatedListener(
            this.purchaseHandler.bind(this)
        );
        this.purchaseErrorSubscription = RNIap.purchaseErrorListener(error => {
            console.warn('purchaseErrorListener', error);
            this.refs.toast.show(error.toString(), DURATION.LENGTH_SHORT);
        });
    }

    componentDidUpdate(prevProps) {
        if (prevProps.currentBalance !== this.props.currentBalance) {
            this.setState({
                updatingBalance: false,
                purchaseExecuted: true,
                selectedCredit: undefined
            });
        }
    }

    componentWillUnmount() {
        if (this.purchaseUpdateSubscription) {
            this.purchaseUpdateSubscription.remove();
            this.purchaseUpdateSubscription = null;
        }
        if (this.purchaseErrorSubscription) {
            this.purchaseErrorSubscription.remove();
            this.purchaseErrorSubscription = null;
        }
    }

    purchaseHandler(purchase) {
        console.log('purchaseUpdatedListener', purchase);
        const receipt = purchase.transactionReceipt;
        if (receipt) {
            InAppPurchase.grpcTopupUserBalance(
                '100',
                parseFloat(this.state.selectedCredit),
                'sampleToken'
            )
                .then(deliveryResult => {
                    if (Platform.OS === 'ios') {
                        RNIap.finishTransactionIOS(purchase.transactionId);
                    } else if (Platform.OS === 'android') {
                        RNIap.acknowledgePurchaseAndroid(
                            purchase.purchaseToken
                        );
                    }
                    this.setState({ updatingBalance: false });
                })
                .catch(e => {
                    this.setState({ updatingBalance: false });
                    this.refs.toast.show(e.toString(), DURATION.LENGTH_SHORT);
                });
        }
    }

    // onExit() {
    //     this.close();
    // }

    close() {
        if (this.state.purchaseExecuted) {
            Actions.pop();
        }
        // if (this.props.wasDialler) {
        //     Actions.dialler({ phoneNumber: this.props.wasDialler });
        // }
    }

    buyCredit() {
        this.setState({ updatingBalance: true }, async () => {
            let productCode;
            switch (this.state.selectedCredit) {
            case '4.99':
                productCode = 'balance_4_99';
                break;
            case '9.99':
                productCode = 'balance_9_99';
                break;
            case '49.99':
                productCode = 'balance_49_99';
                break;
            case '99.99':
                productCode = 'balance_99_99';
                break;
            }
            try {
                await InAppPurchase.buyProduct({
                    productCode: productCode
                });
            } catch (error) {
                this.setState({ updatingBalance: false });
                this.refs.toast.show(error.toString(), DURATION.LENGTH_SHORT);
            }
        });
    }

    applyCode() {
        Bot.addNewProvider(this.state.code)
            .then(() => {
                this.setState({ codeApplied: true });
            })
            .catch(error => {
                this.refs.toast.show(error, DURATION.LENGTH_SHORT);
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
                    {credit}
                    <Text style={styles.currency}> $</Text>
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
                                        {this.props.currentBalance.toFixed(2)}
                                        <Text
                                            style={[
                                                styles.currency,
                                                { fontSize: 16 }
                                            ]}
                                        >
                                            {' '}
                                            $
                                        </Text>
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
                                        placeholderTextColor={
                                            GlobalColors.darkGray
                                        }
                                        value={this.state.code}
                                        onChangeText={text => {
                                            this.setState({ code: text });
                                        }}
                                    />
                                    <TouchableOpacity
                                        style={
                                            this.state.code.length < 2 ||
                                            this.state.codeApplied
                                                ? styles.codeButtonDisabled
                                                : styles.codeButton
                                        }
                                        onPress={this.applyCode.bind(this)}
                                        disabled={
                                            this.state.code.length < 2 ||
                                            this.state.codeApplied
                                        }
                                    >
                                        <Text style={styles.codeButtonText}>
                                            Apply
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                                <Text style={styles.codeText}>
                                    {this.state.codeApplied
                                        ? 'Your code has been applied.'
                                        : ' '}
                                </Text>
                            </View>

                            <TouchableOpacity
                                style={
                                    this.state.selectedCredit ||
                                    this.state.purchaseExecuted
                                        ? styles.buyButton
                                        : styles.buyButtonDisabled
                                }
                                disabled={
                                    !this.state.selectedCredit ||
                                    this.state.updatingBalance
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
