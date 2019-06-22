import React from 'react';
import { View, ActivityIndicator, Image } from 'react-native';
import ImageCache from '../../lib/image_cache';
import Auth from '../../lib/capability/Auth';
import utils from '../../lib/utils';
import styles from './styles';
import moment from 'moment';

export default class ProfileImage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loaded: false,
            source: this.props.placeholder,
            style: this.props.placeholderStyle
        };
    }

    getUri() {
        return utils.userProfileUrl(this.props.uuid);
    }

    async componentDidMount() {
        this.mounted = true;
        const user = await Auth.getUser();
        if (!user) {
            return;
        }
        let uri = this.getUri();
        let headers = utils.s3DownloadHeaders(uri, user) || undefined;
        if (uri && this.isRemoteUri(uri)) {
            let path = await this.getImagePathFromCache(uri);
            if (path) {
                if (this.mounted) {
                    this.setState({
                        source: { uri: path },
                        style: this.props.style,
                        loaded: true
                    });
                }
                ImageCache.imageCacheManager.checkAndUpdateIfModified(
                    uri,
                    this,
                    headers
                );
            } else {
                if (
                    !ImageCache.imageCacheManager.isLastCheckedWithinThreshold(
                        uri
                    )
                ) {
                    ImageCache.imageCacheManager.fetch(uri, this, headers);
                } else {
                    if (this.mounted) {
                        this.setState({
                            source: this.props.placeholder,
                            style: this.props.placeholderStyle,
                            loaded: true
                        });
                    }
                }
            }
        }
    }

    componentWillUnmount() {
        this.mounted = false;
        const uri = this.getUri();
        ImageCache.imageCacheManager.unsubscribe(uri, this);
    }

    isRemoteUri(uri) {
        var pattern = /^((http|https):\/\/)/;
        return pattern.test(uri);
    }

    async getImagePathFromCache(uri) {
        const path = await ImageCache.imageCacheManager.getImagePathFromCache(
            uri
        );
        return path;
    }

    render() {
        // console.log('image url timeline', this.state.source);

        return (
            <View>
                <Image
                    source={this.state.source}
                    style={this.state.style}
                    resizeMode={this.props.resizeMode}
                />
            </View>
        );
    }
}
