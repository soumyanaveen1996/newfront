import React, { Component } from 'react';
import { View, Image, Text } from 'react-native';
import {
    Scene,
    Router,
    Lightbox,
    ActionConst,
    Actions,
    Tabs
} from 'react-native-router-flux';
import styles from './styles';
import EventEmitter, { AuthEvents } from '../../lib/events';

export default class TabIcon extends React.Component {
    constructor(props) {
        super(props);
    }

    state = {
        scene: 'Home'
    };
    componentDidMount() {
        EventEmitter.addListener(AuthEvents.tabSelected, this.tabSelected);
    }
    componentWillUnmount() {
        EventEmitter.removeListener(AuthEvents.tabSelected);
    }
    tabSelected = scene => {
        this.setState({ scene });
    };
    render() {
        const { imageSource, titleScreen } = this.props;
        let color = 'rgba(74,74,74,0.6)';

        return (
            <View style={{ alignItems: 'center' }}>
                <Image source={imageSource} />
                <Text
                    style={{
                        textAlign: 'center',
                        fontSize: 14,
                        color
                    }}
                >
                    {titleScreen}
                </Text>
            </View>
        );
    }
}
