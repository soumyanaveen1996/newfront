import React from 'react';

import { connect } from 'react-redux';
import I18n from '../../config/i18n/i18n';
import { EventEmitter, PollingStrategyEvents } from '../../lib/events';
import { Settings, PollingStrategyTypes } from '../../lib/capability';
import GlobalColors from '../../config/styles';
import configToUse from '../../config/config';
import AlertDialog from '../../lib/utils/AlertDialog';

class NetworkButton extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loadingManual: false,
            pollingStrategy: PollingStrategyTypes.manual
        };
        const { white } = this.props;
        this.iconColor = white
            ? GlobalColors.white
            : GlobalColors.primaryButtonColor;
    }

    componentDidMount() {
        EventEmitter.addListener(
            PollingStrategyEvents.changed,
            this.readPollingStrategy.bind(this)
        );
        this.readPollingStrategy();
    }

    readPollingStrategy() {
        Settings.getPollingStrategy().then((strategy) => {
            this.setState({ pollingStrategy: strategy });
        });
    }

    showConnectionMessage = (connectionType) => {
        let message = I18n.t('Auto_Message');
        if (connectionType === 'gsm') {
            message = I18n.t('Gsm_Message');
        } else if (connectionType === 'satellite') {
            message = I18n.t('Satellite_Message');
        }
        AlertDialog.show(
            this.state.pollingStrategy === PollingStrategyTypes.automatic
                ? I18n.t('Automatic_Network')
                : '',
            message
        );
    };

    render() {
        if (configToUse.app.hideNetworkIcon) return null;
        return null;
    }
}

const mapStateToProps = (state) => ({
    appState: state.user
});

const mapDispatchToProps = (dispatch) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(NetworkButton);
