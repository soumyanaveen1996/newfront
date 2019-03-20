import React from 'react';
import {
    Platform,
    TouchableOpacity,
    View,
    TextInput,
    Image,
    Text,
    Alert,
    FlatList
} from 'react-native';
import styles, { chatBarStyle } from './styles';
import Images from '../../config/images';
import Icons from '../../config/icons';
import Utils from '../../lib/utils';
import Permissions from 'react-native-permissions';
import AndroidOpenSettings from 'react-native-android-open-settings';
import { MessageCounter } from '../../lib/MessageCounter';
import I18n from '../../config/i18n/i18n';

export default class SearchBox extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            text: '',
            selected: false,
            lastSearch: ''
        };
    }

    renderTopBar() {
        return (
            <View style={styles.searchBoxTopBar}>
                <TouchableOpacity>
                    <Text style={styles.searchBoxText}>{I18n.t('Cancel')}</Text>
                </TouchableOpacity>
                <View style={styles.searchBoxTopBarLine} />
                <TouchableOpacity>
                    <Text style={styles.searchBoxText}>{I18n.t('Done')}</Text>
                </TouchableOpacity>
            </View>
        );
    }

    renderResults() {
        if (this.props.results.length > 0) {
            return (
                <FlatList
                    data={this.state.results}
                    renderItem={this.renderItem.bind(this)}
                    ItemSeparatorComponent={this.renderSeparator.bind(this)}
                />
            );
        } else {
            return (
                <View>
                    <Text style={{ textAlign: 'center' }}>
                        No results found for
                    </Text>
                    <Text>{this.state.lastSearch}</Text>
                </View>
            );
        }
    }

    renderItem({ item }) {}
    renderSeparator() {}

    rightButton() {
        return (
            <TouchableOpacity
                accessibilityLabel="Right Button Send"
                testID="right-button-send"
                onPress={null}
            >
                <Image
                    source={Images.btn_send}
                    style={styles.chatBarSendButton}
                />
            </TouchableOpacity>
        );
    }

    onChangeText(text) {
        this.setState({ text: text });
    }

    render() {
        return (
            <View style={styles.searchBoxContainer}>
                {this.renderTopBar()}
                {this.renderResults()}
                <View style={styles.chatBar}>
                    <TextInput
                        value={this.state.text}
                        style={styles.chatTextInput}
                        underlineColorAndroid="transparent"
                        placeholder="Type something nice"
                        multiline
                        onChangeText={this.onChangeText.bind(this)}
                    />
                    {this.rightButton()}
                </View>
            </View>
        );
    }
}
