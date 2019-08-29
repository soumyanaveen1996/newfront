import React, { Component } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StatusBar,
    Platform
} from 'react-native';
import styles from './styles';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp
} from 'react-native-responsive-screen';

import images from '../../images';

export default class BotTutorial extends Component {
    constructor(props) {
        super(props);
    }

    onSkipSubmit() {}
    onNextSubmit() {}

    render() {
        return (
            <View
                style={{
                    position: 'absolute',
                    top: 54,
                    left: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    height: '100%',
                    width: wp('100%'),
                    ...Platform.select({
                        android: {
                            top: 64
                        }
                    })
                }}
            >
                <View
                    style={{
                        height: 35,
                        width: '100%'
                    }}
                />
                <View style={{ height: 30, width: '100%' }} />
                <View style={styles.botSreen}>
                    <View style={{ width: 35, height: 35 }}>
                        <Image
                            source={images.bot_icon_assistant}
                            style={styles.image}
                        />
                    </View>
                    <View style={styles.textContainer}>
                        <Text style={styles.title}>FrontM App</Text>
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

                <View style={styles.botTutorial}>
                    <View style={styles.topTriangle} />
                    <View style={styles.topTutorialContainerForBotTab}>
                        <Text style={styles.welcomeSubHeader}>
                            Chat with FrontM App to configure your account. Feel
                            free to ask him whatever you want.
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
                            <Text style={styles.skipButtonText}>Skip</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.nextTutorialContainer}
                            onPress={this.props.readyScreen}
                        >
                            <Text style={styles.skipTutorialButtonText}>
                                Got It!
                            </Text>

                            <View style={styles.tutorialArrow}>
                                <Image source={images.blue_arrow} />
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    }
}
