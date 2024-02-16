import React from 'react';
import { View, Image, Platform, Text, StyleSheet } from 'react-native';
import ImageCache from '../../lib/image_cache';
import Auth from '../../lib/capability/Auth';
import utils from '../../lib/utils';
import { connect } from 'react-redux';
import { otherUserProfileUpdated } from '../../redux/actions/BotActions';
import GlobalColors from '../../config/styles';
import { getInitialsForName } from '../../lib/utils/TextFormatter';
import { getrandomizedColor } from '../../lib/utils/ChatUtils';
import AppFonts from '../../config/fontConfig';

class ProfileImage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loaded: false,
            source: this.props.placeholder,
            style: this.props.placeholderStyle,
            showInitials: this.props.userName ? true : false
        };
        this.nameColor = getrandomizedColor(this.props.uuid);
    }

    getUri() {
        if (this.props.thumb) {
            return utils.userProfileUrlThumbnailImage(this.props.uuid); // when backend fix the issue
        }
        return utils.userProfileUrl(this.props.uuid);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.uuid !== this.props.uuid) {
            this.refreshImage();
        }

        // eslint-disable-next-line max-len
        if (
            prevProps.botReduxData &&
            prevProps.botReduxData.isOtherUserProfileUpdated !==
                this.props.botReduxData &&
            this.props.botReduxData.isOtherUserProfileUpdated &&
            this.props.botReduxData.isOtherUserProfileUpdated
        ) {
            this.refreshImage();

            this.props.otherUserProfileUpdated(false);
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (nextProps.uuid !== this.props.uuid) {
            return true;
        }
        if (nextState.source?.uri !== this.state.source?.uri) {
            return true;
        }
        return false;
    }

    componentDidMount() {
        this.refreshImage();
    }

    refreshImage = async () => {
        if (this.props.uuid === null || this.props.uuid === undefined) return;
        this.mounted = true;
        const user = Auth.getUserData();
        if (!user) {
            return;
        }
        const uri = this.getUri();

        const headers = utils.s3DownloadHeaders(uri, user) || undefined;
        if (uri && this.isRemoteUri(uri)) {
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
                        loaded: true,
                        showInitials: false
                    });
                }
                await ImageCache.imageCacheManager.checkAndUpdateIfModified(
                    uri,
                    this,
                    headers
                );
            } else if (
                !ImageCache.imageCacheManager.isLastCheckedWithinThreshold(uri)
            ) {
                ImageCache.imageCacheManager.fetch(uri, this, headers);
                this.setState({
                    source: this.props.placeholder,
                    style: this.props.placeholderStyle,
                    loaded: true,
                    showInitials: true
                });
            } else if (this.mounted) {
                if (!path) {
                    await ImageCache.imageCacheManager.checkAndUpdateIfModified(
                        uri,
                        this,
                        headers
                    );
                    await ImageCache.imageCacheManager.fetch(
                        uri,
                        this,
                        headers
                    );
                }
                this.setState({
                    source: this.props.placeholder,
                    showInitials: true,
                    style: this.props.placeholderStyle,
                    loaded: true
                });
            } else {
                this.setState({
                    source: this.props.placeholder,
                    style: this.props.placeholderStyle,
                    showInitials: true,
                    loaded: true
                });
            }
        } else {
            this.setState({
                source: this.props.placeholder,
                style: this.props.placeholderStyle,
                showInitials: true,
                loaded: true
            });
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
        if (!this.mounted) {
            return;
        }
        if (path) {
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
                showInitials: false,
                loaded: true
            });
        } else {
            this.setState({
                source: this.props.placeholder,
                style: this.props.placeholderStyle,
                loaded: true,
                showInitials: true
            });
        }
    };

    setError = () => {
        ImageCache.imageCacheManager.removeFromCache(this.getUri());
        this.setState({ showInitials: true });
    };

    render() {
        return (
            <View>
                {this.state.showInitials ? (
                    <View
                        style={[
                            this.state.style,
                            styles.textContainer,
                            {
                                backgroundColor: this.nameColor
                            }
                        ]}
                    >
                        <Text
                            style={[
                                styles.initials,
                                this.props.textSize && {
                                    fontSize: this.props.textSize
                                }
                            ]}
                        >
                            {getInitialsForName(this.props.userName)}
                        </Text>
                    </View>
                ) : (
                    <Image
                        onError={this.setError}
                        key={
                            this.state.source?.uri
                                ? this.state.source.uri
                                : this.props.uuid
                        }
                        source={this.state.source}
                        style={this.state.style}
                        resizeMode={this.props.resizeMode}
                    />
                )}
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    botReduxData: state.bots
});

const mapDispatchToProps = (dispatch) => ({
    otherUserProfileUpdated: (payload) =>
        dispatch(otherUserProfileUpdated(payload))
});

export default connect(mapStateToProps, mapDispatchToProps, null, {
    forwardRef: true
})(ProfileImage);

const styles = StyleSheet.create({
    initials: {
        color: GlobalColors.white,
        fontSize: 18,
        fontWeight: AppFonts.BOLD
    },
    textContainer: {
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center'
    }
});
