import React from 'react';
import {
    View,
    TouchableOpacity,
    UIManager,
    SafeAreaView,
    Modal,
    Linking,
    Platform,
    NativeModules
} from 'react-native';
import { connect } from 'react-redux';
import { PulseIndicator } from 'react-native-indicators';
import WebView from 'react-native-webview';
import _ from 'lodash';
import { InAppBrowser } from 'react-native-inappbrowser-reborn';
import RNFS from 'react-native-fs';
import RNFetchBlob from 'react-native-blob-util';
import URL from 'url-parse';
import queryString from 'query-string';
import Orientation from 'react-native-orientation-locker';

import Icons from '../../../../config/icons';
import styles from './styles';
import GlobalColors from '../../../../config/styles';
import { Auth, MessageTypeConstants } from '../../../../lib/capability';
import { Form2 } from '../Form2Message';
// import Form2 from '../Form2Message/Form2';
import { TableMessage } from '../TableMessage/TableMessageV2';
import EventEmitter from '../../../../lib/events';
import { updateNonConvControlsList as updateNonConvControlsListFunc } from '../../../../redux/actions/UserActions';
import MenuMessage from '../MenuMessage/MenuMessage';
import chatStyles from '../../styles';
import { HeaderTitle } from '../../../../widgets/Header';
import ContainerMessage from '../ContainerMessage/ContainerMessage';
import ChatBubblesOverlay from './ChatBubblesOverlay';
import { htmlMessagesEvents } from '../.././../../lib/events/MessageEvents';

import config from '../../../../config/config';
import { AssetFetcher } from '../../../../lib/dce';
import Constants from '../../../../config/constants';
import { CalenderMessage } from '../CalenderMessage/CalenderMessage';
import { MapMessage } from '../MapMessage/MapMessageV2';
import moment from 'moment';
import NavigationAction from '../../../../navigation/NavigationAction';
import TimeLineMessage from '../TimeLineMessage/TimeLineMessage';
import SurveyMessage from '../SurveyMessage/SurveyMessage';
import WebViewScreen from '../../../WebViewScreen/WebViewScreen';
import { Toast } from 'react-native-toast-message/lib/src/Toast';
import RNCallKeep from 'react-native-callkeep';
const { FrontMUtils } = NativeModules;

const PROCESSED_MESSAGES = {};
class FullScreenMessageV2 extends React.Component {
    constructor(props) {
        // console.log('in the FullScreen message');
        super(props);
        UIManager.setLayoutAnimationEnabledExperimental &&
            UIManager.setLayoutAnimationEnabledExperimental(true);
        const { message } = this.props;
        this.state = {
            messageData: message.getMessage(),
            messageOptions: message.getMessageOptions(),
            showWebView: false
        };
        this.messageType = message.getMessageType();
        if (
            message.getMessageType() == MessageTypeConstants.MESSAGE_TYPE_HTML
        ) {
            if (
                message.getMessageOptions() &&
                message.getMessageOptions().orientation
            ) {
                if (
                    message.getMessageOptions().orientation ===
                    'force-landscape'
                ) {
                    this.checkForOrientation = message.getMessageOptions().orientation; // used temparory for revert partrait on unmount.
                    Orientation.lockToLandscapeLeft();
                }
                if (
                    message.getMessageOptions().orientation === 'force-portrait'
                ) {
                    this.checkForOrientation = message.getMessageOptions().orientation; // used temparory for revert partrait on unmount.
                    Orientation.lockToPortrait();
                }
            } else {
                Orientation.unlockAllOrientations();
            }
        }
        this.eventListeners = [];
        this.lastVideoTimes = {};
        this.rejoins = {};
    }

