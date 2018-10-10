import './shim';
import React from 'react';
import { MainRouter } from './app/routes/';
import codePush from 'react-native-code-push';

console.disableYellowBox = true;

const codePushOptions = { checkFrequency: codePush.CheckFrequency.MANUAL };

class App extends React.Component {
    render() {
        return <MainRouter />;
    }
}

App = codePush(codePushOptions)(App);
export default App;
