import React from 'react';
import {
    Text,
    Image,
    View,
    TouchableHighlight,
    TouchableOpacity,
    Dimensions,
    Pressable
} from 'react-native';
import { Toast } from 'react-native-toast-message/lib/src/Toast';

import Clipboard from '@react-native-clipboard/clipboard';
import VideoPlayer from 'react-native-video-player';
import { DotIndicator } from 'react-native-indicators';
import _ from 'lodash';
import { ChatImageType } from '../../../lib/utils/ChatUtils';
import { MessageTypeConstants } from '../../../lib/capability';
import utils from '../../../lib/utils';
import AudioPlayer from './AudioPlayer';
import ProfileImage from '../../../widgets/ProfileImage';
import { MessageHandler } from '../../../lib/message';
import Images from '../../../config/images';
import I18n from '../../../config/i18n/i18n';
import { ContactsCache } from '../../../lib/ContactsCache';
import { Icons } from '../../../config/icons';
import config from '../../../config/config';
import ContactCard from './ContactCard';
import TapToOpenFile from './TapToOpenFile';
import GlobalColors from '../../../config/styles';
import styles, {
    chatMessageBubbleStyle,
    chatMessageContainerStyle,
    chatMessageTextStyle,
    chatMessageStyle,
    ellipsisMessageBubbleStyle,
    videoContainerStyle
} from '../styles';
import ImageMessage from './ImageMessage';
import NavigationAction from '../../../navigation/NavigationAction';
import RenderHTML from 'react-native-render-html';
import TextComponent from './Widgets/TextComponent';

const getRandomInt = (max) => Math.floor(Math.random() * Math.floor(max));

//TODO: review for optimization
export default class ChatMessage extends React.Component {
    constructor(props) {
        super(props);
        const { message } = this.props;
        this.state = {
            read: message.isRead(),
            // isFavorite: message.isFavorite(),
            userName:
                message?.getCreatedBy() == this.props.user.userId
                    ? this.props.user.info.userName
                    : this.props.otherUserName,
            userLogo: false, // depends on isUserChat value
            newGroupPaticipent: false,
            oldMessage: message.getStatus()
        };
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (nextProps.message.getStatus() !== this.state.oldMessage) {
            return true;
        }
        if (nextState.userName !== this.state.userName) {
            return true;
        }
        if (
            this.props.message.getMessageId() !==
            nextProps.message.getMessageId()
        ) {
            return true;
        }
        return false;
    }

