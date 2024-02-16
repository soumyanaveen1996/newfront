import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import GlobalColors from '../config/styles';

const SimpleLoader = (props) => {
    return (
        <ActivityIndicator
            color={GlobalColors.chatTitle}
            size="large"
            {...props}
        />
    );
};

export const FullScreenLoader = (props) => {
    return (
        <View
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                alignContent: 'center',
                justifyContent: 'center',
                backgroundColor: GlobalColors.translucentDark
            }}
        >
            <SimpleLoader {...props} />
        </View>
    );
};
export default SimpleLoader;
