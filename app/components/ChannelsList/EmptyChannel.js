import React from 'react';
import { View, Text, Image } from 'react-native';
import images from '../../config/images';

export default class EmptyChannel extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <View
                style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <Image
                    style={{ marginBottom: 45, width: 200 }}
                    source={images.empty_channel}
                />
                <View
                    style={{
                        width: 200,
                        fontSize: 14,
                        fontWeight: '100',
                        fontFamily: 'SF Pro Text Thin',
                        textAlign: 'center',
                        alignItems: 'center'
                    }}
                >
                    <Text
                        style={{ textAlign: 'center', alignSelf: 'center' }}
                        numberOfLines={3}
                    >
                        You are not subscribed to any channel. Search or create
                        a new one.
                    </Text>
                </View>
            </View>
        );
    }
}
