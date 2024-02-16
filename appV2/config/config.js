import configProd from './env/prod';
// import configToUse from './env/local';
import configDev from './env/dev';
// import configToUse from './env/stage';

// Point to the right environment config based on what is being released
import env from 'react-native-config';

function getConfig() {
    switch (env.NAME) {
        case 'PROD':
            return configProd;
        case 'DEV':
            return configDev;

        default:
            return configDev;
    }
}
const configToUse = getConfig();
export default configToUse;
