import React from 'react';
import {
    Text,
    Image,
    View,
    TouchableHighlight,
    TouchableOpacity
} from 'react-native';
import styles from './styles';
import {
    chatMessageBubbleStyle,
    chatMessageContainerStyle,
    chatMessageTextStyle,
    metadataContainerStyle,
    talkIconSign,
    chatMessageStyle,
    ellipsisMessageBubbleStyle,
    videoContainerStyle,
    buttonStyle,
    buttonTextStyle
} from './styles';
import { MessageTypeConstants } from '../../lib/capability';
import utils from '../../lib/utils';
import AudioPlayer from '../AudioPlayer';
import CachedImage from '../CachedImage';
import ProfileImage from '../ProfileImage';
import { Actions } from 'react-native-router-flux';
import { MessageHandler } from '../../lib/message';
import TapToLoadImage from './TapToLoadImage';
import VideoPlayer from 'react-native-video-player';
import Images from '../../config/images';
import I18n from '../../config/i18n/i18n';
import { ContactsCache } from '../../lib/ContactsCache';
import { DotIndicator } from 'react-native-indicators';
import _ from 'lodash';
import Hyperlink from 'react-native-hyperlink';
import { Icons } from '../../config/icons';

export default class ChatMessage extends React.Component {
    constructor(props) {
        super(props);
        let { message } = this.props;
        this.state = {
            read: message.isRead(),
            isFavorite: message.isFavorite()
        };
    }

