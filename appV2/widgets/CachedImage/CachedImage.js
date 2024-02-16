import React from 'react';
import ImageCache from '../../lib/image_cache';
import LogoImage from '../LogoImage';
import { Platform } from 'react-native';

const CachedImageStates = {
    IMAGE_NOT_LOADED: 'IMAGE_NOT_LOADED',
    LOADING: 'LOADING',
    IMAGE_LOADED: 'IMAGE_LOADED'
};

export default class CachedImage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            state: CachedImageStates.IMAGE_NOT_LOADED,
            source: { uri: null }
        };
    }

    async componentDidMount() {
        this.loadImage();
    }

    async loadImage() {
        const { uri, headers } = this.props.source;
        if (uri && this.isRemoteUri(uri)) {
            let path = await this.getImagePathFromCache(uri);
            if (path) {
                this.setState({
                    state: CachedImageStates.IMAGE_LOADED,
                    source: { uri: path }
                });
                ImageCache.imageCacheManager.checkAndUpdateIfModified(
                    uri,
                    this,
                    headers
                );
            } else {
                this.setState({
                    state: CachedImageStates.LOADING,
                    source: this.props.placeholderSource
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

    shouldComponentUpdate(nextProps, nextState) {
        if (nextProps.source.uri !== this.props.source.uri) {
            this.loadImage();
            return true;
        }
        if (nextState.source?.uri !== this.state.source?.uri) {
            return true;
        }
        return false;
    }

    imageDownloaded(path) {
        if (path)
            this.setState({
                imageKey: Date.now() + path,
                state: CachedImageStates.IMAGE_LOADED,
                source: { uri: path }
            });
        else
            this.setState({
                source: this.props.placeholder,
                style: this.props.placeholderStyle,
                loaded: true
            });
    }

    isRemoteUri(uri) {
        var pattern = /^((http|https):\/\/)/;
        return pattern.test(uri);
    }

    async getImagePathFromCache(uri) {
        return ImageCache.imageCacheManager.getImagePathFromCache(uri);
    }

    render() {
        return (
            <LogoImage
                accessibilityLabel={'Cached Image ' + this.props.imageTag}
                testID={'cached-image-' + this.props.imageTag}
                source={this.state.source}
                imagekey={this.state.imageKey}
                imageStyle={this.props.style}
                placeholderSource={this.props.placeholderSource}
                resizeMode={this.props.resizeMode || 'contain'}
                borderRadius={this.props.borderRadius || 22}
            />
        );
    }
}
