import React, { Component } from 'react';
import { View, Image, Text } from 'react-native';

import EventEmitter, { AuthEvents } from '../../lib/events';
import { setCurrentScene } from '../../redux/actions/UserActions';
import Store from '../../redux/store/configureStore';
import GlobalColors from '../../config/styles';
import configToUse from '../../config/config';
import images from '../../images';
import AppFonts from '../../config/fontConfig';
import { isTabletOrIpad, isIOS } from '../../lib/utils/DeviceTypeUtils';

export default class TabIcon extends React.Component {
    state = {
        scene: 'Home'
    };

    componentDidMount() {
        this.tabSelectedSubscription = EventEmitter.addListener(
            AuthEvents.tabSelected,
            this.tabSelected
        );
    }

    componentWillUnmount() {
        this.tabSelectedSubscription?.remove();
    }

    tabSelected = (scene) => {
        if (this.props.focused && this.props.titleScreen === scene) {
            Store.dispatch(setCurrentScene(scene));
            this.setState({ scene });
        }
    };

    render() {
        const { titleScreen, imageSelected, title, focused } = this.props;
        const color = this.props.focused
            ? GlobalColors.activeTabColor
            : GlobalColors.inactiveTabColor;
        let imageSource;
        if (title === 'Home') {
            if (configToUse.customHomeScreen) {
                imageSource = focused
                    ? images.tabIconCustomHomeActive
                    : images.tabIconCustomHome;
            } else {
                imageSource = focused
                    ? images.tabIconHomeActive
                    : images.tabIconHome;
            }
        } else if (title === 'Chats')
            imageSource = focused
                ? images.tabIconHomeActive
                : images.tabIconHome;
        else if (title === 'Calls')
            imageSource = imageSource = focused
                ? images.tabIconCallsActive
                : images.tabIconCalls;
        else if (title === 'Contacts')
            imageSource = imageSource = focused
                ? images.tabIconContactsActive
                : images.tabIconContacts;
        else if (title === 'Apps')
            imageSource = imageSource = focused
                ? images.tabIconAppsActive
                : images.tabIconApps;

        return (
            <View
                style={[
                    {
                        alignItems: 'center'
                    },
                    isTabletOrIpad()
                        ? { minWidth: 80, marginTop: 2 }
                        : { justifyContent: 'space-around' },
                    isIOS() ? { height: 50 } : {}
                ]}
            >
                <Image
                    style={{
                        height: 40,
                        width: 40,
                        resizeMode: 'cover'
                    }}
                    resizeMode="contain"
                    source={imageSource}
                />
                <Text
                    style={[
                        {
                            textAlign: 'center',
                            fontSize: 12,

                            color,
                            fontWeight: this.props.focused
                                ? AppFonts.BOLD
                                : AppFonts.NORMAL
                        },
                        isTabletOrIpad()
                            ? { marginTop: 2, minWidth: 120 }
                            : { marginTop: 5 }
                    ]}
                >
                    {title}
                </Text>
            </View>
        );
    }
}
