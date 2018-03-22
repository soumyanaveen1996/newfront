(function () {
    const CREATE_CHANNEL = 'CreateChannel';
    const SHOW_CHANNELS = 'ShowChannels';
    const FRONTM_DOMAIN = 'frontmai';
    const FIND_CHANNELS_CAP = 'FindChannels';

    let next = function (message, state, previousMessages, botContext) {
        if (message.getMessageType() === 'slider_response') {
            let action = message.getMessage()[0].action || '';
            if (CREATE_CHANNEL === action) {
                return showCreateChannelForm(message, state, previousMessages, botContext);
            } else if(SHOW_CHANNELS === action) {
                return showChannels(message, state, previousMessages, botContext);
            } else {
                return subscribeToChannels(message, state, previousMessages, botContext);
            }
        } else if (message.getMessageType() === 'form_response') {
            let buttonTitle = message.getMessage()[3].title;
            if (buttonTitle === 'Create') {
                return createChannel(message, previousMessages, botContext);
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
            return agentGuardService.executeCustomCapability(FIND_CHANNELS_CAP, {queryString: msg.getMessage()}, true, undefined, botContext, user);
        })
        .then(function(channels) {
            showChannelsList(channels, botContext);
        })
        .catch(function (err) {
            console.log(err);
            tell('Error occurred getting channels data', botContext);
        });
    };

    let subscribeToChannels = function (message, state, previousMessages, botContext) {
        botContext.wait(true);

        const _ = botContext.getCapability('Utils').Lodash;
        let selectedChannels = [];
        _.forEach(message.getMessage(), function(channel) {
            selectedChannels.push({
                name: channel.title,
                domain: channel.domain,
                logo: channel.logo,
                desc: _.get(channel, 'data.channel_info[1].value')
            });
        });
        console.log(selectedChannels);
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
            action: SHOW_CHANNELS
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

    let showChannels = function(message, state, previousMessages, botContext) {
        botContext.wait(true);
        let page = state.channelsPage || 1;

        const authContext = botContext.getCapability('authContext');
        authContext.getAuthUser(botContext)
        .then(function (user) {
            let queryStr = '{participants: {$ne: \'' + user.userUUID + '\'}}';
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
            showChannelsList(channels, botContext);
        })
        .catch(function (err) {
            tell('Unable to get the channel list' + err, botContext);
        });
    };

    let showChannelsList = function(channels, botContext) {
        channels = channels || [];
        const _ = botContext.getCapability('Utils').Lodash;
        if (_.isEmpty(channels)) {
            tell('You have either subscribed to all the channels. Or, there are no more channels to show, the next search will show channels from the beginning', botContext);
            return ask(botContext);
        } else {
            const sliderData = getChannelsListForDisplay(channels);
            let Message = botContext.getCapability('Message');
            let message = new Message();
            message.sliderMessage(sliderData, {
                select: true,
                multiSelect: true
            });
            tell(message, botContext);
        }
    };

    const getChannelsListForDisplay = function (channelsJson) {
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
                    }, {
                        key: 'Owners',
                        value: channel.owners
                    }]
                },
                domain: channel.domain,
                logo: channel.logo
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
