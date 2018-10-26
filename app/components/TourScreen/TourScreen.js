import React, { Component } from 'react';
import {
    View,
    Text,
    Image,
    BackHandler,
    Modal,
    TouchableOpacity,
    ActivityIndicator,
    AsyncStorage
} from 'react-native';
import styles from './styles';
import { Actions, ActionConst } from 'react-native-router-flux';
import I18n from '../../config/i18n/i18n';
import _ from 'lodash';
import { Auth } from '../../lib/capability';

import images from '../../images';

export default class TourScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            show: true,
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

    onFormSubmit() {
        console.log('explore');
    }
    onSkipSubmit() {
        console.log('skipped');
    }
    onNextSubmit() {
        console.log('next 1');
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
                    {/* <View style={styles.welcomeWrapper}>
                        <View style={styles.topContainer}>
                            <Text style={styles.welcomeHeader}>
                                Welcome {this.state.userName}!
                            </Text>
                            <Text style={styles.welcomeSubHeader}>
                                Let’s start with a quick overview.
                            </Text>
                            <TouchableOpacity
                                style={styles.buttonContainer}
                                onPress={this.onFormSubmit.bind(this)}
                            >
                                <Text style={styles.buttonText}>
                                    Explore FrontM
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.bottomContainer}>
                            <TouchableOpacity
                                style={styles.skipButtonContainer}
                                onPress={this.onSkipSubmit.bind(this)}
                            >
                                <Text style={styles.skipButtonText}>
                                    Skip this intro
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View> */}
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
                                onPress={this.onSkipSubmit.bind(this)}
                            >
                                <Text style={styles.skipButtonText}>
                                    Skip this intro
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.nextTutorialContainer}
                                onPress={this.onNextSubmit.bind(this)}
                            >
                                <Text style={styles.skipTutorialButtonText}>
                                    Next
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

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
                                <Text style={styles.tabBarTitle}>
                                    Marketplace
                                </Text>
                            </View>
                        </View>
                        <View style={{ height: 170 }}>
                            <View style={styles.topTutorialContainer}>
                                <Text style={styles.welcomeSubHeader}>
                                    Send a direct message, start a group chat,
                                    install new bots, or configure your account
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
                                    onPress={this.onSkipSubmit.bind(this)}
                                >
                                    <Text style={styles.skipButtonText}>
                                        Skip this intro
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.nextTutorialContainer}
                                    onPress={this.onNextSubmit.bind(this)}
                                >
                                    <Text style={styles.skipTutorialButtonText}>
                                        Next
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
        );
    }
}
