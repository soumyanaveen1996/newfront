import React from 'react';
import {
    SafeAreaView,
    TouchableOpacity,
    Text,
    View,
    FlatList,
    Platform,
    Image,
    Alert
} from 'react-native';
import styles from './styles';
import { CheckBox } from 'react-native-elements';
import { Actions } from 'react-native-router-flux';
import images from '../../config/images';
import { HeaderRightIcon, HeaderBack } from '../Header';
import I18n from '../../config/i18n/i18n';
import { Settings, PollingStrategyTypes } from '../../lib/capability';
import Icons from '../../config/icons';
import { GlobalColors } from '../../config/styles';

export default class Multiselection extends React.Component {
    static navigationOptions({ navigation, screenProps }) {
        const { state } = navigation;
        let navigationOptions = {
            headerTitle: state.params.title
        };
        if (state.params.noBack === true) {
            navigationOptions.headerLeft = null;
        } else {
            navigationOptions.headerLeft = (
                <HeaderBack
                    onPress={() => {
                        if (state.params.botDone) {
                            state.params.botDone();
                        }
                        if (state.params.onBack) {
                            Actions.pop();
                            state.params.onBack();
                        } else {
                            Actions.pop();
                        }
                    }}
                />
            );
        }

        if (state.params.button) {
            if (state.params.button === 'manual') {
                navigationOptions.headerRight = (
                    <HeaderRightIcon
                        onPress={() => {
                            state.params.refresh();
                        }}
                        icon={Icons.refresh()}
                    />
                );
            } else if (state.params.button === 'gsm') {
                navigationOptions.headerRight = (
                    <HeaderRightIcon
                        image={images.gsm}
                        onPress={() => {
                            state.params.showConnectionMessage('gsm');
                        }}
                    />
                );
            } else if (state.params.button === 'satellite') {
                navigationOptions.headerRight = (
                    <HeaderRightIcon
                        image={images.satellite}
                        onPress={() => {
                            state.params.showConnectionMessage('satellite');
                        }}
                    />
                );
            } else {
                navigationOptions.headerRight = (
                    <HeaderRightIcon
                        icon={Icons.automatic()}
                        onPress={() => {
                            state.params.showConnectionMessage('automatic');
                        }}
                    />
                );
            }
        }
        return navigationOptions;
    }

    constructor(props) {
        super(props);
        this.state = {
            response: this.props.response
        };
        this.key = this.props.index;

        this.props.navigation.setParams({
            showConnectionMessage: this.showConnectionMessage
        });
    }

    componentDidMount() {
        this.checkPollingStrategy();
    }

    showConnectionMessage = connectionType => {
        let message = I18n.t('Auto_Message');
        if (connectionType === 'gsm') {
            message = I18n.t('Gsm_Message');
        } else if (connectionType === 'satellite') {
            message = I18n.t('Satellite_Message');
        }
        Alert.alert(
            I18n.t('Connection_Type'),
            message,
            [{ text: I18n.t('Ok'), style: 'cancel' }],
            { cancelable: false }
        );
    };

    showButton(pollingStrategy) {
        if (pollingStrategy === PollingStrategyTypes.manual) {
            this.props.navigation.setParams({ button: 'manual' });
        } else if (pollingStrategy === PollingStrategyTypes.automatic) {
            this.props.navigation.setParams({ button: 'none' });
        } else if (pollingStrategy === PollingStrategyTypes.gsm) {
            this.props.navigation.setParams({ button: 'gsm' });
        } else if (pollingStrategy === PollingStrategyTypes.satellite) {
            this.props.navigation.setParams({ button: 'satellite' });
        }
    }

    async checkPollingStrategy() {
        let pollingStrategy = await Settings.getPollingStrategy();
        this.showButton(pollingStrategy);
    }

    ////////////

    renderListItem({ item, index }) {
        return (
            <CheckBox
                key={index}
                title={item}
                onIconPress={() => {
                    if (!this.props.disabled) {
                        let res = this.state.response;
                        res[index] = !res[index];
                        this.setState({ response: res });
                    }
                }}
                checked={this.state.response[index]}
                textStyle={styles.optionText}
                containerStyle={styles.checkbox}
                size={20}
                iconType="ionicon"
                checkedIcon="ios-checkbox-outline"
                uncheckedIcon="ios-square-outline"
                checkedColor={GlobalColors.sideButtons}
            />
        );
    }

    render() {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.list}>
                    <FlatList
                        data={this.props.options}
                        extraData={this.state}
                        renderItem={this.renderListItem.bind(this)}
                    />
                </View>
                <View style={styles.buttonArea}>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => {
                            if (!this.props.disabled) {
                                this.props.onDone(
                                    this.state.response,
                                    this.key
                                );
                            }
                            Actions.pop();
                        }}
                    >
                        <Text style={styles.buttonText}>Done</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }
}
