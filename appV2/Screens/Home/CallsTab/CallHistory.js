import React from 'react';
import {
    View,
    SafeAreaView,
    Platform,
    Text,
    TouchableOpacity,
    Image,
    FlatList,
    RefreshControl,
    PermissionsAndroid,
    TouchableWithoutFeedback
} from 'react-native';
import _ from 'lodash';
import { connect } from 'react-redux';
import SystemBot from '../../../lib/bot/SystemBot';
import styles from './styles';
import { EventEmitter, AuthEvents, CallsEvents } from '../../../lib/events';
import I18n from '../../../config/i18n/i18n';
import Store from '../../../redux/store/configureStore';
import { setCurrentScene } from '../../../redux/actions/UserActions';
import Images from '../../../config/images';
import ProfileImage from '../../../widgets/ProfileImage';
import { Icons } from '../../../config/icons';
import { BackgroundImage } from '../../../widgets/BackgroundImage';
import Calls from '../../../lib/calls';
import { formattedDate } from '../../../lib/utils';
import eventEmitter from '../../../lib/events/EventEmitter';
import { NETWORK_STATE } from '../../../lib/network';
import GlobalColors from '../../../config/styles';
import { CallDirection, CallType } from '../../../lib/calls/Calls';
import config from '../../../config/config';
import { Auth } from '../../../lib/capability';
import images from '../../../images';
import NavigationAction from '../../../navigation/NavigationAction';
import { Toast } from 'react-native-toast-message/lib/src/Toast';
import AlertDialog from '../../../lib/utils/AlertDialog';
import AppFonts from '../../../config/fontConfig';

const PAGE_SIZE = 25;

