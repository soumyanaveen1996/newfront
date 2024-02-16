import I18n from '../../config/i18n/i18n';
import { NETWORK_STATE } from '../../lib/network';

const initialState = {
    user: {
        allChannelsLoaded: false,
        allConversationsLoaded: false,
        catalogLoaded: true,
        contactsLoaded: false,
        filteredContactNewReqPending: null,
        conversationsLoaded: false,
        currentConversationId: '',
        currentForm: null,
        currentMap: null,
        currentScene: I18n.t('Home'),
        firstLogin: false,
        network:null,
        phoneContacts: [],
        refreshChannels: true,
        refreshContacts: true,
        refreshTimeline: true,
        refreshUserEmail: true,
        remoteBotsInstalled: false,
        timelineBuild: false,
        satelliteMode: false,
        upload: 0,
        activeInstalls: [],
        updatedFavChannelIds: null,
        socketAlive: 'starting',
        roleL2Colors: false,
        networkMsgUI:false
    },
    session: { user: null },
    botState: {
        id: null,
        isDebugEnabledByBot: false,
        isOtherUserProfileUpdated: false,
        nonConvChatMessages: [],
        nonConvControlsList: [],
        activeBots: []
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
