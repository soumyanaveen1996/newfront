import React from 'react';
import { Image } from 'react-native';
import images from '../../../config/images';

export default class CenterComponent extends React.Component {
    render() {
        return <Image source={images.frontm_header_logo} />;
    }
}
