import React, { Component } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import styles from './styles';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp
} from 'react-native-responsive-screen';

import images from '../../../../images';
import GlobalColors from '../../../../config/styles';

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
            <View
                style={{
                    position: 'absolute',
                    bottom: 60,
                    left: 0,
                    height: hp('30%'),
                    width: wp('100%'),
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-end'
                }}
            >
                <View style={styles.tabBarTutorial}>
                    <View style={styles.bottomTriangle} />
                    <View style={{ height: '100%' }}>
                        <View style={styles.topTutorialContainer}>
                            <Text style={styles.welcomeSubHeader}>
                                Manage contacts, create or join groups and
                                install conversational apps.
                            </Text>
                            <View style={styles.dotSider}>
                                <View style={styles.innerWidth}>
                                    <Image source={images.dot_gray} />
                                    <Image
                                        source={images.dot_blue}
                                        style={{
                                            tintColor:
                                                GlobalColors.frontmLightBlue
                                        }}
                                    />
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
                                onPress={this.props.botScreen}
                            >
                                <Text style={styles.skipTutorialButtonText}>
                                    Next
                                </Text>

                                <View style={styles.tutorialArrow}>
                                    <Icon
                                        name="arrow-forward"
                                        size={14}
                                        color={GlobalColors.frontmLightBlue}
                                    />
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        );
    }
}
