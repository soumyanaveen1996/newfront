import React from 'react';
import { View, ActivityIndicator, Image } from 'react-native';
import ImageCache from '../../lib/image_cache';
import Auth from '../../lib/capability/Auth';
import utils from '../../lib/utils';
import styles from './styles';
import ImageLoad from 'react-native-image-placeholder';
import moment from 'moment';

export default class ProfileImage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loaded: false,
            style: {
                width: 30,
                height: 30,
                borderRadius: 30 / 2
            }
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
                        style: this.props.placeholderStyle,
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

    shouldComponentUpdate(nextProps, nextState) {
        return nextState.source !== this.state.source;
    }
    componentWillUnmount() {
        this.mounted = false;
        const uri = this.getUri();
        ImageCache.imageCacheManager.unsubscribe(uri, this);
    }

    imageDownloaded(path) {
        if (!this.mounted) {
            return;
        }
        if (path) {
            this.setState({
                source: { uri: path },
                style: this.props.placeholderStyle,
                loaded: true
            });
        } else {
            this.setState({
                source: this.props.placeholder,
                style: this.props.placeholderStyle,
                loaded: true
            });
        }
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
        // console.log(this.state.source ? this.state.source.uri : 'Empty');
        const bRadius = this.state.style.width / 2;

        return (
            <View>
                <ImageLoad
                    style={this.state.style}
                    resizeMode={this.props.resizeMode}
                    source={this.state.source}
                    isShowActivity={false}
                    placeholderStyle={this.state.style}
                    borderRadius={bRadius}
                    placeholderSource={require('../../images/avatar-icon-placeholder/Default_Image_Thumbnail.png')}
                />
                {/* <Image
                    source={this.state.source}
                    resizeMode={this.props.resizeMode}
                    style={this.state.style}
                    onLoad={this.onLoad}
                /> */}
                {/* {!this.state.loaded && !this.state.source && (
                    <View style={styles.loading}>
                        <ActivityIndicator size="small" />
                    </View>
                )} */}
            </View>
        );
    }

    // onLoad = () => {
    //     if (this.mounted) {
    //         this.setState(() => ({ loaded: true }));
    //     }
    // };
}
