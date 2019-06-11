import React from 'react';
import { View, Text } from 'react-native';
import { Network } from '../../lib/capability';
import EventEmitter from '../../lib/events';
import ChatStatusBar from '../ChatBotScreen/ChatStatusBar';
import SatelliteConnectionEvents from '../../lib/events/SatelliteConnection';
import { connect } from 'react-redux';
import { setNetwork } from '../../redux/actions/UserActions';
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
        console.log('Sourav Logging::: Connection Change Event');
        if (connection.type === 'none') {
            this.props.setNetwork('none');
        } else {
            this.props.setNetwork('full');
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
