import {
    CommonActions,
    createNavigationContainerRef
} from '@react-navigation/native';
import { StackActions } from '@react-navigation/native';
import { DrawerActions } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();
class NavigationAction {
    /**
     * Navigate to a route in current navigation tree, re use if exists.
     *
     * @param name Name of the route to navigate to.
     * @param [params] Params object for the route.
     */
    static push(name, params = {}) {
        if (
            navigationRef.isReady() &&
            navigationRef.current.getCurrentRoute().name !=
                NavigationAction.SCREENS.jitsi
        ) {
            console.log(
                'Navigation operation push:start :' + name,
                navigationRef.current.getRootState().routes
            );
            navigationRef.navigate(name, params);
            console.log(
                'Navigation operation push:done : ' + name,
                navigationRef.current.getRootState().routes
            );
        }
    }
    /**
     * Push new screen always.
     *
     * @param name Name of the route to navigate to.
     * @param [params] Params object for the route.
     */
    static pushNew(name, params = {}) {
        if (
            navigationRef.isReady() &&
            navigationRef.current.getCurrentRoute().name !=
                NavigationAction.SCREENS.jitsi
        ) {
            console.log(
                'Navigation operation pushnew: start' + name,
                navigationRef.current.getRootState().routes
            );
            navigationRef.dispatch(StackActions.push(name, params));
            console.log(
                'Navigation operation pushnew: ' + name,
                navigationRef.current.getRootState().routes
            );
        }
    }

    /**
     * Replace current screen with new.
     *
     * @param name Name of the route to navigate to.
     * @param [params] Params object for the route.
     */
    static replace(name, params = {}, source = undefined, target = undefined) {
        if (
            navigationRef.isReady() &&
            navigationRef.current.getCurrentRoute().name !=
                NavigationAction.SCREENS.jitsi
        ) {
            console.log(
                'Navigation operation replace:start' + name,
                navigationRef.current.getRootState().routes
            );
            navigationRef.dispatch({
                ...StackActions.replace(name, params),
                source: source,
                target
            });
        }
        console.log(
            'Navigation operation replace:' + name,
            navigationRef.current.getRootState().routes
        );
    }

    static currentScreen() {
        if (navigationRef.isReady()) {
            console.log(
                'Navigation operation: get curretn screen',
                navigationRef.current.getCurrentRoute().name
            );
            return navigationRef.current.getCurrentRoute().name;
        }
        return null;
    }

    static pop() {
        console.log(
            'Navigation operation: pop start',
            navigationRef.current.getRootState().routes
        );
        navigationRef.goBack();
        console.log(
            'Navigation operation:pop done',
            navigationRef.current.getRootState().routes
        );
    }

    static popToFirst() {
        if (navigationRef.isReady()) {
            console.log(
                'Navigation operation:popToFirst',
                navigationRef.current.getRootState().routes
            );
            navigationRef.dispatch(StackActions.popToTop());
            console.log(
                'Navigation operation popToFirst:',
                navigationRef.current.getRootState().routes
            );
        }
    }

