import React from 'react';
import { Text, Image, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import styles, {
    chatMessageImageStyle,
    tapToLoadTextContainerStyle
} from './styles';
import I18n from '../../config/i18n/i18n';
import ImageCache from '../../lib/image_cache';


const TapToLoadImageStates = {
    UNINITIALIZED: 'UNINITIALIZED',
    TAP_TO_LOAD_IMAGE: 'TAP_TO_LOAD_IMAGE',
    TAPPED: 'TAPPED',
    IMAGE_DOWNLOADED: 'IMAGE_DOWNLOADED'
}


export class AndroidHackImage extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        if (nextProps.uri === this.props.uri &&
            nextProps.alignRight === this.props.alignRight) {
            return false;
        }
        return true;
    }

    render() {
        const key = Math.random();
        const uri = Platform.OS === 'android' ? `${this.props.uri}#r=${key}` : this.props.uri;
        return <Image
            style={chatMessageImageStyle(this.props.alignRight)}
            source={{ uri: uri }} />
    }
}

export default class TapToLoadImage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            state: TapToLoadImageStates.UNINITIALIZED
        };
    }

    async componentDidMount() {
        const { uri } = this.props.source;
        let path = await this.getImagePathFromCache(uri);
        if (path) {
            this.setState({
                state: TapToLoadImageStates.IMAGE_DOWNLOADED,
                path: path,
            })
        } else {
            this.setState({
                state: TapToLoadImageStates.TAP_TO_LOAD_IMAGE,
            });
        }
    }

    componentWillUnmount() {
        const { uri } = this.props.source;
        ImageCache.imageCacheManager.unsubscribe(uri, this);
    }

    imageDownloaded(path) {
        this.setState({
            state: TapToLoadImageStates.IMAGE_DOWNLOADED,
            path: path,
        });
    }

    isRemoteUri(uri) {
        var pattern = /^((http|https):\/\/)/;
        return pattern.test(uri)
    }

    onImagePress() {
        if (this.props.onImagePress) {
            this.props.onImagePress();
        }
    }

    onImageLoadTap() {
        this.setState({ state: TapToLoadImageStates.TAPPED });
        const { uri, headers } = this.props.source;
        ImageCache.imageCacheManager.fetch(uri, this, headers);
    }

    async getImagePathFromCache(uri) {
        return ImageCache.imageCacheManager.getImagePathFromCache(uri);
    }

    renderLocalFile(uri) {
        return (
            <TouchableOpacity onPress={this.onImagePress.bind(this)}>
                <AndroidHackImage alignRight={this.props.alignRight} uri={uri} />
            </TouchableOpacity>
        );
    }

    render() {
        const { uri } = this.props.source;
        if (!this.isRemoteUri(uri)) {
            return this.renderLocalFile(uri);
        }

        if (this.state.state === TapToLoadImageStates.UNINITIALIZED) {
            return <TouchableOpacity style={tapToLoadTextContainerStyle(this.props.alignRight)} />
        } else if (this.state.state === TapToLoadImageStates.TAP_TO_LOAD_IMAGE) {
            return (
                <TouchableOpacity style={tapToLoadTextContainerStyle(this.props.alignRight)}
                    onPress={this.onImageLoadTap.bind(this)}>
                    <Text style={styles.tapToLoadText}>{I18n.t('Tap_To_Load')}</Text>
                </TouchableOpacity>
            );
        } else if (this.state.state === TapToLoadImageStates.TAPPED) {
            return (
                <TouchableOpacity style={tapToLoadTextContainerStyle(this.props.alignRight)}
                    onPress={this.onImageLoadTap.bind(this)}>
                    <ActivityIndicator size="small" />
                </TouchableOpacity>
            );
        } else {
            return this.renderLocalFile(this.state.path);
        }
    }
}
