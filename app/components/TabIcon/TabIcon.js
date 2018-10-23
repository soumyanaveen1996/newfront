import React from 'react';
import { View, Image } from 'react-native';
import styles from './styles';

const TabIcon = ({ selected, imageSource }) => {
    return (
        <View>
            <Image source={imageSource} />
        </View>
    );
};

export default TabIcon;
