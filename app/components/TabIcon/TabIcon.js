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
        console.tron('TAB', Actions.currentScene);
    }
    let tempScreen;
    let color;
    if (Actions.currentScene === 'timeline') {
        tempScreen = 'Home';
    }

    if (Actions.currentScene === 'botStore') {
        tempScreen = 'Marketplace';
    }
    if (Actions.currentScene === 'channelsList') {
        tempScreen = 'Channels';
    }
    if (Actions.currentScene === 'addContacts') {
        tempScreen = 'Contacts';
    }
    if (tempScreen === titleScreen) {
        fontSize = 'rgba(80,74,74,0.6)';
    } else {
        color = 'rgba(74,74,74,0.6)';
    }

    return (
        <View style={{ alignItems: 'center' }}>
            <Image source={imageSource} />
            <Text
                style={{
                    textAlign: 'center',
                    fontSize: 14,
                    color
                }}
            >
                {titleScreen}
            </Text>
        </View>
    );
};

export default TabIcon;
