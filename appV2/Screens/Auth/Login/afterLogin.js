import { ContactsCache } from '../../../lib/ContactsCache';
import { MessageCounter } from '../../../lib/MessageCounter';
import { NetworkPoller } from '../../../lib/network';
import AsyncStorage from '@react-native-community/async-storage';
import Mapbox from '@rnmapbox/maps';
import { BackgroundBotChat } from '../../../lib/BackgroundTask';
import SystemBot from '../../../lib/bot/SystemBot';
import UserDomainsManager from '../../../lib/UserDomainsManager/UserDomainsManager';

export default class AfterLogin {
    static executeAfterLogin = async () => {
        Mapbox.setAccessToken(
            'pk.eyJ1IjoiZ2FjaWx1IiwiYSI6ImNqcHh0azRhdTFjbXQzeW8wcW5vdXhlMzkifQ.qPfpVkrWbk-GSBY3uc6z3A'
        );
        await AsyncStorage.removeItem('signupStage');
        await AsyncStorage.removeItem('userEmail');
        AfterLogin.initializeBackgroundTask();
        await UserDomainsManager.initialize();
        try {
            UserDomainsManager.refresh();
        } catch {}
        ContactsCache.init();
        // MessageCounter.init();
        NetworkPoller.start();
    };

    static async initializeBackgroundTask() {
        var bgBotScreen = new BackgroundBotChat({
            bot: SystemBot.backgroundTaskBot
        });
        await bgBotScreen.initialize();
    }
}
