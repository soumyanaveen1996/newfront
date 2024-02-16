import React, { Component } from 'react';
import { View, Image, Text } from 'react-native';
import styles from './styles';
import EventEmitter, { AuthEvents } from '../../lib/events';
import { setCurrentScene } from '../../redux/actions/UserActions';
import Store from '../../redux/store/configureStore';

export default class TabIcon extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            scene: 'Home',
            title: ''
        };
    }

    componentDidMount() {
        this.tabSelectedListener = EventEmitter.addListener(
            AuthEvents.tabTopSelected,
            this.tabSelected
        );
    }

    componentWillUnmount() {
        this.tabSelectedListener?.remove();
    }

    tabSelected = (scene, title) => {
        if (this.props.focused && this.props.titleScreen === scene) {
            Store.dispatch(setCurrentScene(scene));
            this.setState({ scene, title });
        }
    };

    render() {
        const { imageSource, titleScreen, imageSelected } = this.props;
        // let color = 'rgba(74,74,74,0.6)'
        // let color = 'aliceblue'

        return (
            <View style={styles.container}>
                {/* <Image
                    style={{ width: 20, height: 20 }}
                    source={
                        this.props.titleScreen === this.state.title
                            ? imageSelected
                            : imageSource
                    }
                /> */}
                <Text
                    style={styles.text}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                >
                    {titleScreen}
                </Text>
            </View>
        );
    }
}
