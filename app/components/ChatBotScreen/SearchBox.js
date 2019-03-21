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

export const SearchBoxBotAction = {
    OPEN: 'open',
    CLOSE: 'close',
    RESULTS: 'results'
};

export const SearchBoxUserAction = {
    DONE: 'done',
    CANCEL: 'cancel',
    SEARCH: 'search'
};

export class SearchBox extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            text: '',
            lastSearch: null,
            canDone: false,
            response: []
        };
    }

    componentDidUpdate() {
        if (this.props.data.action === SearchBoxBotAction.OPEN) {
            this.setState({
                response: [],
                canDone: false,
                lastSearch: null,
                text: ''
            });
        }
    }

    renderTopBar() {
        return (
            <View style={styles.searchBoxTopBar}>
                <TouchableOpacity
                    style={styles.searchBoxTopBarButton}
                    onPress={this.onCancel.bind(this)}
                >
                    <Text style={styles.searchBoxButtonText}>
                        {I18n.t('Cancel')}
                    </Text>
                </TouchableOpacity>
                <View style={styles.searchBoxTopBarLine} />
                <TouchableOpacity
                    style={styles.searchBoxTopBarButton}
                    onPress={this.onDone.bind(this)}
                    disabled={!this.state.canDone}
                >
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
        if (this.props.data.results && this.props.data.results.length > 0) {
            return (
                <FlatList
                    data={this.props.data.results}
                    renderItem={this.renderItem.bind(this)}
                    extraData={this.state}
                    ItemSeparatorComponent={this.renderSeparator.bind(this)}
                />
            );
        } else if (this.state.lastSearch) {
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
        } else {
            return;
        }
    }

    renderItem({ item, index }) {
        return (
            <View style={styles.searchBoxRow}>
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
                containerStyle={styles.searchBoxCheckbox}
                checked={this.state.response[index]}
                textStyle={styles.searchBoxText}
                size={28}
                iconType="ionicon"
                checkedIcon="ios-checkbox-outline"
                uncheckedIcon="ios-square-outline"
                checkedColor={GlobalColors.sideButtons}
            />
        );
    }

    renderInfoIcon(info) {
        return <TouchableOpacity>{Icons.info()}</TouchableOpacity>;
    }

    renderSeparator() {
        return (
            <View
                style={{
                    backgroundColor: GlobalColors.disabledGray,
                    flex: 1,
                    height: 1,
                    marginHorizontal: '5%'
                }}
            />
        );
    }

    rightButton() {
        return (
            <TouchableOpacity
                accessibilityLabel="Right Button Send"
                testID="right-button-send"
                onPress={this.onSearch.bind(this)}
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

    onDone() {
        let results = _.filter(this.props.data.results, (res, index) => {
            return this.state.response[index];
        });
        results = _.map(results, res => {
            return res.text;
        });

        response = {
            action: SearchBoxUserAction.DONE,
            results: results
        };
        this.props.sendResponse(response);
    }

    onCancel() {
        response = {
            action: SearchBoxUserAction.CANCEL
        };
        this.props.sendResponse(response);
    }

    onSearch() {
        this.setState({ lastSearch: this.state.text });
        query = {
            action: SearchBoxUserAction.SEARCH,
            queryString: this.state.text
        };
        this.props.sendSearchQuery(query);
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
