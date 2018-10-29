import Reactotron, { trackGlobalErrors } from 'reactotron-react-native';
import { NativeModules } from 'react-native';

Reactotron.configure({
    name: 'FrontM'
})
    .useReactNative()
    .use(trackGlobalErrors());

if (__DEV__) {
    const scriptURL = NativeModules.SourceCode.scriptURL;
    scriptHostname = scriptURL.split('://')[1].split(':')[0];
    Reactotron.connect({ host: `http://${scriptHostname}` });
    Reactotron.clear();
}

console.tron = Reactotron;
