import React from 'react';
import {
    ActivityIndicator,
    Animated,
    View,
    StyleSheet,
    Text
} from 'react-native';
import { RefreshHeader } from 'react-native-spring-scrollview/RefreshHeader';
import { LoadingFooter } from 'react-native-spring-scrollview/LoadingFooter';

export class PullToRefreshHeader extends RefreshHeader {
    render() {
        return <View style={styles.container}>{this._renderIcon()}</View>;
    }

    _renderIcon() {
        return <ActivityIndicator color={'gray'} />;
    }
}

export class PullToLoadFooter extends LoadingFooter {
    render() {
        if (this.state.status === 'allLoaded') {
            return (
                <View style={styles.footerContainer}>{this._renderIcon()}</View>
            );
        } else {
            return (
                <View style={styles.footerContainer}>{this._renderIcon()}</View>
            );
        }
    }

    _renderIcon() {
        return <ActivityIndicator color={'gray'} />;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row'
    },
    footerContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row'
    }
});
