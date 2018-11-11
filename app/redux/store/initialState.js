import I18n from '../../config/i18n/i18n';
const initialState = {
    user: {
        satelliteMode: false,
        remoteBotsInstalled: false,
        allChannelsLoaded: false,
        contactsLoaded: true,
        conversationsLoaded: false,
        currentScene: I18n.t('Home'),
        refreshTimeline: true,
        refreshChannels: true
    }
};

export default initialState;
