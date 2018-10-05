import React, { Component } from 'react';
import { Text, View, Image, TouchableOpacity } from 'react-native';

import styles from './styles';
import { SCREEN_HEIGHT } from './config';
import Swiper from 'react-native-swiper';
import images from '../../config/images';
import { LoginScreen } from '../Login';
import SignupScreen from '../Signup/SignupScreen';

export default class SwiperScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            lastIndex: 0,
            isLoginPage: true
        };
    }

    changeIndex = state => {
        console.log('on changing index ', state);
    };

    changePages = () => {
        if (this.state.isLoginPage) {
            return <LoginScreen email={this.props.email} />;
        } else {
            return <SignupScreen />;
        }
    };

    changeNavigationText = () => {
        if (this.state.isLoginPage) {
            return (
                <TouchableOpacity
                    onPress={this.goToSignupPage}
                    style={{ alignItems: 'center' }}
                >
                    <Text style={styles.goToLine}>
                        You don’t have an account?
                        <Text style={styles.bolder}> Sign up </Text>
                        <Image source={images.blue_arrow} />
                    </Text>
                </TouchableOpacity>
            );
        } else {
            return (
                <TouchableOpacity
                    onPress={this.goToLoginPage}
                    style={{ alignItems: 'center' }}
                >
                    <Text style={styles.goToLine}>
                        Already have an account?{' '}
                        <Text style={styles.bolder}> Log in </Text>
                        <Image source={images.blue_arrow} />
                    </Text>
                </TouchableOpacity>
            );
        }
    };

    goToSignupPage = () => {
        this.setState(() => {
            return { isLoginPage: false };
        });
        // Actions.signupScreen({ type: ActionConst.REPLACE });
    };

    goToLoginPage = () => {
        this.setState(() => {
            return { isLoginPage: true };
        });
        // Actions.signupScreen({ type: ActionConst.REPLACE });
    };

    render() {
        return (
            <Swiper
                style={styles.wrapper}
                height={SCREEN_HEIGHT - 40}
                onIndexChanged={this.changeIndex}
                index={this.props.swiperIndex ? this.props.swiperIndex : 0}
                dot={
                    <View
                        style={{
                            backgroundColor: 'rgba(222,222,222,1)',
                            width: 5,
                            height: 5,
                            borderRadius: 4,
                            marginLeft: 3,
                            marginRight: 3,
                            marginTop: 3,
                            marginBottom: 3
                        }}
                    />
                }
                activeDot={
                    <View
                        style={{
                            backgroundColor: 'rgba(222,222,222,1)',
                            width: 8,
                            height: 8,
                            borderRadius: 4,
                            marginLeft: 3,
                            marginRight: 3,
                            marginTop: 3,
                            marginBottom: 3
                        }}
                    />
                }
                paginationStyle={{
                    bottom: 20
                }}
                loop={false}
            >
                <View style={styles.slide}>
                    <View
                        style={{
                            height: SCREEN_HEIGHT - 240,
                            backgroundColor: '#fff'
                        }}
                    >
                        <Image
                            style={styles.slider}
                            source={images.preview_slider_1}
                        />
                    </View>
                    <View style={styles.textBox}>
                        <View style={styles.innerBox}>
                            <Text style={styles.headerText}>
                                Welcome to FrontM!
                            </Text>
                            <Text style={styles.text}>
                                Intelligent Collaboration. Lorem ipsum dolor sit
                                amet consectetur ut enim ad minim veniam, quis
                                nostrud exercitation ullamco laboris nisi ut.
                            </Text>
                        </View>
                    </View>
                </View>
                <View style={styles.slide}>
                    <View
                        style={{
                            height: SCREEN_HEIGHT - 240,
                            backgroundColor: '#fff'
                        }}
                    >
                        <Image
                            style={styles.slider}
                            source={images.preview_slider_2}
                        />
                    </View>
                    <View style={styles.textBox}>
                        <View style={styles.innerBox}>
                            <Text style={styles.headerText}>
                                Cruise Passengers and Crew
                            </Text>
                            <Text style={styles.text}>
                                In voluptate velit esse cillum dolore eu fugiat
                                nulla pariatur. Excepteur sint occaecat
                                cupidatat non proident, sunt in culpa qui
                                officia deserunt mollit.
                            </Text>
                        </View>
                    </View>
                </View>
                <View style={styles.slide}>
                    <View
                        style={{
                            height: SCREEN_HEIGHT - 240,
                            backgroundColor: '#fff'
                        }}
                    >
                        <Image
                            style={styles.slider}
                            source={images.preview_slider_3}
                        />
                    </View>
                    <View style={styles.textBox}>
                        <View style={styles.innerBox}>
                            <Text style={styles.headerText}>
                                Airline Passengers and Crew
                            </Text>
                            <Text style={styles.text}>
                                Lorem ipsum dolor sit amet, consectetur
                                adipiscing elit, sed do eiusmod tempor
                                incididunt ut labore et dolore magna aliqua sit
                                dolor amet.
                            </Text>
                        </View>
                    </View>
                </View>
                <View style={styles.slide}>
                    <View
                        style={{
                            height: SCREEN_HEIGHT - 240,
                            backgroundColor: '#fff'
                        }}
                    >
                        <Image
                            style={styles.slider}
                            source={images.preview_slider_4}
                        />
                    </View>
                    <View style={styles.textBox}>
                        <View style={styles.innerBox}>
                            <Text style={styles.headerText}>Remote Land</Text>
                            <Text style={styles.text}>
                                Excepteur sint occaecat cupidatat non proident,
                                sunt in culpa qui officia deserunt mollit anim
                                id est laborum. In voluptate velit esse cillum
                                dolore eu fugiat nulla.
                            </Text>
                        </View>
                    </View>
                </View>
                <View style={styles.login}>
                    {this.changePages()}
                    <View style={styles.bottomBox}>
                        {this.changeNavigationText()}
                    </View>
                </View>
            </Swiper>
        );
    }
}