    static resetOnLogout() {
        navigationRef.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [
                    {
                        name: NavigationAction.SCREENS.swiperScreen,
                        params: { swiperIndex: 4 }
                    }
                ]
            })
        );
        console.log(
            'Navigation operation: reset on logout done',
            navigationRef.current.getRootState().routes
        );
    }

    static getCurrentParams() {
        if (navigationRef.isReady()) {
            return navigationRef.current.getCurrentRoute().params;
        }
    }

    static goToBotChat(params) {
        // NavigationAction.push(NavigationAction.SCREENS.botContainer, {
        //     screen: NavigationAction.SCREENS.bot,
        //     params: params
        // });
        NavigationAction.pushNew(NavigationAction.SCREENS.bot, params);
    }
    static goToUsersChat(params) {
        // NavigationAction.push(NavigationAction.SCREENS.imchatContainer, {
        //     screen: NavigationAction.SCREENS.peopleChat,
        //     params: params
        // });
        NavigationAction.pushNew(NavigationAction.SCREENS.peopleChat, params);
    }
    static goToChannelChat(params) {
        // NavigationAction.push(NavigationAction.SCREENS.channelContainer, {
        //     screen: NavigationAction.SCREENS.channelChat,
        //     params: params
        // });
        NavigationAction.pushNew(NavigationAction.SCREENS.channelChat, params);
    }

    /**
     * Closes full stack of chat compoenets whcih may include different types of full screen messages.
     *
     */
    static closeBotChat() {
        const state = navigationRef.getState();
        const botRoute = state.routes.findIndex(
            (route) => route.name === 'bot'
        );
        navigationRef.dispatch(
            StackActions.pop(state.routes.length - botRoute)
        );
    }

    static toggleDrawer() {
        navigationRef.dispatch(DrawerActions.toggleDrawer());
    }

    static SCREENS = {
        home: 'home',
        chats: 'Chats',
        drawer: 'drawer',
        drawerScreen: 'drawerScreen',
        meetingRoom: 'meetingRoom',
        addContacts: 'addContacts',
        addContactsChat: 'addContactsChat',
        addParticipants: 'addParticipants',
        addressBookScreen: 'addressBookScreen',
        barCodeScanner: 'barCodeScanner',
        bot: 'bot',
        botChat: 'botChat',
        fullScreenMessage: 'fullScreenMessage',
        botFilter: 'botFilter',
        botInfoScreen: 'botInfoScreen',
        botListScreen: 'botListScreen',
        botsListChat: 'botsListChat',
        botsMenuChat: 'botsMenuChat',
        botStore: 'botStore',
        callHistoryMenu: 'callHistoryMenu',
        callHistory: 'callHistory',
        callSummary: 'callSummary',
        channelAdminScreen: 'channelAdminScreen',
        channelChat: 'channelChat',
        channelsFilter: 'channelsFilter',
        channelsList: 'channelsList',
        channelsListChat: 'channelsListChat',
        channelsMenu: 'channelsMenu',
        channelsMenuChat: 'channelsMenuChat',
        chatScene: 'chatScene',
        confirmationScreen: 'confirmationScreen',
        contactDetailsScreen: 'contactDetailsScreen',
        contactEmailInviteScreen: 'contactEmailInviteScreen',
        contactsCall: 'contactsCall',
        contactsCallMenu: 'contactsCallMenu',
        contactsMain: 'contactsMain',
        contactsNewCall: 'contactsNewCall',
        contactsMainChat: 'contactsMainChat',
        conversations: 'conversations',
        dialCall: 'dialCall',
        dialCallbutton: 'dialCallbutton',
        dialCallMenu: 'dialCallMenu',
        dialler: 'dialler',
        favoriteMessage: 'favoriteMessage',
        form: 'form',
        form2: 'form2',
        homeMain: 'homeMain',
        imageViewer: 'imageViewer',
        info: 'info',
        launch: 'launch',
        lightbox: 'lightbox',
        locationPicker: 'locationPicker',
        loginScreen: 'loginScreen',
        main: 'main',
        manageContacts: 'manageContacts',
        mapView: 'mapView',
        marketplaceMenu: 'marketplaceMenu',
        multiselection: 'multiselection',
        myProfileScreen: 'myProfileScreen',
        addRoleScreen: 'addRoleScreen',
        addressScreen: 'addressScreen',
        newChannels: 'newChannels',
        newContactScreen: 'newContactScreen',
        contactPendingNewReqScreen: 'contactPendingNewReqScreen',
        onboarding: 'onboarding',
        peopleChat: 'peopleChat',
        phone: 'phone',
        phoneContactsCall: 'phoneContactsCall',
        phoneContactsCallMenu: 'phoneContactsCallMenu',
        requestsScreen: 'requestsScreen',
        resendCodeScreen: 'resendCodeScreen',
        resetPassword: 'resetPassword',
        searchUsers: 'searchUsers',
        selectTeam: 'selectTeam',
        sendCodePassword: 'sendCodePassword',
        setChannelOwner: 'setChannelOwner',
        signupScreen: 'signupScreen',
        slider: 'slider',
        SNRChart: 'SNRChart',
        swiperScreen: 'swiperScreen',
        tabBar: 'tabbar',
        tabBarCall: 'tabBarCall',
        tabBarChat: 'tabBarChat',
        timeline: 'timeline',
        videoRecorder: 'videoRecorder',
        webview: 'webview',
        chartScreen: 'chartScreen',
        getCredit: 'getCredit',
        nonConversationalChat: 'nonConversationalChat',
        mediaSoup: 'mediaSoup',
        jitsi: 'jitsi',
        picPhonebookContact: 'picPhonebookContact',
        lookupResults: 'lookupResults',
        PermissionRequest: 'PermissionRequest',
        searchAndSelect: 'searchAndSelect',
        searchAndSelectForLookup: 'searchAndSelectForLookup',
        profileDetail: 'profileDetail',
        networkDetails: 'networkDetails',
        sessionExpiry: 'sessionExpiry',
        newChat: 'newChat',
        newGroup: 'newGroup',
        createNewGroup: 'createNewGroup',
        securitySettings: 'securitySettings',
        timeZoneSettings: 'timeZoneSettings',
        twoFactorAuth: 'twoFactorAuth',
        twoFactorScan: 'twoFactorScan',
        changePassword: 'changePassword',
        confirmOtp: 'confirmOtp',
        confirmPassword: 'confirmPassword',
        botContainer: 'botContainer',
        channelContainer: 'channelContainer',
        imchatContainer: 'imchatContainer',
        settings: 'settings',
        catelog: 'Catelog',
        locationViewr: 'locationViewr',
        myProfileScreenOnship: 'myProfileScreenOnship',
        GalleryImageViewer: 'GalleryImageViewer'
    };
}
export default NavigationAction;
