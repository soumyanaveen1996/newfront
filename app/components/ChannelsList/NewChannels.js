import React from 'react';
import {
    View,
    ScrollView,
    Text,
    TouchableOpacity,
    TextInput
} from 'react-native';
import { SafeAreaView } from 'react-navigation';
import { Actions } from 'react-native-router-flux';
import RadioForm, {
    RadioButton,
    RadioButtonInput,
    RadioButtonLabel
} from 'react-native-simple-radio-button';
import { HeaderBack, HeaderRightIcon } from '../Header';
import { Icons } from '../../config/icons';
import styles from './styles';
import I18n from '../../config/i18n/i18n';
import { Channel } from '../../lib/capability';
import Loader from '../Loader/Loader';
import images from '../../images';

class NewChannels extends React.Component {
    static navigationOptions({ navigation, screenProps }) {
        const { state } = navigation;

        let navigationOptions = {
            headerTitle: state.params.title
        };
        if (state.params.noBack === true) {
            navigationOptions.headerLeft = null;
        } else {
            navigationOptions.headerLeft = (
                <HeaderBack
                    onPress={
                        state.params.onBack
                            ? () => {
                                Actions.pop();
                                state.params.onBack();
                            }
                            : Actions.pop
                    }
                    refresh={true}
                />
            );
        }
        if (state.params.button) {
            if (state.params.button === 'manual') {
                navigationOptions.headerRight = (
                    <HeaderRightIcon
                        onPress={() => {
                            state.params.refresh();
                        }}
                        icon={Icons.refresh()}
                    />
                );
            } else if (state.params.button === 'gsm') {
                navigationOptions.headerRight = (
                    <HeaderRightIcon
                        image={images.gsm}
                        onPress={() => {
                            state.params.showConnectionMessage('gsm');
                        }}
                    />
                );
            } else if (state.params.button === 'satellite') {
                navigationOptions.headerRight = (
                    <HeaderRightIcon
                        image={images.satellite}
                        onPress={() => {
                            state.params.showConnectionMessage('satellite');
                        }}
                    />
                );
            } else {
                navigationOptions.headerRight = (
                    <HeaderRightIcon
                        icon={Icons.automatic()}
                        onPress={() => {
                            state.params.showConnectionMessage('automatic');
                        }}
                    />
                );
            }
        }
        return navigationOptions;
    }

    constructor(props) {
        super(props);
        this.state = {
            channelName: '',
            channelDescription: '',
            typeValue: '',
            visibilityValue: '',
            loading: false
        };

        this.channelType_radio = [
            { label: 'Team', value: 'team' },
            { label: 'Platform', value: 'platform' }
        ];

        this.channelVisibility_radio = [
            { label: 'Public', value: 'public' },
            { label: 'Private', value: 'private' }
        ];
        this.inputs = {};
    }

    onChangeChannelName(text) {
        this.setState({ channelName: text });
    }

    onChangeDescriptionText(text) {
        this.setState({ channelDescription: text });
    }

    focusTheField = id => {
        this.inputs[id].focus();
    };

    async saveChannel() {
        this.setState({ loading: true });
        const channelName = this.state.channelName;
        const description = this.state.channelDescription;
        const discoverable = this.state.typeValue;
        const channelType = this.state.visibilityValue;
        let userDomain = '';
        if (channelType === 'private') {
            userDomain = 'inmarsat';
        } else {
            userDomain = 'frontmai';
        }
        const channelData = {
            channelName,
            description,
            discoverable,
            channelType,
            userDomain
        };
        console.log('save channels', channelData);

        Channel.create(channelData)
            .then(data => {
                console.log('success on creating channel ', data);
                this.setState({ loading: false });
                Actions.pop();
            })
            .catch(err => {
                console.log('err on creating channel', err);
            });
    }

    addParticipants() {
        Actions.addParticipants({
            title: 'Add participants',
            onBack: this.props.onBack
        });
    }

    render() {
        return (
            <SafeAreaView style={{ flex: 1 }}>
                <Loader loading={this.state.loading} />
                <ScrollView style={styles.scrollViewCreate}>
                    <View style={styles.newChannelContainer}>
                        <View style={styles.channelInfoContainer}>
                            <View style={styles.entryFields}>
                                <TextInput
                                    style={styles.inputChannel}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    onChangeText={this.onChangeChannelName.bind(
                                        this
                                    )}
                                    keyboardType="default"
                                    blurOnSubmit={false}
                                    returnKeyType={'next'}
                                    onSubmitEditing={() => {
                                        this.focusTheField('description');
                                    }}
                                    placeholder="Channel name"
                                    underlineColorAndroid={'transparent'}
                                    placeholderTextColor="rgba(155,155,155,1)"
                                    clearButtonMode="always"
                                />
                            </View>
                            <View style={styles.entryFields}>
                                <TextInput
                                    style={styles.inputChannelDescription}
                                    keyboardType="default"
                                    blurOnSubmit={true}
                                    returnKeyType={'done'}
                                    ref={input => {
                                        this.inputs.description = input;
                                    }}
                                    onChangeText={this.onChangeDescriptionText.bind(
                                        this
                                    )}
                                    placeholder="Description about your channel"
                                    underlineColorAndroid={'transparent'}
                                    multiline={true}
                                    numberOfLines={4}
                                    maxLength={60}
                                    placeholderTextColor="rgba(155,155,155,1)"
                                    clearButtonMode="always"
                                />
                            </View>
                        </View>
                        <View style={styles.channelInfoContainer}>
                            <Text style={styles.channelText}>Channel Type</Text>
                            <RadioForm
                                radio_props={this.channelType_radio}
                                initial={-1}
                                formHorizontal={true}
                                animation={true}
                                onPress={value => {
                                    this.setState({ typeValue: value });
                                }}
                            />
                        </View>

                        <View style={styles.channelInfoContainer}>
                            <Text style={styles.channelText}>
                                Channel visibility
                            </Text>
                            <RadioForm
                                radio_props={this.channelVisibility_radio}
                                initial={-1}
                                formHorizontal={true}
                                animation={true}
                                onPress={value => {
                                    this.setState({ visibilityValue: value });
                                }}
                            />
                        </View>
                        <View style={styles.channelInfoContainer}>
                            <TouchableOpacity
                                onPress={this.addParticipants.bind(this)}
                            >
                                <Text style={styles.channelText}>
                                    Add participants
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <View style={{ marginVertical: 20 }}>
                            <TouchableOpacity
                                style={styles.buttonContainer}
                                onPress={this.saveChannel.bind(this)}
                            >
                                <Text style={styles.buttonText}>
                                    Create Channel
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        );
    }
}

export default NewChannels;
