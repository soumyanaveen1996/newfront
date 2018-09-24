// import configToUse from './env/local';
import configToUse from './env/dev';


// Point to the right environment config based on what is being released
const config = configToUse;

export const overrideConsole = trueConsole => {
    return {
        log: function() {
            if (global.__DEV__) {
                trueConsole.log.apply(trueConsole, arguments);
            }
        },
        error: function() {
            if (global.__DEV__) {
                trueConsole.log.apply(trueConsole, arguments);
            }
        },
        warn: function() {
            if (global.__DEV__) {
                trueConsole.log.apply(trueConsole, arguments);
            }
        },
        info: function() {
            if (global.__DEV__) {
                trueConsole.log.apply(trueConsole, arguments);
            }
        }
    };
};

export default config;
