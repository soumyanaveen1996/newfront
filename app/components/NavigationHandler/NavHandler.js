// Centralized Android Back Button Handler

import React, { Component } from 'react';
import { BackHandler } from 'react-native';
import { Actions } from 'react-native-router-flux';
import ROUTER_SCENE_KEYS from '../../routes/RouterSceneKeyConstants';

class NavHandler extends Component {
    constructor(props) {
        super(props);
    }

    componentDidCatch(error, errorInfo) {
        console.log('Caught an Error');
        console.log(errorInfo);
        console.log(error);
    }

    componentDidMount() {
        //listens to hardwareBackPress
        BackHandler.addEventListener('hardwareBackPress', () => {
            try {
                console.log(Actions.prevScene);
                if (Actions.currentScene === 'resendCodeScreen') {
                    return true;
                }
                if (Actions.currentScene === 'confirmationScreen') {
                    Actions.swiperScreen({ type: 'reset' });
                    return true;
                }
                if (Actions.currentScene === ROUTER_SCENE_KEYS.dialler) {
                    Actions.pop();
                    setTimeout(
                        () => Actions.refresh({ key: Math.random() }),
                        0
                    );
                }
                if (
                    Actions.currentScene === 'timeline' ||
                    Actions.currentScene === 'swiperScreen'
                ) {
                    BackHandler.exitApp();
                } else {
                    Actions.pop();
                }
                return true;
            } catch (err) {
                BackHandler.exitApp();
                console.debug("Can't pop. Exiting the app...");
                return false;
            }
        });
    }

    componentWillUnmount() {
        console.log('Unmounting app, removing listeners');
        BackHandler.removeEventListener('hardwareBackPress');
    }

    render() {
        return this.props.children;
    }
}

export default NavHandler;
