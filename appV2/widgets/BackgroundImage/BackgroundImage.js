import React, { Component } from 'react';
import { ImageBackground } from 'react-native';
import styles from './styles';

//TOD0: is this required, not having any image. just container
class BackgroundImage extends Component {
    render() {
        return (
            <ImageBackground resizeMode="cover" style={styles.backgroundImage}>
                {this.props.children}
            </ImageBackground>
        );
    }
}

export default BackgroundImage;
