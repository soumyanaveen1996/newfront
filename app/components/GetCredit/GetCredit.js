import React from 'react';
import {
    FlatList,
    Text,
    View,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    ActivityIndicator,
    Platform
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

const EventListeners = [];

export default class GetCredit extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedCredit: undefined,
            updatingBalance: false
        };
    }

    componentDidMount() {}

    componentDidUpdate(prevProps) {
        if (prevProps.currentBalance !== this.props.currentBalance) {
            this.setState({ updatingBalance: false });
        }
    }

    onExit() {
        this.close();
    }

    close() {
        if (this.props.wasDialler) {
            Actions.dialler({ phoneNumber: this.props.wasDialler });
        }
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
                await InAppPurchase.buyProduct({ productCode: productCode });
                // this.setState({ updatingBalance: false });
            } catch (error) {
                this.setState({ updatingBalance: false });
                this.refs.toast.show(error.toString(), DURATION.LENGTH_SHORT);
            }
        });
    }

    renderTopUpButton(credit) {
        const isSelected = credit === this.state.selectedCredit;
        return (
            <TouchableOpacity
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

    render() {
        return (
            <SafeAreaView style={styles.container}>
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
                                    style={[styles.currency, { fontSize: 16 }]}
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
                    </View>
                </View>
                <TouchableOpacity
                    style={
                        this.state.selectedCredit
                            ? styles.buyButton
                            : styles.buyButtonDisabled
                    }
                    disabled={
                        !this.state.selectedCredit || this.state.updatingBalance
                    }
                    onPress={this.buyCredit.bind(this)}
                >
                    {this.state.updatingBalance ? (
                        <ActivityIndicator
                            size="small"
                            color={GlobalColors.white}
                        />
                    ) : (
                        <Text style={styles.buyButtonText}>Buy</Text>
                    )}
                </TouchableOpacity>
                {this.renderToast()}
            </SafeAreaView>
        );
    }
}
