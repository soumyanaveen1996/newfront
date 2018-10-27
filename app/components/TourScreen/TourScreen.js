import React, { Component } from 'react';
import { View, Modal, AsyncStorage } from 'react-native';
import styles from './styles';

import WelcomeScreen from './WelcomeScreen';
import NetworkTutorial from './NetworkTutorial';
import TabBarTutorial from './TabBarTutorial';
import BotTutorial from './BotTutorial';
import ReadyScreen from './ReadyScreen';

export default class TourScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            show: true,
            showScreenOne: true,
            showScreenTwo: false,
            showScreenThree: false,
            showScreenFour: false,
            showScreenFive: false
        };
        this.handler = this.handler.bind(this);
        this.networkScreen = this.networkScreen.bind(this);
        this.tabBarScreen = this.tabBarScreen.bind(this);
        this.botScreen = this.botScreen.bind(this);
        this.readyScreen = this.readyScreen.bind(this);
    }

    handler() {
        this.setState({
            show: false
        });

        AsyncStorage.setItem('firstTimeUser', 'true');
    }

    networkScreen() {
        this.setState({
            showScreenOne: false,
            showScreenTwo: true
        });
    }
    tabBarScreen() {
        this.setState({
            showScreenTwo: false,
            showScreenThree: true
        });
    }
    botScreen() {
        this.setState({
            showScreenThree: false,
            showScreenFour: true
        });
    }
    readyScreen() {
        this.setState({
            showScreenFour: false,
            showScreenFive: true
        });
    }

    render() {
        return (
            <Modal
                transparent={true}
                animationType={'none'}
                visible={this.state.show}
                onRequestClose={() => {
                    console.log('close modal');
                }}
            >
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
                            botScreen={this.botScreen}
                            action={this.handler}
                        />
                    )}
                    {this.state.showScreenFour && (
                        <BotTutorial
                            readyScreen={this.readyScreen}
                            action={this.handler}
                        />
                    )}
                    {this.state.showScreenFive && (
                        <ReadyScreen action={this.handler} />
                    )}
                </View>
            </Modal>
        );
    }
}
