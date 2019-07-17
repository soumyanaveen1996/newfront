import React from 'react';
import { View, ActivityIndicator, Image, Text } from 'react-native';
import ImageCache from '../../lib/image_cache';
import Auth from '../../lib/capability/Auth';
import utils from '../../lib/utils';
import styles from './styles';
import moment from 'moment';
import { connect } from 'react-redux';

class MyProfileImage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loaded: false
        };
    }

    getUri() {
        return utils.userProfileUrl(this.props.uuid);
    }

    async componentDidMount() {
        // console.log('In Profile Image: ', this.props.user.upload);
        // const uploadNumber = this.props.user.upload;
        this.mounted = true;
        const user = await Auth.getUser();
        if (!user) {
            return;
        }
        let uri = this.getUri();
        let headers = utils.s3DownloadHeaders(uri, user) || undefined;
        if (uri && this.isRemoteUri(uri)) {
            let path = await this.getImagePathFromCache(
                uri
                // uploadNumber > 0 ? `${uri}?u=${uploadNumber}` : uri
            );
            if (path) {
                if (this.mounted) {
                    this.setState({
                        source: {
                            // We will call like this to invaidate image cache and reload if image has changed
                            uri: `file://${path}?bust=${this.props.user.upload}`
                        },
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
                source: {
                    uri: `file://${path}?bust=${this.props.user.upload}`
                },
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
        console.log('profile image we will see', this.state.source);
        return (
            <View>
                <Image
                    source={this.state.source}
                    resizeMode={this.props.resizeMode}
                    style={this.state.style}
                    onLoad={this.onLoad}
                    cache="reload"
                />
                {!this.state.loaded && !this.state.source && (
                    <View style={styles.loading}>
                        <ActivityIndicator size="small" />
                    </View>
                )}
            </View>
        );
    }

    onLoad = () => {
        if (this.mounted) {
            this.setState(() => ({ loaded: true }));
        }
    };
}

const mapStateToProps = state => ({
    user: state.user
});

const mapDispatchToProps = dispatch => {
    return {};
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(MyProfileImage);
