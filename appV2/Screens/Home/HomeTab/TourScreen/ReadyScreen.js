import React, { Component } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import styles from './styles';
import I18n from '../../../../config/i18n/i18n';

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
                        {I18n.t('StartUsingApp')}
                    </Text>
                    <TouchableOpacity
                        accessibilityLabel="Let's start"
                        testID="lets-start"
                        style={styles.buttonContainer}
                        onPress={this.props.action}
                    >
                        <Text
                            accessibilityLabel="Let's start"
                            testID="lets-start"
                            style={styles.buttonText}
                        >
                            Let's start
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
}
