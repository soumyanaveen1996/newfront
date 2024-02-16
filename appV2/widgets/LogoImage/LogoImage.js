import React, { Component } from 'react';
import { Image, View, Text } from 'react-native';
import images from '../../images';

export default class LogoImage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loaded: false
        };
        this.renderCount = 0;
    }

    UNSAFE_componentWillMount() {
        if (this.props.source) {
            this.setState({ loaded: true });
        }
    }

    render() {
        const {
            placeholderSource,
            imageStyle,
            source,
            resizeMode,
            imagekey
        } = this.props;
        return (
            <Image
                key={imagekey}
                style={imageStyle}
                source={source}
                resizeMode={resizeMode || 'cover'}
                isShowActivity={false}
                defaultSource={placeholderSource || images.imageTumbnail}
            />
        );
    }
}
