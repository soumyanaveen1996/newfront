import { Platform } from 'react-native';
import configToUse from '../config/config';
import Store from '../redux/store/configureStore';

export const getBaseParams = () => {
    return {
        platform: Platform.OS,
        appType: configToUse.app.appType,
        selectedDomain:
            Store.getState().user.currentDomain || configToUse.app.domain,
        domain: Store.getState().user.currentDomain || configToUse.app.domain
    };
};
