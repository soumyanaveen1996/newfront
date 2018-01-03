import React from 'react';
import { Text, Image, View, TouchableHighlight } from 'react-native';
import styles from './styles';
import {
    chatMessageBubbleStyle,
    chatMessageContainerStyle,
    chatMessageTextStyle,
    metadataContainerStyle,
    talkIconSign,
    chatMessageStyle,
    ellipsisMessageBubbleStyle,
    videoContainerStyle
} from './styles';
import { MessageTypeConstants } from '../../lib/capability';
import utils from '../../lib/utils';
import AudioPlayer from '../AudioPlayer';
import { Actions } from 'react-native-router-flux';
import { MessageHandler } from '../../lib/message';
import { FormMessage } from '../FormMessage';
import TapToLoadImage from './TapToLoadImage';
import AnimatedEllipsis from 'react-native-animated-ellipsis';
import VideoPlayer from 'react-native-video-player';

export default class ChatMessage extends React.Component {

    constructor(props) {
        super(props)
    }

    image() {
        if (this.props.imageSource) {
            return <Image source={this.props.imageSource} style={styles.profilePic} />;
        }
    }

    componentWillMount() {
        let { message } = this.props;
        this.state = {
            read: message.isRead(),
            isFavorite: message.isFavorite()
        };
    }

    componentWillUnmount() {
        this.mounted = false
    }

    async componentDidMount() {
        this.mounted = true
        let { message } = this.props;

        MessageHandler.markBotMessageAsRead(message.getBotKey(), message.getMessageId())
            .then((success) => {
                if (this.mounted) {
                    this.setState({ read: success });
                }
            }).catch((err) => {
                console.log(err);
            });
    }

    onImagePress(headers) {
        let { message } = this.props;
        Actions.imageViewer({ uri: message.getMessage(), headers: headers })
    }

    wrapBetweenFavAndTalk(message, component) {
        var favMsgIcon = message.isFavorite() ? 'favMsgSelectedIcon' : 'favMsgUnSelectedIcon';
        var favIcon =
            (<TouchableHighlight underlayColor="white" style={[this.props.alignRight ? { alignItems: 'flex-end' } : { alignItems: 'flex-start' }, styles.favIcon]}
                onPress={this.favoriteIconClicked.bind(this)}>
                <Image source={{ uri: favMsgIcon }} style={styles.favIconImage} />
            </TouchableHighlight>)

        if (this.props.hideFavoriteIcon === false) {
            favIcon = null
        }
        // TODO: Remove this, after fav icon gets live.
        favIcon = null

        var talkSign = <View style={talkIconSign(this.props.alignRight)}/>;

        return (
            <View style={chatMessageStyle(this.props.alignRight)}>
                {this.props.alignRight ? favIcon : talkSign}
                {component}
                {this.props.alignRight ? talkSign : favIcon}
            </View>
        )
    }

    renderImageMessage(message) {
        const url = message.getMessage();
        let headers = utils.s3DownloadHeaders(url, this.props.user) || undefined;
        const component = (
            <TapToLoadImage alignRight={this.props.alignRight} source={{ uri: url, headers: headers }} onImagePress={this.onImagePress.bind(this, headers)} />
        );

        return this.wrapBetweenFavAndTalk(message, component);
    }

    renderVideoMessage(message) {
        const url = message.getMessage();
        let headers = utils.s3DownloadHeaders(url, this.props.user) || undefined;

        const component = (
            <View style={videoContainerStyle(this.props.alignRight)}>
                <VideoPlayer
                    video={{ uri: url, headers: headers }}
                    videoWidth={300}
                    videoHeight={300}
                    autoplay={false}
                    loop={false}
                />
            </View>
        );

        return this.wrapBetweenFavAndTalk(message, component);
    }

    renderAudioMessage(message) {
        const url = message.getMessage();
        let headers = utils.s3DownloadHeaders(url, this.props.user) || undefined;

        const component = (
            <View style={chatMessageBubbleStyle(this.props.alignRight, this.props.imageSource)}>
                <AudioPlayer audioSource={{ uri: url, headers: headers }} />
            </View>
        );

        return this.wrapBetweenFavAndTalk(message, component);
    }

    favoriteIconClicked() {
        let { message } = this.props;

        MessageHandler.toggleFavorite(message.getBotKey(), message.getMessageId(), !message.isFavorite())
            .then((success) => {
                console.log('markBotMessageAsFavorite' + !message.isFavorite())
                message.setFavorite(!message.isFavorite())
                this.setState({
                    isFavorite: message.isFavorite()
                })
            }).catch((err) => {
                console.log(err);
            });
    }

