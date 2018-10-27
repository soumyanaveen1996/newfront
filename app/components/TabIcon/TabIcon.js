import React from 'react';
import { View, Image, Text } from 'react-native';
import {
    Scene,
    Router,
    Lightbox,
    ActionConst,
    Actions,
    Tabs
} from 'react-native-router-flux';
import styles from './styles';

const TabIcon = ({ focused, imageSource, titleScreen }) => {
    if (__DEV__) {
        console.tron('TAB', Actions.currentScene, titleScreen);
    }
    let tempScreen;
    let fontSize = 0;
    if (Actions.currentScene === 'timeline') {
        tempScreen = 'Home';
    }

    if (tempScreen === titleScreen) {
        fontSize = 16;
    } else {
        fontSize = 14;
    }

    return (
        <View style={{ alignItems: 'center' }}>
            <Image source={imageSource} />
            <Text
                style={{
                    textAlign: 'center',
                    fontSize,
                    color: 'rgba(74,74,74,0.6)'
                }}
            >
                {titleScreen}
            </Text>
        </View>
    );
};

export default TabIcon;
