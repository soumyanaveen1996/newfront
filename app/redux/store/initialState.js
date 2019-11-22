import I18n from '../../config/i18n/i18n';
const initialState = {
    user: {
        allChannelsLoaded: false,
        allConversationsLoaded: false,
        catalogLoaded: true,
        contactsLoaded: false,
        conversationsLoaded: false,
        currentConversationId: '',
        currentForm: null,
        currentMap: null,
        currentScene: I18n.t('Home'),
        firstLogin: false,
        network: 'full',
        phoneContacts: [],
        refreshChannels: true,
        refreshContacts: true,
        refreshTimeline: true,
        refreshUserEmail: true,
        remoteBotsInstalled: false,
        satelliteMode: false,
        upload: 0
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
