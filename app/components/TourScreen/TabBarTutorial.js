import React, { Component } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import styles from './styles';

import images from '../../images';

export default class TabBarTutorial extends Component {
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
            <View style={styles.tabBarTutorial}>
                <View style={styles.bottomTriangle} />
                <View style={styles.bottomNavBarTutorial}>
                    <View style={styles.tabsStyleTutorial}>
                        <Image
                            style={styles.tabBarIcon}
                            source={images.tabbar_home}
                        />
                        <Text style={styles.tabBarTitle}>Home</Text>
                    </View>
                    <View style={styles.tabsStyleTutorial}>
                        <Image
                            style={styles.tabBarIcon}
                            source={images.tabbar_contacts}
                        />
                        <Text style={styles.tabBarTitle}>Contacts</Text>
                    </View>
                    <View style={styles.tabsStyleTutorial}>
                        <Image
                            style={styles.tabBarIcon}
                            source={images.tabbar_channels}
                        />
                        <Text style={styles.tabBarTitle}>Channels</Text>
                    </View>
                    <View style={styles.tabsStyleTutorial}>
                        <Image
                            style={styles.tabBarIcon}
                            source={images.tabbar_marketplace}
                        />
                        <Text style={styles.tabBarTitle}>Marketplace</Text>
                    </View>
                </View>
                <View style={{ height: 170 }}>
                    <View style={styles.topTutorialContainer}>
                        <Text style={styles.welcomeSubHeader}>
                            Send a direct message, start a group chat, install
                            new bots, or configure your account
                        </Text>
                        <View style={styles.dotSider}>
                            <View style={styles.innerWidth}>
                                <Image source={images.dot_gray} />
                                <Image source={images.dot_blue} />
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
                            onPress={this.props.botScreen}
                        >
                            <Text style={styles.skipTutorialButtonText}>
                                Next
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    }
}
