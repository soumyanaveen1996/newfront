import React, { Component } from 'react';
import { Image, View, ActivityIndicator } from 'react-native';
import styles from './styles';

export default class LogoImage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loaded: false
        };
    }

    componentWillMount() {
        if (this.props.source) {
            this.setState({ loaded: true });
        }
    }

    render() {
        return (
            <View>
                <Image
                    source={this.props.source}
                    resizeMode={'contain'}
                    style={this.props.imageStyle}
                    onLoadEnd={this.onLoad}
                />
                {false && !this.state.loaded && (
                    <View
                        style={
                            this.props.loadingStyle === undefined
                                ? styles.loading
                                : this.props.loadingStyle
                        }
                    >
                        <ActivityIndicator size="small" />
                    </View>
                )}
            </View>
        );
    }

    onLoad = () => {
        if (!this.state.loaded) {
            this.setState(() => ({ loaded: true }));
        }
    };
}
