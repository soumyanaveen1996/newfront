import _ from 'lodash';
import config from '../../config/config';
import { Auth, Network } from '.';
import SystemBot from '../bot/SystemBot';
import ChannelDAO from '../../lib/persistence/ChannelDAO';

export default class Channel {

    static getSubscribedChannels = ChannelDAO.selectChannels

    static addToSubscribedChannel = (name, description, logo, domain) => ChannelDAO.insertIfNotPresent(name, description, logo, domain)

    static unsubscribe = (channel) => new Promise((resolve, reject) => {
        Auth.getUser()
            .then((user) => {
                if (user) {
                    let options = {
                        'method': 'POST',
                        'url': `${config.network.queueProtocol}${config.proxy.host}${config.network.channelUnsubscribePath}`,
                        'headers': {
                            accessKeyId: user.aws.accessKeyId,
                            secretAccessKey: user.aws.secretAccessKey,
                            sessionToken: user.aws.sessionToken
                        },
                        data: {
                            userUuid: user.userUUID,
                            conversationId: channel.conversationId || user.userUUID,
                            botId: SystemBot.channelsBot.id,
                            domain: channel.domain,
                            channel: channel.name,
                        }
                    };
                    return Network(options);
                }
            })
            .then((response) => {
                if (response) {
                    return ChannelDAO.deleteChannel(channel.id);
                }
            })
            .then(resolve)
            .catch(reject);
    });

    static clearChannels = ChannelDAO.deleteAllChannels

    static refreshChannels = () => new Promise((resolve, reject) => {
        Auth.getUser()
            .then((user) => {
                if (user) {
                    let options = {
                        'method': 'POST',
                        'url': `${config.network.queueProtocol}${config.proxy.host}${config.network.channelsPath}`,
                        'headers': {
                            accessKeyId: user.aws.accessKeyId,
                            secretAccessKey: user.aws.secretAccessKey,
                            sessionToken: user.aws.sessionToken
                        },
                        data: {
                            userUuid: user.userUUID,
                            conversationId: user.userUUID,
                            botId: SystemBot.channelsBot.id,
                            domains: user.info.domains
                        }
                    };
                    return Network(options);
                }
            })
            .then((response) => {
                if (response.data && response.data.content) {
                    let channels = response.data.content;
                    let channelInsertPromises = _.map(channels, (channel) => {
                        ChannelDAO.insertIfNotPresent(channel.channelName, channel.description, channel.channelLogo, channel.domain);
                    })
                    return Promise.all(channelInsertPromises);
                }
            })
            .then(resolve)
            .catch(reject);
    });
}
