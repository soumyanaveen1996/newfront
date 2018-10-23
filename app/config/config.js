// import configToUse from './env/prod';
// import configToUse from './env/local';
import configToUse from './env/dev';
import '../../ReactotronConfig';
import Reactotron from 'reactotron-react-native';

// Point to the right environment config based on what is being released
const config = configToUse;

export const overrideConsole = trueConsole => {
    return {
        log: function() {
            if (global.__DEV__) {
                trueConsole.log.apply(trueConsole, arguments);
                // console.tron.log.apply(trueConsole, arguments)
                Reactotron.display({
                    name: 'CONSOLE.LOG',
                    value: arguments,
                    preview:
                        arguments.length > 1
                            ? JSON.stringify(arguments)
                            : arguments[0]
                });
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