    showBotIcon(picStyle) {
        let url = this.props.imageSource;
        return ChatImageType(false, url.uri, picStyle);
    }
    image(normalTime = null) {
        const { message, isUserChat, alignRight } = this.props;
        if (normalTime && !(message?.getCreatedBy() === 'AgentM')) {
            return (
                <View style={[styles.imageWithName, { marginTop: 15 }]}>
                    {this.props.isBotNameShown && !this.props.isUserChat ? (
                        this.showBotIcon(styles.chatProfilePic)
                    ) : (
                        <ProfileImage
                            key={
                                message.getCreatedBy() + message.getMessageId()
                            }
                            uuid={message.getCreatedBy()}
                            placeholder={Images.user_image}
                            style={styles.chatProfilePic}
                            textSize={10}
                            userName={this.state?.userName}
                            placeholderStyle={styles.chatPlaceholderProfilePic}
                            resizeMode="cover"
                            // thumb={true}
                        />
                    )}
                    <View
                        style={[
                            styles.imageWithName,
                            { alignSelf: 'flex-start' }
                        ]}
                    >
                        <View>
                            {this.state.userName && (
                                <Text style={styles.userNameStyle}>
                                    {this.state?.userName}
                                </Text>
                            )}
                        </View>
                        {normalTime}
                    </View>
                </View>
            );
        } else {
            return null;
        }
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    async componentDidMount() {
        this.mounted = true;
        const { message } = this.props;
        if (
            !message.isRead() &&
            message.getMessageType() === MessageTypeConstants.MESSAGE_TYPE_FORM
        ) {
            this.openForm(message);
        }

        if (message.getCreatedBy() && !(message?.getCreatedBy() === 'AgentM')) {
            if (this.state.userName) {
            } else {
                const wait = getRandomInt(5000);

                setTimeout(async () => {
                    await ContactsCache.getUserDetails(
                        message.getCreatedBy()
                    ).then((user) => {
                        // console.log(
                        //     'THE DATA IS,-----CONTACCT CACHE',
                        //     JSON.stringify(user)
                        // );
                        // console.log(
                        //     'THE DATA IS,-----CONTACCT CACHE',
                        //     JSON.parse(user)
                        // );
                        let userName = null;
                        if (
                            user &&
                            user?.userName &&
                            user.userName.length > 0
                        ) {
                            userName = user.userName;
                            this.setState({ userName });
                        }
                    });
                }, wait);
            }

            // }
            // Throttle this call as too many chat messages trigger multiple API calls before the Ccache can return
        } else {
            if (this.props.isBotNameShown)
                this.setState({ userName: this.props.isBotNameShown });
        }

        MessageHandler.markBotMessageAsRead(
            message.getBotKey(),
            message.getMessageId()
        )
            .then((success) => {
                if (this.mounted) {
                    this.setState({ read: success });
                }
            })
            .catch((err) => {
                console.log('Error Marking message as read : ', err);
            });
    }

    onImagePress(headers, uri) {
        NavigationAction.push(NavigationAction.SCREENS.imageViewer, {
            uri,
            headers
        });
    }

    wrapBetweenFavAndTalk(message, component) {
        return (
            <View style={[chatMessageStyle(this.props.showTime)]}>
                {component}
            </View>
        );
    }

    renderImageMessage(message) {
        const remoteFileName = message.getMessage();
        const { type } = message.getMessageOptions()
            ? message.getMessageOptions()
            : { type: '' };
        const name = message.getMessageOptions()
            ? message.getMessageOptions().fileName
            : remoteFileName;
        const url = `${config.proxy.protocol}${config.proxy.resource_host}/downloadwithsignedurl/conversation/${this.props.conversationContext.conversationId}/${remoteFileName}`;
        const headers =
            utils.s3DownloadHeaders(url, this.props.user) || undefined;
        let imageComponent;

        imageComponent = (
            <View style={{ flexDirection: 'row' }}>
                <View
                    style={[
                        chatMessageBubbleStyle(this.props.showTime),
                        {
                            paddingHorizontal: 0,
                            backgroundColor: 'transperent',
                            marginLeft: 48
                        }
                    ]}
                >
                    <View
                        style={[
                            {
                                justifyContent: 'space-between'
                            }
                        ]}
                    >
                        <ImageMessage
                            user={this.props.user}
                            fileName={message.getMessage()}
                            conversationContext={this.props.conversationContext}
                            isFromUser={
                                this.props.user.userId === message._createdBy
                            }
                            shouldShowUserName={this.props.shouldShowUserName}
                            message={message}
                            source={{
                                url,
                                headers,
                                MIMEType: type,
                                name: message.getMessage()
                            }}
                        />
                    </View>
                </View>
                <View
                    style={{
                        justifyContent: 'flex-end'
                    }}
                >
                    {this.props.user !== undefined &&
                    message.getCreatedBy() === this.props.user.userId &&
                    (this.props.message.getStatus() === 1 ||
                        this.props.message.getStatus() === -1) ? (
                        <View style={[styles.textMsgDeliveryICon]}>
                            {this.props.message.getStatus() === 1
                                ? Icons.delivered()
                                : Icons.deliveryFailed()}
                        </View>
                    ) : (
                        <Text />
                    )}
                </View>
            </View>
        );

        const component = imageComponent;
        return component;
    }

    renderFileMessage(message) {
        const remoteFileName = message.getMessage();
        const { type } = message.getMessageOptions()
            ? message.getMessageOptions()
            : { type: '' };
        const name = message.getMessageOptions()
            ? message.getMessageOptions().fileName
            : remoteFileName;
        const url = `${config.proxy.protocol}${config.proxy.resource_host}/downloadwithsignedurl/conversation/${this.props.conversationContext.conversationId}/${remoteFileName}`;
        const headers =
            utils.s3DownloadHeaders(url, this.props.user) || undefined;
        let imageComponent;

        imageComponent = (
            <View style={{ flexDirection: 'row' }}>
                <View
                    style={[
                        chatMessageBubbleStyle(this.props.showTime),
                        {
                            paddingHorizontal: 0,
                            backgroundColor: 'transperent',
                            marginLeft: 48
                        }
                    ]}
                >
                    <View style={[styles.downloadIconStyle]}>
                        <TapToOpenFile
                            // alignRight
                            isVideoFile={
                                message.getMessageType() ===
                                MessageTypeConstants.MESSAGE_TYPE_VIDEO
                            }
                            source={{
                                url,
                                headers,
                                MIMEType: type,
                                name
                            }}
                        />
                        <View
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between'
                            }}
                        >
                            <View />
                        </View>
                    </View>
                </View>
                {this.props.user !== undefined &&
                message.getCreatedBy() === this.props.user.userId &&
                (this.props.message.getStatus() === 1 ||
                    this.props.message.getStatus() === -1) ? (
                    <View style={styles.textMsgDeliveryICon}>
                        {this.props.message.getStatus() === 1
                            ? Icons.delivered()
                            : Icons.deliveryFailed()}
                    </View>
                ) : (
                    <Text />
                )}
            </View>
        );

