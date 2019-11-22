import React from 'react';
import styles from './styles';
import Icons from '../../config/icons';
import {
    TouchableOpacity,
    Alert,
    Image,
    ActivityIndicator
} from 'react-native';
import { connect } from 'react-redux';
import { NETWORK_STATE } from '../../lib/network';
import I18n from '../../config/i18n/i18n';
import images from '../../config/images';
import {
    EventEmitter,
    SatelliteConnectionEvents,
    PollingStrategyEvents,
    MessageEvents
} from '../../lib/events';
import { Settings, PollingStrategyTypes } from '../../lib/capability';

class NetworkButton extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loadingManual: false,
            pollingStrategy: PollingStrategyTypes.manual
        };
    }

    componentDidMount() {
        EventEmitter.addListener(
            PollingStrategyEvents.changed,
            this.readPollingStrategy.bind(this)
        );
        this.readPollingStrategy();
    }

    readPollingStrategy() {
        Settings.getPollingStrategy().then(strategy => {
            this.setState({ pollingStrategy: strategy });
        });
    }

    showConnectionMessage = connectionType => {
        let message = I18n.t('Auto_Message');
        if (connectionType === 'gsm') {
            message = I18n.t('Gsm_Message');
        } else if (connectionType === 'satellite') {
            message = I18n.t('Satellite_Message');
        }
        Alert.alert(
            this.state.pollingStrategy === PollingStrategyTypes.automatic
                ? I18n.t('Automatic_Network')
                : '',
            message,
            [{ text: I18n.t('Ok'), style: 'cancel' }],
            { cancelable: false }
        );
    };

    render() {
        if (
            this.state.pollingStrategy === PollingStrategyTypes.gsm ||
            (this.state.pollingStrategy === PollingStrategyTypes.automatic &&
                this.props.appState.network === NETWORK_STATE.full)
        ) {
            this.lastIcon = (
                <Image
                    accessibilityLabel="Network Icon"
                    testID="network-icon"
                    source={images.gsm}
                    resizeMode="contain"
                    style={{ width: 50, height: 50, opacity: 0.2 }}
                />
            );
            return (
                <TouchableOpacity
                    accessibilityLabel="Network Icon"
                    testID="network-icon"
                    activeOpacity={1}
                    onPress={() => this.showConnectionMessage('gsm')}
                >
                    <Image
                        accessibilityLabel="Network Icon"
                        testID="network-icon"
                        source={images.gsm}
                        resizeMode="contain"
                        style={{ width: 50, height: 50 }}
                    />
                </TouchableOpacity>
            );
        } else if (
            this.state.pollingStrategy === PollingStrategyTypes.manual ||
            (this.state.pollingStrategy === PollingStrategyTypes.automatic &&
                this.props.appState.network === NETWORK_STATE.manual)
        ) {
            this.lastIcon = (
                <Image
                    accessibilityLabel="Network Icon"
                    testID="network-icon"
                    source={images.refresh}
                    resizeMode="contain"
                    style={{ width: 50, height: 50, opacity: 0.2 }}
                />
            );
            return (
                <TouchableOpacity
                    accessibilityLabel="Network Icon"
                    testID="network-icon"
                    onPress={() => {
                        this.setState({ loadingManual: true });
                        this.props.manualAction;
                        setTimeout(() => {
                            this.setState({ loadingManual: false });
                        }, 2000);
                    }}
                    activeOpacity={1}
                >
                    {this.state.loadingManual ? (
                        <ActivityIndicator
                            size="small"
                            style={{ marginRight: 10 }}
                        />
                    ) : (
                        <Image
                            accessibilityLabel="Network Icon"
                            testID="network-icon"
                            source={images.refresh}
                            resizeMode="contain"
                            style={{ width: 50, height: 50 }}
                        />
                    )}
                </TouchableOpacity>
            );
        } else if (
            this.state.pollingStrategy === PollingStrategyTypes.satellite ||
            (this.state.pollingStrategy === PollingStrategyTypes.automatic &&
                this.props.appState.network === NETWORK_STATE.satellite)
        ) {
            this.lastIcon = (
                <Image
                    accessibilityLabel="Network Icon"
                    testID="network-icon"
                    source={images.satellite}
                    resizeMode="contain"
                    style={{ width: 50, height: 50, opacity: 0.2 }}
                />
            );
            return (
                <TouchableOpacity
                    accessibilityLabel="Network Icon"
                    testID="network-icon"
                    onPress={() => this.showConnectionMessage('satellite')}
                    activeOpacity={1}
                >
                    <Image
                        accessibilityLabel="Network Icon"
                        testID="network-icon"
                        source={images.satellite}
                        resizeMode="contain"
                        style={{ width: 50, height: 50 }}
                    />
                </TouchableOpacity>
            );
        } else {
            return this.lastIcon;
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
