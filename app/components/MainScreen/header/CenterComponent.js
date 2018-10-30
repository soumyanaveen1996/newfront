import React from 'react';
import { Image, Platform } from 'react-native';
import images from '../../../config/images';

export default class CenterComponent extends React.Component {
    render() {
        return (
            <Image
                style={Platform.OS === 'android' ? { marginLeft: 30 } : null}
                source={images.frontm_header_logo}
            />
        );
    }
}