        const component = imageComponent;
        return component;
    }

    renderVideoMessage(message) {
        const remoteFileName = message.getMessage();
        const url = `${config.proxy.protocol}${config.proxy.resource_host}/downloadwithsignedurl/${this.props.conversationContext.conversationId}/${remoteFileName}`;
        const headers =
            utils.s3DownloadHeaders(url, this.props.user) || undefined;

        // http://techslides.com/demos/sample-videos/small.mp4
        const component = (
            <View style={videoContainerStyle(this.props.alignRight)}>
                <VideoPlayer
                    video={{ uri: url, headers }}
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
        return component;
        return this.wrapBetweenFavAndTalk(message, component);
    }

    renderAudioMessage(message) {
        const remoteFileName = message.getMessage();
        const url = `${config.proxy.protocol}${config.proxy.resource_host}${config.proxy.downloadFilePath}/${this.props.conversationContext.conversationId}/${remoteFileName}`;
        const headers =
            utils.s3DownloadHeaders(url, this.props.user) || undefined;

        const component = (
            <View style={{ flexDirection: 'row' }}>
                <View
                    style={[
                        chatMessageBubbleStyle(this.props.showTime),
                        styles.audioMsgContainer
                    ]}
                >
                    <View
                        style={[
                            styles.downloadIconStyle
                            // { flexDirection: 'row' }
                        ]}
                    >
                        <AudioPlayer
                            audioSource={{
                                fileName: remoteFileName,
                                uri: url,
                                headers
                            }}
                            sentByUser={
                                this.props.message.getCreatedBy() ===
                                this.props.user.userId
                            }
                            message={message}
                            user={this.props.user}
                            isProfileImageShown={this.props.showTime}
                        />
                    </View>
                </View>
                {this.props.user !== undefined &&
                message.getCreatedBy() === this.props.user.userId &&
                (this.props.message.getStatus() === 1 ||
                    this.props.message.getStatus() === -1) ? (
                    <View style={styles.textMsgDeliveryICon}>
                        {this.props.message.getStatus() === 1
                            ? Icons.delivered()
                            : Icons.deliveryFailed()}
                    </View>
                ) : (
                    <Text />
                )}
            </View>
        );

        return component;
    }

    contactMessage(message) {
        const messageData = message.getMessage();
        let userId = null;
        let userName = null;
        let contactType = null;
        let msgDataForLocal = null;
        if (messageData) {
            if (messageData.userId) {
                userId = message.getMessage().userId;
                contactType = message.getMessage()?.contactType;
                userName = message.getMessage().userName;
                msgDataForLocal = message.getMessage();
            } else if (Array.isArray(messageData)) {
                userId = message.getMessage()[0].userId;
                userName = message.getMessage()[0].userName;
                contactType = message.getMessage()[0].contactType;
                msgDataForLocal = message.getMessage()[0];
            } else {
                userId = message.getMessage();
            }
        }
        return (
            <View style={{ flexDirection: 'row', marginVertical: 6 }}>
                <View
                    style={[
                        chatMessageBubbleStyle(this.props.showTime),
                        {
                            paddingHorizontal: 0,
                            marginLeft: 48
                        }
                    ]}
                >
                    <ContactCard
                        key={userId}
                        id={userId}
                        name={userName}
                        contactType={contactType}
                        msgData={msgDataForLocal}
                        // alignRight={this.props.alignRight}
                        imageSource={this.props.imageSource}
                        openModalWithContent={this.props.openModalWithContent}
                        hideChatModal={this.props.hideChatModal}
                        disabled={
                            this.props.message.getCreatedBy() ===
                            this.props.user.userId
                        }
                    />
                </View>
                {this.props.user !== undefined &&
                message.getCreatedBy() === this.props.user.userId &&
                (this.props.message.getStatus() === 1 ||
                    this.props.message.getStatus() === -1) ? (
                    <View style={[styles.textMsgDeliveryICon]}>
                        {this.props.message.getStatus() === 1
                            ? Icons.delivered()
                            : Icons.deliveryFailed()}
                    </View>
                ) : (
                    <Text />
                )}
            </View>
        );
    }

    // favoriteIconClicked = () => {
    //     const { message } = this.props;

    //     MessageHandler.toggleFavorite(
    //         message.getBotKey(),
    //         message.getMessageId(),
    //         !message.isFavorite()
    //     )
    //         .then((success) => {
    //             message.setFavorite(!message.isFavorite());
    //             this.setState({
    //                 isFavorite: message.isFavorite()
    //             });
    //         })
    //         .catch((err) => {
    //             console.log(err);
    //         });
    // };

    renderNotification(message) {
        if (
            message.getDisplayMessage().includes('Missed') ||
            message.getDisplayMessage().includes('called')
        ) {
            let color = message.getDisplayMessage().includes('Missed')
                ? true
                : false;
            if (message.getCreatedBy() !== this.props.user.userId) {
                if (color) {
                    return (
                        <View
                            style={[
                                styles.callNotifWrapper,
                                this.props.showTime ? { marginTop: 0 } : {},
                                {
                                    paddingRight: 18,
                                    justifyContent: 'flex-start'
                                }
                            ]}
                        >
                            <View style={{ marginRight: 6, marginLeft: 2 }}>
                                {message.getDisplayMessage().includes('video')
                                    ? Icons.missedCallVideo({ size: 20 })
                                    : Icons.missedCall({ size: 20 })}
                            </View>
                            <View>
                                <Text
                                    style={{
                                        color: GlobalColors.red,
                                        fontSize: 14
                                        // letterSpacing: -0.8
                                    }}
                                >
                                    {message.getDisplayMessage()}
                                </Text>
                            </View>
                        </View>
                    );
                } else {
                    return (
                        <View
                            style={[
                                styles.callNotifWrapper,
                                this.props.showTime ? { marginTop: 0 } : {},
                                {
                                    paddingRight: 18,
                                    justifyContent: 'flex-start'
                                }
                            ]}
                        >
                            <View style={{ marginRight: 14, marginLeft: 4 }}>
                                {message.getDisplayMessage().includes('video')
                                    ? Icons.callEndedVideo({ size: 20 })
                                    : Icons.callEnded({ size: 20 })}
                            </View>
                            <View>
                                <Text
                                    style={{
                                        color: GlobalColors.primaryTextColor,
                                        fontSize: 14
                                        // letterSpacing: -0.8
                                    }}
                                >
                                    {message.getDisplayMessage()}
                                </Text>
                            </View>
                        </View>
                    );
                }
            }
        } else {
            if (message.getCreatedBy() !== this.props.user.userId) {
                return (
                    <View
                        style={[
                            styles.normalNotifWrapper,
                            this.props.showTime ? { marginTop: 5 } : {}
                        ]}
                    >
                        <View style={styles.notificationNormalContainer}>
                            <View
                                style={{
                                    paddingVertical: 8,
                                    paddingHorizontal: 30,
                                    backgroundColor: GlobalColors.appBackground,
                                    borderRadius: 40
                                }}
                            >
                                <Text style={styles.normalNotificationTxt}>
                                    {message.getDisplayMessage()}
                                </Text>
                            </View>
                        </View>
                    </View>
                );
            } else return null;
        }
    }

    urlify(text) {
        var urlRegex = /(https?:\/\/[^\s]+)/g;
        return text.replace(urlRegex, function (url) {
            return '<a href="' + url + '">' + url + '</a>';
        });
    }

    renderMessage() {
        const { message } = this.props;
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
            return (
                <TextComponent
                    message={message}
                    showTime={this.props.showTime}
                    user={this.props.user}
                />
            );
        }
        if (
            message.getMessageType() ===
                MessageTypeConstants.MESSAGE_TYPE_STD_NOTIFICATION ||
            message.getMessageType() ===
                MessageTypeConstants.MESSAGE_TYPE_CRITICAL_NOTIFICATION
        ) {
            return this.renderNotification(message);
        }
        if (
            message.getMessageType() === MessageTypeConstants.MESSAGE_TYPE_IMAGE
        ) {
            return this.renderImageMessage(message);
        }
        if (
            message.getMessageType() ===
                MessageTypeConstants.MESSAGE_TYPE_OTHER_FILE ||
            message.getMessageType() === MessageTypeConstants.MESSAGE_TYPE_VIDEO
        ) {
            return this.renderFileMessage(message);
        }
        if (
            message.getMessageType() === MessageTypeConstants.MESSAGE_TYPE_VIDEO
        ) {
            return this.renderVideoMessage(message);
        }
        if (
            message.getMessageType() === MessageTypeConstants.MESSAGE_TYPE_FORM
        ) {
            const component = (
                <View
                    style={[styles.formButtonWrapper, { marginLeft: 48 }]}
                    key={message.getMessageId()}
                >
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
        }
        if (
            message.getMessageType() === MessageTypeConstants.MESSAGE_TYPE_HTML
        ) {
            const component = (
                <TouchableHighlight
                    style={[
                        chatMessageBubbleStyle(this.props.showTime),
                        { marginLeft: 48 }
                    ]}
                    underlayColor="white"
                    onPress={this.htmlResponseOnPress.bind(
                        this,
                        message.getMessage()
                    )}
                >
                    <View
                        style={{
                            justifyContent: 'center',
                            flexDirection: 'row',
                            color: GlobalColors.textBlack
                        }}
                    >
                        {message.getMessage().image && (
                            <View
                                style={{
                                    flex: 1,
                                    justifyContent: 'center',
                                    marginRight: 12
                                }}
                            >
                                <Image
                                    source={{ uri: message.getMessage().image }}
                                    style={styles.htmlMessageImage}
                                />
                            </View>
                        )}
                        <View>
                            <Text
                                style={chatMessageTextStyle(
                                    this.props.alignRight
                                )}
                            >
                                {message.getMessage().title}
                            </Text>
                        </View>
                    </View>
                </TouchableHighlight>
            );
            return this.wrapBetweenFavAndTalk(message, component);
        }
        if (
            message.getMessageType() === MessageTypeConstants.MESSAGE_TYPE_WAIT
        ) {
            const component = (
                <View
                    style={[
                        ellipsisMessageBubbleStyle(
                            this.props.alignRight,
                            this.props.imageSource
                        ),
                        { marginLeft: 48 }
                    ]}
                >
                    <DotIndicator
                        style={{
                            backgroundColor: GlobalColors.contentBackgroundColor
                        }}
                        color={GlobalColors.frontmLightBlue}
                        size={8}
                        count={3}
                    />
                </View>
            );
            return this.wrapBetweenFavAndTalk(message, component);
        }
        if (
            message.getMessageType() === MessageTypeConstants.MESSAGE_TYPE_AUDIO
        ) {
            return this.renderAudioMessage(message);
        }
        if (
            message.getMessageType() ===
            MessageTypeConstants.MESSAGE_TYPE_CONTACT_CARD
        ) {
            const component = this.contactMessage(message);
            return component;
            // return this.wrapBetweenFavAndTalk(message, component);
        }
    }

    openForm(message) {
        const formMessage = message.getMessage();
        this.onFormOpen(formMessage);
        NavigationAction.push(NavigationAction.SCREENS.form, {
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
        const { message } = this.props;
        if (this.props.onFormCancel) {
            this.props.onFormCancel(message.getMessage());
        }
    }

    onFormSubmit(items) {
        const { message } = this.props;
        this.props.onFormCTAClick(items, message);
    }

    htmlResponseOnPress(htmlText) {
        if (_.isEmpty(htmlText.content)) {
            NavigationAction.push(NavigationAction.SCREENS.webview, {
                url: htmlText.url
            });
        } else {
            NavigationAction.push(NavigationAction.SCREENS.webview, {
                htmlString: htmlText.content,
                url: htmlText.url
            });
        }
    }

    renderMetadata() {
        const { message, alignRight } = this.props;
        return (
            <View style={{ marginLeft: 8 }}>
                <Text style={[styles.date, { lineHeight: 16 }]}>
                    {utils.formattedDateTimeOnly(message.getMessageDate())}
                </Text>
            </View>
        );
    }

    onLayout(event) {
        if (this.props.onLayout) {
            this.props.onLayout(event, this.props.message);
        }
    }

    showDateTimeLine = () => {
        return (
            <View style={[styles.sessionStartMessage]}>
                <View style={[styles.sessionStartHorizontalLine]} />

                <View>
                    <Text style={styles.sessionStartText}>
                        {utils.formattedDateCheckOnly(message.getMessageDate())}
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
    };
    render() {
        const { message, showTime } = this.props;
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
            // const msgType = message.getMessageType();
            // const notifStyle =
            //     msgType === MessageTypeConstants.MESSAGE_TYPE_STD_NOTIFICATION
            //         ? [styles.bubble, styles.stdNotifBubble]
            //         : [styles.bubble, styles.criticalBubble];
            if (renderedMessage) {
                return (
                    <View onLayout={this.onLayout.bind(this)}>
                        <View
                            style={{
                                backgroundColor: GlobalColors.chatBackground
                            }}
                        >
                            <View
                                style={[
                                    chatMessageContainerStyle(
                                        this.props.showTime
                                    )
                                ]}
                            >
                                {this.image(
                                    showTime ? this.renderMetadata() : null
                                )}
                            </View>
                            <View>{renderedMessage}</View>
                        </View>
                    </View>
                );
            }
            return null;
        }
        if (
            message.getMessageType() ===
            MessageTypeConstants.MESSAGE_TYPE_SESSION_START
        ) {
            return (
                <View
                    onLayout={this.onLayout.bind(this)}
                    style={[
                        styles.sessionStartMessage,
                        {
                            overflow: 'hidden',
                            backgroundColor: GlobalColors.chatBackground
                        }
                    ]}
                >
                    <View style={[styles.sessionStartHorizontalLine]} />
                    <View
                        style={{
                            overflow: 'hidden',
                            borderWidth: 1,
                            borderColor:
                                GlobalColors.secondaryButtonColorDisabled,
                            borderRadius: 10,
                            height: 24,
                            justifyContent: 'center',
                            minWidth: 100
                        }}
                    >
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
        }
        if (
            message.getMessageType() !==
            MessageTypeConstants.MESSAGE_TYPE_FORM_RESPONSE
        ) {
            const renderedMessage = this.renderMessage();

            if (renderedMessage) {
                return (
                    <View onLayout={this.onLayout.bind(this)}>
                        <View
                            style={[
                                chatMessageContainerStyle(this.props.showTime)
                            ]}
                        >
                            {this.image(
                                showTime ? this.renderMetadata() : null
                            )}
                        </View>
                        <View>{renderedMessage}</View>
                    </View>
                );
            }
            return null;
        }
        return null;
    }
}