    componentDidMount() {
        const { navigation, title, messageIndex, messageList } = this.props;
        if (navigation) {
            navigation.setParams({
                title: this.state.messageOptions.title || title,
                onClose: () => this.closeFullScreenApp(this.props),
                onBack: () => this.onBackToPreviousScreen(),
                headerProps: this.props
            });
        }
        this.props.setTitle?.(this.state.messageOptions.title || title);

        this.eventListeners.push(
            EventEmitter.addListener(htmlMessagesEvents.update, (message) => {
                console.log(
                    '>>>>msg event',
                    messageIndex,
                    this.props.messageList[this.props.bot.botId].length,
                    message
                );
                const messageOptions = message.getMessageOptions();
                const { url } = messageOptions;
                console.log('URL : ', url);
                if (PROCESSED_MESSAGES[message.getMessageId()]) {
                    return;
                }
                PROCESSED_MESSAGES[message.getMessageId()] = true;

                const { sendMessage } = this.props;
                if (url) {
                    const parsedUrl = new URL(url);
                    console.log(
                        'Parsed URL : ',
                        parsedUrl,
                        config.proxy.meetingServersMapping[parsedUrl.hostname]
                    );

                    if (
                        config.proxy.meetingServersMapping[
                            parsedUrl.hostname
                        ] === 'jitsi'
                    ) {
                        const qs = queryString.parse(
                            parsedUrl.query ? parsedUrl.query : parsedUrl.search
                        );

                        if (qs.id) roomId = qs.id;
                        const codeForRejoin = qs.rejoinCode
                            ? qs.rejoinCode
                            : null;
                        console.log('Query string : ', qs, roomId);
                        if (
                            !this.lastVideoTimes[roomId] ||
                            moment() - this.lastVideoTimes[roomId] > 45000 ||
                            this.checkIfRejoin(codeForRejoin)
                        ) {
                            this.lastVideoTimes[roomId] = moment();
                            this.rejoins[codeForRejoin] = moment();
                            if (Platform.OS === 'android') {
                                FrontMUtils.cancelVoiceNotifications(() => {});
                            } else {
                                RNCallKeep.endAllCalls();
                            }
                            NavigationAction.push(
                                NavigationAction.SCREENS.jitsi,
                                {
                                    fullUrl: url,
                                    botId: this.props.bot.botId,
                                    sendMessage
                                }
                            );
                        }
                    } else {
                        this.openWebView(message);
                    }
                } else {
                    this.openWebView(message);
                }
            })
        );
    }

    checkIfRejoin = (codeForRejoin) => {
        return (
            codeForRejoin === null ||
            !this.rejoins[codeForRejoin] ||
            moment() - this.rejoins[codeForRejoin] > 45000
        );
    };

    componentWillUnmount() {
        const { updateNonConvControlsList, messageList } = this.props;
        const chatMessagelist = messageList[this.props.bot.botId];
        chatMessagelist.pop();
        this.props.updateNonConvControlsList({
            list: chatMessagelist,
            id: this.props.bot.botId,
            src: 'full screen unmount ->' + this.state.messageOptions?.controlId
        });

        this.eventListeners.forEach((listener) => {
            listener.remove();
        });
        if (this.messageType == MessageTypeConstants.MESSAGE_TYPE_HTML) {
            Orientation.lockToPortrait();
        }
    }

    async updateWebView(message) {
        const messageOptions = message.getMessageOptions();
        const { htmlContent, url, external } = messageOptions;

        // uncomment if the videocall works in the webview in Android
        // if (Platform.OS === 'ios' && external) {

        // uncomment to use the native browser in android too
        if (external) {
            const supported = await Linking.canOpenURL(url);
            if (supported) {
                await Linking.openURL(url);
            } else {
                Toast.show({
                    text1: `Don't know how to open this URL: ${url}`
                });
            }
        } else {
            const webViewContent = _.isEmpty(htmlContent)
                ? { uri: url }
                : { html: htmlContent };
            this.setState({ webViewContent, showWebView: true });
        }
    }

