import React from 'react';
import { View } from 'react-native';
import { connect } from 'react-redux';
import EventEmitter from '../../lib/events';
import ChatStatusBar from '../ChatStatusBar';
import SatelliteConnectionEvents from '../../lib/events/SatelliteConnection';
import AgentGuard from '../../lib/capability/AgentGuard';
import Bot from '../../lib/bot';
import { NETWORK_STATE } from '../../lib/network';
import { Connection } from '../../lib/events/Connection';

class NetworkStatusNotchBar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showNetworkStatusBar: false,
            network:
                this.props.appState && this.props.appState.network
                    ? this.props.appState.network
                    : null
        };
    }

    async componentDidMount() {
        this.networkListener = EventEmitter.addListener(
            Connection.netWorkStatusChange,
            this.handleConnectionChange
        );
        this.connectedToSatelliteListener = EventEmitter.addListener(
            SatelliteConnectionEvents.connectedToSatellite,
            this.satelliteConnectionHandler.bind(this)
        );
        this.notConnectedToSatelliteListener = EventEmitter.addListener(
            SatelliteConnectionEvents.notConnectedToSatellite,
            this.satelliteDisconnectHandler.bind(this)
        );
    }

    componentWillUnmount() {
        this.networkListener?.remove();
        this.notConnectedToSatelliteListener?.remove();
        this.connectedToSatelliteListener?.remove();
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

    handleConnectionChange = (connection) => {
        if (connection.type === 'none') {
            this.setState({
                showNetworkStatusBar: true,
                network: 'none'
            });
        } else if (this.state.network === 'none') {
            this.setState({
                showNetworkStatusBar: false,
                network: 'connected'
            });
        }
    };

    renderNetworkStatusBar = () => {
        const { network } = this.props.appState;

        if (network === NETWORK_STATE.none) {
            return (
                <ChatStatusBar
                    network={network}
                    onChatStatusBarClose={this.props.onChatStatusBarClose}
                />
            );
        }
        return <View />;
    };

    render() {
        const { network } = this.props.appState;
        if (this.props.appState.networkMsgUI && this.state.network === 'none') {
            return <View>{this.renderNetworkStatusBar()}</View>;
        }
        return <View />;
    }
}

const mapStateToProps = (state) => ({
    appState: state.user
});

const mapDispatchToProps = (dispatch) => ({});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(NetworkStatusNotchBar);
