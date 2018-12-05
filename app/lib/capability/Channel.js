import _ from 'lodash';
import config from '../../config/config';
import I18n from '../../config/i18n/i18n';
import { Auth, Network } from '.';
import SystemBot from '../bot/SystemBot';
import ChannelDAO from '../../lib/persistence/ChannelDAO';
import Store from '../../redux/store/configureStore';
import { completeChannelInstall } from '../../redux/actions/UserActions';

export class ChannelError extends Error {
    constructor(code, message) {
        super(message);
        this.code = code;
        this.message = message;
    }

    get code() {
        return this.code;
    }

    get message() {
        return this.message;
    }
}

export default class Channel {
    static getSubscribedChannels = ChannelDAO.selectChannels;

    static addToSubscribedChannel = (
        channelId,
        name,
        description,
        logo,
        domain,
        ownerEmail,
        ownerName,
        ownerId
    ) =>
        ChannelDAO.insertIfNotPresent(
            name,
            description,
            logo,
            domain,
            channelId,
            ownerEmail,
            ownerName,
            ownerId
        );

    static subscribe = channels =>
        new Promise((resolve, reject) => {
            Auth.getUser()
                .then(user => {
                    if (user) {
                        let channelsGroup = _.groupBy(channels, 'userDomain');
                        let domainChannels = _.map(
                            channelsGroup,
                            (value, key) => {
                                return {
                                    userDomain: key,
                                    channels: _.map(value, 'channelName')
                                };
                            }
                        );
                        let options = {
                            method: 'POST',
                            url: `${config.network.queueProtocol}${
                                config.proxy.host
                            }${config.network.channelsPath}`,
                            headers: {
                                sessionId: user.creds.sessionId
                            },
                            data: {
                                action: 'Subscribe',
                                botId: SystemBot.channelsBot.botId,
                                domainChannels: domainChannels
                            }
                        };
                        return Network(options);
                    }
                })
                .then(response => {
                    let err = _.get(response, 'data.error');
                    if (err !== '0' && err !== 0) {
                        reject(new ChannelError(+err));
                    } else {
                        let channelInsertPromises = _.map(channels, channel => {
                            ChannelDAO.insertIfNotPresent(
                                channel.channelName,
                                channel.description,
                                channel.logo,
                                channel.userDomain,
                                channel.channelId
                            );
                        });
                        return Promise.all(channelInsertPromises);
                    }
                })
                .then(resolve)
                .catch(reject);
        });

    static subscribeChannel = (channelName, domain) =>
        new Promise((resolve, reject) => {
            Auth.getUser()
                .then(user => {
                    if (user) {
                        let domainChannels = [
                            { userDomain: domain, channels: [channelName] }
                        ];
                        let options = {
                            method: 'POST',
                            url: `${config.network.queueProtocol}${
                                config.proxy.host
                            }${config.network.channelsPath}`,
                            headers: {
                                sessionId: user.creds.sessionId
                            },
                            data: {
                                action: 'Subscribe',
                                botId: SystemBot.channelsBot.botId,
                                domainChannels
                            }
                        };
                        return Network(options);
                    }
                })
                .then(response => {
                    let err = _.get(response, 'data.error');
                    if (err !== '0' && err !== 0) {
                        reject(new ChannelError(+err));
                    } else {
                        return ChannelDAO.updateChannelSubscription(
                            channelName,
                            domain,
                            'true'
                        );
                    }
                })
                .then(resolve)
                .catch(reject);
        });

    static unsubscribeChannel = (channelName, userDomain) =>
        new Promise((resolve, reject) => {
            Auth.getUser()
                .then(user => {
                    if (user) {
                        let options = {
                            method: 'POST',
                            url: `${config.network.queueProtocol}${
                                config.proxy.host
                            }${config.network.channelsPath}`,
                            headers: {
                                sessionId: user.creds.sessionId
                            },
                            data: {
                                action: 'Unsubscribe',
                                botId: SystemBot.channelsBot.botId,
                                userDomain,
                                channelName
                            }
                        };
                        return Network(options);
                    }
                })
                .then(response => {
                    let err = _.get(response, 'data.error');
                    if (err !== '0' && err !== 0) {
                        reject(new ChannelError(+err));
                    } else {
                        let err = _.get(response, 'data.error');
                        if (err !== '0' && err !== 0) {
                            reject(new ChannelError(+err));
                        } else {
                            return ChannelDAO.updateChannelSubscription(
                                channelName,
                                userDomain,
                                'false'
                            );
                        }
                    }
                })
                .then(resolve)
                .catch(reject);
        });

