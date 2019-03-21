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
import { CheckBox } from 'react-native-elements';
import GlobalColors from '../../config/styles';
import _ from 'lodash';

export default class SearchBox extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            text: '',
            lastSearch: '',
            canDone: false,
            response: []
        };
    }

    renderTopBar() {
        return (
            <View style={styles.searchBoxTopBar}>
                <TouchableOpacity style={styles.searchBoxTopBarButton}>
                    <Text style={styles.searchBoxButtonText}>
                        {I18n.t('Cancel')}
                    </Text>
                </TouchableOpacity>
                <View style={styles.searchBoxTopBarLine} />
                <TouchableOpacity style={styles.searchBoxTopBarButton}>
                    <Text
                        style={[
                            styles.searchBoxButtonText,
                            {
                                textAlign: 'right',
                                color: this.state.canDone
                                    ? GlobalColors.sideButtons
                                    : GlobalColors.disabledGray
                            }
                        ]}
                    >
                        {I18n.t('Done')}
                    </Text>
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
                    <Text
                        style={[styles.searchBoxText, { textAlign: 'center' }]}
                    >
                        No results found for
                    </Text>
                    <Text
                        style={[
                            styles.searchBoxText,
                            { fontWeight: 'bold', textAlign: 'center' }
                        ]}
                    >
                        {this.state.lastSearch}
                    </Text>
                </View>
            );
        }
    }

    renderItem({ item, index }) {
        return (
            <View>
                {this.renderCheckbox(item.text, index)}
                {item.info ? this.renderInfoIcon(item.info) : null}
            </View>
        );
    }

    renderCheckbox(text, index) {
        return (
            <CheckBox
                title={text}
                onIconPress={() => {
                    let response = this.state.response;
                    if (response[index]) {
                        response[index] = false;
                    } else {
                        response[index] = true;
                    }
                    canDone = _.find(response, res => {
                        return res === true;
                    });
                    this.setState({ response: response, canDone: canDone });
                }}
                checked={this.state.response[index]}
                textStyle={styles.searchBoxText}
                size={20}
                iconType="ionicon"
                checkedIcon="ios-checkbox-outline"
                uncheckedIcon="ios-square-outline"
                checkedColor={GlobalColors.sideButtons}
            />
        );
    }

    renderInfoIcon(info) {
        <TouchableOpacity>{Icons.info()}</TouchableOpacity>;
    }

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
