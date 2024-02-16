import { ActionTypes as Actions } from './ActionTypes';
import _, { result } from 'lodash';

const rankRoleColor={
    'Ship': {
        lightColor: 'rgba(53,89,189,0.1)',
        darkColor: 'rgb(53,89,189)',
        name: 'Ship'
    },
    'Shore': {
        lightColor: 'rgba(23,137,71,0.1)',
        darkColor: 'rgb(23,137,71)',
        name: 'Shore'
    },
    'Personal': {
        lightColor: 'rgba(152,176,200,0.1)',
        darkColor: 'rgb(152,176,200)',
        name: 'Personal'
    },
    'Uncategorised': {
        lightColor: 'rgba(152,176,200,0.1)',
        darkColor: 'rgb(152,176,200)',
        name: 'Uncategorised'
    }
};
// this is not used any where
export const setSatMode = (payload) => ({
    type: Actions.SET_SAT_MODE,
    payload
});
// THIS FUNCTION I USED SO THAT NO OTHER API CALLED FOR PENDING LIST
export const getFilteredContactNewReqPending = (payload) => {
    let filteredContactNewReqPending = null;
    // NEW REQUESTS
    const newRequestsList = _.filter(payload.data.contacts, (contact) => {
        if (contact.showAcceptIgnoreMsg) {
            return _.extend({}, contact, {
                contactType: 'frontm',
                ignored: false,
                type: 'People'
            });
        }
    });
    // IGNORED CONTACTS
    const ignoredList = _.filter(payload.data.ignored, (contact) =>
        _.extend({}, contact, { ignored: true })
    );
    filteredContactNewReqPending = {
        newRequests: false,
        newRequestsList: [],
        ignored: false,
        ignoredList: []
    };
    if (newRequestsList.length > 0) {
        filteredContactNewReqPending = {
            newRequestsList: newRequestsList,
            newRequests: true
        };
    }
    if (ignoredList.length > 0) {
        filteredContactNewReqPending.ignoredList = ignoredList;
        filteredContactNewReqPending.ignored = true;
    }
    return {
        type: Actions.GET_NEW_REQ_PENDING_CONTACTS,
        payload: filteredContactNewReqPending
    };
};

export const completeBotInstall = (payload) => ({
    type: Actions.COMPLETE_BOT_INSTALL,
    payload
});

export const completeChannelInstall = (payload) => ({
    type: Actions.COMPLETE_CHANNEL_INSTALL,
    payload
});

export const completeCatalogLoad = (payload) => ({
    type: Actions.COMPLETE_CATALOG_LOAD,
    payload
});

export const completeConversationsLoad = (payload) => ({
    type: Actions.COMPLETE_CONVERSATIONS_LOAD,
    payload
});

export const completeContactsLoad = (payload) => ({
    type: Actions.COMPLETE_CONTACTS_LOAD,
    payload
});

export const logout = () => ({
    type: Actions.LOGOUT
});

export const setCurrentScene = (payload) => ({
    type: Actions.SET_CURRENT_SCENE,
    payload
});

export const refreshTimeline = (payload) => ({
    type: Actions.REFRESH_TIMELINE,
    payload
});

export const timelineRebuild = (payload) => ({
    type: Actions.TIMELINE_REBUILD,
    payload
});

export const refreshChannels = (payload) => ({
    type: Actions.REFRESH_CHANNELS,
    payload
});

export const refreshContacts = (payload) => ({
    type: Actions.REFRESH_CONTACTS,
    payload
});
export const getL2RoleMapDataWithColors = (payload) => {
        const roleL2Colors={};
        const dataFromApi = payload;
       let shipRoles =dataFromApi.ship.map(res=>{
        roleL2Colors[`${res.info}`]={...rankRoleColor.Ship, ...{name:res.info}};
       })
         console.log("the data is ",roleL2Colors);
        shipRoles = dataFromApi.shore.map(res=>{
            roleL2Colors[`${res.info}`]={...rankRoleColor.Shore, ...{name:res.info}};
        })
    roleL2Colors['Ship']=rankRoleColor.Ship;
    roleL2Colors['Shore']=rankRoleColor.Shore;
    roleL2Colors['ship']=rankRoleColor.Ship;
    roleL2Colors['shore']=rankRoleColor.Shore;
    roleL2Colors['Personal']=rankRoleColor.Personal;
    roleL2Colors['Uncategorised']=rankRoleColor.Uncategorised;
    console.log("the data is end",roleL2Colors);

        return ({type: Actions.UPDATE_RANK_ROLE_GROUP_COLORS,
        payload:{data:roleL2Colors}})

};

export const refreshUserEmail = (payload) => ({
    type: Actions.USER_EMAIL,
    payload
});
export const setChennalForFavUpdate = (payload) => ({
    type: Actions.CHANNEL_FAV_UPDATE,
    payload
});

export const setNetwork = (payload) => ({
    type: Actions.SET_NETWORK,
    payload
});

export const setNetworkMsgUI = (payload) => ({
    type: Actions.SET_NETWORK_MSG_UI,
    payload
});

export const setCurrentConversationId = (payload) => ({
    type: Actions.SET_CURRENT_CONVERSATION_ID,
    payload
});
export const setCurrentMap = (payload) => ({
    type: Actions.SET_CURRENT_MAP,
    payload
});
export const setCurrentForm = (payload) => ({
    type: Actions.SET_CURRENT_FORM,
    payload
});
export const uploadImage = () => ({
    type: Actions.UPLOAD_IMAGE
});

export const setFirstLogin = (payload) => ({
    type: Actions.SET_FIRST_LOGIN,
    payload
});

export const setPhoneContacts = (payload) => ({
    type: Actions.SET_PHONE_CONTACTS,
    payload
});

export const setPhoneContactsStatus = (payload) => ({
    type: Actions.SET_PHONE_CONTACTS_STATUS,
    payload
});

export const updateNonConvChat = (payload) => ({
    type: Actions.UPDATE_NONCONV_CHAT,
    payload
});

export const updateNonConvControlsList = (payload) => ({
    type: Actions.UPDATE_NONCONV_CONTROLS_LIST,
    payload
});

export const botInstallStart = (payload) => ({
    type: Actions.BOT_INSTALL_START,
    payload
});

export const botInstallEnd = (payload) => ({
    type: Actions.BOT_INSTALL_END,
    payload
});

export const setCurrentDomain = (payload) => ({
    type: Actions.SET_CURRENT_DOMAIN,
    payload
});

export const reInitUserData = (payload) => ({
    type: Actions.REINTILIAZE_SYNCHRONIZE,
    payload
});

export const increaseNotificationCount = () => ({
    type: Actions.INCREASE_NOTIFICATION_COUNT
});

export const resetNotificationCount = () => ({
    type: Actions.RESET_NOTIFICATION_COUNT
});

export const setUserDomains = (payload) => ({
    type: Actions.SET_USER_DOMAINS,
    payload
});

export const setSocketState = (payload) => ({
    type: Actions.SET_SOCKET_STATE,
    payload
});
export const setBotDownloadState = (payload) => ({
    type: Actions.SET_BOT_DOWNLOAD_STATE,
    payload
});
export const setCallState = (payload) => ({
    type: Actions.SET_CALL_STATE,
    payload
});
