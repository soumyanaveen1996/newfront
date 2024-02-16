import apiClient from './Api';
import { getBaseParams } from './BaseParams';
export default class ChannelsServices {
    static getSubscribed = (params) => {
        return apiClient().post('channels.ChannelsService/GetSubscribed', {
            ...getBaseParams(),
            ...params
        });
    };

    static getUnsubscribed = (params) => {
        return apiClient().post('channels.ChannelsService/GetUnsubscribed', {
            ...getBaseParams(),
            ...params
        });
    };

    static getOwned = (params) => {
        return apiClient().post('channels.ChannelsService/GetOwned', {
            ...getBaseParams(),
            ...params
        });
    };

    static subscribe = (params) => {
        return apiClient().post('channels.ChannelsService/Subscribe', {
            ...getBaseParams(),
            ...params
        });
    };

    static unsubscribe = (params) => {
        return apiClient().post('channels.ChannelsService/Unsubscribe', {
            ...getBaseParams(),
            ...params
        });
    };

    static addParticipants = (params) => {
        return apiClient().post('channels.ChannelsService/AddParticipants', {
            ...getBaseParams(),
            ...params
        });
    };

    static create = (params) => {
        return apiClient().post('channels.ChannelsService/Create', {
            ...getBaseParams(),
            ...params
        });
    };

    static edit = (params) => {
        return apiClient().post('channels.ChannelsService/Edit', {
            ...getBaseParams(),
            ...params
        });
    };

    static getParticipants = (params) => {
        return apiClient().post('channels.ChannelsService/GetParticipants', {
            ...getBaseParams(),
            ...params
        });
    };

    static getPendingParticipants = (params) => {
        return apiClient().post(
            'channels.ChannelsService/GetPendingParticipants',
            {
                ...getBaseParams(),
                ...params
            }
        );
    };

    static updateParticipants = (params) => {
        return apiClient().post('channels.ChannelsService/UpdateParticipants', {
            ...getBaseParams(),
            ...params
        });
    };

    static requestPrivateChannelAccess = (params) => {
        return apiClient().post(
            'channels.ChannelsService/RequestPrivateChannelAccess',
            {
                ...getBaseParams(),
                ...params
            }
        );
    };

    static authorizeParticipants = (params) => {
        return apiClient().post(
            'channels.ChannelsService/AuthorizeParticipants',
            {
                ...getBaseParams(),
                ...params
            }
        );
    };

    static changeOwner = (params) => {
        return apiClient().post('channels.ChannelsService/ChangeOwner', {
            ...getBaseParams(),
            ...params
        });
    };

    static getChannelAdmins = (params) => {
        return apiClient().post('channels.ChannelsService/GetChannelAdmins', {
            ...getBaseParams(),
            ...params
        });
    };

    static updateChannelAdmins = (params) => {
        return apiClient().post(
            'channels.ChannelsService/UpdateChannelAdmins',
            {
                ...getBaseParams(),
                ...params
            }
        );
    };

    static deleteChannel = (params) => {
        return apiClient().post('channels.ChannelsService/DeleteChannel', {
            ...getBaseParams(),
            ...params
        });
    };

    static findNewParticipants = (params) => {
        return apiClient().post(
            'channels.ChannelsService/FindNewParticipants',
            {
                ...getBaseParams(),
                ...params
            }
        );
    };
}
