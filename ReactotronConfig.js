import Reactotron, { trackGlobalErrors } from 'reactotron-react-native';

Reactotron.configure({
    name: 'FrontM'
})
    .useReactNative()
    .use(trackGlobalErrors());

if (__DEV__) {
    Reactotron.connect();
    Reactotron.clear();
}

console.tron = Reactotron;
