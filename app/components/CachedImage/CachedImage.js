import React from 'react';
import ImageCache from '../../lib/image_cache';
import LogoImage from '../LogoImage';
import {Platform} from "react-native";


const CachedImageStates = {
    IMAGE_NOT_LOADED: 'IMAGE_NOT_LOADED',
    LOADING: 'LOADING',
    IMAGE_LOADED: 'IMAGE_LOADED'
}

export default class CachedImage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            state: CachedImageStates.IMAGE_NOT_LOADED
        };
    }

    async componentDidMount() {
        const { uri, headers } = this.props.source;
        if (uri && this.isRemoteUri(uri)) {
            let path = await this.getImagePathFromCache(uri);
            if (path) {
                this.setState({
                    state: CachedImageStates.IMAGE_LOADED,
                    source: { uri: path },
                })
            } else {
                this.setState({
                    state: CachedImageStates.LOADING,
                    source: this.props.placeholderSource,
                });
                ImageCache.imageCacheManager.fetch(uri, this, headers);
            }
        } else {
            this.setState({
                state: CachedImageStates.IMAGE_LOADED,
                source: this.props.source
            });
        }
    }

    componentWillUnmount() {
        const { uri } = this.props.source;
        if (uri) {
            ImageCache.imageCacheManager.unsubscribe(uri, this);
        }
    }

    imageDownloaded(path) {
        this.setState({
            state: CachedImageStates.IMAGE_LOADED,
            source: { uri: path },
        });
    }

    isRemoteUri(uri) {
        var pattern = /^((http|https):\/\/)/;
        return pattern.test(uri)
    }

    async getImagePathFromCache(uri) {
        return ImageCache.imageCacheManager.getImagePathFromCache(uri);
    }

    render() {
        return (
            <LogoImage
                source={this.state.source}
                imageStyle={ this.props.style }
                loadingStyle={( Platform.OS === 'android') ? null : undefined}
            />
        )
    }
}
