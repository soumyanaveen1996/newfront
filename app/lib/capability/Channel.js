import _ from 'lodash';
import config from '../../config/config';
import I18n from '../../config/i18n/i18n';
import { Auth, Network } from '.';
import SystemBot from '../bot/SystemBot';
import ChannelDAO from '../../lib/persistence/ChannelDAO';
import Store from '../../redux/store/configureStore';
import { completeChannelInstall } from '../../redux/actions/UserActions';
const moment = require('moment');

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

// User/admin/participant object
//{
//   emailAddress:
//   userName:
//   userId:
// }

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
                                userDomain: userDomain,
                                channelName: channelName
                            }
                        };
                        return Network(options);
                    }
                })
                .then(response => {
                    let err = _.get(response, 'data.error');
                    if (err !== '0' && err !== 0) {
                        if (err === 98) {
                            reject(98);
                        } else {
                            reject(new ChannelError(+err));
                        }
                    } else {
                        return ChannelDAO.updateChannelSubscription(
                            channelName,
                            userDomain,
                            'false'
                        );
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
                .then(async response => {
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
                            const user = await Auth.getUser();
                            const channelId = response.data.content[0];
                            let isPlatformChannel = false;
                            if (channel.userDomain === 'frontmai') {
                                isPlatformChannel = true;
                            }
                            return ChannelDAO.insertIfNotPresent(
                                channel.channelName,
                                channel.description,
                                'ChannelsBotLogo.png',
                                channel.userDomain,
                                channelId,
                                user.info.emailAddress,
                                user.info.userName,
                                user.info.userId,
                                moment()
                                    .valueOf()
                                    .toString(),
                                'true',
                                isPlatformChannel,
                                channel.channelType,
                                channel.discoverable
                            );
                        } else {
                            reject(new ChannelError(99));
                        }
                    }
                })
                .then(resolve)
                .catch(reject);
        });

    static deleteChannel = channel =>
        new Promise((resolve, reject) => {
            Auth.getUser()
                .then(user => {
                    if (user) {
                        console.log('deleting channel ', channel);
                        let options = {
                            method: 'POST',
                            url: `${config.network.queueProtocol}${
                                config.proxy.host
                            }${config.network.channelsPath}`,
                            headers: {
                                sessionId: user.creds.sessionId
                            },
                            data: {
                                action: 'DeleteChannel',
                                channelName: channel.channelName,
                                userDomain: channel.userDomain
                            }
                        };
                        return Network(options);
                    } else {
                        reject();
                    }
                })
                .then(response => {
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

    static updateParticipants = (channelName, userDomain, userIds) =>
        new Promise((resolve, reject) => {
            Auth.getUser()
                .then(user => {
                    console.log('updating users to Channel ', channelName);
                    let options = {
                        method: 'POST',
                        url: `${config.network.queueProtocol}${
                            config.proxy.host
                        }${config.network.channelsPath}`,
                        headers: {
                            sessionId: user.creds.sessionId
                        },
                        data: {
                            action: 'UpdateParticipants',
                            channelName: channelName,
                            userDomain: userDomain,
                            userIds: userIds
                        }
                    };
                    return Network(options);
                })
                .then(response => {
                    let err = _.get(response, 'data.error');
                    if (err !== '0' && err !== 0) {
                        reject(new ChannelError(+err));
                    } else {
                        resolve();
                    }
                })
                .catch(reject);
        });

    static getParticipants = (channelName, userDomain) =>
        new Promise((resolve, reject) => {
            Auth.getUser()
                .then(user => {
                    let options = {
                        method: 'POST',
                        url: `${config.network.queueProtocol}${
                            config.proxy.host
                        }${config.network.channelsPath}`,
                        headers: {
                            sessionId: user.creds.sessionId
                        },
                        data: {
                            action: 'GetParticipants',
                            channelName: channelName,
                            userDomain: userDomain
                        }
                    };
                    return Network(options);
                })
                .then(res => {
                    resolve(res.data.content);
                })
                .catch(reject);
        });

    static getAdmins = (channelName, userDomain) =>
        new Promise((resolve, reject) => {
            Auth.getUser()
                .then(user => {
                    let options = {
                        method: 'POST',
                        url: `${config.network.queueProtocol}${
                            config.proxy.host
                        }${config.network.channelsPath}`,
                        headers: {
                            sessionId: user.creds.sessionId
                        },
                        data: {
                            action: 'GetChannelAdmins',
                            channelName: channelName,
                            userDomain: userDomain
                        }
                    };
                    return Network(options);
                })
                .then(res => {
                    resolve(res.data.content);
                })
                .catch(reject);
        });

    static updateAdmins = (channelName, userDomain, adminsIds) =>
        new Promise((resolve, reject) => {
            Auth.getUser()
                .then(user => {
                    let options = {
                        method: 'POST',
                        url: `${config.network.queueProtocol}${
                            config.proxy.host
                        }${config.network.channelsPath}`,
                        headers: {
                            sessionId: user.creds.sessionId
                        },
                        data: {
                            action: 'UpdateChannelAdmins',
                            channelName: channelName,
                            userDomain: userDomain,
                            admins: adminsIds
                        }
                    };
                    return Network(options);
                })
                .then(() => {
                    return Channel.refreshUnsubscribedChannels();
                })
                .then(() => {
                    return Channel.refreshChannels();
                })
                .then(resolve)
                .catch(reject);
        });

    static getRequests = (channelName, userDomain) =>
        new Promise((resolve, reject) => {
            Auth.getUser()
                .then(user => {
                    let options = {
                        method: 'POST',
                        url: `${config.network.queueProtocol}${
                            config.proxy.host
                        }${config.network.channelsPath}`,
                        headers: {
                            sessionId: user.creds.sessionId
                        },
                        data: {
                            action: 'GetPendingParticipants',
                            channelName: channelName,
                            userDomain: userDomain
                        }
                    };
                    return Network(options);
                })
                .then(res => {
                    let err = _.get(res, 'data.error');
                    if (err !== '0' && err !== 0) {
                        resolve([]);
                    }
                    resolve(res.data.content);
                })
                .catch(reject);
        });

    static manageRequests = (
        channelName,
        userDomain,
        acceptedUserIds,
        ignoredUserIds
    ) =>
        new Promise((resolve, reject) => {
            Auth.getUser()
                .then(user => {
                    let options = {
                        method: 'POST',
                        url: `${config.network.queueProtocol}${
                            config.proxy.host
                        }${config.network.channelsPath}`,
                        headers: {
                            sessionId: user.creds.sessionId
                        },
                        data: {
                            action: 'AuthorizeParticipants',
                            channelName: channelName,
                            userDomain: userDomain,
                            accepted: acceptedUserIds,
                            ignored: ignoredUserIds
                        }
                    };
                    return Network(options);
                })
                .then(res => {
                    let err = _.get(res, 'data.error');
                    if (err !== '0' && err !== 0) {
                        reject(new ChannelError(+err));
                    }
                    resolve(res.data.content);
                })
                .catch(reject);
        });

    static setChannelOwner = (channelName, userDomain, newOwnerId) =>
        new Promise((resolve, reject) => {
            Auth.getUser()
                .then(user => {
                    let options = {
                        method: 'POST',
                        url: `${config.network.queueProtocol}${
                            config.proxy.host
                        }${config.network.channelsPath}`,
                        headers: {
                            sessionId: user.creds.sessionId
                        },
                        data: {
                            action: 'ChangeOwner',
                            channelName: channelName,
                            userDomain: userDomain,
                            newOwnerId: newOwnerId
                        }
                    };
                    return Network(options);
                })
                .then(res => {
                    let err = _.get(res, 'data.error');
                    if (err !== '0' && err !== 0) {
                        reject(new ChannelError(+err));
                    }
                    return Channel.refreshChannels();
                })
                .then(() => {
                    return Channel.refreshUnsubscribedChannels();
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
                        reject(new ChannelError(+err));
                    } else {
                        return ChannelDAO.deleteChannel(channel.id);
                    }
                })
                .then(resolve)
                .catch(reject);
        });

    static clearChannels = ChannelDAO.deleteAllChannels;

    static refreshChannels = () =>
        new Promise((resolve, reject) => {
            let newChannels;
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
                    newChannels = response;
                    return Channel.clearChannels();
                })
                .then(() => {
                    if (newChannels.data && newChannels.data.content) {
                        let channels = newChannels.data.content;
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
                                channel.channelType,
                                channel.discoverable
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
                                channel.channelType,
                                channel.discoverable
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