    async openWebView(message) {
        const messageOptions = message.getMessageOptions();
        const {
            htmlContent,
            content,
            url,
            signed_url,
            external
        } = messageOptions;
        if (content || htmlContent) {
            NavigationAction.pushNew(NavigationAction.SCREENS.webview, {
                htmlString: content ? content : htmlContent,
                url
            });
            return;
        }
        if ((!url || url === '') && (!signed_url || signed_url === '')) {
            return Toast.show({ text1: 'No valid url' });
        }

        // open url in in app browser
        if (url) {
            try {
                if (await InAppBrowser.isAvailable()) {
                    const result = await InAppBrowser.open(url, {
                        // iOS Properties
                        dismissButtonStyle: 'close',
                        preferredBarTintColor: GlobalColors.frontmLightBlue,
                        preferredControlTintColor: GlobalColors.white,
                        readerMode: false,
                        animated: true,
                        modalPresentationStyle: 'fullScreen',
                        modalTransitionStyle: 'coverVertical',
                        modalEnabled: true,
                        enableBarCollapsing: false,
                        // Android Properties
                        showTitle: true,
                        toolbarColor: GlobalColors.frontmLightBlue,
                        // secondaryToolbarColor: GlobalColors.white,
                        enableUrlBarHiding: true,
                        enableDefaultShare: true,
                        forceCloseOnRedirection: false,
                        // Specify full animation resource identifier(package:anim/name)
                        // or only resource name(in case of animation bundled with app).
                        animations: {
                            startEnter: 'slide_in_right',
                            startExit: 'slide_out_left',
                            endEnter: 'slide_in_left',
                            endExit: 'slide_out_right'
                        },
                        headers: {
                            'my-custom-header': 'my custom header value'
                        }
                    });
                } else Linking.openURL(url);
            } catch (error) {
                console.log('>>>>>>>msg e', error.message);
                Toast.show({ text1: error.message });
            }
            return;
        }

        // download file from S3
        if (signed_url) {
            const {
                proxy: { protocol, resource_host }
            } = config;
            try {
                const user = Auth.getUserData();
                const headers = { sessionId: user.creds.sessionId };
                const res = await fetch(
                    `${protocol}${resource_host}/downloadwithsignedurl/${this.props.bot.userDomain}/${signed_url}`,
                    {
                        method: 'GET',
                        headers
                    }
                );
                const parsedRes = await res.json();
                const {
                    signedUrl,
                    headers: { ContentType }
                } = parsedRes;
                const downloadUrl = signedUrl;
                console.log(
                    '>>>>>>msg download url',
                    downloadUrl,
                    ContentType,
                    parsedRes
                );

                await RNFS.mkdir(Constants.OTHER_FILE_DIRECTORY);
                const localPath = decodeURI(
                    `${Constants.OTHER_FILE_DIRECTORY}/${signed_url}`
                );
                const res2 = await AssetFetcher.downloadFile(
                    localPath,
                    downloadUrl,
                    headers,
                    true,
                    false
                );
                console.log('>>>>>>msg downloaded file', res2);
                if (Platform.OS === 'android') {
                    RNFetchBlob.android.actionViewIntent(
                        localPath.slice(7),
                        ContentType
                    );
                } else if (Platform.OS === 'ios') {
                    RNFetchBlob.ios.openDocument(localPath);
                }
            } catch (error) {
                console.log('>>>>>>>msg e 1', error.message);
                Toast.show({ text1: error.message });
            }
        }
    }

    onBackToPreviousScreen() {
        if (this.props.messageIndex > 0) {
            NavigationAction.pop();
        } else {
            console.log('~~~~~~~~~~~~~~~ handle');
            this.props.updateNonConvControlsList({
                list: [],
                id: this.props.bot.botId,
                src:
                    'full screen onBackToPreviousScreen ->' +
                    this.state.messageOptions?.controlId
            });
            EventEmitter.emit('RefreshFullScreenMessage');
        }
    }

    closeFullScreenApp(headerProps) {
        if (
            NavigationAction.currentScreen() ===
            NavigationAction.SCREENS.fullScreenMessage
        ) {
            NavigationAction.popToFirst();
        }
        this.props.updateNonConvControlsList({
            list: [],
            id: this.props.bot.botId,
            src:
                'full screen closeFullScreenApp ->' +
                this.state.messageOptions?.controlId
        });
        headerProps.botDone() || this.props.botDone();
    }

