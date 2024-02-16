const HANDLED_MEDIA_SESSIONS = {};
const handleNotification = (params) => {
    const bots = await Bot.getInstalledBots();
                const targetBot = bots.find(
                    (bot) => bot.botId === botId
                    // bot => { return bot.botId === 'iRUaMo58iqCRDubmDKi8M3' }
                );
                if (targetBot) {
                    Actions.bot({
                        bot: targetBot,
                        videoCallData: {
                            userId: callerUserId,
                            videoControlId: videoControlId,
                            videoSessionId: videoSessionId
                        }
                    });
                } else {
                }
};
const handleCallAnswer = (params) => {
    const {
        videoSessionId,
        video,
        callerName,
        botId,
        videoControlId,
        callerUserId,
        mediasoupHost,
        codec,
        roomName,
        iAmHost,
        startWithVideoMuted,
        preConnectCallCheck,
        userId,
        uid,
        ur,
        brand
    } = params;

    if (botId) {
        if (videoControlId === 'conferenceCall') {
            handleCallAnswer(screenLaunchProps)
        } else {
            handleNotification(screenLaunchProps)
        }
    } else if (
        Actions.currentScene !== ROUTER_SCENE_KEYS.meetingRoom ||
        Actions.currentScene !== ROUTER_SCENE_KEYS.meetingRoom2
    ) {
        // TODO(react-native-notifications) : should we cancel voice notifications
        // FrontMUtils.cancelVoiceNotifications(() => {});
        
    }



    if (!HANDLED_MEDIA_SESSIONS[videoSessionId]) {
        const action =
            Actions[
                config.proxy.meetingServersMapping[
                    mediasoupHost
                ]
            ];
        action({
            hostname: mediasoupHost,
            codec,
            roomName: roomName,
            peerId: user.userId,
            roomId: videoSessionId,
            displayName: user.info.userName,
            botId: botId,
            iAmHost: iAmHost,
            startWithVideoMuted: startWithVideoMuted,
            preConnectCallCheck: preConnectCallCheck,
            userId: userId,
            uid,
            ur,
            brand
        });
        HANDLED_MEDIA_SESSIONS[videoSessionId] = true;
    }

    Actions.meetingRoom2({
                // data: { videoSessionId: params.videoSessionId },
                data: {
                    otherUserId: callerUserId,
                    otherUserName: callerName,
                    videoSessionId: videoSessionId
                },
                incomingVoipCall: true,
                title: callerName,
                isVideoCall: video,
                userId: user.info.userId
            });
};

handleCallReject = ()=>{
    const {
        videoControlId: videoControlId,
        botId
    } = this.props.screenProps;
    if (botId) {
        const msg = {
            controlId: 'conferenceCall',
            action: 'callReject',
            videoSessionId: this.props.screenProps.videoSessionId
        };
        const message = new Message();
        message.messageByBot(false);
        message.videoResponseMessage(msg);
        message.setCreatedBy(user.userId);
        const messageSender = new BackgroundMessageSender(botId);
        messageSender.sendMessage(message);
        return;
    }
    if (videoControlId !== 'conferenceCall') {
        // TODO(react-native-notifications) : should we cancel voice notifications
        // FrontMUtils.cancelVoiceNotifications(() => {});
        UserServices.sendVoipPushNotification({
            callAction: 'CallEnd',
            userId: this.props.screenProps.callerUserId,
            callerUserId: user.info.userId,
            videoSessionId: this.props.screenProps.videoSessionId,
            video: !!this.props.video
        })
            .then(() => {
                console.log('Call end sent from callkeep');
            })
            .catch((error) => {
                console.log('Call end error from callkeep');
            });
    }
}
handleAndroidInitialActions = (screenLaunchProps) => {
    if (screenLaunchProps.actionType === 'accept') {
        const {
            videoSessionId,
            video,
            callerName,
            botId,
            videoControlId,
            callerUserId,
            
        } = screenLaunchProps;
        console.log('Notification: user: - main', screenLaunchProps);
        if (botId) {
            if (videoControlId === 'conferenceCall') {
                handleCallAnswer(screenLaunchProps)
            } else {
                handleNotification(screenLaunchProps)
            }
        } else
        handleCallAnswer(screenLaunchProps)
        
    } else if (screenLaunchProps.actionType === 'reject') {
        // TODO(react-native-notifications) : should we cancel voice notifications
        // FrontMUtils.cancelVoiceNotifications(() => {});
        handleCallReject(screenLaunchProps)
    }
};
