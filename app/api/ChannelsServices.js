import { Auth } from '../lib/capability';
import { NativeModules, Platform } from 'react-native';

const ChannelsServiceClient = NativeModules.ChannelsServiceClient;

export default class ChannelsServices {
    static findNewParticipants(channel, queryString) {
        return new Promise((resolve, reject) => {
            Auth.getUser()
                .then(user => {
                    ChannelsServiceClient.findNewParticipants(
                        user.creds.sessionId,
                        {
                            queryString,
                            channelName: channel.channelName,
                            userDomain: channel.userDomain
                        },
                        (error, result) => {
                            console.log(
                                'GRPC:::ChannelsServiceClient::findNewParticipants : ',
                                error,
                                result
                            );
                            if (error || result.data.error !== 0) {
                                reject('Could not search users');
                            } else {
                                resolve(result.data.content || []);
                            }
                        }
                    );
                })
                .catch(e => {
                    reject('Could not search users');
                });
        });
    }
}
