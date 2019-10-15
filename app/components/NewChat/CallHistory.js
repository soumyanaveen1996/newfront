import React from 'react';
import {
    View,
    SafeAreaView,
    Platform,
    Text,
    TouchableOpacity,
    Image,
    Alert,
    FlatList,
    NativeModules,
    RefreshControl
} from 'react-native';
import styles from './styles';
import { Actions } from 'react-native-router-flux';
import _ from 'lodash';
import SystemBot from '../../lib/bot/SystemBot';
import { EventEmitter, AuthEvents, CallsEvents } from '../../lib/events';
import { connect } from 'react-redux';
import I18n from '../../config/i18n/i18n';
import Store from '../../redux/store/configureStore';
import { setCurrentScene } from '../../redux/actions/UserActions';
import NewChatItemSeparator from './NewChatItemSeparator';
import Images from '../../config/images';
import ProfileImage from '../ProfileImage';
import { Icons } from '../../config/icons';
import { BackgroundImage } from '../BackgroundImage';
import Calls from '../../lib/calls';
import { formattedDate } from '../../lib/utils';
import eventEmitter from '../../lib/events/EventEmitter';
import { NETWORK_STATE } from '../../lib/network';
import GlobalColors from '../../config/styles';
import images from '../../config/images';
import { CallDirection, CallType } from '../../lib/calls/Calls';
import Toast, { DURATION } from 'react-native-easy-toast';

const PAGE_SIZE = 25;

