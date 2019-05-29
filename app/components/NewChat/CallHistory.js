import React from 'react';
import {
    View,
    SafeAreaView,
    SectionList,
    TextInput,
    KeyboardAvoidingView,
    ActivityIndicator,
    Platform,
    Text,
    TouchableOpacity,
    Image,
    PermissionsAndroid,
    Alert,
    FlatList,
    NativeModules
} from 'react-native';
import styles from './styles';
import { Actions, ActionConst } from 'react-native-router-flux';
import _ from 'lodash';
import SystemBot from '../../lib/bot/SystemBot';
import {
    Contact,
    Auth,
    Network,
    Message,
    MessageTypeConstants
} from '../../lib/capability';
import {
    EventEmitter,
    AuthEvents,
    CallQuotaEvents,
    TwilioEvents,
    CallsEvents
} from '../../lib/events';
import { connect } from 'react-redux';
import I18n from '../../config/i18n/i18n';
import Store from '../../redux/store/configureStore';
import {
    setCurrentScene,
    refreshContacts
} from '../../redux/actions/UserActions';
import { NetworkStatusNotchBar } from '../NetworkStatusBar';
import NewChatItemSeparator from './NewChatItemSeparator';
import NewChatSectionHeader from './NewChatSectionHeader';
import NewChatIndexView from './NewChatIndexView';
import NewChatRow from './NewChatRow';
import {
    SECTION_HEADER_HEIGHT,
    searchBarConfig,
    addButtonConfig
} from './config';
import Images from '../../config/images';
import ProfileImage from '../ProfileImage';
import Modal from 'react-native-modal';
import ROUTER_SCENE_KEYS from '../../routes/RouterSceneKeyConstants';
import { Icons } from '../../config/icons';
import { EmptyContact } from '../ContactsPicker';
import { BackgroundImage } from '../BackgroundImage';
import config from '../../config/config';
import InviteModal from '../ContactsPicker/InviteModal';
import { BackgroundBotChat } from '../../lib/BackgroundTask';
import Bot from '../../lib/bot';
import Calls from '../../lib/calls';
import { formattedDate } from '../../lib/utils';
import eventEmitter from '../../lib/events/EventEmitter';

const UserServiceClient = NativeModules.UserServiceClient;

export default class CallHistory extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            callHistory: []
        };
    }

    componentDidMount() {
        eventEmitter.addListener(
            CallsEvents.callHistoryUpdated,
            this.getCallHistory.bind(this)
        );
        Calls.fetchCallHistory();
        this.getCallHistory();
    }

    componentWillUnmount() {
        eventEmitter.removeListener(
            CallsEvents.callHistoryUpdated,
            this.getCallHistory.bind(this)
        );
    }

    getCallHistory() {
        Calls.getCallHistory().then(res => {
            this.setState({ callHistory: res });
        });
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
        Actions.dialler({
            call: true,
            number: number,
            newCallScreen: true
        });
    }

    renderRow({ item }) {
        let id;
        let name;
        let number;
        let icon;
        if (item.callDirection === Calls.callDirection.INCOMING) {
            id = item.fromUserId;
            name = item.fromUserName;
            icon = Icons.arrowBottomLeft();
        } else {
            id = item.toUserId;
            name = item.toUserName ? item.toUserName : item.toNumber;
            number = item.toNumber;
            icon = Icons.arrowTopRight();
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
                                    { width: '50%' }
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
                                <View style={styles.verticalSeparator} />
                            </View>
                            <Text style={styles.contactItemEmail}>
                                {item.callType === Calls.callType.PSTN
                                    ? number
                                    : 'Voip call'}
                            </Text>
                        </View>
                    </View>
                </View>
                <TouchableOpacity
                    style={styles.callButton}
                    onPress={
                        item.callType === Calls.callType.PSTN
                            ? this.makePstnCall.bind(this, number)
                            : this.makeVoipCall.bind(this, id, name)
                    }
                >
                    {Icons.greenCallOutline()}
                </TouchableOpacity>
            </View>
        );
    }

    render() {
        return (
            <SafeAreaView style={styles.container}>
                <BackgroundImage>
                    <FlatList
                        data={this.state.callHistory}
                        extraData={this.state.callHistory}
                        renderItem={this.renderRow.bind(this)}
                        ItemSeparatorComponent={NewChatItemSeparator}
                    />
                </BackgroundImage>
            </SafeAreaView>
        );
    }
}
