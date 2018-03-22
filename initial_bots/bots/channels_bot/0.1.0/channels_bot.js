(function () {
    const CHANNELS_CAP = 'ChannelsCapability';
    const CREATE_CHANNEL = 'CreateChannel';
    const SHOW_OWNED_CHANNELS = 'GetOwnedChannels';
    const SHOW_UNSUBED_CHANNELS = 'FindChannels';
    const FRONTM_DOMAIN = 'frontmai';

    let next = function (message, state, previousMessages, botContext) {
        if (message.getMessageType() === 'slider_response') {
            let action = message.getMessage()[0].action || '';
            if (CREATE_CHANNEL === action) {
                return showCreateChannelForm(message, state, previousMessages, botContext);
            } else if(SHOW_UNSUBED_CHANNELS === action) {
                return showUnsubedChannels(message, state, previousMessages, botContext);
            } else if(SHOW_OWNED_CHANNELS === action) {
                return showOwnedChannels(message, state, previousMessages, botContext);
            } else {
                let channelList = message.getMessage();
                let ownedChannel = channelList[0].ownedChannel;
                if(ownedChannel) {
                    return showEditChannelForm(channelList[0], state, previousMessages, botContext);
                } else {
                    return subscribeToChannels(channelList, state, previousMessages, botContext);
                }

            }
        } else if (message.getMessageType() === 'form_response') {
            let formData = message.getMessage();
            let buttonTitle = formData[3].title || formData[2].title || '';
            if (buttonTitle === 'Create') {
                return createChannel(message, previousMessages, botContext);
            } else if (buttonTitle === 'Edit') {
                return editChannel(message, previousMessages, botContext);
            }
        } else if (message.getMessageType() === 'string') {
            return processNlp(message, state, previousMessages, botContext);
        }
    };

    const processNlp = function(msg, state, previousMessages, botContext) {
        const authContext = botContext.getCapability('authContext');

        botContext.wait(true);
        authContext.getAuthUser(botContext)
        .then(function(user) {
            const agentGuardService = botContext.getCapability('agentGuardService');
            return agentGuardService.executeCustomCapability(SHOW_UNSUBED_CHANNELS, {queryString: msg.getMessage(), domains: user.info.domains}, true, undefined, botContext, user);
        })
        .then(function(channels) {
            showChannelsList(channels, false, botContext);
        })
        .catch(function (err) {
            console.log(err);
            tell('Error occurred getting channels data', botContext);
        });
    };

    let subscribeToChannels = function (channelList, state, previousMessages, botContext) {
        botContext.wait(true);

        const _ = botContext.getCapability('Utils').Lodash;
        let selectedChannels = [];
        _.forEach(channelList, function(channel) {
            selectedChannels.push({
                name: channel.title,
                domain: channel.domain,
                logo: channel.logo,
                desc: _.get(channel, 'data.channel_info[1].value')
            });
        });

        const channelCap = botContext.getCapability('Channel');
        channelCap.subscribe(selectedChannels)
        .then(function() {
            tell('Subscribed to selected channels', botContext);
        })
        .catch(function() {
            tell('Error occurred while trying to subscribe to the channels', botContext);
        });

        return ask(botContext);
    };

    const ask = function(botContext) {
        let Message = botContext.getCapability('Message');
        let message = new Message();
        message.sliderMessage([{
            title: 'Show me channel suggestions',
            action: SHOW_UNSUBED_CHANNELS
        },{
            title: 'Show me the channels I created',
            action: SHOW_OWNED_CHANNELS
        },{
            title: 'Create Channel',
            action: CREATE_CHANNEL
        }
        ], {smartReply: true});
        tell(message, botContext);

    };

    let createChannel = function(msg, previousMessages, botContext) {
        let channelName = msg.getMessage()[1].value;
        let channelDesc = msg.getMessage()[2].value;

        botContext.wait(true);
        const channelCap = botContext.getCapability('Channel');
        channelCap.create(channelName, channelDesc, FRONTM_DOMAIN)
        .then(function() {
            tell('Channel created', botContext);
            return ask(botContext);
        })
        .catch(function() {
            tell('Unable to create channel. Is a channel with the same name already created? If so, you can subscribe to it', botContext);
            return ask(botContext);
        });
    };

    let editChannel = function(msg, previousMessages, botContext) {
        let desc = msg.getMessage()[1].value;
        let channel = msg.getMessage()[3].channel;

        botContext.wait(true);
        const channelCap = botContext.getCapability('Channel');
        channelCap.update(channel.name, desc, channel.domain)
        .then(function() {
            tell('Channel updated', botContext);
            return ask(botContext);
        })
        .catch(function() {
            tell('Unable to update channel', botContext);
            return ask(botContext);
        });
    };

    let showOwnedChannels = function(message, state, previousMessages, botContext) {
        const authContext = botContext.getCapability('authContext');

        botContext.wait(true);
        authContext.getAuthUser(botContext)
        .then(function(user) {
            const agentGuardService = botContext.getCapability('agentGuardService');
            return agentGuardService.executeCustomCapability(CHANNELS_CAP, {action: SHOW_OWNED_CHANNELS, domains: user.info.domains}, true, undefined, botContext, user);
        })
        .then(function(channels) {
            showChannelsList(channels, true, botContext);
        })
        .catch(function (err) {
            console.log(err);
            tell('Error occurred getting channels data', botContext);
        });
    };

    let showUnsubedChannels = function(message, state, previousMessages, botContext) {
        botContext.wait(true);
        let page = state.channelsPage || 1;

        const authContext = botContext.getCapability('authContext');
        authContext.getAuthUser(botContext)
        .then(function (user) {
            let domainsList = "'" + user.info.domains.join("','") + "'";
            let queryStr = '{participants: {$ne: \'' + user.userUUID + '\'}, domain: {$in: [' + domainsList + ']}}';
            let pageQuery = "&page=" + page;
            let pgSizeQuery = "&pagesize=10";
            let queryObj = queryStr + pageQuery + pgSizeQuery;
            let fields = ["name", "desc", "owners", "domain", "logo"];

            return getChannels(message, botContext, user, previousMessages, queryObj, fields);
        })
        .then((channels) => {
            const _ = botContext.getCapability('Utils').Lodash;
            if (_.isEmpty(channels) || channels.length <= 10) {
                state.channelsPage = 1;
            } else {
                state.channelsPage = page + 1;
            }
            showChannelsList(channels, false, botContext);
        })
        .catch(function (err) {
            tell('Unable to get the channel list' + err, botContext);
        });
    };

    let showChannelsList = function(channels, isOwnedChannels, botContext) {
        channels = channels || [];
        const _ = botContext.getCapability('Utils').Lodash;
        if (_.isEmpty(channels)) {
            if(isOwnedChannels) {
                tell('You have not created any channels', botContext);
            } else {
                tell('You have either subscribed to all the channels. Or, there are no more channels to show, the next search will show channels from the beginning', botContext);
            }
            return ask(botContext);
        } else {
            const sliderData = getChannelsListForDisplay(channels, isOwnedChannels);
            let Message = botContext.getCapability('Message');
            let message = new Message();
            if(isOwnedChannels) {
                message.sliderMessage(sliderData, {smartReply: true});
            } else {
                message.sliderMessage(sliderData, {
                    select: true,
                    multiSelect: true
                });
            }
            tell(message, botContext);
        }
    };

    const getChannelsListForDisplay = function (channelsJson, isOwnedChannels) {
        channelsJson = channelsJson || [];
        let sliderFormat = channelsJson.map((channel) => {
            return {
                title: channel.name,
                data: {
                    channel_info: [{
                        key: 'Name',
                        value: channel.name
                    }, {
                        key: 'Description',
                        value: channel.desc
                    }]
                },
                domain: channel.domain,
                logo: channel.logo,
                ownedChannel: isOwnedChannels
            }
        });
        return sliderFormat;
    };

    let getChannels = function(msg, botContext, user, previousMessages, queryObject, fields) {
        const agentGuardService = botContext.getCapability('agentGuardService');
        let params = {
            collection: "Channels",
            fields: fields,
            queryObject: queryObject
        };

        return agentGuardService.readData(msg, botContext, user, previousMessages, params);
    };

    let showEditChannelForm = function (selectedChannel, state, previousMessages, botContext) {
        const _ = botContext.getCapability('Utils').Lodash;
        let channel = {
            name: selectedChannel.title,
            domain: selectedChannel.domain,
            desc: _.get(selectedChannel, 'data.channel_info[1].value')
        };

        let Message = botContext.getCapability('Message');
        let message = new Message();
        message.formMessage([{
            id:1,
            title:'Please edit the channel ' + channel.name + ' details',
            type: 'text'
        }, {
            id:2,
            title:'Description',
            type: 'text_field',
            optional: false,
            value: channel.desc
        }, {
            id:3,
            title:'Edit',
            type: 'button'
        }, {
            channel: channel
        }], '');
        tell(message, botContext);
    };

    let showCreateChannelForm = function (msg, state, previousMessages, botContext) {
        let Message = botContext.getCapability('Message');
        let message = new Message();
        message.formMessage([{
            id:1,
            title:'Please enter the channel\'s details',
            type: 'text'
        }, {
            id:2,
            title:'Name',
            type: 'text_field',
            optional: false,
            value: ''
        }, {
            id:3,
            title:'Description',
            type: 'text_field',
            optional: false,
            value: ''
        }, {
            id:4,
            title:'Create',
            type: 'button'
        }], '');
        tell(message, botContext);
    };

    let greeting = function (state, previousMessages, botContext) {
        return ask(botContext);
    };

    let tell = function (msg, botContext) {
        botContext.tell(msg);
    };


    let state = {
    };

    // We can use this to dump the state of the bot at any time.
    let debug = function () {
        return {
            localState: state
        }
    };

    let farewell = function (msg, state, previousMessages, botContext) {
    };

    let asyncResult = function (result, state, previousMessages, botContext) {
    };

    return {
        done: farewell,
        init: greeting,
        asyncResult: asyncResult,
        next: next,
        debug: debug,
        version: '1.0.0'
    };
})();
