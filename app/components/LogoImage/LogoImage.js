import React, { Component } from 'react';
import { Image, View, ActivityIndicator } from 'react-native';

export default class LogoImage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            loaded: false
        };
    }

    render() {
        return (
            <View>
                <Image
                    source={this.props.source}
                    resizeMode={'contain'}
                    style={this.props.imageStyle}
                    onLoad={this.onLoad} />
                {!this.state.loaded &&
                <View style={this.props.loadingStyle}>
                    <ActivityIndicator size="small" />
                </View>
                }
            </View>
        )
    }

    onLoad = () => {
        this.setState(() => ({ loaded: true }))
    }
}