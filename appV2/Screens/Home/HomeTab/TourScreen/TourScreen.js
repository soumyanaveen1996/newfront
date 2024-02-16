import React, { Component } from 'react';
import { View, Modal } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from './styles';

import WelcomeScreen from './WelcomeScreen';
import NetworkTutorial from './NetworkTutorial';
import TabBarTutorial from './TabBarTutorial';
import ReadyScreen from './ReadyScreen';

export default class TourScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            show: true,
            showScreenOne: true,
            showScreenTwo: false,
            showScreenThree: false,
            showScreenFour: false
        };
        this.handler = this.handler.bind(this);
        this.networkScreen = this.networkScreen.bind(this);
        this.tabBarScreen = this.tabBarScreen.bind(this);
        this.readyScreen = this.readyScreen.bind(this);
    }

    handler() {
        this.setState({
            show: false
        });
        this.props.onClose();
        AsyncStorage.setItem('existingUser', 'true');
    }

    networkScreen() {
        this.setState({
            showScreenOne: false,
            showScreenTwo: true
        });
    }

    tabBarScreen() {
        this.props.showNetwork();
        this.setState({
            showScreenTwo: false,
            showScreenThree: true
        });
    }

    readyScreen() {
        this.setState({
            showScreenThree: false,
            showScreenFour: true
        });
        AsyncStorage.setItem('existingUser', 'true');
    }

    render() {
        return (
            <Modal
                transparent
                animationType="none"
                visible={this.state.show}
                onRequestClose={() => {
                    this.props.onTourClose();
                }}
            >
                <SafeAreaView style={{ flex: 1 }}>
                    <View style={styles.modalBackground}>
                        {this.state.showScreenOne && (
                            <WelcomeScreen
                                networkScreen={this.networkScreen}
                                action={this.handler}
                            />
                        )}
                        {this.state.showScreenTwo && (
                            <NetworkTutorial
                                tabBarScreen={this.tabBarScreen}
                                action={this.handler}
                            />
                        )}
                        {this.state.showScreenThree && (
                            <TabBarTutorial
                                botScreen={this.readyScreen}
                                action={this.handler}
                            />
                        )}
                        {this.state.showScreenFour && (
                            <ReadyScreen action={this.handler} />
                        )}
                    </View>
                </SafeAreaView>
            </Modal>
        );
    }
}
