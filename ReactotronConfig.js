import Reactotron, { trackGlobalErrors } from 'reactotron-react-native';
import { reactotronRedux } from 'reactotron-redux';
import { NativeModules } from 'react-native';

const reactotron = Reactotron.configure({
    name: 'FrontM'
})
    .useReactNative()
    .use(reactotronRedux()) //  <- here i am!
    .use(trackGlobalErrors());

if (__DEV__) {
    const scriptURL = NativeModules.SourceCode.scriptURL;
    scriptHostname = scriptURL.split('://')[1].split(':')[0];
    Reactotron.connect({ host: `http://${scriptHostname}` });
    Reactotron.clear();
}

console.tron = Reactotron;

export default reactotron;