    renderMessage() {
        let { message } = this.props;

        if (message.getMessageType() === MessageTypeConstants.MESSAGE_TYPE_STRING
            || message.getMessageType() === MessageTypeConstants.MESSAGE_TYPE_SLIDER_RESPONSE
            || message.getMessageType() === MessageTypeConstants.MESSAGE_TYPE_BUTTON_RESPONSE) {

            const component = (
                <View style={chatMessageBubbleStyle(this.props.alignRight, this.props.imageSource)}>
                    <Text style={chatMessageTextStyle(this.props.alignRight)}>{message.getDisplayMessage()}</Text>
                </View>
            );
            return this.wrapBetweenFavAndTalk(message, component);

        } else if (message.getMessageType() === MessageTypeConstants.MESSAGE_TYPE_IMAGE) {
            return this.renderImageMessage(message);
        } else if (message.getMessageType() === MessageTypeConstants.MESSAGE_TYPE_VIDEO) {
            return this.renderVideoMessage(message)
        } else if (message.getMessageType() === MessageTypeConstants.MESSAGE_TYPE_BUTTON) {
            var buttons = []
            for (var i = 0; i < message.getMessage().length; i++) {
                buttons.push(
                    <View style={styles.buttonMsgParent} key={i}>
                        <TouchableHighlight
                            underlayColor="white"
                            onPress={this.buttonResponseOnPress.bind(this, i, message.getMessage()[i])}
                            style={styles.buttonMessage}>
                            <Text>
                                {message.getMessage()[i].title}
                            </Text>
                        </TouchableHighlight>
                    </View>
                )
            }

            const component = (
                <View style={{ flexDirection: 'column' }}>
                    {buttons}
                </View>
            );
            return this.wrapBetweenFavAndTalk(message, component);

        } else if (message.getMessageType() === MessageTypeConstants.MESSAGE_TYPE_FORM) {
            const component = (
                <FormMessage
                    formData={message.getMessage()}
                    onCTAClicked={this.formCTAClick.bind(this)} />
            );
            return this.wrapBetweenFavAndTalk(message, component);
        } else if (message.getMessageType() === MessageTypeConstants.MESSAGE_TYPE_HTML) {
            const component = (
                <View style={{ flexDirection: 'column' }}>
                    <TouchableHighlight
                        underlayColor="white"
                        onPress={this.htmlResponseOnPress.bind(this, message.getMessage())}
                        style={styles.buttonMessage}>
                        <Text>
                            {message.getMessage().actionText}
                        </Text>
                    </TouchableHighlight>
                </View>
            );
            return this.wrapBetweenFavAndTalk(message, component);
        } else if (message.getMessageType() === MessageTypeConstants.MESSAGE_TYPE_WAIT) {
            const component = (
                <View style={ellipsisMessageBubbleStyle(this.props.alignRight, this.props.imageSource)}>
                    <AnimatedEllipsis style={styles.ellipsis} />
                </View>
            );
            return this.wrapBetweenFavAndTalk(message, component);
        } else if (message.getMessageType() === MessageTypeConstants.MESSAGE_TYPE_AUDIO) {
            return this.renderAudioMessage(message);
        }
    }

    htmlResponseOnPress(htmlText) {
        Actions.webview({ htmlString: htmlText.htmlMsg });
    }

    buttonResponseOnPress(index, item) {
        this.props.onDoneBtnClick(item)
    }

    formCTAClick(items) {
        this.props.onFormCTAClick(items)
    }

    renderMetadata() {
        let { message, alignRight } = this.props;
        return (
            <View style={[metadataContainerStyle(alignRight, !!this.props.imageSource)]}>
                <Text style={[styles.date, styles.dataNoMargin]}>{utils.formattedDate(message.getMessageDate())}</Text>
            </View>
        )
    }

    render() {
        let { message } = this.props;
        if (message.getMessageType() === MessageTypeConstants.MESSAGE_TYPE_SESSION_START) {
            return (
                <View style={styles.sessionStartMessage}>
                    <View style={styles.sessionStartHorizontalLine} />
                    <View>
                        <Text style={styles.sessionStartText}>{utils.sessionStartFormattedDate(message.getMessageDate())}</Text>
                    </View>
                    <View style={[styles.sessionStartHorizontalLine, styles.sessionStartHorizontalLineRight]} />
                </View>
            )
        } else {
            return (
                <View>
                    <View style={[chatMessageContainerStyle(this.props.alignRight)]}>
                        {this.image()}
                        {this.renderMessage()}
                    </View>
                    {this.renderMetadata()}
                </View>
            );
        }
    }
}
