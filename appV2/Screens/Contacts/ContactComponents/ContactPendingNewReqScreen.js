import React from 'react';
import { Text, Image, View, TouchableOpacity, FlatList } from 'react-native';
import Loader from '../../../widgets/Loader';
import AsyncStorage from '@react-native-community/async-storage';
import _ from 'lodash';
import ContactsEvents from '../../../lib/events/Contacts';
import { Conversation } from '../../../lib/conversation';
import EventEmitter from '../../../lib/events';
import { Auth, Contact } from '../../../lib/capability';
import styles from '../styles';
import { getContactRankImage } from '../config';
import ContactServices from '../../../apiV2/ContactServices';
import { ProfileImage } from '../../../widgets';
import Images from '../../../images';
import Icons from '../../../config/icons';
import TimelineBuilder from '../../../lib/TimelineBuilder/TimelineBuilder';
import GlobalColors from '../../../config/styles';
import { Toast } from 'react-native-toast-message/lib/src/Toast';
import NavigationAction from '../../../navigation/NavigationAction';

const IGNORED = 'ignored';
const R = require('ramda');

export default class ContactPendingNewReqScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            newRequests: this.props.route.params?.newRquestsAndRejectedObj
                .newRequests,
            newRequestsList: this.props.route.params?.newRquestsAndRejectedObj
                .newRequestsList,
            ignoredList: this.props.route.params?.newRquestsAndRejectedObj
                .ignoredList,
            ignored: this.props.route.params?.newRquestsAndRejectedObj.ignored,
            type: this?.props?.route?.params?.type,
            mainLoading: false
        };

        this.userInfo = Auth.getUserData();
    }

    async componentDidMount() {
        try {
            await AsyncStorage.setItem(
                'BADGE_NEW_CONTACT_REQUEST',
                JSON.stringify({
                    count: this.props.route.params.newRquestsAndRejectedObj
                        .newRequestsList?.length,
                    showBadge: 0
                })
            );
            this.props.route.params.upDateBadge();
        } catch {
            (e) => console.log(e);
        }

        if (this.state.type === 'blocked_contact') {
            try {
                this.setState({ mainLoading: true });
                await Contact.getNewRequestAndIgnoredContact()
                    .then((res) => {
                        if (res) {
                            this.setState({
                                ignoredList: res.ignoredList,
                                ignored: true,
                                mainLoading: false
                            });
                        }
                    })
                    .catch((err) => {
                        console.log('error', err);
                    });
            } catch {
                (e) => console.log(e);
            }
        }
    }

    checkForNewReqAndPendingReq = (refreshOnIgnore = false) => {
        Contact.getNewRequestAndIgnoredContact()
            .then((res) => {
                if (res) {
                    const {
                        newRequests,
                        newRequestsList,
                        ignored,
                        ignoredList
                    } = res;

                    if (newRequests || ignored) {
                        this.setState({
                            newRequests,
                            ignored,
                            newRequestsList,
                            ignoredList
                        });
                    } else {
                        this.setState({
                            newRequests: false,
                            ignored: false,
                            mainLoading: false
                        });
                    }
                } else {
                    this.setState({
                        newRequests: false,
                        ignored: false,
                        mainLoading: false
                    });
                }
            })
            .catch((err) => {
                console.log(err);
            });
    };

    callCapebilityForAcceptIgnore = (selectedContacts, flag) =>
        new Promise((resolve, reject) => {
            if (flag) {
                ContactServices.accept({ userIds: [selectedContacts] })
                    .then((result) => {
                        if (result.error === 0) {
                            resolve();
                        } else {
                            reject();
                        }
                    })
                    .catch((error) => {
                        reject();
                    });
            } else {
                ContactServices.ignore({ userIds: [selectedContacts] })
                    .then((result) => {
                        if (result.error === 0) {
                            resolve();
                        } else {
                            reject();
                        }
                    })
                    .catch((error) => {
                        reject();
                    });
            }
        });

    onDone = (contact, acceptOrIgnore) => {
        this.setState({ mainLoading: true });

        this.callCapebilityForAcceptIgnore(contact.userId, acceptOrIgnore)
            .then(async () => {
                // await Contact.refreshContacts();
                if (acceptOrIgnore) {
                    this.checkForNewReqAndPendingReq();
                    await Contact.refreshContacts();
                    TimelineBuilder.buildTiimeline(true);
                    this.setState({
                        mainLoading: false
                    });
                    Toast.show({
                        text1: 'Contact added successfully.',
                        type: 'success'
                    });
                    if (this.state.newRequestsList?.length === 1) {
                        NavigationAction.pop();
                    }
                    // Event to people chat to enable button (Maybe) if better way then do that...
                } else {
                    this.checkForNewReqAndPendingReq(true);
                    Conversation.downloadRemoteConversations(true);
                    this.setState({
                        mainLoading: false
                    });
                    Toast.show({
                        text1: 'Contact request rejected successfully.',
                        type: 'success'
                    });
                    if (this.state.newRequestsList?.length === 1) {
                        NavigationAction.pop();
                    }
                }
            })
            .catch((err) => {
                console.log('error ', err);
                Toast.show({ text1: 'Something went wrong.' });
            });
    };

    addContacts = (selectedContacts) =>
        new Promise((resolve, reject) => {
            Contact.addIgnoredContacts(selectedContacts)
                .then(() => ContactServices.add([selectedContacts.userId]))
                .then((result) => {
                    if (result.error === 0) {
                        resolve();
                    } else {
                        reject();
                    }
                })
                .catch((error) => {
                    Toast.show({ text1: 'Something went wrong.' });
                    // console.log('te error is 4443333555 ', error);
                    reject();
                });
        });

    connectIgnored = (contact) => {
        this.setState({ mainLoading: true });
        this.addContacts(contact)
            .then(async () => {
                this.checkForNewReqAndPendingReq();
                await Contact.refreshContacts();
                Conversation.downloadRemoteConversations(true);
                TimelineBuilder.buildTiimeline(true);
                this.setState({
                    mainLoading: false
                });
                Toast.show({
                    text1: 'Contact added successfully.',
                    type: 'success'
                });
                EventEmitter.emit(ContactsEvents.contactAccepted);
                // Event to people chat to enable button (Maybe) if better way then do that...
            })
            .catch((err) => {
                console.log('error ', err);
                Toast.show({ text1: 'Please try again! server error' });
            });
    };

    renderName = (contact) => {
        const name = contact.name || contact.userName || '';

        return (
            <Text style={styles.contactItemNameNew}>
                {name?.length > 18 ? `${name.substring(0, 24)}...` : name}
            </Text>
        );
    };

    getContactEmail = (contact) => {
        const homeEmail = R.pathOr(
            null,
            ['emails', 0, 'email', 'home'],
            contact
        );
        const workEmail = R.pathOr(
            null,
            ['emails', 0, 'email', 'work'],
            contact
        );
        const generalEmail =
            typeof R.pathOr(null, ['emails', 0, 'email'], contact) === 'string'
                ? R.pathOr(null, ['emails', 0, 'email'], contact)
                : null;

        if (generalEmail) {
            return (
                <Text style={styles.contactItemEmail}>
                    {contact.emails[0].email}
                </Text>
            );
        }

        if (workEmail) {
            return <Text style={styles.contactItemEmail}>{workEmail}</Text>;
        }
        if (homeEmail) {
            return <Text style={styles.contactItemEmail}>{homeEmail}</Text>;
        }
    };

    renderItem = (data, typeOfReq, isBlocked) => {
        let contact = data.item;
        const uuid = contact.id || contact.userId;
        return (
            <>
                <View style={styles.mainContainer}>
                    <View style={styles.subContainer1}>
                        {contact.rankLevel1 ||
                        contact.rankLevel2 ||
                        contact.rankLevel3 ? (
                            <Image
                                style={styles.imageStyle}
                                resizeMode="cover"
                                source={getContactRankImage(contact)}
                            />
                        ) : null}
                        <ProfileImage
                            accessibilityLabel="Profile Picture"
                            testID="profile-picture"
                            uuid={uuid}
                            userName={contact.name || contact.userName}
                            style={[
                                styles.contactItemImage
                                // { marginRight: 10 }
                            ]}
                            placeholder={Images.user_image}
                            placeholderStyle={[
                                styles.contactItemImage,
                                {
                                    marginRight: 10
                                }
                            ]}
                            resizeMode="cover"
                        />
                    </View>
                    <View style={styles.subContainer2}>
                        <View style={styles.nameContainer}>
                            <View
                                style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between'
                                }}
                            >
                                <View>{this.renderName(contact)}</View>

                                <View />
                            </View>
                        </View>
                        {typeOfReq ? (
                            isBlocked ? (
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center'
                                    }}
                                >
                                    <View style={{ width: 5 }} />
                                    <TouchableOpacity
                                        onPress={() => {
                                            this.onDone(contact, true);
                                        }}
                                    >
                                        <View style={styles.unBlockContainer}>
                                            <Text
                                                style={
                                                    styles.unBlockContainerText
                                                }
                                            >
                                                {'Accept contact'}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center'
                                    }}
                                >
                                    <TouchableOpacity
                                        onPress={() => {
                                            this.onDone(contact, false);
                                        }}
                                    >
                                        <View style={styles.unBlockContainer}>
                                            <Text
                                                style={
                                                    styles.unBlockContainerText
                                                }
                                            >
                                                {'Reject'}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                    <View style={{ width: 5 }} />
                                    <TouchableOpacity
                                        onPress={() => {
                                            this.onDone(contact, true);
                                        }}
                                    >
                                        <View
                                            style={styles.acceptButtonContainer}
                                        >
                                            <Text
                                                style={styles.acceptButtonText}
                                            >
                                                {'Accept'}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            )
                        ) : (
                            <TouchableOpacity
                                onPress={() => {
                                    this.connectIgnored(contact);
                                }}
                                style={{ flexDirection: 'row' }}
                            >
                                <Text style={styles.connectText}>
                                    {'Connect'}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
                <View style={styles.pnrScreenDevider} />
            </>
        );
    };

    render() {
        const { newRequests, ignored, mainLoading, type } = this.state || {};
        console.log('type ---->', mainLoading);
        if (type === 'blocked_contact') {
            return (
                <View style={styles.container}>
                    <Loader loading={mainLoading} />
                    {this.state.ignoredList?.length > 0 ? (
                        <>
                            <FlatList
                                renderItem={(item) =>
                                    this.renderItem(item, true, true)
                                }
                                data={this.state.ignoredList}
                                extraData={this.state.ignoredList}
                                keyExtractor={(item, index) => item.index}
                                maxToRenderPerBatch={10}
                                windowSize={10}
                            />
                        </>
                    ) : !mainLoading ? (
                        <View style={styles.centerContainer}>
                            <Text style={styles.textStyle}>
                                {'No ignored contacts!'}
                            </Text>
                        </View>
                    ) : (
                        <></>
                    )}
                </View>
            );
        }
        return (
            <View style={styles.container}>
                <Loader loading={mainLoading} />
                {newRequests ? (
                    <>
                        <View style={styles.pendingContainer}>
                            <Text style={styles.pendingText}>{'Pending'}</Text>
                        </View>

                        <FlatList
                            renderItem={(item) => this.renderItem(item, true)}
                            data={this.state.newRequestsList}
                            extraData={this.state.newRequestsList}
                            keyExtractor={(item, index) => item.index}
                            maxToRenderPerBatch={10}
                            windowSize={10}
                        />
                    </>
                ) : null}
                {ignored ? (
                    <>
                        <View style={styles.pendingContainer}>
                            <Text style={styles.pendingText}>{'Rejected'}</Text>
                        </View>

                        <FlatList
                            renderItem={(item) => this.renderItem(item, false)}
                            data={this.state.ignoredList}
                            extraData={this.state.ignoredList}
                            keyExtractor={(item, index) => item.index}
                            maxToRenderPerBatch={10}
                            windowSize={10}
                        />
                    </>
                ) : null}
                {!ignored && !newRequests ? (
                    <View style={styles.centerContainer}>
                        <Text style={styles.textStyle}>
                            {'No new contact requests!'}
                        </Text>
                    </View>
                ) : null}
            </View>
        );
    }
}