    renderContent = () => {
        const {
            messageOptions,
            messageData,
            messageOptions: { controlId, minimizeOnConfirm, title }
        } = this.state;
        const {
            conversationId,
            userId,
            sendMessage,
            clearCurrentMap,
            messageIndex,
            formData,
            inlineActions,
            formMessage
        } = this.props;
        const type = this.messageType;
        if (type === MessageTypeConstants.MESSAGE_TYPE_FORM2) {
            return (
                <Form2
                    ref={(controlContent) => {
                        this.controlContent = controlContent;
                    }}
                    key={controlId}
                    localControlId={
                        inlineActions ? null : controlId + conversationId
                    }
                    conversationId={conversationId}
                    inlineActions={inlineActions}
                    sendMessage={sendMessage}
                    formData={formData}
                    formMessage={formMessage}
                    userId={userId}
                    conversational={false}
                    nonConvOnConfirm={() => {
                        if (minimizeOnConfirm) {
                            this.onBackToPreviousScreen();
                        }
                    }}
                    minimize={() => {
                        this.onBackToPreviousScreen();
                    }}
                    fullScreenMessageIndex={messageIndex}
                    hideLogo={this.props.hideLogo}
                />
            );
        }
        if (type === MessageTypeConstants.MESSAGE_TYPE_TABLE) {
            return (
                <View style={styles.tableContainer} key={controlId}>
                    <TableMessage
                        ref={(controlContent) => {
                            this.controlContent = controlContent;
                        }}
                        botId={this.props.bot.botId}
                        localControlId={controlId + conversationId}
                        conversationId={conversationId}
                        sendMessage={sendMessage}
                        userId={userId}
                        conversational={false}
                        fullScreenMessageIndex={messageIndex}
                        hideLogo={this.props.hideLogo}
                    />
                </View>
            );
        }
        if (type === MessageTypeConstants.MESSAGE_TYPE_CALENDAR) {
            return (
                <View style={styles.tableContainer} key={controlId}>
                    <CalenderMessage
                        ref={(controlContent) => {
                            this.controlContent = controlContent;
                        }}
                        localControlId={controlId + conversationId}
                        conversationId={conversationId}
                        sendMessage={sendMessage}
                        userId={userId}
                        botId={this.props.bot.botId}
                        conversational={false}
                        fullScreenMessageIndex={messageIndex}
                        hideLogo={this.props.hideLogo}
                    />
                </View>
            );
        }
        if (type === MessageTypeConstants.MESSAGE_TYPE_MENU) {
            return (
                <MenuMessage
                    key={controlId}
                    entries={messageData}
                    controlId={controlId}
                    sendMessage={sendMessage}
                    conversationId={conversationId}
                    fullScreenMessageIndex={messageIndex}
                    hideLogo={this.props.hideLogo}
                />
            );
        }
        if (type === MessageTypeConstants.MESSAGE_TYPE_CONTAINER) {
            return (
                <ContainerMessage
                    key={controlId}
                    fields={messageData}
                    controlId={controlId}
                    sendMessage={sendMessage}
                    conversationId={conversationId}
                    userId={userId}
                    botId={this.props.bot.botId}
                    options={messageOptions}
                    nonConvOnConfirm={() => this.onBackToPreviousScreen()}
                    fullScreenMessageIndex={messageIndex}
                    setTitle={this.props.setTitle}
                    hideLogo={this.props.hideLogo}
                />
            );
        }
        if (type === MessageTypeConstants.MESSAGE_TYPE_MAP) {
            return (
                <MapMessage
                    key={controlId}
                    ref={(controlContent) => {
                        this.controlContent = controlContent;
                    }}
                    localControlId={controlId + conversationId}
                    conversationId={conversationId}
                    sendMessage={sendMessage}
                    userId={userId}
                    botId={this.props.bot.botId}
                    conversational={false}
                    fullScreenMessageIndex={messageIndex}
                    hideLogo={this.props.hideLogo}
                />
            );
        }
        if (type === MessageTypeConstants.MESSAGE_TYPE_TIMELINE) {
            return (
                <View style={styles.tableContainer} key={controlId}>
                    <TimeLineMessage
                        ref={(controlContent) => {
                            this.controlContent = controlContent;
                        }}
                        localControlId={controlId + conversationId}
                        conversationId={conversationId}
                        sendMessage={sendMessage}
                        userId={userId}
                        botId={this.props.bot.botId}
                        conversational={false}
                        fullScreenMessageIndex={messageIndex}
                        navigation={this.props.navigation}
                        hideLogo={this.props.hideLogo}
                    />
                </View>
            );
        }
        if (type === MessageTypeConstants.MESSAGE_TYPE_SURVEY) {
            return (
                <View style={styles.tableContainer} key={controlId}>
                    <SurveyMessage
                        ref={(controlContent) => {
                            this.controlContent = controlContent;
                        }}
                        localControlId={controlId + conversationId}
                        conversationId={conversationId}
                        sendMessage={sendMessage}
                        userId={userId}
                        botId={this.props.bot.botId}
                        conversational={false}
                        fullScreenMessageIndex={messageIndex}
                        navigation={this.props.navigation}
                        hideLogo={this.props.hideLogo}
                    />
                </View>
            );
        }
        if (type === MessageTypeConstants.MESSAGE_TYPE_HTML) {
            return (
                <View style={styles.tableContainer} key={controlId}>
                    <WebViewScreen
                        route={{
                            params: {
                                url: messageOptions.url,
                                hideCloseButton: true
                            }
                        }}
                    />
                </View>
            );
        }
    };

