import I18n from '../../config/i18n/i18n';
const initialState = {
    user: {
        satelliteMode: false,
        remoteBotsInstalled: false,
        catalogLoaded: true,
        allConversationsLoaded: false,
        allChannelsLoaded: false,
        contactsLoaded: false,
        conversationsLoaded: false,
        currentScene: I18n.t('Home'),
        refreshTimeline: true,
        refreshChannels: true,
        refreshContacts: true,
        refreshUserEmail: true,
        network: 'full',
        currentConversationId: '',
        upload: 0,
        currentMap: null
    },
    botState: {
        id: null
    },
    channels: {
        filters: [],
        participants: [],
        team: ''
    },
    timeline: {
        allChats: []
    }
};

export default initialState;
