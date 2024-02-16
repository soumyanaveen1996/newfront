import React from 'react';
import {
    FlatList,
    SafeAreaView,
    TouchableOpacity,
    Text,
    View,
    Platform,
    KeyboardAvoidingView
} from 'react-native';
import FrontMAddedContactsPickerDataSource from '../../../lib/utils/FrontMAddedContactsPickerDataSource';
import Images from '../../../config/images';
import ProfileImage from '../../../widgets/ProfileImage';
import styles from './styles';
import Icons from '../../../config/icons';
import I18n from '../../../config/i18n/i18n';
import SystemBot from '../../../lib/bot/SystemBot';
import { MainScreenStyles } from '../../Home/HomeTab/styles';
import NetInfo from '@react-native-community/netinfo';
import NavigationAction from '../../../navigation/NavigationAction';
import { Auth } from '../../../lib/capability';
import { Conversation } from '../../../lib/conversation';
import TimelineBuilder from '../../../lib/TimelineBuilder/TimelineBuilder';
import GlobalColors from '../../../config/styles';
import SearchBar from '../../../widgets/SearchBar';
import AlertDialog from '../../../lib/utils/AlertDialog';

class NewChat extends React.Component {
    constructor(props) {
        super(props);
        this.dataSource = new FrontMAddedContactsPickerDataSource(this);
        this.state = {
            contactsData: [{ elemType: 'New Group' }],
            searchString: ''
        };
        this.userInfo = Auth.getUserData();
    }

    updateList = () => {
        const { contactsData } = this.state;
        const data = this.dataSource.getSortedData();
        const contacts = data
            .filter((item) => item.contactType !== 'local')
            .map((chat) => ({
                ...chat,
                elemType: 'contact'
            }));
        this.setState({ contactsData: [...contactsData, ...contacts] });
    };

    onDataUpdate() {
        this.updateList();
    }

    onCreateNewGroup() {
        NetInfo.fetch().then((state) => {
            console.log('Connection type', state.type);
            console.log('Is connected?', state.isConnected);
            if (state.isConnected) {
                NavigationAction.push(NavigationAction.SCREENS.newGroup);
            } else {
                AlertDialog.show('please connect to network.');
            }
        });
    }

    renderItem = ({
        item: { elemType, id, name, thumbnail, imageAvailable, userId }
    }) => {
        if (!thumbnail && imageAvailable) {
            this.dataSource.loadImage(id);
        }
        if (elemType === 'New Group') {
            return (
                <TouchableOpacity
                    onPress={() => this.onCreateNewGroup()}
                    style={[styles.chatItem]}
                >
                    <View style={styles.groupAddIcon}>
                        {Icons.newGroupAdd({ size: 25 })}
                    </View>
                    <Text style={[styles.groupText]}>New Group</Text>
                </TouchableOpacity>
            );
        }
        return (
            // eslint-disable-next-line max-len
            <TouchableOpacity
                onPress={() => this.onInitiateNewChat(id || userId, name)}
                style={[styles.chatItem]}
            >
                <ProfileImage
                    accessibilityLabel="Profile Picture"
                    testID="profile-picture"
                    uuid={id || userId}
                    userName={name}
                    style={styles.contactItemImage}
                    placeholder={Images.empty_user_image}
                    placeholderStyle={styles.contactItemImage}
                    resizeMode="contain"
                />
                <Text style={[styles.contactName]}>{name}</Text>
            </TouchableOpacity>
        );
    };

    renderSearchBar = () => (
        <View style={MainScreenStyles.searchArea}>
            <SearchBar
                placeholder={I18n.t('Search_contact')}
                onChangeText={(searchString) =>
                    this.onSearchQueryChange(searchString)
                }
            />
        </View>
    );

    onSearchQueryChange = (text) => {
        let contactsList = [];
        if (!text || text === '') {
            contactsList = this.dataSource.getSortedData();
            contactsList = [{ elemType: 'New Group' }, ...contactsList];
        } else {
            contactsList = this.dataSource.getSortedFilteredData(text);
        }

        this.setState(
            {
                contactsData: contactsList.filter(
                    (item) => item.contactType !== 'local'
                ),
                searchString: text
            },
            () => {
                if (
                    this.state.searchString === '' ||
                    this.state.searchString.length === 0
                ) {
                    this.setState({
                        titleText: 'Selected'
                    });
                }
            }
        );
    };

    onInitiateNewChat = (id, name) => {
        const participants = [
            {
                userId: id,
                userName: name
            }
        ];
        SystemBot.get(SystemBot.imBotManifestName).then((imBot) => {
            const conversationId = Conversation.getIMConversationId(
                this.userInfo.userId,
                id
            );
            NavigationAction.goToUsersChat({
                bot: imBot,
                otherParticipants: participants,
                onBack: this.props.onBack,
                otherUserId: id,
                otherUserName: name,
                comingFromNotif: {
                    notificationFor: 'peopleChat',
                    getConversation: true,
                    otherUserId: id,
                    conversationId,
                    userDomain: imBot?.userDomain,
                    onRefresh: () => TimelineBuilder.buildTiimeline()
                }
            });
        });
    };

    itemSeparatorComponent = () => (
        <View
            style={{
                marginHorizontal: 12,
                height: 1,
                backgroundColor: GlobalColors.itemDevider
            }}
        />
    );

    render() {
        const { contactsData, searchString } = this.state;
        return (
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : null}
                style={styles.addressBookContainer}
            >
                {this.renderSearchBar()}
                <SafeAreaView style={styles.container}>
                    {contactsData.length === 0 && searchString !== '' ? (
                        <View style={styles.noSearchFound}>
                            {Icons.userIcon({
                                size: 100,
                                color: 'rgb(232,232,232)'
                            })}
                            <Text style={styles.noSearchText}>
                                No results found for “{searchString}”
                            </Text>
                            {/* eslint-disable-next-line max-len */}
                            <Text style={styles.noSearchSubText}>
                                Please check and try a new search
                            </Text>
                        </View>
                    ) : (
                        <FlatList
                            data={contactsData}
                            renderItem={this.renderItem}
                            keyExtractor={(item) => item.id}
                            ItemSeparatorComponent={this.itemSeparatorComponent}
                        />
                    )}
                </SafeAreaView>
            </KeyboardAvoidingView>
        );
    }
}

export default NewChat;
