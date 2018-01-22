import React from 'react';
import { Image, TouchableOpacity } from 'react-native';
import styles, {
    chatMessageImageStyle,
} from './styles';
import ImageCache from '../../lib/image_cache';


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
        ImageCache.imageCacheManager.unsubscribe(uri, this);
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

    renderLocalFile(uri) {
        return (
            <TouchableOpacity onPress={this.onImagePress.bind(this)}>
                <Image
                    style={chatMessageImageStyle(this.props.alignRight)}
                    source={{ uri: uri }} />
            </TouchableOpacity>
        );
    }

    render() {
        return (
            <Image source={this.state.source} style={this.props.style} resizeMode={this.props.resizeMode} />
        )
    }
}
