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

    return (
        <View style={{ alignItems: 'center' }}>
            <Image source={imageSource} />
            <Text
                style={{
                    textAlign: 'center',
                    fontSize: 12,
                    color: 'rgba(74,74,74,0.6)'
                }}
            >
                {titleScreen}
            </Text>
        </View>
    );
};

export default TabIcon;
