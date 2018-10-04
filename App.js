import './shim';
import React from 'react';
import { MainRouter } from './app/routes/';

console.disableYellowBox = true;

export default class App extends React.Component {
    render() {
        return <MainRouter />;
    }
}