class CallHistory extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            callHistory: [],
            refreshing: false,
            isModalVisible: false,
            callDuration: null,
            callCost: null,
            toUserName: '',
            userId: ''
        };
    }

    async componentDidMount() {
        const callHistory = await Calls.getLocalCallHistory();
        Platform.OS === 'android' && this.requestRecordRermission();
        if (callHistory) {
            if (callHistory.length >= PAGE_SIZE) {
                this.setState({ callHistory: callHistory.slice(0, PAGE_SIZE) });
            } else {
                this.setState({ callHistory });
            }
        }
        this.updateCallHistory();
        this.callHistorySubscriber = eventEmitter.addListener(
            CallsEvents.callHistoryUpdated,
            this.updateCallHistory.bind(this)
        );
    }

    componentWillUnmount() {
        this.callHistorySubscriber?.remove();
    }

    requestRecordRermission = async () => {
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
                {
                    title: 'Audio Record Permission',
                    message: 'Audio Record Permission is required'
                }
            );
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                console.log('Audio Record Permission Granted.');
            } else {
                console.log('Audio Record Permission Not Granted');
            }
        } catch (err) {
            console.warn(err);
        }
    };

    static onEnter() {
        EventEmitter.emit(AuthEvents.tabSelected, I18n.t('Calls'));
    }

    static onExit() {
        Store.dispatch(setCurrentScene('none'));
    }

    async updateCallHistory() {
        try {
            const newCalls = await Calls.updateCallHistory();
            this.setState({
                callHistory: newCalls.concat(this.state.callHistory)
            });
        } catch (error) {
            Toast.show({ text1: 'Could not update call history' });

            throw error;
        }
    }

    loadOlderCalls = async () => {
        if (
            !this.state.callHistory[this.state.callHistory.length - 1].lastCall
        ) {
            try {
                let lastCallTime = Date.now();
                if (this.state.callHistory.length > 0) {
                    lastCallTime =
                        this.state.callHistory[
                            this.state.callHistory.length - 1
                        ].callTimestamp;
                }
                const olderCalls = await Calls.fetchCallHistory(lastCallTime);
                if (olderCalls) {
                    this.setState({
                        callHistory: this.state.callHistory.concat(olderCalls)
                    });
                }
            } catch (error) {
                Toast.show({ text1: 'Could not load older calls' });
            }
        }
    };

    makeVoipCall(id, name, videoCall) {
        const user = Auth.getUserData();
        NavigationAction.push(NavigationAction.SCREENS.meetingRoom, {
            voipCallData: { otherUserId: id, otherUserName: name },
            userId: user?.userId,
            title: name,
            isVideoCall: videoCall
        });
    }

    makePstnCall(number) {
        if (this.props.appState.network !== NETWORK_STATE.none) {
            NavigationAction.push(NavigationAction.SCREENS.dialler, {
                call: true,
                number,
                newCallScreen: true
            });
        } else {
            AlertDialog.show('No network connection', 'Cannot make the call');
        }
    }

    onChatPresses = (item) => {
        const participants = [
            {
                userId: item.toUserId ? item.toUserId : item.fromUserId,
                userName: item.toUserName ? item.toUserName : item.fromUserName
            }
        ];
        SystemBot.get(SystemBot.imBotManifestName).then((imBot) => {
            NavigationAction.goToUsersChat({
                bot: imBot,
                otherParticipants: participants,
                onBack: this.props.onBack,
                otherUserId: participants[0].userId,
                otherUserName: participants[0].userName
            });
        });
    };

    onClickDialpad = () => {
        NavigationAction.push(NavigationAction.SCREENS.dialler);
    };

    onRowPressed = (name, duration, callCharge, toUserId) => {
        this.setState({
            isModalVisible: true,
            callDuration: duration,
            callCost: callCharge,
            toUserName: name,
            userId: toUserId
        });
    };

    hideModal = () => {
        this.setState({ isModalVisible: false });
    };

    renderRow = ({ item }) => {
        if (item.lastCall) {
            return null;
        }

        let id;
        let name;
        let number;
        let icon;
        let toNumber;
        if (item.callDirection === CallDirection.INCOMING) {
            id = item.fromUserId;
            name = item.fromUserName;
            icon =
                item.duration <= 0
                    ? Icons.inCommingCall({ color: 'red' })
                    : Icons.inCommingCall({ color: 'green' });
        } else {
            id = item.toUserId;
            toNumber = item.toNumber.includes('+')
                ? item.toNumber
                : `+${item.toNumber}`;
            name = item.toUserName ? item.toUserName : toNumber;
            number = toNumber;
            icon =
                item.duration <= 0
                    ? Icons.outGoingCall({ color: 'red' })
                    : Icons.outGoingCall({ color: 'green' });
        }

        return (
            <View
                key={`${id}-${item.callTimestamp}`}
                style={{
                    marginVertical: 14,
                    marginHorizontal: 14,
                    backgroundColor: GlobalColors.appBackground
                }}
            >
                <TouchableOpacity
                    style={styles.contactItemContainer}
                    onPress={() =>
                        this.onRowPressed(
                            name,
                            item.duration,
                            item.callCharge,
                            item.toUserId
                        )
                    }
                >
                    <View style={styles.contactItemLeftContainer}>
                        <View style={{ marginRight: 6 }}>
                            <ProfileImage
                                uuid={id}
                                placeholder={Images.user_image}
                                style={styles.avatarImage}
                                placeholderStyle={styles.avatarImage}
                                userName={name}
                            />
                            <View
                                style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    paddingTop: 15
                                }}
                            >
                                {icon}
                            </View>
                        </View>
                        <View style={styles.contactItemDetailsContainer}>
                            <Text style={styles.callHistoryTitle}>{name}</Text>
                            {/* <View style={[styles.callDetailsContainer]}> */}
                            <View style={{ flexDirection: 'row' }}>
                                <Text style={styles.callHistoryTime}>
                                    {formattedDate(
                                        new Date(item.callTimestamp)
                                    )}
                                </Text>
                                <Text
                                    style={{
                                        color: GlobalColors.chatSubTitle,
                                        fontWeight: AppFonts.SEMIBOLD,
                                        paddingHorizontal: 4
                                    }}
                                >
                                    {`·`}
                                </Text>
                                {item.video ? (
                                    <Text style={styles.callHistoryType}>
                                        Video Call
                                    </Text>
                                ) : (
                                    <Text style={styles.callHistoryType}>
                                        {`${item.callType} Call`}
                                    </Text>
                                )}
                            </View>
                        </View>
                    </View>

                    {(config.showVoipCalls || config.showPSTNCalls) && (
                        <TouchableOpacity
                            style={styles.recallButton}
                            onPress={
                                item.callType === CallType.PSTN ||
                                item.callType === CallType.SAT
                                    ? this.makePstnCall.bind(this, number)
                                    : this.makeVoipCall.bind(
                                          this,
                                          id,
                                          name,
                                          item.video
                                      )
                            }
                        >
                            {item.video
                                ? Icons.videocam({
                                      size: 16,
                                      color: GlobalColors.white
                                  })
                                : Icons.call({
                                      size: 16,
                                      color: GlobalColors.white
                                  })}
                        </TouchableOpacity>
                    )}
                </TouchableOpacity>
            </View>
        );
    };

    renderContactModal = () => {
        const { isModalVisible, userId, toUserName, callDuration, callCost } =
            this.state;
        const style = isModalVisible
            ? {
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  backgroundColor: 'rgba(0,0,0,0.8)',
                  justifyContent: 'center',
                  alignItems: 'center'
              }
            : {
                  position: 'relative',
                  width: '0%',
                  height: '0%',
                  display: 'none',
                  backgroundColor: 'rgba(0,0,0,0.8)'
              };
        return (
            <TouchableOpacity style={style} onPress={() => this.hideModal()}>
                <TouchableWithoutFeedback>
                    <View style={styles.modal}>
                        <View style={{ marginVertical: 20 }}>
                            <ProfileImage
                                uuid={userId}
                                placeholder={Images.user_image}
                                style={styles.propicCD}
                                placeholderStyle={styles.propicCD}
                                userName={toUserName}
                            />
                        </View>
                        <Text style={styles.contactDetailItemName}>
                            {toUserName}
                        </Text>

                        <View style={styles.detailMainInfoRenderContainer}>
                            <View style={styles.labelContainer}>
                                {/* {iconImage} */}
                                <Text style={styles.labelStyle}>
                                    {I18n.t('length')}
                                </Text>
                            </View>
                            <View style={styles.infoContainer}>
                                <Text style={styles.inputNumber}>
                                    {callDuration} {I18n.t('minutes')}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.detailMainInfoRenderContainer}>
                            <View style={styles.labelContainer}>
                                {/* {iconImage} */}
                                <Text style={styles.labelStyle}>
                                    {I18n.t('cost')}
                                </Text>
                            </View>
                            <View style={styles.infoContainer}>
                                <Text style={styles.inputNumber}>
                                    {I18n.t('currency')} {callCost}
                                </Text>
                            </View>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </TouchableOpacity>
        );
    };

    renderEmptyScreen = () => (
        <View
            style={{
                height: '100%',
                justifyContent: 'center',
                alignItems: 'center'
            }}
        >
            <Image
                style={{ marginBottom: 45, width: 200 }}
                source={Images.empty_contact}
            />
            <Text
                style={{
                    color: GlobalColors.primaryTextColor
                }}
                numberOfLines={2}
            >
                You haven’t performed any calls yet.
            </Text>
        </View>
    );

    seperator() {
        return (
            <View
                style={{
                    height: 1,
                    marginLeft: 58,
                    marginRight: 24,
                    backgroundColor: GlobalColors.itemDevider
                }}
            />
        );
    }

    render() {
        return (
            <SafeAreaView style={[styles.container]}>
                <BackgroundImage>
                    {this.state.callHistory.length > 0 ? (
                        <FlatList
                            style={{
                                backgroundColor: GlobalColors.appBackground
                            }}
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
                            onEndReached={this.loadOlderCalls}
                            onEndReachedThreshold={0.1}
                            data={this.state.callHistory}
                            extraData={this.state.callHistory}
                            keyExtractor={(item) =>
                                `${item.fromUserId || item.toUserId}-${
                                    item.callTimestamp
                                }`
                            }
                            renderItem={this.renderRow}
                            ItemSeparatorComponent={this.seperator}
                        />
                    ) : (
                        <FlatList
                            style={{ flex: 1 }}
                            contentContainerStyle={{ flexGrow: 1 }}
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
                            data={[1]}
                            renderItem={this.renderEmptyScreen}
                        />
                    )}
                </BackgroundImage>
                {config.showPSTNCalls && (
                    <TouchableOpacity
                        style={{
                            position: 'absolute',
                            width: 152,
                            height: 38,
                            backgroundColor: 'rgba(47,199,111,1)',
                            borderRadius: 20,
                            justifyContent: 'center',
                            alignItems: 'center',
                            flexDirection: 'row',
                            bottom: 20,
                            alignSelf: 'center'
                        }}
                        onPress={() => this.onClickDialpad()}
                    >
                        <Image
                            style={{
                                width: 11,
                                height: 16,
                                marginRight: 10
                            }}
                            source={images.dialPad}
                        />
                        <Text style={{ color: '#fff' }}>DialPad</Text>
                    </TouchableOpacity>
                )}
                {this.renderContactModal()}
            </SafeAreaView>
        );
    }
}

const mapStateToProps = (state) => ({
    appState: state.user
});

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(CallHistory);
