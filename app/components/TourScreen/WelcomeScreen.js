import React, { Component } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import styles from './styles';

import { Auth } from '../../lib/capability';

export default class WelcomeScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            userName: 'UserName'
        };
    }

    async componentWillMount() {
        Auth.getUser()
            .then(user => {
                this.setState({ userName: user.info.userName });
            })
            .catch(err => {
                console.error('>>>>>>>>>>>>Error<<<<<<<<<< : ', err);
            });
    }

    render() {
        return (
            <View style={styles.welcomeWrapper}>
                <View style={styles.topContainer}>
                    <Text style={styles.welcomeHeader}>
                        Welcome {this.state.userName}!
                    </Text>
                    <Text style={styles.welcomeSubHeader}>
                        Let’s start with a quick overview.
                    </Text>
                    <TouchableOpacity
                        style={styles.buttonContainer}
                        onPress={this.props.networkScreen}
                    >
                        <Text style={styles.buttonText}>Explore FrontM</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.bottomContainer}>
                    <TouchableOpacity
                        style={styles.skipButtonContainer}
                        onPress={this.props.action}
                    >
                        <Text style={styles.skipButtonText}>Skip</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
}
