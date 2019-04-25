import _ from 'lodash';
import config from '../../config/config';
import I18n from '../../config/i18n/i18n';
import { Auth, Network } from '.';
import SystemBot from '../bot/SystemBot';
import ChannelDAO from '../../lib/persistence/ChannelDAO';
import Store from '../../redux/store/configureStore';
import { completeChannelInstall } from '../../redux/actions/UserActions';
const moment = require('moment');
const R = require('ramda');

import { NativeModules } from 'react-native';
const ChannelsServiceClient = NativeModules.ChannelsServiceClient;

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

const callGRPCFunction = (methodName, user, params) => {
    console.log('Calling GRPC Function:::', methodName);

    return new Promise((resolve, reject) => {
        if (R.isNil(methodName) || methodName === '') {
            return reject(new Error('GRPC MethodName cannot be Empty'));
        }
        if (!user) {
            return reject(new Error('No Logged in User'));
        }

        // Call Function
        ChannelsServiceClient[methodName](
            user.creds.sessionId,
            params,
            (err, result) => {
                if (err) {
                    return reject(
                        new Error(
                            `GRPC Call to ChannelsServiceClient.${methodName} has Failed`
                        )
                    );
                } else {
                    resolve(result);
                }
            }
        );
    });
};

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
        new Promise((resolve, reject) => {
            if (user) {
                ChannelsServiceClient.subscribe(
                    user.creds.sessionId,
                    channels,
                    (err, result) => {
                        if (err) {
                            reject(new Error('Unknown error'));
                        } else {
                            resolve(result);
                        }
                    }
                );
            } else {
                reject(new Error('No Logged in user'));
            }
        });

    static grpcUnsubscribeChannels = (user, channels) =>
        new Promise((resolve, reject) => {
            if (user) {
                ChannelsServiceClient.unsubscribe(
                    user.creds.sessionId,
                    channels,
                    (err, result) => {
                        if (err) {
                            reject(new Error('Unknown error'));
                        } else {
                            resolve(result);
                        }
                    }
                );
            } else {
                reject(new Error('No Logged in user'));
            }
        });

    static grpcGetSubscribed = user =>
        new Promise((resolve, reject) => {
            if (user) {
                ChannelsServiceClient.getSubscribed(
                    user.creds.sessionId,
                    (err, result) => {
                        if (err) {
                            reject(new Error('Unknown error'));
                        } else {
                            resolve(result);
                        }
                    }
                );
            } else {
                reject(new Error('No Logged in user'));
            }
        });

    static grpcGetUnubscribed = user =>
        new Promise((resolve, reject) => {
            if (user) {
                ChannelsServiceClient.getUnsubscribed(
                    user.creds.sessionId,
                    (err, result) => {
                        if (err) {
                            reject(new Error('Unknown error'));
                        } else {
                            resolve(result);
                        }
                    }
                );
            } else {
                reject(new Error('No Logged in user'));
            }
        });

    static grpcGetOwned = user =>
        new Promise((resolve, reject) => {
            if (user) {
                ChannelsServiceClient.getOwned(
                    user.creds.sessionId,
                    (err, result) => {
                        if (err) {
                            reject(new Error('Unknown error'));
                        } else {
                            resolve(result);
                        }
                    }
                );
            } else {
                reject(new Error('No Logged in user'));
            }
        });

    static grpcAddParticipants = (user, participants) =>
        new Promise((resolve, reject) => {
            if (user) {
                ChannelsServiceClient.addParticipants(
                    user.creds.sessionId,
                    participants,
                    (err, result) => {
                        if (err) {
                            reject(new Error('Unknown error'));
                        } else {
                            resolve(result);
                        }
                    }
                );
            } else {
                reject(new Error('No Logged in user'));
            }
        });

    static grpcCreate = (user, params) =>
        new Promise((resolve, reject) => {
            if (user) {
                ChannelsServiceClient.create(
                    user.creds.sessionId,
                    params,
                    (err, result) => {
                        if (err) {
                            reject(new Error('Unknown error'));
                        } else {
                            resolve(result);
                        }
                    }
                );
            } else {
                reject(new Error('No Logged in user'));
            }
        });

    static grpcEdit = (user, params) =>
        new Promise((resolve, reject) => {
            if (user) {
                ChannelsServiceClient.edit(
                    user.creds.sessionId,
                    params,
                    (err, result) => {
                        if (err) {
                            reject(new Error('Unknown error'));
                        } else {
                            resolve(result);
                        }
                    }
                );
            } else {
                reject(new Error('No Logged in user'));
            }
        });

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
                        return Channel.grpcSubscribeChannels(user, {
                            domainChannels
                        });
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
                        return Channel.grpcSubscribeChannels(user, {
                            domainChannels
                        });
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
                        let domainChannels = [
                            { userDomain: userDomain, channels: [channelName] }
                        ];
                        return Channel.grpcUnsubscribeChannels(user, {
                            domainChannels
                        });
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
                        return Channel.grpcCreate(user, channel);
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
                            let isFavourite = false;
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
                                channel.discoverable,
                                isFavourite
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
                    return callGRPCFunction('deleteChannel', user, {
                        channelName: channel.channelName,
                        userDomain: channel.userDomain
                    });
                    // if (user) {
                    //     console.log('deleting channel ', channel);
                    //     let options = {
                    //         method: 'POST',
                    //         url: `${config.network.queueProtocol}${
                    //             config.proxy.host
                    //         }${config.network.channelsPath}`,
                    //         headers: {
                    //             sessionId: user.creds.sessionId
                    //         },
                    //         data: {
                    //             action: 'DeleteChannel',
                    //             channelName: channel.channelName,
                    //             userDomain: channel.userDomain
                    //         }
                    //     };
                    //     return Network(options);
                    // } else {
                    //     reject();
                    // }
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
                        return Channel.grpcAddParticipants(user, {
                            channelName,
                            userDomain,
                            newUserIds
                        });
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
                    return callGRPCFunction('updateParticipants', user, {
                        channelName: channelName,
                        userDomain: userDomain,
                        userIds: userIds
                    });
                    // console.log('updating users to Channel ', channelName);
                    // let options = {
                    //     method: 'POST',
                    //     url: `${config.network.queueProtocol}${
                    //         config.proxy.host
                    //     }${config.network.channelsPath}`,
                    //     headers: {
                    //         sessionId: user.creds.sessionId
                    //     },
                    //     data: {
                    //         action: 'UpdateParticipants',
                    //         channelName: channelName,
                    //         userDomain: userDomain,
                    //         userIds: userIds
                    //     }
                    // };
                    // return Network(options);
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
                    return callGRPCFunction('getParticipants', user, {
                        channelName: channelName,
                        userDomain: userDomain
                    });
                })
                .then(res => {
                    resolve(res.data.content);
                })
                .catch(reject);
        });

    // static getParticipants = (channelName, userDomain) =>
    //     new Promise((resolve, reject) => {
    //         Auth.getUser()
    //             .then(user => {
    //                 let options = {
    //                     method: 'POST',
    //                     url: `${config.network.queueProtocol}${
    //                         config.proxy.host
    //                     }${config.network.channelsPath}`,
    //                     headers: {
    //                         sessionId: user.creds.sessionId
    //                     },
    //                     data: {
    //                         action: 'GetParticipants',
    //                         channelName: channelName,
    //                         userDomain: userDomain
    //                     }
    //                 };
    //                 return Network(options);
    //             })
    //             .then(res => {
    //                 resolve(res.data.content);
    //             })
    //             .catch(reject);
    //     });

    static getAdmins = (channelName, userDomain) =>
        new Promise((resolve, reject) => {
            Auth.getUser()
                .then(user => {
                    return callGRPCFunction('getChannelAdmins', user, {
                        channelName: channelName,
                        userDomain: userDomain
                    });
                    // let options = {
                    //     method: 'POST',
                    //     url: `${config.network.queueProtocol}${
                    //         config.proxy.host
                    //     }${config.network.channelsPath}`,
                    //     headers: {
                    //         sessionId: user.creds.sessionId
                    //     },
                    //     data: {
                    //         action: 'GetChannelAdmins',
                    //         channelName: channelName,
                    //         userDomain: userDomain
                    //     }
                    // };
                    // return Network(options);
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
                    return callGRPCFunction('updateChannelAdmins', user, {
                        channelName: channelName,
                        userDomain: userDomain,
                        admins: adminsIds
                    });
                    // let options = {
                    //     method: 'POST',
                    //     url: `${config.network.queueProtocol}${
                    //         config.proxy.host
                    //     }${config.network.channelsPath}`,
                    //     headers: {
                    //         sessionId: user.creds.sessionId
                    //     },
                    //     data: {
                    //         action: 'UpdateChannelAdmins',
                    //         channelName: channelName,
                    //         userDomain: userDomain,
                    //         admins: adminsIds
                    //     }
                    // };
                    // return Network(options);
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
                    return callGRPCFunction('getPendingParticipants', user, {
                        channelName: channelName,
                        userDomain: userDomain
                    });
                    // let options = {
                    //     method: 'POST',
                    //     url: `${config.network.queueProtocol}${
                    //         config.proxy.host
                    //     }${config.network.channelsPath}`,
                    //     headers: {
                    //         sessionId: user.creds.sessionId
                    //     },
                    //     data: {
                    //         action: 'GetPendingParticipants',
                    //         channelName: channelName,
                    //         userDomain: userDomain
                    //     }
                    // };
                    // return Network(options);
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
                    return callGRPCFunction('authorizeParticipants', user, {
                        channelName: channelName,
                        userDomain: userDomain,
                        accepted: acceptedUserIds,
                        ignored: ignoredUserIds
                    });
                    // let options = {
                    //     method: 'POST',
                    //     url: `${config.network.queueProtocol}${
                    //         config.proxy.host
                    //     }${config.network.channelsPath}`,
                    //     headers: {
                    //         sessionId: user.creds.sessionId
                    //     },
                    //     data: {
                    //         action: 'AuthorizeParticipants',
                    //         channelName: channelName,
                    //         userDomain: userDomain,
                    //         accepted: acceptedUserIds,
                    //         ignored: ignoredUserIds
                    //     }
                    // };
                    // return Network(options);
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
                    return callGRPCFunction('changeOwner', user, {
                        channelName: channelName,
                        userDomain: userDomain,
                        newOwnerId: newOwnerId
                    });
                    // let options = {
                    //     method: 'POST',
                    //     url: `${config.network.queueProtocol}${
                    //         config.proxy.host
                    //     }${config.network.channelsPath}`,
                    //     headers: {
                    //         sessionId: user.creds.sessionId
                    //     },
                    //     data: {
                    //         action: 'ChangeOwner',
                    //         channelName: channelName,
                    //         userDomain: userDomain,
                    //         newOwnerId: newOwnerId
                    //     }
                    // };
                    // return Network(options);
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
                        return Channel.grpcEdit(user, {
                            channelName: name,
                            description,
                            userDomain
                        });
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
                        let domainChannels = [
                            {
                                userDomain: channel.userDomain,
                                channels: [channel.channelName]
                            }
                        ];
                        return Channel.grpcUnsubscribeChannels(user, {
                            domainChannels
                        });
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
                        Store.dispatch(completeChannelInstall(false));
                        return Channel.grpcGetSubscribed(user);
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
                                channel.discoverable,
                                channel.isFavourite
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
                        Store.dispatch(completeChannelInstall(false));
                        return Channel.grpcGetUnubscribed(user);
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
                                channel.discoverable,
                                channel.isFavourite
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

    static getOwnedChannels = () =>
        new Promise((resolve, reject) => {
            Auth.getUser()
                .then(user => {
                    if (user) {
                        return Channel.grpcGetOwned(user);
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
                                channel.channelType,
                                channel.discoverable,
                                channel.isFavourite
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
}
