import React, { Component } from 'react';
import {
    Text,
    View,
    Image,
    TouchableOpacity,
    Keyboard,
    ImageBackground,
    BackHandler,
    StatusBar,
    Platform
} from 'react-native';
import Swiper from 'react-native-swiper';
import styles from './styles';
import images from '../../../images';
import { LoginView } from '../Login';
import configToUse from '../../../config/config';
const swiperData = [
    {
        header: 'Collaborate',
        description:
            'with your colleagues, crew and maritime professionals worldwide',
        imageSource: require('../../../images/preview-slide-1/preview-slide-1.png')
    },
    {
        header: 'Perform',
        description:
            'efficiently with communications, operations and AI productivity tools',
        imageSource: require('../../../images/preview-slide-2/preview-slide-2.png')
    },
    ///////REMOVED////////
    {
        header: 'Making flying fun again',
        description:
            'Message your loved ones and your teams, on a Cruise ship or an Aeroplane. Or even from Timbuktu.',
        imageSource: require('../../../images/preview-slide-3/preview-slide-3.png')
    },
    /////////////////////
    {
        header: 'Self Care',
        description:
            'with access to helpful information, services, news and entertainment',
        imageSource: require('../../../images/preview-slide-4/preview-slide-4.png')
    }
];

export default SwiperView = ({ onIndexChanged, swiperIndex, email }) => {
    const infoScreens = swiperData.map((item) => (
        <View style={styles.slide}>
            <View style={styles.sliderImageContainer}>
                <Image style={styles.slider} source={item.imageSource} />
                <View style={styles.sliderLogo}>
                    <Image source={images.slider_logo} />
                </View>
            </View>
            <ImageBackground
                resizeMode="cover"
                style={styles.backgroundImage}
                source={images.logo_background}
            >
                <View style={styles.innerBox}>
                    <Text style={styles.headerText}>{item.header}</Text>
                    <Text style={styles.text}>{item.description}</Text>
                </View>
            </ImageBackground>
        </View>
    ));
    if (configToUse.simpleLogin) {
        return (
            <View style={styles.login}>
                <LoginView email={email || ''} />
            </View>
        );
    }
    return (
        <Swiper
            style={styles.wrapper}
            index={swiperIndex ? swiperIndex : 0}
            onIndexChanged={onIndexChanged}
            dot={<View style={styles.dotStyle} />}
            activeDot={<View style={styles.activeDotStyle} />}
            paginationStyle={styles.paginationStyles}
            loop={false}
        >
            <View style={styles.slide}>
                <View style={styles.sliderImageContainer}>
                    <Image
                        style={styles.slider}
                        source={swiperData[0].imageSource}
                    />
                    <View style={styles.sliderLogo}>
                        <Image source={images.slider_logo} />
                    </View>
                </View>
                <ImageBackground
                    resizeMode="cover"
                    style={styles.backgroundImage}
                    source={images.logo_background}
                >
                    <View style={styles.innerBox}>
                        <Text style={styles.headerText}>
                            {swiperData[0].header}
                        </Text>
                        <Text style={styles.text}>
                            {swiperData[0].description}
                        </Text>
                    </View>
                </ImageBackground>
            </View>
            <View style={styles.slide}>
                <View style={styles.sliderImageContainer}>
                    <Image
                        style={styles.slider}
                        source={swiperData[1].imageSource}
                    />
                    <View style={styles.sliderLogo}>
                        <Image source={images.slider_logo} />
                    </View>
                </View>
                <ImageBackground
                    resizeMode="cover"
                    style={styles.backgroundImage}
                    source={images.logo_background}
                >
                    <View style={styles.innerBox}>
                        <Text style={styles.headerText}>
                            {swiperData[1].header}
                        </Text>
                        <Text style={styles.text}>
                            {swiperData[1].description}
                        </Text>
                    </View>
                </ImageBackground>
            </View>
            {/* <View style={styles.slide}>
            <View style={styles.sliderImageContainer}>
                <Image
                    style={styles.slider}
                    source={this.state.swiperData[2].imageSource}
                />
            </View>
            <ImageBackground
                resizeMode="cover"
                style={styles.backgroundImage}
                source={images.logo_background}
            >
                <View style={styles.innerBox}>
                    <Text style={styles.headerText}>
                        {this.state.swiperData[2].header}
                    </Text>
                    <Text style={styles.text}>
                        {this.state.swiperData[2].description}
                    </Text>
                </View>
            </ImageBackground>
        </View> */}
            <View
                style={styles.slide}
                accessibilityLabel="welcome4"
                testID="welcome4"
            >
                <View style={styles.sliderImageContainer}>
                    <Image
                        style={styles.slider}
                        source={swiperData[3].imageSource}
                    />
                    <View style={styles.sliderLogo}>
                        <Image source={images.slider_logo} />
                    </View>
                </View>
                <ImageBackground
                    resizeMode="cover"
                    style={styles.backgroundImage}
                    source={images.logo_background}
                >
                    <View
                        style={styles.innerBox}
                        accessibilityLabel="welcome4"
                        testID="welcome4"
                    >
                        <Text
                            style={styles.headerText}
                            accessibilityLabel="welcome4"
                            testID="welcome4"
                        >
                            {swiperData[3].header}
                        </Text>
                        <Text
                            style={styles.text}
                            accessibilityLabel="welcome4"
                            testID="welcome4"
                        >
                            {swiperData[3].description}
                        </Text>
                    </View>
                </ImageBackground>
            </View>
            <View style={styles.login}>
                <LoginView email={email || ''} />
            </View>
        </Swiper>
    );
};