    static create = channel =>
        new Promise((resolve, reject) => {
            Auth.getUser()
                .then(user => {
                    if (user) {
                        console.log('creating channels ', channel);
                        let options = {
                            method: 'POST',
                            url: `${config.network.queueProtocol}${
                                config.proxy.host
                            }${config.network.channelsPath}`,
                            headers: {
                                sessionId: user.creds.sessionId
                            },
                            data: {
                                action: 'Create',
                                botId: SystemBot.channelsBot.botId,
                                channel: channel
                            }
                        };
                        return Network(options);
                    }
                })
                .then(response => {
                    let err = _.get(response, 'data.error');
                    if (err !== '0' && err !== 0) {
                        reject(new ChannelError(+err));
                    } else {
                        // TODO(amal) : Hardcoded logo. remove later.
                        if (
                            response.data &&
                            response.data.content &&
                            response.data.content.length > 0
                        ) {
                            const channelId = response.data.content[0];
                            return ChannelDAO.insertIfNotPresent(
                                channel.channelName,
                                channel.description,
                                'ChannelsBotLogo.png',
                                channel.userDomain,
                                channelId
                            );
                        } else {
                            reject(new ChannelError(99));
                        }
                    }
                })
                .then(resolve)
                .catch(reject);
        });

    static addUsers = (channelName, userDomain, newUserIds) =>
        new Promise((resolve, reject) => {
            Auth.getUser()
                .then(user => {
                    if (user) {
                        console.log('adding users to Channel ', channelName);
                        let options = {
                            method: 'POST',
                            url: `${config.network.queueProtocol}${
                                config.proxy.host
                            }${config.network.channelsPath}`,
                            headers: {
                                sessionId: user.creds.sessionId
                            },
                            data: {
                                action: 'AddUsers',
                                botId: SystemBot.channelsBot.botId,
                                channelName,
                                userDomain,
                                newUserIds
                            }
                        };
                        return Network(options);
                    }
                })
                .then(response => {
                    let err = _.get(response, 'data.error');
                    if (err !== '0' && err !== 0) {
                        reject(new ChannelError(+err));
                    } else {
                        // TODO(amal) : Hardcoded logo. remove later.
                        if (
                            response.data &&
                            response.data.content &&
                            response.data.content.length > 0
                        ) {
                            const channelId = response.data.content[0];
                            return ChannelDAO.insertIfNotPresent(
                                channelName,
                                'Added Participants',
                                'ChannelsBotLogo.png',
                                userDomain,
                                channelId
                            );
                        } else {
                            reject(new ChannelError(99));
                        }
                    }
                })
                .then(resolve)
                .catch(reject);
        });

    static update = (name, description, domain) =>
        new Promise((resolve, reject) => {
            Auth.getUser()
                .then(user => {
                    if (user) {
                        let options = {
                            method: 'POST',
                            url: `${config.network.queueProtocol}${
                                config.proxy.host
                            }${config.network.channelsPath}`,
                            headers: {
                                sessionId: user.creds.sessionId
                            },
                            data: {
                                action: 'Edit',
                                botId: SystemBot.channelsBot.botId,
                                channelName: name,
                                description: description,
                                userDomain: domain
                            }
                        };
                        return Network(options);
                    }
                })
                .then(response => {
                    let err = _.get(response, 'data.error');
                    if (err !== '0' && err !== 0) {
                        reject(new ChannelError(+err));
                    } else {
                        return ChannelDAO.updateChannel(
                            name,
                            domain,
                            description
                        );
                    }
                })
                .then(resolve)
                .catch(reject);
        });

