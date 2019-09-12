import React from 'react';
import styles from './styles';
import Icons from '../../config/icons';
import { TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';
import { NETWORK_STATE } from '../../lib/network';
import {
    EventEmitter,
    SatelliteConnectionEvents,
    PollingStrategyEvents,
    MessageEvents
} from '../../lib/events';
import { Settings } from '../../lib/capability';

class NetworkButton extends React.Component {
    constructor(props) {
        super(props);
    }

    // componentDidMount() {
    //     EventEmitter.addListener(
    //         PollingStrategyEvents.changed,
    //         this.updateIcon.bind(this)
    //     );
    // }

    // updateIcon() {
    //     Settings.getPollingStrategy()
    //         .then((type) => { this.setState({ network: type }) })
    // }

    render() {
        if (this.props.appState.network === NETWORK_STATE.full) {
            return Icons.antenna({
                onPress: this.props.gsmAction
            });
        } else if (this.props.appState.network === NETWORK_STATE.manual) {
            return Icons.refresh({
                onPress: this.props.manualAction
            });
        } else if (this.props.appState.network === NETWORK_STATE.satellite) {
            return Icons.satIcon({
                onPress: this.props.satelliteAction
            });
        } else {
            return Icons.refresh({
                onPress: this.props.disconnectedAction
            });
        }
    }
}

const mapStateToProps = state => ({
    appState: state.user
});

const mapDispatchToProps = dispatch => {
    return {};
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(NetworkButton);
