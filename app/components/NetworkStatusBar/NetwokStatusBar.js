import React from 'react';
import { View, Text } from 'react-native';
import { Network } from '../../lib/capability';
import EventEmitter from '../../lib/events';
import ChatStatusBar from '../ChatBotScreen/ChatStatusBar';
import SatelliteConnectionEvents from '../../lib/events/SatelliteConnection';

class NetworkStatusNotchBar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showNetworkStatusBar: false,
            network: null
        };
    }

    async componentDidMount() {
        Network.addConnectionChangeEventListener(this.handleConnectionChange);
        EventEmitter.addListener(
            SatelliteConnectionEvents.connectedToSatellite,
            this.satelliteConnectionHandler
        );
        EventEmitter.addListener(
            SatelliteConnectionEvents.notConnectedToSatellite,
            this.satelliteDisconnectHandler
        );
    }

    satelliteConnectionHandler = () => {
        if (this.state.network !== 'satellite') {
            this.setState({
                showNetworkStatusBar: true,
                network: 'satellite'
            });
        }
    };

    satelliteDisconnectHandler = () => {
        if (this.state.network === 'satellite') {
            this.setState({
                showNetworkStatusBar: false,
                network: 'connected'
            });
        }
    };

    handleConnectionChange = connection => {
        if (connection.type === 'none') {
            this.setState({
                showNetworkStatusBar: true,
                network: 'none'
            });
        } else {
            if (this.state.network === 'none') {
                this.setState({
                    showNetworkStatusBar: false,
                    network: 'connected'
                });
            }
        }
    };

    onChatStatusBarClose = () => {
        this.setState({
            showNetworkStatusBar: false
        });
    };
    renderNetworkStatusBar = () => {
        const { network, showNetworkStatusBar } = this.state;
        if (
            showNetworkStatusBar &&
            (network === 'none' || network === 'satellite')
        ) {
            return (
                <ChatStatusBar
                    network={this.state.network}
                    onChatStatusBarClose={this.onChatStatusBarClose}
                />
            );
        }
    };

    render() {
        return <View>{this.renderNetworkStatusBar()}</View>;
    }
}

export default NetworkStatusNotchBar;
