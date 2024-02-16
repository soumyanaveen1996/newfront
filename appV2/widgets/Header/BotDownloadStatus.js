import React from 'react';
import { connect } from 'react-redux';
import { View, Text, Platform } from 'react-native';
import GlobalColors from '../../config/styles';
import { ProgressBar } from 'react-native-paper';

class BotDownloadStatus extends React.Component {
    render() {
        if (this.props.appState.downloadingBot)
            return (
                <ProgressBar
                    style={{ width: '100%' }}
                    indeterminate
                    color={GlobalColors.frontmLightBlue}
                />
            );
        return null;
    }
}
const mapStateToProps = (state) => ({
    appState: state.user
});

const mapDispatchToProps = (dispatch) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(BotDownloadStatus);
