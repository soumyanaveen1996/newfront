// Centralized Android Back Button Handler

import React, { Component } from 'react';
import { BackAndroid } from 'react-native';
import { Actions } from 'react-native-router-flux';

class NavHandler extends Component {
    constructor(props) {
        super(props);
    }

    componentDidCatch(error, errorInfo) {
        console.log('Caught an Error');
        console.trace(errorInfo);
        console.log(error);
    }

    componentDidMount() {
        //listens to hardwareBackPress
        BackAndroid.addEventListener('hardwareBackPress', () => {
            try {
                console.log(Actions.prevScene);
                if (Actions.currentScene === 'resendCodeScreen') {
                    return true;
                }
                if (Actions.currentScene === 'confirmationScreen') {
                    Actions.swiperScreen({ type: 'reset' });
                    return true;
                }
                if (
                    Actions.currentScene === 'timeline' ||
                    Actions.currentScene === 'swiperScreen'
                ) {
                    BackAndroid.exitApp();
                } else {
                    Actions.pop();
                }
                return true;
            } catch (err) {
                BackAndroid.exitApp();
                console.debug("Can't pop. Exiting the app...");
                return false;
            }
        });
    }

    componentWillUnmount() {
        console.log('Unmounting app, removing listeners');
        BackAndroid.removeEventListener('hardwareBackPress');
    }

    render() {
        return this.props.children;
    }
}

export default NavHandler;
