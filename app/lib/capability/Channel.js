import _ from 'lodash';
import config from '../../config/config';
import { Auth, Network } from '.';
import SystemBot from '../bot/SystemBot';
import ChannelDAO from '../../lib/persistence/ChannelDAO';

export class ChannelError extends Error {
    constructor(code) {
        super();
        this.code = code;
    }

    get code() {
        return this.code;
    }
}

export default class Channel {

    static getSubscribedChannels = ChannelDAO.selectChannels

    static addToSubscribedChannel = (name, description, logo, domain) => ChannelDAO.insertIfNotPresent(name, description, logo, domain)

    static subscribe = (channels) => new Promise((resolve, reject) => {
        Auth.getUser()
            .then((user) => {
                if (user) {
                    let channelsGroup = _.groupBy(channels, 'domain')
                    let domainChannels = _.map(channelsGroup, (value, key) => {
                        return {
                            domain: key,
                            channels: _.map(value, 'name'),
                        }
                    });
                    let options = {
                        'method': 'POST',
                        'url': `${config.network.queueProtocol}${config.proxy.host}${config.network.channelsPath}`,
                        'headers': {
                            accessKeyId: user.aws.accessKeyId,
                            secretAccessKey: user.aws.secretAccessKey,
                            sessionToken: user.aws.sessionToken
                        },
                        data: {
                            action: 'Subscribe',
                            userId: user.userId,
                            botId: SystemBot.channelsBot.botId,
                            domainChannels: domainChannels
                        }
                    };
                    console.log('Options : ', options);
                    return Network(options);
                }
            })
            .then((response) => {
                console.log('response : ', response);
                let err = _.get(response, 'data.error');
                if (err !== '0' && err !== 0) {
                    reject(new ChannelError(+err));
                } else {
                    console.log('channels : ', channels);
                    let channelInsertPromises = _.map(channels, (channel) => {
                        ChannelDAO.insertIfNotPresent(channel.name, channel.desc, channel.logo, channel.domain);
                    })
                    return Promise.all(channelInsertPromises);
                }
            })
            .then(resolve)
            .catch(reject);
    });


    static create = (name, description, domain) => new Promise((resolve, reject) => {
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
                            action: 'Create',
                            userId: user.userId,
                            botId: SystemBot.channelsBot.botId,
                            name: name,
                            desc: description,
                            domain: domain
                        }
                    };
                    return Network(options);
                }
            })
            .then((response) => {
                let err = _.get(response, 'data.error');
                if (err !== '0' && err !== 0) {
                    reject(new ChannelError(+err));
                } else {
                    // TODO(amal) : Hardcoded logo. remove later.
                    return ChannelDAO.insertIfNotPresent(name, description, 'ChannelsBotLogo.png', domain);
                }
            })
            .then(resolve)
            .catch(reject);
    });

    static update = (name, description, domain) => new Promise((resolve, reject) => {
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
                            action: 'Edit',
                            userId: user.userId,
                            botId: SystemBot.channelsBot.botId,
                            name: name,
                            desc: description,
                            domain: domain
                        }
                    };
                    return Network(options);
                }
            })
            .then((response) => {
                let err = _.get(response, 'data.error');
                if (err !== '0' && err !== 0) {
                    reject(new ChannelError(+err));
                } else {
                    return ChannelDAO.updateChannel(name, domain, description);
                }
            })
            .then(resolve)
            .catch(reject);
    });

    static unsubscribe = (channel) => new Promise((resolve, reject) => {
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
                            action: 'Unsubscribe',
                            userId: user.userId,
                            botId: SystemBot.channelsBot.botId,
                            domain: channel.domain,
                            channel: channel.name,
                        }
                    };
                    return Network(options);
                }
            })
            .then((response) => {
                let err = _.get(response, 'data.error');
                if (err !== '0' && err !== 0) {
                    reject(new ChannelError(+err));
                } else {
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
                            action: 'Get',
                            userId: user.userId,
                            botId: SystemBot.channelsBot.botId,
                            domains: user.info.domains
                        }
                    };
                    return Network(options);
                }
            })
            .then((response) => {
                if (response.data && response.data.content) {
                    let channels = response.data.content;
                    console.log('channels : ', channels);
                    let channelInsertPromises = _.map(channels, (channel) => {
                        ChannelDAO.insertIfNotPresent(channel.name, channel.desc, channel.logo, channel.domain);
                    })
                    return Promise.all(channelInsertPromises);
                }
            })
            .then(resolve)
            .catch(reject);
    });
}
