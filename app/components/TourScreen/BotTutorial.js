import React, { Component } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import styles from './styles';

import images from '../../images';

export default class BotTutorial extends Component {
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
            <View style={styles.botTutorial}>
                <View style={styles.topTriangle} />
                <View style={styles.botSreen}>
                    <View style={{ width: 35, height: 35, padding: 2 }}>
                        <Image
                            source={images.bot_icon_assistant}
                            style={styles.image}
                        />
                    </View>
                    <View style={styles.textContainer}>
                        <Text style={styles.title}>FrontM Assistant</Text>
                        <Text numberOfLines={2} style={styles.subTitle}>
                            Welcome to FrontM. I’m here to guide
                        </Text>
                    </View>
                    <View
                        accessibilityLabel="List Element Right Arrow"
                        testID="list-element-right-arrow"
                        style={styles.rightContainer}
                    >
                        <Image source={images.home_gray_arrow} />
                    </View>
                </View>
                <View style={styles.topTutorialContainer}>
                    <Text style={styles.welcomeSubHeader}>
                        Chat with FrontM Assistant to configure your account.
                        Feel free to ask him whatever you want.
                    </Text>
                    <View style={styles.dotSider}>
                        <View style={styles.innerWidth}>
                            <Image source={images.dot_gray} />
                            <Image source={images.dot_gray} />
                            <Image source={images.dot_blue} />
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
                        onPress={this.props.readyScreen}
                    >
                        <Text style={styles.skipTutorialButtonText}>Next</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
}
