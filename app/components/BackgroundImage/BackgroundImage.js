import React, { Component } from 'react';
import { ImageBackground } from 'react-native';
import images from '../../images';
import styles from './styles';

class BackgroundImage extends Component {
    render() {
        return (
            <ImageBackground
                resizeMode="cover"
                style={styles.backgroundImage}
                source={images.backgroundImage}
            >
                {this.props.children}
            </ImageBackground>
        );
    }
}

export default BackgroundImage;
