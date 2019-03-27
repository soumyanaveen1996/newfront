import React from 'react';
import { View, Text, Image } from 'react-native';
import styles from './styles';
import images from '../../config/images';
import { BackgroundImage } from '../BackgroundImage';

export default class EmptyContact extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <BackgroundImage style={{ flex: 1 }}>
                <View
                    style={{
                        flex: 1,
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <Image
                        style={{ marginBottom: 45, width: 200 }}
                        source={images.empty_contact}
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
                            numberOfLines={2}
                        >
                            You have no contacts yet.
                        </Text>
                    </View>
                </View>
            </BackgroundImage>
        );
    }
}
