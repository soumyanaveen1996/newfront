import AsyncStorage from '@react-native-community/async-storage';
import UserServices from '../../apiV2/UserServices';
import {
    setCurrentDomain,
    setUserDomains
} from '../../redux/actions/UserActions';
import Store from '../../redux/store/configureStore';
import _ from 'lodash';

class UserDomainsManager {
    constructor() {
        console.log('Are you called once ?');
    }
    async initialize() {
        const json = await AsyncStorage.getItem('DOMAIN_DETAILS');
        if (json) {
            const allDomains = this.getFilteredDomains(JSON.parse(json));
            this.userDomains = allDomains || [];
            Store.dispatch(setUserDomains(_.cloneDeep(allDomains)));
            const domainJSON = await AsyncStorage.getItem('currentDomain');
            console.log('current domain : ', domainJSON);
            const domain = domainJSON ? JSON.parse(domainJSON) : undefined;
            if (!Store.getState().user.currentDomain) {
                Store.dispatch(
                    setCurrentDomain(
                        domain || _.first(this.userDomains).userDomain
                    )
                );
            }
        }
    }

    getFilteredDomains(domains) {
        return _.filter(domains, (domain) => {
            return !_.includes(['frontmai'], domain.userDomain);
        });
    }
    refresh() {
        return UserServices.getUserDomains()
            .then((response) => {
                this.updateDomains(response.domains);
            })
            .catch((error) => {
                console.log('User domain error : ', error);
            });
    }
    updateDomains(domains) {
        this.userDomains = this.getFilteredDomains(domains);
        Store.dispatch(
            setUserDomains(
                this.getFilteredDomains(_.cloneDeep(this.userDomains))
            )
        );
        if (!Store.getState().user.currentDomain) {
            Store.dispatch(
                setCurrentDomain(_.first(this.userDomains).userDomain)
            );
        }
        // We store all the domains. But in the redux, we just store the filtered domains.
        AsyncStorage.setItem('DOMAIN_DETAILS', JSON.stringify(domains));
    }

    lastDomain() {
        return _.last(this.userDomains);
    }
    getDomainInformation(domain) {
        return _.find(this.userDomains, (d) => d.userDomain === domain);
    }

    reset() {
        Store.dispatch(setUserDomains([]));
        AsyncStorage.removeItem('DOMAIN_DETAILS');
        this.userDomains = [];
    }
}

export default new UserDomainsManager();
