import './shim';
import React from 'react';
import { MainRouter } from './app/routes/';
import codePush from 'react-native-code-push';
import ReactotronConfig from './ReactotronConfig';
import Store from './app/redux/store/configureStore.js';
import { Provider } from 'react-redux';

console.disableYellowBox = true;
const codePushOptions = { checkFrequency: codePush.CheckFrequency.MANUAL };

class App extends React.Component {
    render() {
        return (
            <Provider store={Store}>
                <MainRouter />
            </Provider>
        );
    }
}

App = codePush(codePushOptions)(App);
export default App;
