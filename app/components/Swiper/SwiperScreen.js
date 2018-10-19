import React, { Component } from 'react';
import {
    Text,
    View,
    Image,
    TouchableOpacity,
    Keyboard,
    ScrollView,
    BackHandler
} from 'react-native';
import { Actions } from 'react-native-router-flux';
import styles from './styles';
import Swiper from 'react-native-swiper';
import images from '../../config/images';
import { LoginScreen } from '../Login';
import SignupScreen from '../Signup/SignupScreen';

export default class SwiperScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            lastIndex: 0,
            isLoginPage: true,
            swiperData: [
                {
                    header: 'Keep conversations going no matter where you are',
                    description:
                        'The Safest and Lowest-data-consuming smart messenger, the cheapest voice calling and the most powerful Chatbot Marketplace app out there.',
                    imageSource: images.preview_slider_1
                },
                {
                    header: 'Say Goodbye to isolation',
                    description:
                        'Easily collaborate with your friends, colleagues and companies while you’re at sea',
                    imageSource: images.preview_slider_2
                },
                {
                    header: 'Flying is fun again',
                    description:
                        'Discover the world below you, chat with others on the flight, book hotels, cabs, shop duty free and much more',
                    imageSource: images.preview_slider_3
                },
                {
                    header: "Let's get you going",
                    description:
                        'No matter where you, we are making it easier for you to connect, communicate and operate.',
                    imageSource: images.preview_slider_4
                }
            ]
        };
    }
    componentWillMount() {
        BackHandler.addEventListener(
            'hardwareBackPress',
            this.handleBackButtonClick
        );
    }

    handleBackButtonClick() {
        if (Actions.currentScene === 'swiperScreen') {
            BackHandler.exitApp();
        }
    }

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
                    style={{ alignItems: 'center', zIndex: 1 }}
                >
                    <Text style={styles.goToLine}>
                        You don’t have an account?
                        <Text style={styles.bolder}> Sign up </Text>
                        <Image
                            style={styles.arrow}
                            source={images.blue_arrow}
                        />
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
                        <Image
                            style={styles.arrow}
                            source={images.blue_arrow}
                        />
                    </Text>
                </TouchableOpacity>
            );
        }
    };

    goToSignupPage = () => {
        this.setState(() => {
            return { isLoginPage: false };
        });
    };

    goToLoginPage = () => {
        this.setState(() => {
            return { isLoginPage: true };
        });
    };

    onIndexChanged(index) {
        if (index <= 3) {
            Keyboard.dismiss();
        }
    }

    render() {
        return (
            <Swiper
                style={styles.wrapper}
                index={this.props.swiperIndex ? this.props.swiperIndex : 0}
                onIndexChanged={this.onIndexChanged.bind(this)}
                dot={<View style={styles.dotStyle} />}
                activeDot={<View style={styles.activeDotStyle} />}
                paginationStyle={styles.paginationStyles}
                loop={false}
            >
                <View style={styles.slide}>
                    <View style={styles.sliderImageContainer}>
                        <Image
                            style={styles.slider}
                            source={this.state.swiperData[0].imageSource}
                        />
                    </View>
                    <View style={styles.textBox}>
                        <View style={styles.innerBox}>
                            <Text style={styles.headerText}>
                                {this.state.swiperData[0].header}
                            </Text>
                            <Text style={styles.text}>
                                {this.state.swiperData[0].description}
                            </Text>
                        </View>
                    </View>
                </View>
                <View style={styles.slide}>
                    <View style={styles.sliderImageContainer}>
                        <Image
                            style={styles.slider}
                            source={this.state.swiperData[1].imageSource}
                        />
                    </View>
                    <View style={styles.textBox}>
                        <View style={styles.innerBox}>
                            <Text style={styles.headerText}>
                                {this.state.swiperData[1].header}
                            </Text>
                            <Text style={styles.text}>
                                {this.state.swiperData[1].description}
                            </Text>
                        </View>
                    </View>
                </View>
                <View style={styles.slide}>
                    <View style={styles.sliderImageContainer}>
                        <Image
                            style={styles.slider}
                            source={this.state.swiperData[2].imageSource}
                        />
                    </View>
                    <View style={styles.textBox}>
                        <View style={styles.innerBox}>
                            <Text style={styles.headerText}>
                                {this.state.swiperData[2].header}
                            </Text>
                            <Text style={styles.text}>
                                {this.state.swiperData[2].description}
                            </Text>
                        </View>
                    </View>
                </View>
                <View style={styles.slide}>
                    <View style={styles.sliderImageContainer}>
                        <Image
                            style={styles.slider}
                            source={this.state.swiperData[3].imageSource}
                        />
                    </View>
                    <View style={styles.textBox}>
                        <View style={styles.innerBox}>
                            <Text style={styles.headerText}>
                                {this.state.swiperData[3].header}
                            </Text>
                            <Text style={styles.text}>
                                {this.state.swiperData[3].description}
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