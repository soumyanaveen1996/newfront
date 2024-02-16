import _ from 'lodash';
import { Auth } from '.';
import ChannelDAO from '../../lib/persistence/ChannelDAO';
import Store from '../../redux/store/configureStore';
import { completeChannelInstall } from '../../redux/actions/UserActions';
const moment = require('moment');
const R = require('ramda');
import { Conversation } from '../conversation';
import ChannelsServices from '../../apiV2/ChannelsServices';

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

    static grpcSubscribeChannels = (user, channels) =>
        ChannelsServices.subscribe(channels);

    static grpcRequestPrivateChannelAccess = (user, channel) =>
        ChannelsServices.requestPrivateChannelAccess(channel);

    static grpcUnsubscribeChannels = (user, channels) =>
        ChannelsServices.unsubscribe(channels);

    static grpcGetSubscribed = () => ChannelsServices.getSubscribed();

    static grpcGetUnubscribed = () => ChannelsServices.getUnsubscribed();

    static grpcGetOwned = () => ChannelsServices.getOwned();

    static grpcAddParticipants = (user, participants) =>
        ChannelsServices.addParticipants(participants);

    static grpcCreate = (user, params) => ChannelsServices.create(params);

    static grpcEdit = (user, params) => ChannelsServices.edit(params);

    static subscribe = (channels) =>
        new Promise((resolve, reject) => {
            const user = Auth.getUserData();
            if (user) {
                let channelsGroup = _.groupBy(channels, 'userDomain');
                let domainChannels = _.map(channelsGroup, (value, key) => {
                    return {
                        userDomain: key,
                        channels: _.map(value, 'channelName')
                    };
                });
                Channel.grpcSubscribeChannels(user, {
                    domainChannels
                })
                    .then((response) => {
                        if (response.error) {
                            reject(new ChannelError(98, response.message));
                        } else {
                            let channelInsertPromises = _.map(
                                channels,
                                (channel) => {
                                    ChannelDAO.insertIfNotPresent(
                                        channel.channelName,
                                        channel.description,
                                        channel.logo,
                                        channel.userDomain,
                                        channel.channelId
                                    );
                                }
                            );
                            return Promise.all(channelInsertPromises);
                        }
                    })
                    .then(resolve)
                    .catch(reject);
            }
        });

    static subscribeChannel = (channelName, domain) =>
        new Promise((resolve, reject) => {
            const user = Auth.getUserData();
            if (user) {
                let domainChannels = [
                    { userDomain: domain, channels: [channelName] }
                ];
                Channel.grpcSubscribeChannels(user, {
                    domainChannels
                })
                    .then((response) => {
                        Conversation.downloadRemoteConversations();
                        if (response.error) {
                            reject(new ChannelError(98, response.message));
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
            }
        });

    static unsubscribeChannel = (channelName, userDomain) =>
        new Promise((resolve, reject) => {
            const user = Auth.getUserData();
            if (user) {
                let domainChannels = [
                    { userDomain: userDomain, channels: [channelName] }
                ];
                Channel.grpcUnsubscribeChannels(user, {
                    domainChannels
                })
                    .then((response) => {
                        if (response.error) {
                            reject(new ChannelError(98, response.message));
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
            }
        });

    static requestPrivateChannelAccess = (channelName, domain) =>
        new Promise((resolve, reject) => {
            const user = Auth.getUserData();
            if (user) {
                let domainChannel = {
                    userDomain: domain,
                    channelName: channelName
                };
                Channel.grpcRequestPrivateChannelAccess(user, domainChannel)
                    .then((response) => {
                        if (response.error) {
                            reject(new ChannelError(98, response.message));
                        } else resolve(true);
                    })
                    .catch(reject);
            }
        });

    static create = (channel) =>
        new Promise((resolve, reject) => {
            Channel.grpcCreate(null, channel)
                .then(async (response) => {
                    if (response.error) {
                        reject(new ChannelError(98, response.errorMessage));
                    } else {
                        // TODO(amal) : Hardcoded logo. remove later.
                        if (
                            response &&
                            response.content &&
                            response.content.length > 0
                        ) {
                            const channeData = channel.channel;
                            const user = Auth.getUserData();
                            const channelId = response.content[0];
                            let isPlatformChannel = false;
                            let isFavourite = false;
                            if (channeData.userDomain === 'frontmai') {
                                isPlatformChannel = true;
                            }

                            Conversation.downloadRemoteConversations();
                            return ChannelDAO.insertIfNotPresent(
                                channeData.channelName,
                                channeData.description,
                                'ChannelsBotLogo.png',
                                channeData.userDomain,
                                channelId,
                                user.info.emailAddress,
                                user.info.userName,
                                user.info.userId,
                                moment().valueOf().toString(),
                                'true',
                                isPlatformChannel,
                                channeData.channelType,
                                channeData.discoverable,
                                isFavourite
                            );
                        } else {
                            reject(new ChannelError(99));
                        }
                    }
                })
                .then((id) => {
                    return ChannelDAO.selectChannel(id);
                })
                .then(resolve)
                .catch((error) => {
                    console.log('>>>>>>err', error);
                    reject(error);
                });
        });

    static deleteChannel = (channel) =>
        new Promise((resolve, reject) => {
            return ChannelsServices.deleteChannel({
                channelName: channel.channelName,
                userDomain: channel.userDomain
            })
                .then((response) => {
                    if (response.error == 0) {
                        return ChannelDAO.deleteChannel(channel.id);
                    } else {
                        reject(new ChannelError(98, response.message));
                    }
                })
                .then(() => {
                    Channel.refreshChannels();
                    resolve();
                });
        });

    static addUsers = (channelName, userDomain, newUserIds) =>
        new Promise((resolve, reject) => {
            Channel.grpcAddParticipants(null, {
                channelName,
                userDomain,
                newUserIds
            })

                .then((response) => {
                    if (response.error) {
                        reject(new ChannelError(98, response.message));
                    } else {
                        if (
                            response &&
                            response.content &&
                            response.content.length > 0
                        ) {
                            resolve;
                        } else {
                            reject(
                                new ChannelError(99),
                                'Channel created, failed to add members'
                            );
                        }
                    }
                })
                .then(resolve)
                .catch((e) => reject(e));
        });

    static updateParticipants = (channelName, userDomain, userIds) =>
        new Promise((resolve, reject) => {
            ChannelsServices.updateParticipants({
                channelName: channelName,
                userDomain: userDomain,
                userIds: userIds
            })
                .then((response) => {
                    if (response.error === 0) {
                        resolve();
                    } else reject(new ChannelError(98, response.message));
                })
                .catch(reject);
        });

    static getParticipants = (channelName, userDomain) =>
        ChannelsServices.getParticipants({
            channelName: channelName,
            userDomain: userDomain
        });

    static getAdmins = (channelName, userDomain) =>
        ChannelsServices.getChannelAdmins({
            channelName: channelName,
            userDomain: userDomain
        });

    static updateAdmins = (channelName, userDomain, adminsIds) =>
        new Promise((resolve, reject) => {
            return ChannelsServices.updateChannelAdmins({
                channelName: channelName,
                userDomain: userDomain,
                admins: adminsIds,
                userIds: adminsIds
            })
                .then((res) => {
                    if (res.error === 0)
                        return Channel.refreshUnsubscribedChannels();
                    else reject(new ChannelError(98, res.message));
                })
                .then(() => {
                    return Channel.refreshChannels();
                })
                .then(resolve)
                .catch(reject);
        });

    static getRequests = (channelName, userDomain) =>
        ChannelsServices.getPendingParticipants({
            channelName: channelName,
            userDomain: userDomain
        });

    static manageRequests = (
        channelName,
        userDomain,
        acceptedUserIds,
        ignoredUserIds
    ) =>
        new Promise((resolve, reject) => {
            ChannelsServices.authorizeParticipants({
                channelName: channelName,
                userDomain: userDomain,
                accepted: acceptedUserIds,
                ignored: ignoredUserIds
            })
                .then((res) => {
                    if (res.error === 0) resolve(res.content);
                    else reject(new ChannelError(98, res.message));
                })
                .catch(reject);
        });

    static setChannelOwner = (channelName, userDomain, newOwnerId) =>
        new Promise((resolve, reject) => {
            ChannelsServices.changeOwner({
                channelName: channelName,
                userDomain: userDomain,
                newOwnerId: newOwnerId
            })
                .then((res) => {
                    if (res.error === 0) return Channel.refreshChannels();
                    else reject(new ChannelError(98, res.message));
                })
                .then(() => {
                    return Channel.refreshUnsubscribedChannels();
                })
                .then(resolve)
                .catch(reject);
        });

    static update = (channel) =>
        new Promise((resolve, reject) => {
            const user = Auth.getUserData();
            if (user) {
                Channel.grpcEdit(user, channel)
                    .then((response) => {
                        if (response.error === 0) {
                            return ChannelDAO.updateChannel(
                                channel.channelName,
                                channel.userDomain,
                                channel.description
                            );
                        } else {
                            reject(new ChannelError(98, response.message));
                        }
                    })
                    .then(resolve)
                    .catch(reject);
            } else {
                reject();
            }
        });

    static unsubscribe = (channel) =>
        new Promise((resolve, reject) => {
            const user = Auth.getUserData();
            if (user) {
                let domainChannels = [
                    {
                        userDomain: channel.userDomain,
                        channels: [channel.channelName]
                    }
                ];
                Channel.grpcUnsubscribeChannels(user, {
                    domainChannels
                })
                    .then((response) => {
                        if (response.error) {
                            reject(new ChannelError(98, response.message));
                        } else {
                            return ChannelDAO.deleteChannel(channel.id);
                        }
                    })
                    .then(() => {
                        return Channel.refreshChannels();
                    })
                    .then(resolve)
                    .catch(reject);
            }
        });

    static clearChannels = ChannelDAO.deleteAllChannels;

    static changeIsFavourite = (name, domain, isFavourite) => {
        return new Promise((resolve, reject) => {
            const user = Auth.getUserData();
            if (user) {
                return ChannelDAO.updateChannelisfavourite(
                    name,
                    domain,
                    isFavourite
                )
                    .then(resolve)
                    .catch(reject);
            } else reject();
        });
    };

    static refreshChannels = () =>
        new Promise((resolve, reject) => {
            let newChannels;
            const user = Auth.getUserData();
            if (user) {
                Store.dispatch(completeChannelInstall(false));
                return Channel.grpcGetSubscribed(user)
                    .then((response) => {
                        console.log('Channel refresh : ', response);
                        newChannels = response;
                        return Channel.clearChannels();
                    })
                    .then(() => {
                        if (newChannels && newChannels.content) {
                            // console.log('all subscribed channels ', newChannels);

                            let channels = newChannels.content;
                            let channelInsertPromises = _.map(
                                channels,
                                (channel) => {
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
                                        channel.discoverable,
                                        channel.isFavourite
                                    );
                                }
                            );
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
            } else {
                return reject();
            }
        });

    static refreshUnsubscribedChannels = () =>
        new Promise((resolve, reject) => {
            const user = Auth.getUserData();
            if (user) {
                Store.dispatch(completeChannelInstall(false));
                Channel.grpcGetUnubscribed(user)
                    .then((response) => {
                        if (response && response.content) {
                            // console.log('all unscubscribe channels ', response);

                            let channels = response.content;
                            let channelInsertPromises = _.map(
                                channels,
                                (channel) => {
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
                                        channel.discoverable,
                                        channel.isFavourite
                                    );
                                }
                            );
                            return Promise.all(channelInsertPromises);
                        }
                    })
                    .then(() => {
                        Store.dispatch(completeChannelInstall(true));
                        return resolve();
                    })
                    .catch((error) => {
                        if (__DEV__) {
                            console.tron(
                                'Cannot Load  unsubscribed Cahnnels',
                                error
                            );
                        }
                        return reject();
                    });
            }
        });

    static getOwnedChannels = () =>
        new Promise((resolve, reject) => {
            const user = Auth.getUserData();
            if (user) {
                return Channel.grpcGetOwned(user)
                    .then((response) => {
                        if (response && response.content) {
                            let channels = response.content;
                            let channelInsertPromises = _.map(
                                channels,
                                (channel) => {
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
                                        channel.discoverable,
                                        channel.isFavourite
                                    );
                                }
                            );
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
            }
        });
}