    static unsubscribe = channel =>
        new Promise((resolve, reject) => {
            Auth.getUser()
                .then(user => {
                    if (user) {
                        let options = {
                            method: 'POST',
                            url: `${config.network.queueProtocol}${
                                config.proxy.host
                            }${config.network.channelsPath}`,
                            headers: {
                                sessionId: user.creds.sessionId
                            },
                            data: {
                                action: 'Unsubscribe',
                                botId: SystemBot.channelsBot.botId,
                                userDomain: channel.userDomain,
                                channelName: channel.channelName
                            }
                        };
                        return Network(options);
                    }
                })
                .then(response => {
                    console.log('Channel unsubscribe : ', response);
                    let err = _.get(response, 'data.error');
                    let code = _.get(response, 'data.statusCode');
                    if (err !== '0' && err !== 0) {
                        if (code === 422) {
                            reject(
                                new ChannelError(
                                    +err,
                                    I18n.t('Channel_admin_unsubscribe')
                                )
                            );
                        } else {
                            reject(new ChannelError(+err));
                        }
                    } else {
                        return ChannelDAO.deleteChannel(channel.id);
                    }
                })
                .then(resolve)
                .catch(() => {
                    console.log('');
                    throw new ChannelError(99);
                });
        });

    static clearChannels = ChannelDAO.deleteAllChannels;

    static refreshChannels = () =>
        new Promise((resolve, reject) => {
            Auth.getUser()
                .then(user => {
                    if (user) {
                        let options = {
                            method: 'POST',
                            url: `${config.network.queueProtocol}${
                                config.proxy.host
                            }${config.network.channelsPath}`,
                            headers: {
                                sessionId: user.creds.sessionId
                            },
                            data: {
                                action: 'Get',
                                botId: SystemBot.channelsBot.botId,
                                domains: user.info.domains
                            }
                        };
                        Store.dispatch(completeChannelInstall(false));
                        return Network(options);
                    }
                })
                .then(response => {
                    if (response.data && response.data.content) {
                        let channels = response.data.content;
                        let channelInsertPromises = _.map(channels, channel => {
                            if (!channel.channelOwner) {
                                return Promise.resolve(true);
                            }
                            return ChannelDAO.insertIfNotPresent(
                                channel.channelName,
                                channel.description,
                                channel.logo,
                                channel.userDomain,
                                channel.channelId,
                                channel.channelOwner.emailAddress,
                                channel.channelOwner.userName,
                                channel.channelOwner.userId,
                                channel.createdOn,
                                'true',
                                channel.isPlatformChannel,
                                channel.channelType
                            );
                        });
                        return Promise.all(channelInsertPromises);
                    }
                })
                .then(() => {
                    Store.dispatch(completeChannelInstall(true));
                    return resolve();
                })
                .catch(() => {
                    if (__DEV__) {
                        console.tron('Cannot Load Cahnnels');
                    }
                    return reject();
                });
        });

    static refreshUnsubscribedChannels = () =>
        new Promise((resolve, reject) => {
            Auth.getUser()
                .then(user => {
                    if (user) {
                        let options = {
                            method: 'POST',
                            url: `${config.network.queueProtocol}${
                                config.proxy.host
                            }${config.network.channelsPath}`,
                            headers: {
                                sessionId: user.creds.sessionId
                            },
                            data: {
                                action: 'getUnsubscribed',
                                botId: SystemBot.channelsBot.botId,
                                domains: user.info.domains
                            }
                        };
                        Store.dispatch(completeChannelInstall(false));
                        return Network(options);
                    }
                })
                .then(response => {
                    if (response.data && response.data.content) {
                        let channels = response.data.content;
                        let channelInsertPromises = _.map(channels, channel => {
                            if (!channel.channelOwner) {
                                return Promise.resolve(true);
                            }
                            return ChannelDAO.insertIfNotPresent(
                                channel.channelName,
                                channel.description,
                                channel.logo,
                                channel.userDomain,
                                channel.channelId,
                                channel.channelOwner.emailAddress,
                                channel.channelOwner.userName,
                                channel.channelOwner.userId,
                                channel.createdOn,
                                'false',
                                channel.isPlatformChannel,
                                channel.channelType
                            );
                        });
                        return Promise.all(channelInsertPromises);
                    }
                })
                .then(() => {
                    Store.dispatch(completeChannelInstall(true));
                    return resolve();
                })
                .catch(error => {
                    if (__DEV__) {
                        console.tron(
                            'Cannot Load  unsubscribed Cahnnels',
                            error
                        );
                    }
                    return reject();
                });
        });
}
