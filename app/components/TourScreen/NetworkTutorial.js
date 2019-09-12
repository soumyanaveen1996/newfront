import React, { Component } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import styles from './styles';

import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp
} from 'react-native-responsive-screen';
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
                        source={images.bot_icon_assistant}
                    />
                </View>
                <View style={styles.topTutorialContainer}>
                    <View style={styles.textContainer}>
                        <Text style={styles.title}>FrontM App</Text>
                        <Text numberOfLines={2} style={styles.subTitle}>
                            Welcome to FrontM. I’m here to guide
                        </Text>
                    </View>
                    <Text style={styles.welcomeSubHeader}>
                        Chat with FrontM App to configure your account. Feel
                        free to ask him whatever you want.
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
                        <Text style={styles.skipButtonText}>Skip</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.nextTutorialContainer}
                        onPress={this.props.tabBarScreen}
                    >
                        <Text style={styles.skipTutorialButtonText}>Next</Text>
                        <View style={styles.tutorialArrow}>
                            <Image source={images.blue_arrow} />
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
}
