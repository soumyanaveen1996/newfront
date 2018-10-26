import React from 'react';
import { View, Image, Text } from 'react-native';
import styles from './styles';

const TabIcon = ({ selected, imageSource, titleScreen }) => {
    console.log('in which tab ', titleScreen, selected);
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
