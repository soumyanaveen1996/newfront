import React from 'react';
import { Image, Platform } from 'react-native';
import images from '../../../config/images';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp
} from 'react-native-responsive-screen';

export default class CenterComponent extends React.Component {
    render() {
        return (
            <Image
                style={
                    Platform.OS === 'android' ? { marginLeft: wp('20%') } : null
                }
                source={images.frontm_header_logo}
            />
        );
    }
}
