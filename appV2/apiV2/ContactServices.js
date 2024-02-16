const R = require('ramda');
import apiClient from './Api';
import { getBaseParams } from './BaseParams';

export default class ContactServices {
    static find = (queryString) => {
        return apiClient().post('contacts.ContactsService/Find', {
            ...getBaseParams(),
            ...{ queryString, selectedDomain: getBaseParams().domain }
        });
    };

    static add = (userIds) => {
        console.log('the data is ', userIds);
        const param = {};
        if (userIds.localContacts) {
            param.localContacts = userIds.localContacts;
        } else param.userIds = userIds;
        return apiClient().post('contacts.ContactsService/Add', {
            ...getBaseParams(),
            ...param
        });
    };

    static accept = (params) => {
        return apiClient().post('contacts.ContactsService/Accept', {
            ...getBaseParams(),
            ...params
        });
    };

    static ignore = (params) => {
        return apiClient().post('contacts.ContactsService/Ignore', {
            ...getBaseParams(),
            ...params
        });
    };

    static remove = (userIds) => {
        return apiClient().post('contacts.ContactsService/Remove', {
            ...getBaseParams(),
            ...{ userIds: userIds }
        });
    };
    static removeLocal = (body) => {
        return apiClient().post('contacts.ContactsService/Remove', {
            ...getBaseParams(),
            ...{ localContacts: body }
        });
    };

    static invite = (emailIds) => {
        return apiClient().post('contacts.ContactsService/Invite', {
            ...getBaseParams(),
            ...{ emailIds: emailIds }
        });
    };

    static update = (params) => {
        return apiClient().post('contacts.ContactsService/Update', {
            ...getBaseParams(),
            ...params
        });
    };
}
