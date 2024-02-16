import React from 'react';
import {
    FlatList,
    Image,
    Keyboard,
    SafeAreaView,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Platform,
    BackHandler,
    ActivityIndicator
} from 'react-native';
import RBSheet from 'react-native-raw-bottom-sheet';
import ImageResizer from 'react-native-image-resizer';
import Constants from '../../../config/constants';
// import utils from '../../../lib/utils';

import _ from 'lodash';
import Images from '../../../config/images';
import ProfileImage from '../../../widgets/ProfileImage';
import styles from './styles';
import I18n from '../../../config/i18n/i18n';
import ActionSheet from 'react-native-action-sheet';
import {
    Channel,
    Media,
    Auth,
    Resource,
    ResourceTypes
} from '../../../lib/capability';
import Utils from '../../../lib/utils';
import UtilsCapabilities from '.././../../lib/capability/Utils';
import Config from '../../Contacts/config';
import { ConfirmationModal } from './ConfirmationModal';
import AdminAlert from './AdminAlert';
import AdminLeaveAlert from './AdminAlert';
import Loader from '../../../widgets/Loader';
import Icons from '../../../config/icons';
import { Conversation } from '../../../lib/conversation';
import { MessageDAO } from '../../../lib/persistence';
import SystemBot from '../../../lib/bot/SystemBot';
import CachedImage from '../../../widgets/CachedImage';
import EventEmitter, { TimelineEvents } from '../../../lib/events';
import configToUse from '../../../config/config';
import NavigationAction from '../../../navigation/NavigationAction';
import TimelineBuilder from '../../../lib/TimelineBuilder/TimelineBuilder';
import ImageCache from '../../../lib/image_cache';
import GlobalColors from '../../../config/styles';
import Store from '../../../redux/store/configureStore';
import { setChennalForFavUpdate } from '../../../redux/actions/UserActions';
import AlertDialog from '../../../lib/utils/AlertDialog';
import { Toast } from 'react-native-toast-message/lib/src/Toast';

export const ImagePickerOptions = {
    camera: 'camera',
    photo_library: 'photo_library',
    delete: 'delete'
};

