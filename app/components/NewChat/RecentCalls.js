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
    TwilioEvents
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

const UserServiceClient = NativeModules.UserServiceClient;

export default class RecentCalls extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            recenteCalls: []
        };
    }

    componentDidMount() {
        Calls.getCallHistory().then(res => {
            this.setState({ recentCalls: res });
        });
    }

    makeVoipCall() {
        const { contactSelected } = this.state;
        if (!contactSelected) {
            alert('Sorry, cannot make call!');
            return;
        }
        let participants = [
            {
                userId: contactSelected.id,
                userName: contactSelected.name
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
        const { contactSelected } = this.state;
        if (!contactSelected) {
            alert('Sorry, cannot make call!');
            return;
        }
        Actions.dialler({
            call: true,
            number: number,
            contact: this.state.contactSelected,
            newCallScreen: true
        });
    }

    renderRow({ item }) {
        const image = (
            <ProfileImage
                uuid={item.id}
                placeholder={Images.user_image}
                style={styles.avatarImage}
                placeholderStyle={styles.avatarImage}
                resizeMode="cover"
            />
        );
        return (
            <TouchableOpacity
                style={styles.contactItemContainer}
                onPress={this.onRowPressed.bind(this, item)}
                disabled={waitingForConfirmation}
            >
                <View style={styles.contactItemLeftContainer}>
                    {image}
                    <View style={styles.contactItemDetailsContainer}>
                        <Text style={styles.contactItemName}>{item}</Text>
                        <View>
                            {/* image */}
                            <Text style={styles.contactItemEmail} />
                            <View style={styles.verticalSeparator} />
                            <Text style={styles.contactItemEmail}>
                                {item.callTo}
                            </Text>
                        </View>
                    </View>
                </View>
                {/* image */}
            </TouchableOpacity>
        );
    }

    render() {
        <SafeAreaView style={styles.container}>
            <BackgroundImage>
                <FlatList
                    data={this.state.recentCalls}
                    renderItem={this.renderRow.bind(this)}
                />
            </BackgroundImage>
        </SafeAreaView>;
    }
}
