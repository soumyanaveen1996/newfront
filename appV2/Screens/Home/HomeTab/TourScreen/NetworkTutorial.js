import React, { Component } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Icon } from '@rneui/themed';
import styles from './styles';
import images from '../../../../images';
import I18n from '../../../../config/i18n/i18n';
import GlobalColors from '../../../../config/styles';

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
                {/* <View style={styles.satelliteCircle}>
                    <Icon
                        style={{ justifyContent: 'center' }}
                        type="simple-line-icon"
                        size={25}
                        containerStyle={{
                            padding: 0,
                            justifyContent: 'center'
                        }}
                        color={GlobalColors.primaryButtonColor}
                        name="settings"
                    />
                </View> */}
                <View style={styles.topTutorialContainer}>
                    <Text style={styles.welcomeSubHeader}>
                        {I18n.t('AssistantInfo')}
                    </Text>
                    <View style={styles.dotSider}>
                        <View style={styles.innerWidth}>
                            <Image
                                source={images.dot_gray}
                                style={{
                                    tintColor: GlobalColors.frontmLightBlue
                                }}
                            />
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
                            <Icon
                                name="arrow-forward"
                                size={14}
                                color={GlobalColors.frontmLightBlue}
                            />
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
}