class CreateNewGroup extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            contactsData: this.props.route.params.selectedContact,
            groupName: '',
            groupDesc: '',
            isBackModalVisible: false,
            loading: false,
            participants: [],
            admins: [],
            pendingRequests: [],
            uiDisabled: false,
            isOwner: false,
            userInfo: false,
            grpImage: this.props.route.params.logo || false,
            checkIsFavourite: false,
            onlyParticipant: [],
            temporaryGroupImg: false
        };
        this.userInfo = Auth.getUserData();
    }

    onBack = (fromDevice = false) => {
        const {
            groupName,
            groupDesc,
            grpImage: { uri }
        } = this.state;
        const { isFromInfo } = this.props.route.params;
        if (!isFromInfo && (groupName || groupDesc || uri)) {
            this.confirmExit();
        } else if (
            isFromInfo &&
            this.props.route.params.selectedContact &&
            this.props.route.params.selectedContact.length > 0
        ) {
            this.confirmExit();
        } else {
            if (this.state.checkingBack) {
                this.confirmExit();
                return true;
            } else {
                NavigationAction.pop();
            }
        }
    };

    confirmExit = () => {
        AlertDialog.showCritical(
            'Are you sure you want to exit the group creation process?',
            ' You will loose the selection made',
            [
                { text: 'Cancel' },
                {
                    text: 'Yes',
                    onPress: () => {
                        setTimeout(() => {
                            NavigationAction.popToFirst();
                        }, 500);
                    }
                }
            ]
        );
    };

    handleBack = () => {
        return this.props.route.params.goBack;
    };

    componentDidMount() {
        const {
            isFromInfo,
            channel,
            selectedContact
        } = this.props.route.params;
        if (Platform.OS === 'android') {
            this.backHandler = BackHandler.addEventListener(
                'hardwareBackPress',
                this.handleBack
            );
        }
        this.props.navigation.setParams({
            onBack: this.onBack,
            createNewGroup: this.onCreateGroup
        });

        if (isFromInfo) {
            this.fetchdata();
            this.checkForFav();
        }
        if (
            this.props.route.params?.selectedContact &&
            this.props.route.params.selectedContact.length > 0
        ) {
            this.setState({ checkingBack: true });
        }
        // updating fav if updated anywhere
    }
    componentWillUnmount() {
        if (Platform.OS === 'android') this.backHandler.remove();
    }

    checkForFav = async () => {
        if (this.props.route?.params?.channel) {
            const { isFavourite } = this.props.route.params.channel;

            if (this.props.route?.params?.conversation.conversationId) {
                Conversation.getConversation(
                    this.props.route.params.conversation.conversationId
                )
                    .then((res3) => {
                        if (res3) {
                            this.setState({
                                checkIsFavourite: res3.favorite ? true : false
                            });
                        } else {
                            if (typeof isFavourite === 'string') {
                                this.setState({
                                    checkIsFavourite: +isFavourite
                                });
                            } else {
                                this.setState({
                                    checkIsFavourite: isFavourite
                                });
                            }
                        }
                    })
                    .catch((err) => {
                        if (typeof isFavourite === 'string') {
                            this.setState({ checkIsFavourite: +isFavourite });
                        } else {
                            this.setState({ checkIsFavourite: isFavourite });
                        }
                    });
            } else {
                if (typeof isFavourite === 'string') {
                    this.setState({ checkIsFavourite: +isFavourite });
                } else {
                    this.setState({ checkIsFavourite: isFavourite });
                }
            }
        }
    };

    renderItem = ({
        item: {
            id,
            name,
            thumbnail,
            imageAvailable,
            userId,
            isAdmin,
            isCurrentUser
        }
    }) => {
        if (!thumbnail && imageAvailable) {
            this.dataSource.loadImage(id);
        }
        const { isFromInfo } = this.props.route.params;
        return (
            <TouchableOpacity style={styles.item}>
                <View style={{ flexDirection: 'row' }}>
                    <ProfileImage
                        accessibilityLabel="Profile Picture"
                        testID="profile-picture"
                        uuid={id || userId}
                        style={styles.participantItemImage}
                        userName={name}
                        placeholder={Images.empty_user_image}
                        placeholderStyle={styles.contactItemImage}
                        resizeMode="cover"
                    />
                    <Text style={[styles.contactName]}>{name}</Text>
                </View>
                {isFromInfo ? (
                    isAdmin ? (
                        <View
                            style={{
                                alignSelf: 'center',
                                flexDirection: 'row'
                            }}
                        >
                            <Text
                                style={{
                                    alignSelf: 'center',
                                    color: GlobalColors.descriptionText
                                }}
                            >
                                Admin
                            </Text>
                            {!isCurrentUser && (
                                <TouchableOpacity
                                    onPress={() =>
                                        this.openUserInfo({
                                            id,
                                            name,
                                            userId
                                        })
                                    }
                                >
                                    {Icons.dotsVertical({
                                        color: GlobalColors.descriptionText
                                    })}
                                </TouchableOpacity>
                            )}
                        </View>
                    ) : (
                        <View
                            style={{
                                alignSelf: 'center',
                                flexDirection: 'row'
                            }}
                        >
                            {!isCurrentUser && (
                                <TouchableOpacity
                                    onPress={() =>
                                        this.openUserInfo({
                                            id,
                                            name,
                                            userId
                                        })
                                    }
                                >
                                    {Icons.dotsVertical({
                                        color: GlobalColors.descriptionText
                                    })}
                                </TouchableOpacity>
                            )}
                        </View>
                    )
                ) : null}
            </TouchableOpacity>
        );
    };

    onOptionSelected(key) {
        if (key === ImagePickerOptions.camera) {
            this.takePicture();
        } else if (key === ImagePickerOptions.photo_library) {
            this.pickImage();
        } else if (key === ImagePickerOptions.delete) {
            this.setState({ grpImage: false });
        }
    }

    showOptions() {
        const {
            grpImage: { uri },
            isOwner
        } = this.state;
        const { isFromInfo } = this.props.route.params;
        if (isFromInfo && !isOwner) {
            return;
        }
        let moreOptions = [
            {
                key: ImagePickerOptions.camera,
                label: I18n.t('Chat_Input_Camera')
            },
            {
                key: ImagePickerOptions.photo_library,
                label: I18n.t('Chat_Input_Photo_Library')
            }
        ];
        if (uri) {
            moreOptions.push({
                key: ImagePickerOptions.delete,
                label: 'Delete Photo'
            });
        }

        const cancelButtonIndex = moreOptions.length;
        const optionLabels = moreOptions.map((elem) => elem.label);
        if (Platform.OS === 'ios') {
            optionLabels.push('Cancel');
        }

        ActionSheet.showActionSheetWithOptions(
            {
                options: optionLabels,
                cancelButtonIndex
            },
            (buttonIndex) => {
                if (
                    buttonIndex !== undefined &&
                    buttonIndex !== cancelButtonIndex
                ) {
                    this.onOptionSelected(moreOptions[buttonIndex].key);
                }
            }
        );
    }

    openUserInfo = (info) => {
        this.setState({ userInfo: info });
        this.RBUserOptions.open();
    };

    takePicture = async () => {
        Keyboard.dismiss();
        const result = await Media.takePicture(Config.CameraOptions);
        const { groupDesc, groupName } = this.state;
        if (!result.cancelled) {
            const isCreate = groupName && groupName !== '';
            this.props.navigation.setParams({
                isGroupCreate: isCreate
            });
            this.setState({
                grpImage: result,
                temporaryGroupImg: { uri: result.uri }
            });
        }
    };

    pickImage = async () => {
        Keyboard.dismiss();
        const result = await Media.pickMediaFromLibrary(Config.CameraOptions);
        console.log('the pic data is ', result);
        const { groupDesc, groupName } = this.state;
        // Have to filter out videos ?
        if (!result.cancelled) {
            const isCreate = groupName && groupName !== '';
            this.props.navigation.setParams({
                isGroupCreate: isCreate
            });
            this.setState({
                grpImage: result,
                temporaryGroupImg: { uri: result.uri }
            });
        }
    };

    async sendImage(channelData) {
        this.setState({ loading: true });
        const { channel } = this.props.route.params;
        const channelId = channel?.channelId || channelData?.channelId;
        if (!channelId) {
            alert('Error!! Cannot upload the image');
            return;
        }
        const { uri, name, type } = this.state.grpImage;
        // const fileUrl = await Resource.uploadFileWithExtension(
        //     uri,
        //     'uploadchannellogo',
        //     channel?.channelId || channelData?.channelId, // File name should be same as channelId
        //     type,
        //     channel?.channelId || channelData?.channelId || 'channel',
        //     true
        // );
        ImageResizer.createResizedImage(uri, 800, 800, 'PNG', 50, 0)
            .then(async (imageResizeResponse) => {
                console.log('++++ imageResizeResponse ', imageResizeResponse);
                newUri = await Utils.copyFileAsync(
                    decodeURI(imageResizeResponse.uri),
                    Constants.IMAGES_DIRECTORY,
                    `${channelId}.png`
                );
            })
            .then(async () => {
                const fileUrl = await Resource.uploadFileForGroupForThumbnailAlso(
                    channelId,
                    newUri,
                    (fileName = `${channelId}.png`),
                    (isBase64Encoded = true)
                );
                console.log('++++ upload done', fileUrl);
                if (_.isNull(fileUrl)) {
                } else {
                    this.setState(
                        {
                            loading: false,
                            temporaryGroupImg: false
                        },
                        async () => {
                            await ImageCache.imageCacheManager.removeFromCache(
                                Utils.userUploadedChannelLogoUrl(channelId)
                            );
                            setTimeout(() => {
                                this.showAlert('Group image updated');
                                this.fetchdata();
                            }, 200);
                        }
                    );
                }
            });
        // console.log('++++ upload done', fileUrl);

        EventEmitter.emit(TimelineEvents.reloadTimeline);
    }

    onChangeOfDesc = (text) => {
        // group description manadate removed from backend
        const { groupDesc, groupName } = this.state;
        const isCreate = text && text !== '';
        this.setState({ groupDesc: text, checkingBack: true });
        if (groupDesc !== text) {
            if (groupName && groupName !== '')
                this.props.navigation.setParams({
                    isGroupCreate: true
                });
        }
    };

    onChangeOfName = (text) => {
        const { groupDesc } = this.state;
        const isCreate = text && text !== '';
        this.setState({ groupName: text, checkingBack: true });
        this.props.navigation.setParams({
            isGroupCreate: isCreate
        });
    };

    fetchdata = async () => {
        const {
            isFromInfo,
            channel,
            selectedContact
        } = this.props.route.params;
        if (selectedContact && selectedContact.length > 0) {
            this.props.navigation.setParams({
                isGroupCreate: true
            });
        }

        this.setState({ loading: true });

        let participants;
        let admins;
        let pendingRequests;
        let onlyParticipant = [];
        const {
            userId,
            info: { userName }
        } = Auth.getUserData();
        const userInfo = {
            name: userName,
            id: userId,
            isCurrentUser: true
        };
        let isOwner = channel.ownerId === userId;
        this.props.navigation.setParams({
            isOwner,
            isGroupEdit: isOwner,
            saveGroup: this.onSaveGroup
        });

        Channel.getParticipants(channel.channelName, channel.userDomain)
            .then((response) => {
                const prt = response.content;
                participants = prt.map((item) => ({
                    ...item,
                    name: item.userName,
                    id: item.userId,
                    isAdmin: item.role === 'owner' || item.role === 'admin'
                }));
                if (!isOwner) {
                    participants = [...participants, userInfo];
                }
                onlyParticipant = prt;
                return Channel.getRequests(
                    channel.channelName,
                    channel.userDomain
                );
            })
            .then((response) => {
                const pend = response.content;
                pendingRequests = pend;
                return Channel.getAdmins(
                    channel.channelName,
                    channel.userDomain
                );
            })
            .then((response) => {
                const adm = response.content;
                if (isOwner || adm.find((i) => i.userId === userId)) {
                    isOwner = Boolean(adm.find((i) => i.userId === userId));
                    admins = adm.map((item) => ({
                        ...item,
                        isAdmin: true,
                        name: item.userName,
                        id: item.userId,
                        isCurrentUser: item.userId === userId
                    }));
                } else {
                    admins = [];
                }

                if (selectedContact && selectedContact.length > 0) {
                    participants = admins.concat(participants);
                    const ids = new Set(selectedContact.map((d) => d.id));
                    participants = [
                        ...selectedContact,
                        ...participants.filter((d) => !ids.has(d.id))
                    ];
                } else {
                    const ids = new Set(admins.map((d) => d.id));
                    participants = [
                        ...admins,
                        ...participants.filter((d) => !ids.has(d.id))
                    ];
                }

                this.props.navigation.setParams({
                    isOwner,
                    isGroupEdit: isOwner,
                    saveGroup: this.onSaveGroup
                });

                return this.setState({
                    contactsData: participants,
                    admins,
                    pendingRequests,
                    uiDisabled: true,
                    groupName: channel.channelName,
                    groupDesc: channel.description,
                    isOwner,
                    onlyParticipant
                });
            })
            .then(() => {
                this.setState({ loading: false });
            })
            .catch((e) => {
                console.log('error', e);
                NavigationAction.pop();
            });

        this.props.navigation.setParams({
            isOwner,
            isGroupEdit: isOwner,
            saveGroup: this.onSaveGroup
        });
    };

    onCreateGroup = () => {
        this.setState({ loading: true, checkingBack: false });
        const { groupName, groupDesc } = this.state;

        const channelData = {
            channelName: groupName,
            description: groupDesc,
            discoverable: 'private',
            channelType: 'platform',
            userDomain: Store.getState().user.currentDomain
        };
        console.log('new group channelData', channelData);
        Channel.create({ channel: channelData })
            .then((data) => {
                console.log('Channel created data : data', data);
                const { contactsData, grpImage } = this.state;
                const userIds = contactsData.map((user) => user.id);
                setTimeout(() => {
                    TimelineBuilder.buildTiimeline();
                }, 0);

                if (grpImage) {
                    this.sendImage(data);
                }

                if (contactsData.length > 0) {
                    Channel.addUsers(
                        channelData.channelName,
                        channelData.userDomain,
                        userIds
                    ).then((dataVal) => {
                        this.setState({ loading: false });
                        NavigationAction.popToFirst();
                    });
                } else {
                    this.setState({ loading: false });
                    NavigationAction.popToFirst();
                }
            })
            .catch((err) => {
                UtilsCapabilities.addLogEntry({
                    type: 'SYSTEM',
                    entry: {
                        message: 'Error creating group'
                    },
                    data: {
                        err
                    }
                });
                console.log('Error : ', err);
                if (err.message) {
                    this.setState({ loading: false }, () => {
                        AlertDialog.show(err.message);
                    });
                } else {
                    this.setState({ loading: false }, () => {
                        AlertDialog.show(
                            'Something went wrong. Please try again'
                        );
                    });
                }
            });
    };

    onSaveGroup = async () => {
        this.setState({ loading: true, checkingBack: false });
        const { groupName, groupDesc, grpImage } = this.state;
        const {
            discoverable,
            channelType,
            userDomain
        } = this.props.route.params.channel;

        const { selectedContact } = this.props.route.params;

        Channel.update({
            channel: {
                channelName: groupName,
                description: groupDesc,
                userDomain,
                channelType,
                discoverable
            }
        })
            .then((data) => {
                setTimeout(() => {
                    TimelineBuilder.buildTiimeline();
                }, 0);

                if (selectedContact && selectedContact.length > 0) {
                    this.setState({ loading: true });
                    const participantsIds = _.map(
                        selectedContact,
                        (part) => part.id
                    );
                    Channel.updateParticipants(
                        groupName,
                        userDomain,
                        participantsIds
                    )
                        .then(() => {
                            // this.setState({ loading: false });
                        })
                        .catch((e) => {
                            console.log(e);
                        });
                }

                if (grpImage) {
                    console.log('IMAGE UPLOAD RESULT: ', grpImage);
                    this.sendImage();
                }
                setTimeout(() => {
                    this.setState({ loading: false });
                    EventEmitter.emit(TimelineEvents.refreshTimeline);
                    NavigationAction.popToFirst();
                }, 500);
            })
            .catch((err) => {
                this.setState({ loading: false });
                AlertDialog.show('Message', err.message);
                console.log('err on creating channel', err);
            });
    };

    onLeaveGroup = () => {
        this.setState({ loading: true });
        const { admins } = this.state;
        const { userId } = Auth.getUserData();
        const isCurrentAdmin = admins.some((el) => el.userId === userId);
        const isOtherAdminAvl = admins.filter((el) => el.userId !== userId);
        if (isCurrentAdmin && !isOtherAdminAvl.length > 0) {
            AlertDialog.show(
                'You have to define a new admin before leaving the group',
                'Admins cannot leave a group. Please define a new admin and try again.'
            );
            this.setState({ loading: false });
            return;
        }
        Channel.unsubscribe(this.props.route.params.channel)
            .then(() =>
                Conversation.deleteChannelConversation(
                    this.props.route.params.channel.channelId
                )
            )
            .then(() =>
                MessageDAO.deleteBotMessages(
                    this.props.route.params.channel.channelId
                )
            )
            .then(() => {
                this.setState({ loading: false });
                NavigationAction.popToFirst();
            })
            .catch((e) => {
                this.setState({ loading: false });
                Toast.show({ text1: 'Fail to unsubscribe' });
            });
    };

    setAdmins = () => {
        const { channel } = this.props.route.params;
        const {
            admins,
            contactsData,
            userInfo: { id, name, userId }
        } = this.state;
        this.RBUserOptions.close();
        this.setState({ loading: true });
        const existingAdmins = this.state.admins.map((admin) => admin.id);
        Channel.updateAdmins(channel.channelName, channel.userDomain, [
            ...existingAdmins,
            userId
        ]).then(() => {
            const test = contactsData.findIndex((e) => e.id === userId);
            contactsData[test] = {
                ...contactsData[test],
                isAdmin: true
            };
            this.setState({
                contactsData,
                admins: [
                    ...admins,
                    {
                        id,
                        name,
                        userId,
                        isAdmin: true
                    }
                ],
                loading: false
            });
        });
    };

    deleteChannel = () => {
        const { channel } = this.props.route.params;
        AlertDialog.showCritical(
            'Delete Group',
            'Are you sure you want to delete this Group?',
            [
                {
                    text: 'Cancel',
                    onPress: () => console.log('Cancel Pressed'),
                    style: 'cancel'
                },
                {
                    text: 'Yes',
                    onPress: () => {
                        this.setState({ loading: true });
                        Channel.deleteChannel(channel)
                            .then(() =>
                                Conversation.deleteChannelConversation(
                                    channel.channelId
                                )
                            )
                            .then(() =>
                                MessageDAO.deleteBotMessages(channel.channelId)
                            )
                            .then(() => {
                                setTimeout(() => {
                                    this.setState({ loading: false });
                                    NavigationAction.popToFirst();
                                }, 500);
                            })
                            .catch((e) => {
                                Toast.show({
                                    text1: 'Unable to delete group'
                                });
                            });
                    }
                }
            ]
        );
    };

    onStartChat = () => {
        this.RBUserOptions.close();
        const {
            userInfo: { id, name, userId }
        } = this.state;
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
                onBack: this.props.route.params.onBack,
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

    setFavourite = () => {
        this.setState({ loading: true });
        const { channel } = this.props.route.params;
        const data = {
            type: 'channel',
            channelConvId: channel.channelId,
            channelName: channel.channelName,
            action: 'add',
            description: channel.description,
            userDomain: channel.userDomain
        };

        Conversation.setFavorite(data)
            .then(() => {
                TimelineBuilder.buildTiimeline();
                this.setState({ checkIsFavourite: true });
                this.setState({ loading: false });
                // in this screen channel prop we are getting should be refreshed.
                let updatedFavChannelIds = {};
                updatedFavChannelIds[channel.channelId] = channel.channelId;

                Store.dispatch(setChennalForFavUpdate(updatedFavChannelIds));
            })
            .catch((err) => {
                console.log('updtaing error on channel add favourite', err);
                this.setState({ loading: false });
            });
    };

    removeFavourite = () => {
        this.setState({ loading: true });
        const { channel } = this.props.route.params;
        const data = {
            type: 'channel',
            channelConvId: channel.channelId,
            channelName: channel.channelName,
            action: 'remove',
            description: channel.description,
            userDomain: channel.userDomain
        };

        Conversation.setFavorite(data)
            .then(() => {
                TimelineBuilder.buildTiimeline();
                this.setState({ checkIsFavourite: false });
                this.setState({ loading: false });
                // in this screen channel prop we are getting should be refreshed.
                let updatedFavChannelIds = {};
                updatedFavChannelIds[channel.channelId] = channel.channelId;

                Store.dispatch(setChennalForFavUpdate(updatedFavChannelIds));
            })
            .catch((err) => {
                console.log('updtaing error on channel remove favourite', err);
                this.setState({ loading: false });
            });
    };

    onContactDetail = (contact) => {
        this.RBUserOptions.close();
        NavigationAction.push(NavigationAction.SCREENS.contactDetailsScreen, {
            contact
            // updateList: this.onDataUpdate.bind(this),
            // updateContactScreen: this.updateList.bind(this)
        });
    };

    deleteParticipant = () => {
        this.RBUserOptions.close();
        this.setState({ loading: true });
        const {
            contactsData,
            onlyParticipant,
            userInfo: { id }
        } = this.state;

        if (onlyParticipant.length === 1) {
            this.setState({ loading: false });
            setTimeout(() => {
                AlertDialog.show(
                    'You can not delete the last participant from the group.'
                );
            }, 500);
            return;
        }

        const { channel } = this.props.route.params;
        const remainingPart = onlyParticipant.filter((i) => i.userId !== id);
        const participantsIds = _.map(remainingPart, (part) => part.userId);
        Channel.updateParticipants(
            channel.channelName,
            channel.userDomain,
            participantsIds
        )
            .then(() => {
                this.setState({
                    contactsData: contactsData.filter((i) => i.id !== id),
                    loading: false,
                    onlyParticipant: remainingPart
                });
            })
            .catch((e) => {
                console.log(e);
            });
    };

    onContactSelection = (selectedContact) => {
        console.log('selectedContact', selectedContact);
        const { channel } = this.props.route.params;
        const participantsIds = _.map(selectedContact, (part) => part.id);
        this.setState({ loading: true });
        Channel.updateParticipants(
            channel.channelName,
            channel.userDomain,
            participantsIds
        )
            .then(() => {
                this.props.navigation.setParams({
                    isOwner: true,
                    isGroupEdit: true,
                    isGroupCreate: true
                });
                this.fetchdata();
            })
            .catch((e) => {
                this.setState({ loading: false });
                AlertDialog.show('Something went wrong, Please try again');
                console.log(e);
            });
    };

    render() {
        const {
            contactsData,
            groupName,
            groupDesc,
            loading,
            isOwner,
            grpImage: { uri },
            admins,
            userInfo: { id, name, userId },
            checkIsFavourite,
            temporaryGroupImg
        } = this.state;
        const { isFromInfo, channel } = this.props.route.params;

        const user = Auth.getUserData();
        const uploadedUri = Utils.userUploadedChannelLogoUrl(
            channel?.channelId
        );
        return (
            <View
                style={{ flex: 1, backgroundColor: GlobalColors.appBackground }}
            >
                <ScrollView>
                    {!loading && (
                        <SafeAreaView style={styles.container}>
                            {!isFromInfo || isOwner ? (
                                <View style={styles.createGroupContainer}>
                                    {/* eslint-disable-next-line max-len */}
                                    <TouchableOpacity
                                        style={styles.groupIconContainer}
                                        onPress={this.showOptions.bind(this)}
                                    >
                                        {temporaryGroupImg ? (
                                            <Image
                                                imageTag="channelLogo"
                                                source={temporaryGroupImg}
                                                style={{
                                                    overflow: 'hidden',
                                                    height: 120,
                                                    width: 120,
                                                    borderRadius: 60
                                                }}
                                                resizeMode="cover"
                                            />
                                        ) : (
                                            <CachedImage
                                                imageTag="channelLogo"
                                                placeholderSource={
                                                    Images.group_icon_default
                                                }
                                                source={
                                                    uri
                                                        ? { uri }
                                                        : {
                                                              uri: uploadedUri
                                                          }
                                                }
                                                style={{
                                                    overflow: 'hidden',
                                                    height: 120,
                                                    width: 120,
                                                    borderRadius: 60
                                                }}
                                                resizeMode="cover"
                                            />
                                        )}
                                    </TouchableOpacity>
                                    <View style={styles.groupNameContainer}>
                                        <TextInput
                                            style={styles.groupName}
                                            onChangeText={this.onChangeOfName}
                                            value={groupName}
                                            selectionColor={
                                                GlobalColors.cursorColor
                                            }
                                            placeholder="Group Name"
                                            editable={!isFromInfo}
                                            placeholderTextColor={
                                                GlobalColors.formPlaceholderText
                                            }
                                        />
                                    </View>
                                    <View style={styles.groupDescContainer}>
                                        <TextInput
                                            editable
                                            maxLength={40}
                                            multiline
                                            numberOfLines={5}
                                            placeholder="Description of your group"
                                            onChangeText={this.onChangeOfDesc}
                                            value={groupDesc}
                                            style={styles.groupDesc}
                                            placeholderTextColor={
                                                GlobalColors.formPlaceholderText
                                            }
                                            selectionColor={
                                                GlobalColors.cursorColor
                                            }
                                        />
                                    </View>
                                </View>
                            ) : (
                                <View style={styles.createGroupContainer}>
                                    <View style={styles.groupIconContainer}>
                                        <CachedImage
                                            imageTag="channelLogo"
                                            placeholderSource={
                                                Images.group_icon_default
                                            }
                                            source={{
                                                uri: uploadedUri
                                            }}
                                            style={{
                                                overflow: 'hidden',
                                                height: 120,
                                                width: 120,
                                                borderRadius: 60
                                            }}
                                            resizeMode="cover"
                                        />
                                    </View>
                                    <Text style={styles.groupTextName}>
                                        {groupName}
                                    </Text>
                                </View>
                            )}
                            <View style={styles.divider} />
                            {!loading && isFromInfo && (
                                <View>
                                    {!checkIsFavourite ? (
                                        // eslint-disable-next-line max-len
                                        <TouchableOpacity
                                            style={styles.fromOtherOption}
                                            onPress={this.setFavourite}
                                        >
                                            <Text style={styles.fromOptionText}>
                                                Add to favourite
                                            </Text>
                                        </TouchableOpacity>
                                    ) : (
                                        <TouchableOpacity
                                            style={styles.fromOtherOption}
                                            onPress={this.removeFavourite}
                                        >
                                            <Text style={styles.fromOptionText}>
                                                Remove favourite
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                    <View style={styles.fromDivider} />
                                    <TouchableOpacity
                                        style={styles.fromOtherOption}
                                        onPress={this.onLeaveGroup}
                                    >
                                        <Text
                                            style={[
                                                styles.fromOptionText,
                                                { color: GlobalColors.red }
                                            ]}
                                        >
                                            Leave group
                                        </Text>
                                    </TouchableOpacity>
                                    {isOwner && (
                                        <>
                                            <View style={styles.fromDivider} />
                                            <TouchableOpacity
                                                style={styles.fromOtherOption}
                                                onPress={this.deleteChannel}
                                            >
                                                <Text
                                                    style={[
                                                        styles.fromOptionText,
                                                        {
                                                            color:
                                                                GlobalColors.red
                                                        }
                                                    ]}
                                                >
                                                    Delete group
                                                </Text>
                                            </TouchableOpacity>
                                        </>
                                    )}
                                </View>
                            )}
                            <View style={styles.divider} />
                            <View>
                                {isFromInfo && isOwner ? (
                                    <View style={styles.addContainer}>
                                        {/* eslint-disable-next-line max-len */}
                                        <Text
                                            style={styles.participantSecondText}
                                        >
                                            Participants
                                        </Text>
                                        <TouchableOpacity
                                            style={{ flexDirection: 'row' }}
                                            // eslint-disable-next-line max-len
                                            onPress={() =>
                                                NavigationAction.push(
                                                    NavigationAction.SCREENS
                                                        .newGroup,
                                                    {
                                                        channel,
                                                        logo:
                                                            this.state
                                                                .grpImage ||
                                                            false,
                                                        fromInfo: true,
                                                        onContactSelection: this
                                                            .onContactSelection,
                                                        fromSelectedContact: contactsData.map(
                                                            (item) => ({
                                                                ...item,
                                                                isSelected: true
                                                            })
                                                        )
                                                    }
                                                )
                                            }
                                        >
                                            {Icons.addParticipant({
                                                color:
                                                    GlobalColors.primaryButtonColor
                                            })}
                                            <Text style={styles.addBtn}>
                                                Add
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <Text style={styles.participantText}>
                                        Participants
                                    </Text>
                                )}

                                <FlatList
                                    data={contactsData}
                                    renderItem={this.renderItem}
                                    keyExtractor={(item) => item.id}
                                />
                            </View>
                        </SafeAreaView>
                    )}

                    <RBSheet
                        ref={(ref) => {
                            this.RBUserOptions = ref;
                        }}
                        // eslint-disable-next-line max-len,no-nested-ternary
                        height={isOwner ? 300 : 200}
                        openDuration={250}
                        closeDuration={250}
                        customStyles={{
                            container: {
                                paddingTop: 20,
                                paddingHorizontal: 10,
                                borderTopLeftRadius: 20,
                                borderTopRightRadius: 20
                            }
                        }}
                    >
                        <TouchableOpacity
                            style={styles.options}
                            onPress={this.onStartChat}
                        >
                            <Text style={styles.optionsText}>
                                Send Message to {name}
                            </Text>
                        </TouchableOpacity>
                        {/* eslint-disable-next-line max-len */}
                        <TouchableOpacity
                            style={styles.options}
                            onPress={() =>
                                this.onContactDetail(this.state.userInfo)
                            }
                        >
                            <Text style={styles.optionsText}>
                                See {name}
                                {/* eslint-disable-next-line react/no-unescaped-entities */}
                                's Profile
                            </Text>
                        </TouchableOpacity>
                        {isOwner && (
                            <>
                                {admins &&
                                    admins.findIndex((i) => i.id === id) ===
                                        -1 && (
                                        <TouchableOpacity
                                            style={styles.options}
                                            onPress={this.setAdmins}
                                        >
                                            {/* eslint-disable-next-line max-len */}
                                            <Text style={styles.optionsText}>
                                                Set as Admin of this Group
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                {/* eslint-disable-next-line max-len */}
                                <TouchableOpacity
                                    style={styles.options}
                                    onPress={this.deleteParticipant}
                                >
                                    <Text
                                        style={[
                                            styles.optionsText,
                                            { color: GlobalColors.red }
                                        ]}
                                    >
                                        Delete {name} from this group
                                    </Text>
                                </TouchableOpacity>
                            </>
                        )}
                        <TouchableOpacity
                            style={styles.cancelOption}
                            onPress={() => this.RBUserOptions.close()}
                        >
                            <Text style={styles.cancelOptionsText}>Cancel</Text>
                        </TouchableOpacity>
                    </RBSheet>
                </ScrollView>
                {loading && (
                    <ActivityIndicator
                        size={'large'}
                        style={{
                            position: 'absolute',
                            backgroundColor: GlobalColors.translucentDark,
                            alignContent: 'center',
                            flex: 1,
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0
                        }}
                    />
                )}
            </View>
        );
    }
}

export default CreateNewGroup;
