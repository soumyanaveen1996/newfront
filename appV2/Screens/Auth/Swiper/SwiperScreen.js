import React, { Component } from 'react';
import {
    Text,
    View,
    Image,
    TouchableOpacity,
    Keyboard,
    ImageBackground,
    BackHandler,
    StatusBar,
    Platform
} from 'react-native';

import NavigationAction from '../../../navigation/NavigationAction';
import SwiperView from './SwiperView';
export default class SwiperScreen extends Component {
    constructor(props) {
        super(props);
        this.backhandler = BackHandler.addEventListener(
            'hardwareBackPress',
            this.handleBackButtonClick
        );

        this.state = {
            lastIndex: 0,
            isLoginPage: true
        };
    }

    componentWillUnmount() {
        this.backhandler?.remove();
    }

    handleBackButtonClick() {
        if (NavigationAction.currentScreen() === 'swiperScreen') {
            BackHandler.exitApp();
        }
    }

    onIndexChanged(index) {
        if (index <= 3) {
            Keyboard.dismiss();
        }
    }

    render() {
        return (
            <View style={{ flex: 1, backgroundColor: '#fff' }}>
                <StatusBar
                    hidden={false}
                    backgroundColor="grey"
                    barStyle={
                        Platform.OS === 'ios' ? 'dark-content' : 'light-content'
                    }
                />
                <SwiperView
                    onIndexChanged={this.onIndexChanged}
                    swiperIndex={
                        this.props.route?.params?.swiperIndex
                            ? this.props.route.params.swiperIndex
                            : 0
                    }
                    email={this.props.email || ''}
                />
            </View>
        );
    }
}
