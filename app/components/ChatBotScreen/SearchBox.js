import React from 'react';
import {
    Platform,
    TouchableOpacity,
    View,
    TextInput,
    Image,
    Text,
    Alert,
    FlatList,
    ActivityIndicator,
    ScrollView
} from 'react-native';
import styles, { chatBarStyle } from './styles';
import modalStyle from '../Cards/styles';
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
            response: [],
            searching: false
        };
    }

    componentDidUpdate(prevProps) {
        if (
            prevProps.data.action !== this.props.data.action &&
            this.props.data.action === SearchBoxBotAction.OPEN
        ) {
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
                    keyboardShouldPersistTaps="handled"
                    data={this.props.data.results}
                    renderItem={this.renderItem.bind(this)}
                    extraData={this.state}
                    ItemSeparatorComponent={this.renderSeparator.bind(this)}
                />
            );
        } else if (
            this.props.data.results &&
            this.props.data.results.length === 0 &&
            !this.state.searching
        ) {
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
        return (
            <TouchableOpacity onPress={this.onOpenInfo.bind(this, info)}>
                {Icons.info()}
            </TouchableOpacity>
        );
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
        if (this.state.searching) {
            return (
                <ActivityIndicator
                    style={{ marginHorizontal: 10 }}
                    size="small"
                />
            );
        } else {
            return (
                <TouchableOpacity
                    accessibilityLabel="Right Button Send"
                    testID="right-button-send"
                    onPress={this.onSearch.bind(this)}
                    disabled={this.state.canDone}
                >
                    <Image
                        source={Images.btn_send}
                        style={[
                            styles.chatBarSendButton,
                            {
                                tintColor: this.state.canDone
                                    ? GlobalColors.disabledGray
                                    : null
                            }
                        ]}
                    />
                </TouchableOpacity>
            );
        }
    }

    renderModalContent(info) {
        let fields;
        if (info) {
            let keys = Object.keys(info);
            keys = keys.slice(1, keys.length);
            fields = _.map(keys, key => {
                return (
                    <View style={modalStyle.fieldModal}>
                        <Text style={modalStyle.fieldLabelModal}>
                            {key + ': '}
                        </Text>
                        {this.renderValue(info[key], true)}
                    </View>
                );
            });
        }
        return (
            <View style={[modalStyle.modalCard, { height: '65%' }]}>
                <ScrollView>
                    <View style={modalStyle.fieldsModal}>{fields}</View>
                </ScrollView>
            </View>
        );
    }

    renderValue(value, isModal) {
        if (value === null || value === undefined) {
            return <Text style={modalStyle.fieldText}>-</Text>;
        } else if (typeof value === 'boolean') {
            if (value) {
                return Icons.cardsTrue();
            } else {
                return Icons.cardsFalse();
            }
        } else {
            if (isModal) {
                return (
                    <Text style={modalStyle.fieldText}>{value.toString()}</Text>
                );
            } else {
                return (
                    <Text
                        style={[modalStyle.fieldText, { textAlign: 'left' }]}
                        numberOfLines={1}
                        ellipsizeMode={'tail'}
                    >
                        {value.toString()}
                    </Text>
                );
            }
        }
    }

    onOpenInfo(info) {
        this.props.onOpenInfo(this.renderModalContent(info));
    }

    onChangeText(text) {
        this.setState({ text: text });
    }

    onDone() {
        let results = _.filter(this.props.data.results, (res, index) => {
            return this.state.response[index];
        });
        // results = _.map(results, res => {
        //     return { text: res.text };
        // });

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
        this.setState({ lastSearch: this.state.text, searching: true });
        query = {
            action: SearchBoxUserAction.SEARCH,
            queryString: this.state.text
        };
        this.props.sendSearchQuery(query);
    }

    onResponseReceived() {
        this.setState({ searching: false });
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
                        placeholder="Aa"
                        multiline
                        onChangeText={this.onChangeText.bind(this)}
                    />
                    {this.rightButton()}
                </View>
            </View>
        );
    }
}