    image() {
        let { message, isUserChat, alignRight } = this.props;
        if (!alignRight) {
            if (message.getCreatedBy() && isUserChat) {
                return (
                    <ProfileImage
                        uuid={message.getCreatedBy()}
                        placeholder={Images.user_image}
                        style={styles.profilePic}
                        placeholderStyle={styles.placeholderProfilePic}
                        resizeMode="cover"
                    />
                );
            } else {
                return (
                    <CachedImage
                        imageTag="profileImage"
                        source={this.props.imageSource}
                        style={styles.profilePic}
                    />
                );
            }
        }
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    async componentDidMount() {
        this.mounted = true;
        let { message } = this.props;

        if (
            !message.isRead() &&
            message.getMessageType() === MessageTypeConstants.MESSAGE_TYPE_FORM
        ) {
            this.openForm(message);
        }
        MessageHandler.markBotMessageAsRead(
            message.getBotKey(),
            message.getMessageId()
        )
            .then(success => {
                if (this.mounted) {
                    this.setState({ read: success });
                }
            })
            .catch(err => {
                console.log('Error Marking message as read : ', err);
            });
    }

    onImagePress(headers) {
        const { message } = this.props;
        Actions.imageViewer({ uri: message.getMessage(), headers: headers });
    }

    wrapBetweenFavAndTalk(message, component) {
        var favMsgIcon = message.isFavorite()
            ? 'favMsgSelectedIcon'
            : 'favMsgUnSelectedIcon';
        var favIcon = (
            <TouchableHighlight
                underlayColor="white"
                style={[
                    this.props.alignRight
                        ? { alignItems: 'flex-end' }
                        : { alignItems: 'flex-start' },
                    styles.favIcon
                ]}
                onPress={this.favoriteIconClicked.bind(this)}
            >
                <Image
                    source={{ uri: favMsgIcon }}
                    style={styles.favIconImage}
                />
            </TouchableHighlight>
        );

        if (this.props.hideFavoriteIcon === false) {
            favIcon = null;
        }
        // TODO: Remove this, after fav icon gets live.
        favIcon = null;

        var talkSign = <View style={talkIconSign(this.props.alignRight)} />;

        return (
            <View style={[chatMessageStyle(this.props.alignRight)]}>
                {this.props.alignRight ? favIcon : talkSign}
                {component}
                {this.props.alignRight ? talkSign : favIcon}
            </View>
        );
    }

    renderImageMessage(message) {
        const url = message.getMessage();
        let headers =
            utils.s3DownloadHeaders(url, this.props.user) || undefined;
        const imageComponent = (
            <TapToLoadImage
                alignRight={this.props.alignRight}
                source={{ uri: url, headers: headers }}
                onImagePress={this.onImagePress.bind(this, headers)}
            />
        );
        const component = this.wrapWithTitle(imageComponent);
        return this.wrapBetweenFavAndTalk(message, component);
    }

    renderVideoMessage(message) {
        const url = message.getMessage();
        let headers =
            utils.s3DownloadHeaders(url, this.props.user) || undefined;

        // http://techslides.com/demos/sample-videos/small.mp4
        const component = (
            <View style={videoContainerStyle(this.props.alignRight)}>
                <VideoPlayer
                    video={{ uri: url, headers: headers }}
                    headers={headers}
                    videoWidth={300}
                    videoHeight={300}
                    autoplay={false}
                    loop={false}
                    onLoad={() => console.log('AmalVideo: File loaded')}
                    onLoadStart={() =>
                        console.log('AmalVideo: File load started')
                    }
                />
            </View>
        );

        /*
        const component = (
            <View style={videoContainerStyle(this.props.alignRight)}>
                <Video
                    source={{ uri: url, headers: headers }}
                    style={{width: 150, height: 150}}
                    muted={false}
                    videoWidth={300}
                    videoHeight={300}
                    autoplay={false}
                    loop={false}
                />
            </View>
        ); */

        return this.wrapBetweenFavAndTalk(message, component);
    }

    renderAudioMessage(message) {
        const url = message.getMessage();
        let headers =
            utils.s3DownloadHeaders(url, this.props.user) || undefined;

        const audioStyle = {
            ...chatMessageBubbleStyle(
                this.props.alignRight,
                this.props.imageSource
            ),
            backgroundColor: 'rgba(0, 167, 214, 1)',
            borderRadius: 12
        };
        const component = (
            <View style={audioStyle}>
                <AudioPlayer audioSource={{ uri: url, headers: headers }} />
            </View>
        );

        return this.wrapBetweenFavAndTalk(message, component);
    }

    favoriteIconClicked() {
        let { message } = this.props;

        MessageHandler.toggleFavorite(
            message.getBotKey(),
            message.getMessageId(),
            !message.isFavorite()
        )
            .then(success => {
                message.setFavorite(!message.isFavorite());
                this.setState({
                    isFavorite: message.isFavorite()
                });
            })
            .catch(err => {
                console.log(err);
            });
    }

    wrapWithTitle(component) {
        let { message, shouldShowUserName } = this.props;
        //console.log(shouldShowUserName, message.isMessageByBot())
        if (shouldShowUserName && message.getCreatedBy()) {
            let user = ContactsCache.getUserDetails(message.getCreatedBy());
            return (
                <View style={{ flexDirection: 'column' }}>
                    <Text style={styles.userNameStyle}>
                        {user ? user.userName : I18n.t('Unknown')}
                    </Text>
                    {component}
                </View>
            );
        } else {
            return component;
        }
    }

    renderStdNotification(message) {
        return <Text>{message.getDisplayMessage()}</Text>;
    }
    renderCriticalNotification(message) {}
    renderMessage() {
        let { message } = this.props;

        if (
            message.getMessageType() ===
                MessageTypeConstants.MESSAGE_TYPE_STRING ||
            message.getMessageType() ===
                MessageTypeConstants.MESSAGE_TYPE_SLIDER_RESPONSE ||
            message.getMessageType() ===
                MessageTypeConstants.MESSAGE_TYPE_BARCODE ||
            message.getMessageType() ===
                MessageTypeConstants.MESSAGE_TYPE_BUTTON_RESPONSE
        ) {
            if (!message.getDisplayMessage()) {
                return null;
            }

            const textComponent = (
                <Hyperlink
                    linkDefault={true}
                    linkStyle={{ textDecorationLine: 'underline' }}
                >
                    <View style={{ display: 'flex', flexDirection: 'row' }}>
                        <Text
                            style={chatMessageTextStyle(this.props.alignRight)}
                        >
                            {message.getDisplayMessage()}
                        </Text>
                        {message.getStatus() == 1 ? (
                            <View
                                style={{
                                    paddingLeft: 10,
                                    opacity: 0.7,
                                    alignSelf: 'flex-end'
                                }}
                            >
                                {Icons.delivered()}
                            </View>
                        ) : (
                            <Text />
                        )}
                    </View>
                </Hyperlink>
            );
            const component = (
                <View
                    style={chatMessageBubbleStyle(
                        this.props.alignRight,
                        this.props.imageSource
                    )}
                >
                    {this.wrapWithTitle(textComponent)}
                </View>
            );
            return this.wrapBetweenFavAndTalk(message, component);
        } else if (
            message.getMessageType() ===
            MessageTypeConstants.MESSAGE_TYPE_STD_NOTIFICATION
        ) {
            return this.renderStdNotification(message);
        } else if (
            message.getMessageType() === MessageTypeConstants.MESSAGE_TYPE_IMAGE
        ) {
            return this.renderImageMessage(message);
        } else if (
            message.getMessageType() === MessageTypeConstants.MESSAGE_TYPE_VIDEO
        ) {
            return this.renderVideoMessage(message);
        } else if (
            message.getMessageType() ===
            MessageTypeConstants.MESSAGE_TYPE_BUTTON
        ) {
            var buttons = [];
            for (var i = 0; i < message.getMessage().length; i++) {
                buttons.push(
                    <View style={styles.buttonMsgParent} key={i}>
                        <TouchableOpacity
                            underlayColor="white"
                            onPress={this.buttonResponseOnPress.bind(
                                this,
                                i,
                                message.getMessage()[i]
                            )}
                            style={buttonStyle(message.getMessage()[i].style)}
                        >
                            <Text
                                style={buttonTextStyle(
                                    message.getMessage()[i].style
                                )}
                            >
                                {message.getMessage()[i].title}
                            </Text>
                        </TouchableOpacity>
                    </View>
                );
            }

            const component = (
                <View style={{ flexDirection: 'column', width: '70%' }}>
                    {buttons}
                </View>
            );
            return component;
        } else if (
            message.getMessageType() === MessageTypeConstants.MESSAGE_TYPE_FORM
        ) {
            const component = (
                <View style={styles.formButtonWrapper} key={i}>
                    <TouchableOpacity
                        onPress={this.openForm.bind(this, message)}
                        style={styles.formButton}
                    >
                        <Text style={styles.formButtonText}>
                            {message.isCompleted()
                                ? I18n.t('View_form')
                                : I18n.t('Fill_form')}
                        </Text>
                    </TouchableOpacity>
                </View>
            );
            return this.wrapBetweenFavAndTalk(message, component);
        } else if (
            message.getMessageType() === MessageTypeConstants.MESSAGE_TYPE_HTML
        ) {
            const component = (
                <View style={{ flexDirection: 'column' }}>
                    <TouchableHighlight
                        underlayColor="white"
                        onPress={this.htmlResponseOnPress.bind(
                            this,
                            message.getMessage()
                        )}
                        style={styles.buttonMessage}
                    >
                        <Text>{message.getMessage().actionText}</Text>
                    </TouchableHighlight>
                </View>
            );
            return this.wrapBetweenFavAndTalk(message, component);
        } else if (
            message.getMessageType() === MessageTypeConstants.MESSAGE_TYPE_WAIT
        ) {
            const component = (
                <View
                    style={ellipsisMessageBubbleStyle(
                        this.props.alignRight,
                        this.props.imageSource
                    )}
                >
                    <DotIndicator
                        style={{ backgroundColor: 'rgba(255,255,255,1)' }}
                        color="rgba(0,0,0,0.4)"
                        size={8}
                        count={3}
                    />
                </View>
            );
            return this.wrapBetweenFavAndTalk(message, component);
        } else if (
            message.getMessageType() === MessageTypeConstants.MESSAGE_TYPE_AUDIO
        ) {
            return this.renderAudioMessage(message);
        }
    }

    openForm(message) {
        const formMessage = message.getMessage();
        this.onFormOpen(formMessage);
        Actions.form({
            formData: formMessage,
            onFormSubmit: this.onFormSubmit.bind(this),
            onFormCancel: this.onFormCancel.bind(this),
            editable: !message.isCompleted()
        });
    }

    onFormOpen(formMessage) {
        if (this.props.onFormOpen) {
            this.props.onFormOpen(formMessage);
        }
    }

    onFormCancel(items) {
        let { message } = this.props;
        if (this.props.onFormCancel) {
            this.props.onFormCancel(message.getMessage());
        }
    }

    onFormSubmit(items) {
        let { message } = this.props;
        this.props.onFormCTAClick(items, message);
    }

    htmlResponseOnPress(htmlText) {
        Actions.webview({ htmlString: htmlText.htmlMsg });
    }

    buttonResponseOnPress(index, item) {
        this.props.onDoneBtnClick(item);
    }

    renderMetadata() {
        let { message, alignRight } = this.props;
        return (
            <View
                style={[
                    metadataContainerStyle(alignRight, !!this.props.imageSource)
                ]}
            >
                <Text style={[styles.date, styles.dataNoMargin]}>
                    {utils.formattedDate(message.getMessageDate())}
                </Text>
            </View>
        );
    }

    onLayout(event) {
        if (this.props.onLayout) {
            this.props.onLayout(event, this.props.message);
        }
    }

    render() {
        let { message, showTime } = this.props;

        if (message.isEmptyMessage()) {
            return null;
        }

        if (
            message.getMessageType() ===
                MessageTypeConstants.MESSAGE_TYPE_STD_NOTIFICATION ||
            message.getMessageType() ===
                MessageTypeConstants.MESSAGE_TYPE_CRITICAL_NOTIFICATION
        ) {
            const renderedMessage = this.renderMessage();
            const msgType = message.getMessageType();
            const notifStyle =
                msgType === MessageTypeConstants.MESSAGE_TYPE_STD_NOTIFICATION
                    ? [styles.bubble, styles.stdNotifBubble]
                    : [styles.bubble, styles.criticalBubble];
            if (renderedMessage) {
                return (
                    <View
                        onLayout={this.onLayout.bind(this)}
                        style={{
                            display: 'flex',
                            flex: 1,
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: 30
                        }}
                    >
                        <View style={notifStyle}>{renderedMessage}</View>
                        {showTime ? this.renderMetadata() : null}
                    </View>
                );
            } else {
                return null;
            }
        }
        if (
            message.getMessageType() ===
            MessageTypeConstants.MESSAGE_TYPE_SESSION_START
        ) {
            return (
                <View
                    onLayout={this.onLayout.bind(this)}
                    style={styles.sessionStartMessage}
                >
                    <View style={styles.sessionStartHorizontalLine} />
                    <View>
                        <Text style={styles.sessionStartText}>
                            {utils.sessionStartFormattedDate(
                                message.getMessageDate()
                            )}
                        </Text>
                    </View>
                    <View
                        style={[
                            styles.sessionStartHorizontalLine,
                            styles.sessionStartHorizontalLineRight
                        ]}
                    />
                </View>
            );
        } else if (
            message.getMessageType() !==
            MessageTypeConstants.MESSAGE_TYPE_FORM_RESPONSE
        ) {
            const renderedMessage = this.renderMessage();
            if (renderedMessage) {
                return (
                    <View onLayout={this.onLayout.bind(this)}>
                        <View
                            style={[
                                chatMessageContainerStyle(this.props.alignRight)
                            ]}
                        >
                            {this.image()}
                            {renderedMessage}
                        </View>
                        {showTime ? this.renderMetadata() : null}
                    </View>
                );
            } else {
                return null;
            }
        }
        return null;
    }
}
