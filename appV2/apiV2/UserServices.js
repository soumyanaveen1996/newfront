import apiClient from './Api';
import { getBaseParams } from './BaseParams';
import _ from 'lodash';

const services = [
    'UpdateUserProfile',
    'GetUserDetails',
    'GetLocalUserDetails',
    'GetBotSubscriptions',
    'GetBotSubscriptionsInfo',
    'GetContacts',
    'SubscribeBot',
    'UnsubscribeBot',
    'SubscribeDomain',
    'EnableVoip',
    'DisableVoip',
    'GetVoipStatus',
    'GenerateTwilioToken',
    'GenerateWebTwilioToken',
    'ManageTnc',
    'GetCompanies',
    'GetCallHistory',
    'GetPaginatedCallHistory',
    'GetCallHistoryForContact',
    'GetUserDomains',
    'UpdateLastLoggedInDomain',
    'TopupUserBalance',
    'RegisterDevice',
    'DeregisterDevice',
    'RegisterDeviceForVoip',
    'DeregisterDeviceForVoip',
    'GetUserBalance',
    'GetTwilioIceServers',
    'PreConnectCallCheck',
    'GetAppBroadcastMessages',
    'PostPaidUserCallsCheck',
    'SendVoipPushNotification',
    'SetUserAvailableForCall',
    'GetSystemBots',
    'getUserRankRoles',
    'getShipDetails',
    'GetLevel3Ranks'
];

export default UserServices = _.reduce(
    services,
    (us, name) => {
        return _.merge(us, {
            [_.lowerFirst(name)]: (params = {}) => {
                console.log(`Params for user.UserService/${name} ${params}`);
                return apiClient().post(`user.UserService/${name}`, {
                    ...getBaseParams(),
                    ...params
                });
            }
        });
    },
    {}
);