    render() {
        const { conversationContext, bot, isWaiting, waiting } = this.props;
        const { webViewContent, showWebView } = this.state;
        return (
            <SafeAreaView style={chatStyles.safeArea}>
                {this.renderContent()}
                {(isWaiting || waiting) && (
                    <PulseIndicator
                        color={GlobalColors.frontmLightBlue}
                        style={{
                            size: 50,
                            bottom: 150,
                            position: 'absolute',
                            alignSelf: 'center'
                        }}
                    />
                )}
                <Modal
                    animationType="slide"
                    visible={showWebView}
                    transparent={false}
                >
                    <SafeAreaView
                        style={{
                            flex: 1,
                            backgroundColor:
                                GlobalColors.fullScreenMessageBackground
                        }}
                    >
                        <View style={{ flex: 1 }}>
                            <WebView
                                originWhitelist={['*']}
                                scalesPageToFit
                                // automaticallyAdjustContentInsets={true}
                                source={webViewContent}
                            />
                            <TouchableOpacity
                                style={{
                                    backgroundColor: GlobalColors.textBlack,
                                    width: 30,
                                    height: 30,
                                    position: 'absolute',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    alignSelf: 'flex-end',
                                    borderRadius: 15,
                                    right: 20,
                                    top: 15
                                }}
                                onPress={() => {
                                    this.setState({
                                        showWebView: false,
                                        webViewContent: {}
                                    });
                                }}
                            >
                                {Icons.close({
                                    size: 25,
                                    color: GlobalColors.white
                                })}
                            </TouchableOpacity>
                        </View>
                    </SafeAreaView>
                </Modal>
                <ChatBubblesOverlay
                    conversationContext={conversationContext}
                    bot={bot}
                />
            </SafeAreaView>
        );
    }
}

const mapStateToProps = (state) => ({
    messageList: state.bots.nonConvControlsList,
    waiting: state.messageState.waiting
});

const mapDispatchToProps = (dispatch) => ({
    updateNonConvControlsList: (list) =>
        dispatch(updateNonConvControlsListFunc(list))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(FullScreenMessageV2);
