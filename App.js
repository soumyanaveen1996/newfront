import React from 'react';
import { MainRouter } from './app/routes/';
import Notification from './app/lib/capability/Notification';

export default class App extends React.Component {
    componentDidMount() {
        Notification.configure();
    }

    render() {
        return (
            <MainRouter />
        );
    }
}
