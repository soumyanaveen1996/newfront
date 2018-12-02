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
import { setCurrentScene } from '../../redux/actions/UserActions';
import Store from '../../redux/store/configureStore';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp
} from 'react-native-responsive-screen';

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
        Store.dispatch(setCurrentScene(scene));
        this.setState({ scene });
    };
    render() {
        const { imageSource, titleScreen, imageSelected } = this.props;
        // let color = 'rgba(74,74,74,0.6)'
        let color = 'aliceblue';

        return (
            <View
                style={{
                    width: wp('40%'),
                    flexDirection: 'row',
                    alignItems: 'center',
                    alignSelf: 'center',
                    justifyContent: 'center'
                }}
            >
                <Image
                    source={
                        this.props.titleScreen === this.state.scene
                            ? imageSelected
                            : imageSource
                    }
                />
                <Text
                    style={{
                        textAlign: 'center',
                        fontSize: hp('2%'),
                        marginHorizontal: wp('5%'),
                        color
                    }}
                >
                    {titleScreen}
                </Text>
            </View>
        );
    }
}
