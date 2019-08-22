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

    componentDidUpdate() {}

    close() {
        Actions.pop();
    }

    buyCredit() {
        this.setState({ updatingBalance: true }, async () => {
            try {
                await InAppPurchase.buyProduct({ productCode: 'balance_4_99' });
                this.setState({ updatingBalance: false });
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
                        <Text style={styles.balance}>
                            {this.props.currentBalance}
                            <Text style={[styles.currency, { fontSize: 16 }]}>
                                {' '}
                                $
                            </Text>
                        </Text>
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
