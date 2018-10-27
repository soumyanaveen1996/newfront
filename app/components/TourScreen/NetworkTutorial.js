import React, { Component } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import styles from './styles';

import images from '../../images';

export default class NetworkTutorial extends Component {
    constructor(props) {
        super(props);
    }

    onSkipSubmit() {
        console.log('skipped');
    }
    onNextSubmit() {
        console.log('next 1');
    }

    render() {
        return (
            <View style={styles.networkTutorial}>
                <View style={styles.triangle} />
                <View style={styles.satelliteCircle}>
                    <Image
                        style={styles.imageSatellite}
                        source={images.network_icon_automatic}
                    />
                </View>
                <View style={styles.topTutorialContainer}>
                    <Text style={styles.welcomeSubHeader}>
                        This is your network connection.
                    </Text>
                    <View style={styles.dotSider}>
                        <View style={styles.innerWidth}>
                            <Image source={images.dot_blue} />
                            <Image source={images.dot_gray} />
                            <Image source={images.dot_gray} />
                        </View>
                    </View>
                </View>

                <View style={styles.bottomTutorialContainer}>
                    <TouchableOpacity
                        style={styles.skipTotorialContainer}
                        onPress={this.props.action}
                    >
                        <Text style={styles.skipButtonText}>
                            Skip this intro
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.nextTutorialContainer}
                        onPress={this.props.tabBarScreen}
                    >
                        <Text style={styles.skipTutorialButtonText}>Next</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
}
