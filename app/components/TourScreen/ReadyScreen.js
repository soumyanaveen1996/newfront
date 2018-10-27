import React, { Component } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import styles from './styles';

export default class ReadyScreen extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <View style={styles.welcomeWrapper}>
                <View style={styles.readyContainer}>
                    <Text style={styles.welcomeHeader}>Ready to go!</Text>
                    <Text style={styles.welcomeSubHeader}>
                        Let’s configure your account with FrontM Assistant.
                    </Text>
                    <TouchableOpacity
                        style={styles.buttonContainer}
                        onPress={this.props.action}
                    >
                        <Text style={styles.buttonText}>Lets's start</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
}
