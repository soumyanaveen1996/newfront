import reduxStore from '../../redux/store/configureStore';
import {
    increaseNotificationCount,
    resetNotificationCount
} from '../../redux/actions/UserActions';

class DomainNotificationsManager {
    constructor() {
        this.domainNotificatons = {};
    }
    addNotification(domain) {
        console.log('adding Domain : ', domain);
        if (!this.domainNotificatons[domain]) {
            this.domainNotificatons[domain] = 0;
        }
        this.domainNotificatons[domain] += 1;
        reduxStore.dispatch(increaseNotificationCount());
    }
    markNotificationRead(domain) {
        this.domainNotificatons[domain] = 0;
        reduxStore.dispatch(resetNotificationCount());
    }
    domainNotificationCount(domain) {
        return this.domainNotificatons[domain] || 0;
    }
}

export default new DomainNotificationsManager();
