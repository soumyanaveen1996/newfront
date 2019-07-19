import React from 'react';
import { View, Text } from 'react-native';
import { Network } from '../../lib/capability';
import EventEmitter from '../../lib/events';
import ChatStatusBar from '../ChatBotScreen/ChatStatusBar';
import SatelliteConnectionEvents from '../../lib/events/SatelliteConnection';
import { connect } from 'react-redux';
import { setNetwork } from '../../redux/actions/UserActions';
import AgentGuard from '../../lib/capability/AgentGuard';
import Bot from '../../lib/bot';
import { NETWORK_STATE } from '../../lib/network';
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
        // if (this.state.network !== 'satellite') {
        //     this.setState({
        //         showNetworkStatusBar: true,
        //         network: 'satellite'
        //     });
        // }
        this.props.setNetwork('satellite');
    };

    satelliteDisconnectHandler = () => {
        // if (this.state.network === 'satellite') {
        //     this.setState({
        //         showNetworkStatusBar: false,
        //         network: 'connected'
        //     });
        // }
        this.props.setNetwork('full');
    };

    handleConnectionChange = connection => {
        if (connection.type === 'none') {
            this.props.setNetwork(NETWORK_STATE.none);
        } else {
            this.props.setNetwork(NETWORK_STATE.full);
            AgentGuard.heartBeat();
            Bot.grpcheartbeatCatalog();
        }
    };

    onChatStatusBarClose = () => {
        // this.setState({
        //     showNetworkStatusBar: false
        // });
        this.props.setNetwork('full');
    };
    renderNetworkStatusBar = () => {
        const { network } = this.props.appState;
        if (network !== 'full') {
            return (
                <ChatStatusBar
                    network={network}
                    onChatStatusBarClose={this.onChatStatusBarClose}
                />
            );
        }
    };

    render() {
        if (!this.props.appState) {
            return <View />;
        }

        return <View>{this.renderNetworkStatusBar()}</View>;
    }
}

const mapStateToProps = state => ({
    appState: state.user
});

const mapDispatchToProps = dispatch => {
    return {
        setNetwork: network => dispatch(setNetwork(network))
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(NetworkStatusNotchBar);
