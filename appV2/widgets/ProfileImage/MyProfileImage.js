import React from 'react';
import { View, ActivityIndicator, Image, Platform } from 'react-native';
import moment from 'moment';
import ImageCache from '../../lib/image_cache';
import Auth from '../../lib/capability/Auth';
import utils from '../../lib/utils';
import styles from './styles';

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
        if (this.props.uuid) return utils.userProfileUrl(this.props.uuid);
        return null;
    }

    componentDidUpdate(prevProps) {
        if (
            prevProps.imageRefreshKey !== this.props.imageRefreshKey ||
            prevProps.uuid !== this.props.uuid
        ) {
            this.refreshImage();
        }
    }

    componentDidMount() {
        this.refreshImage();
    }

    refreshImage = async () => {
        this.mounted = true;
        this.setState({ loaded: false, source: this.props.placeholder });
        const user = Auth.getUserData();
        if (!user) {
            return;
        }
        const uri = this.getUri();
        if (uri && this.isRemoteUri(uri)) {
            const headers = utils.s3DownloadHeaders(uri, user) || undefined;
            const path = await this.getImagePathFromCache(uri);
            if (path) {
                if (this.mounted) {
                    this.setState({
                        source: {
                            uri:
                                Platform.OS === 'ios'
                                    ? path
                                    : `${path}?random=${Math.random()
                                          .toString(36)
                                          .substring(7)}`
                        },
                        style: this.props.style,
                        loaded: true
                    });
                }
                ImageCache.imageCacheManager.checkAndUpdateIfModified(
                    uri,
                    this,
                    headers
                );
            } else if (
                !ImageCache.imageCacheManager.isLastCheckedWithinThreshold(uri)
            ) {
                ImageCache.imageCacheManager.fetch(uri, this, headers);
            } else if (this.mounted) {
                this.setState({
                    source: this.props.placeholder,
                    style: this.props.placeholderStyle,
                    loaded: true
                });
            }
        } else {
            this.setState({ loaded: true });
        }
    };

    componentWillUnmount() {
        this.mounted = false;
        const uri = this.getUri();
        ImageCache.imageCacheManager.unsubscribe(uri, this);
    }

    isRemoteUri(uri) {
        const pattern = /^((http|https):\/\/)/;
        return pattern.test(uri);
    }

    async getImagePathFromCache(uri) {
        const path = await ImageCache.imageCacheManager.getImagePathFromCache(
            uri
        );
        return path;
    }

    imageDownloaded = (path) => {
        console.log('+++imageDownloaded', path);
        if (!this.mounted) {
            return;
        }
        if (path) {
            this.setState(
                {
                    source: this.props.placeholder,
                    style: this.props.style,
                    loaded: false
                },
                () => {
                    this.setState({
                        source: {
                            uri:
                                Platform.OS === 'ios'
                                    ? path
                                    : `${path}?random=${Math.random()
                                          .toString(36)
                                          .substring(7)}`
                        },
                        style: this.props.style,
                        loaded: true
                    });
                }
            );
        } else {
            this.setState({
                source: this.props.placeholder,
                style: this.props.style,
                loaded: true
            });
        }
    };

    render() {
        return (
            <View>
                {this.state.loaded ? (
                    <Image
                        source={this.state.source}
                        style={this.state.style}
                        resizeMode={this.props.resizeMode}
                    />
                ) : (
                    <ActivityIndicator style={this.state.style} size="small" />
                )}
            </View>
        );
    }
}
