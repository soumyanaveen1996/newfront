import I18n from '../../config/i18n/i18n';
const initialState = {
    user: {
        satelliteMode: false,
        remoteBotsInstalled: false,
        allConversationsLoaded: false,
        allChannelsLoaded: false,
        contactsLoaded: false,
        conversationsLoaded: false,
        currentScene: I18n.t('Home'),
        refreshTimeline: true,
        refreshChannels: true,
        refreshContacts: true
    },
    botState: {
        id: null
    }
};

export default initialState;
