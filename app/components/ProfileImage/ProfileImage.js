import React from 'react';
import { Image } from 'react-native';
import ImageCache from '../../lib/image_cache';
import Auth from '../../lib/capability/Auth';
import utils from '../../lib/utils';

const ProfileImageStates = {
    IMAGE_NOT_LOADED: 'IMAGE_NOT_LOADED',
    LOADING_USER_PROFILE: 'IMAGE_LOADED_FROM_CACHE',
    LOADED_DEFAULT_PROFILE_IMAGE: 'LOADED_DEFAULT_PROFILE_IMAGE',
    LOADED_USER_PROFILE: 'LOADED_USER_PROFILE'
}

export default class ProfileImage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            state: ProfileImageStates.IMAGE_NOT_LOADED,
            source: props.placeholder,
            style: this.props.placeholderStyle,
        };
    }

    getUri() {
        return utils.userProfileUrl(this.props.uuid);
    }

    async componentDidMount() {
        const user = await Auth.getUser();
        if (!user) {
            return;
        }
        let uri = this.getUri();
        let headers = utils.s3DownloadHeaders(uri, user) || undefined;
        if (uri && this.isRemoteUri(uri)) {
            let path = await this.getImagePathFromCache(uri);
            if (path) {
                this.setState({
                    state: ProfileImageStates.IMAGE_LOADED_FROM_CACHE,
                    source: { uri: path }
                })
                ImageCache.imageCacheManager.checkAndUpdateIfModified(uri, this, headers);
            } else {
                this.setState({
                    state: ProfileImageStates.LOADED_DEFAULT_PROFILE_IMAGE,
                    source: this.props.placeholder,
                    style: this.props.placeholderStyle,
                });
                ImageCache.imageCacheManager.fetch(uri, this, headers);
            }
        } else {
            this.setState({
                state: ProfileImageStates.LOADED_DEFAULT_PROFILE_IMAGE,
                source: this.props.placeholder,
                style: this.props.placeholderStyle,
            });
        }
    }

    componentWillUnmount() {
        const uri = this.getUri();
        ImageCache.imageCacheManager.unsubscribe(uri, this);
    }

    imageDownloaded(path) {
        this.setState({
            state: ProfileImageStates.LOADED_USER_PROFILE,
            source: { uri: path },
            style: this.props.placeholderStyle
        });
    }

    isRemoteUri(uri) {
        var pattern = /^((http|https):\/\/)/;
        return pattern.test(uri)
    }

    async getImagePathFromCache(uri) {
        const path = await ImageCache.imageCacheManager.getImagePathFromCache(uri);
        return path;
    }

    render() {
        return (
            <Image source={this.state.source} style={this.state.style} resizeMode={this.props.resizeMode} />
        )
    }
}