class CallHistory extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            callHistory: [],
            refreshing: false
        };
    }

    async componentDidMount() {
        const callHistory = await Calls.getLocalCallHistory();
        if (callHistory) {
            if (callHistory.length >= PAGE_SIZE) {
                this.setState({ callHistory: callHistory.slice(0, PAGE_SIZE) });
            } else {
                this.setState({ callHistory: callHistory });
            }
        }
        this.updateCallHistory();
        eventEmitter.addListener(
            CallsEvents.callHistoryUpdated,
            this.updateCallHistory.bind(this)
        );
    }

    componentWillUnmount() {
        eventEmitter.removeListener(
            CallsEvents.callHistoryUpdated,
            this.updateCallHistory.bind(this)
        );
    }

    static onEnter() {
        EventEmitter.emit(
            AuthEvents.tabTopSelected,
            I18n.t('Call_History'),
            I18n.t('Call_History')
        );
    }

    static onExit() {
        Store.dispatch(setCurrentScene('none'));
    }

    shouldComponentUpdate(nextProps) {
        return nextProps.appState.currentScene === I18n.t('Call_History');
    }

    async updateCallHistory() {
        try {
            const newCalls = await Calls.updateCallHistory();
            this.setState({
                callHistory: newCalls.concat(this.state.callHistory)
            });
        } catch (error) {
            this.refs.toast.show(
                'Could not update call history',
                DURATION.LENGTH_SHORT
            );
            throw error;
        }
    }

    async loadOlderCalls() {
        if (
            !this.state.callHistory[this.state.callHistory.length - 1].lastCall
        ) {
            try {
                let lastCallTime = Date.now();
                if (this.state.callHistory.length > 0) {
                    lastCallTime = this.state.callHistory[
                        this.state.callHistory.length - 1
                    ].callTimestamp;
                }
                const olderCalls = await Calls.fetchCallHistory(lastCallTime);
                this.setState({
                    callHistory: this.state.callHistory.concat(olderCalls)
                });
            } catch (error) {
                this.refs.toast.show(
                    'Could not load older calls',
                    DURATION.LENGTH_SHORT
                );
            }
        }
    }

    makeVoipCall(id, name) {
        let participants = [
            {
                userId: id,
                userName: name
            }
        ];
        SystemBot.get(SystemBot.imBotManifestName).then(imBot => {
            Actions.peopleChat({
                bot: imBot,
                otherParticipants: participants,
                call: true
            });
        });
    }

    makePstnCall(number) {
        if (this.props.appState.network !== NETWORK_STATE.none) {
            Actions.dialler({
                call: true,
                number: number,
                newCallScreen: true
            });
        } else {
            Alert.alert('No netwrok connection', 'Cannot make the call', [
                { text: 'OK' }
            ]);
        }
    }

    renderRow({ item }) {
        if (item.lastCall) {
            return (
                <View
                    style={[
                        styles.contactItemContainer,
                        { justifyContent: 'center', alignItems: 'center' }
                    ]}
                >
                    <Text style={{ alignSelf: 'center' }}>No more calls.</Text>
                </View>
            );
        }
        let id;
        let name;
        let number;
        let icon;
        if (item.callDirection === CallDirection.INCOMING) {
            id = item.fromUserId;
            name = item.fromUserName;
            icon =
                item.duration <= 0
                    ? Icons.arrowBottomLeft({ color: 'red' })
                    : Icons.arrowBottomLeft();
        } else {
            id = item.toUserId;
            name = item.toUserName ? item.toUserName : '+' + item.toNumber;
            number = '+' + item.toNumber;
            icon =
                item.duration <= 0
                    ? Icons.arrowTopRight({ color: 'red' })
                    : Icons.arrowTopRight();
        }
        const image = (
            <ProfileImage
                uuid={id}
                placeholder={Images.user_image}
                style={styles.avatarImage}
                placeholderStyle={styles.avatarImage}
                resizeMode="cover"
            />
        );
        return (
            <View
                style={styles.contactItemContainer}
                // onPress={this.onRowPressed.bind(this, item)}
            >
                <View style={styles.contactItemLeftContainer}>
                    {image}
                    <View style={styles.contactItemDetailsContainer}>
                        <Text style={styles.contactItemName}>{name}</Text>
                        <View style={styles.callDetailsContainer}>
                            <View
                                style={[
                                    styles.callDetailsContainer,
                                    { width: '55%' }
                                ]}
                            >
                                {icon}
                                <Text
                                    style={[
                                        styles.contactItemEmail,
                                        { marginLeft: 10 }
                                    ]}
                                >
                                    {formattedDate(
                                        new Date(item.callTimestamp)
                                    )}
                                </Text>
                            </View>
                            <View style={styles.verticalSeparator} />
                            <Text style={styles.contactItemEmail}>
                                {item.callType === CallType.PSTN ||
                                item.callType === CallType.SAT
                                    ? number
                                    : 'Voip call'}
                            </Text>
                        </View>
                    </View>
                </View>
                <TouchableOpacity
                    style={styles.recallButton}
                    onPress={
                        item.callType === CallType.PSTN ||
                        item.callType === CallType.SAT
                            ? this.makePstnCall.bind(this, number)
                            : this.makeVoipCall.bind(this, id, name)
                    }
                >
                    {Icons.greenCallOutline({ size: 16 })}
                </TouchableOpacity>
            </View>
        );
    }

    renderEmptyScreen() {
        return (
            <View
                style={{
                    height: '100%',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}
            >
                <Image
                    style={{ marginBottom: 45, width: 200 }}
                    source={images.empty_contact}
                />
                <Text
                    style={{
                        color: GlobalColors.textBlack
                    }}
                    numberOfLines={2}
                >
                    You haven’t performed any calls yet.
                </Text>
            </View>
        );
    }

    renderToast() {
        if (Platform.OS === 'ios') {
            return <Toast ref="toast" position="bottom" positionValue={350} />;
        } else {
            return <Toast ref="toast" position="center" />;
        }
    }

    render() {
        return (
            <SafeAreaView style={styles.container}>
                <BackgroundImage>
                    {this.state.callHistory.length > 0 ? (
                        <FlatList
                            refreshControl={
                                this.props.appState.network === 'full' ? (
                                    <RefreshControl
                                        onRefresh={() => {
                                            this.setState(
                                                { refreshing: true },
                                                async () => {
                                                    try {
                                                        await this.updateCallHistory();
                                                        this.setState({
                                                            refreshing: false
                                                        });
                                                    } catch (e) {
                                                        this.setState({
                                                            refreshing: false
                                                        });
                                                    }
                                                }
                                            );
                                        }}
                                        refreshing={this.state.refreshing}
                                    />
                                ) : null
                            }
                            onEndReached={this.loadOlderCalls.bind(this)}
                            onEndReachedThreshold={0.1}
                            data={this.state.callHistory}
                            extraData={this.state.callHistory}
                            renderItem={this.renderRow.bind(this)}
                            ItemSeparatorComponent={NewChatItemSeparator}
                        />
                    ) : (
                        this.renderEmptyScreen()
                    )}
                </BackgroundImage>
                {this.renderToast()}
            </SafeAreaView>
        );
    }
}

const mapStateToProps = state => ({
    appState: state.user
});

const mapDispatchToProps = () => {
    return {};
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(CallHistory);
