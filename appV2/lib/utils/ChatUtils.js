import React from 'react';
import { BotListItemStyles } from '../../Screens/Home/HomeTab/styles';
import images from '../../config/images';
import { View, Image } from 'react-native';
import ProfileImage from '../../widgets/ProfileImage';
import { CachedImage } from '../../widgets/CachedImage';
import { Conversation } from '../../lib/conversation';
import { Contact } from '../../lib/capability';
import EventEmitter from '../events';
import ContactsEvents from '../events/Contacts';
import { Toast } from 'react-native-toast-message/lib/src/Toast';
const ligthColors = [
    '#FFC03B',
    '#FF7523',
    '#E5453B',
    '#AF3CF6',
    '#638DFF',
    '#204CC7',
    '#006C8A',
    '#04B74F'
];

const ChatImageType = (
    otherUserId = false,
    uri = false,
    styles = false,
    isFavorite = false,
    userName = null
) => {
    if (otherUserId) {
        return (
            <View>
                <ProfileImage
                    uuid={otherUserId}
                    placeholder={images.user_image}
                    style={
                        styles ? styles : BotListItemStyles.conversationImage
                    }
                    placeholderStyle={BotListItemStyles.conversationImage}
                    resizeMode="cover"
                    userName={userName}
                />
                {isFavorite ? (
                    <Image
                        style={{
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            marginBottom: 5,
                            marginRight: -3
                        }}
                        source={images.timeline_fav}
                    />
                ) : null}
            </View>
        );
    }
    if (uri) {
        return (
            <View>
                <CachedImage
                    placeholderSource={images.channels_bot_logo}
                    source={{
                        uri
                    }}
                    style={
                        styles
                            ? styles
                            : { height: 40, width: 40, borderRadius: 20 }
                    }
                    placeholderStyle={
                        styles
                            ? styles
                            : { height: 40, width: 40, borderRadius: 20 }
                    }
                    resizeMode="contain"
                />

                {isFavorite ? (
                    <Image
                        style={{
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            marginBottom: 5,
                            marginRight: -3
                        }}
                        source={images.timeline_fav}
                    />
                ) : null}
            </View>
        );
    }
    return <View />;
};

const setConversationFavorite = (
    conversation,
    chatData = undefined,
    type,
    otherUserId,
    domain,
    callRefresh,
    updateFunc
) => {
    // console.log('Setting favorite..', conversation, type, chatData);
    let data;

    if (type === 'conversation') {
        data = {
            type,
            conversationId: conversation,
            action: 'add',
            userDomain: domain ? domain : 'frontmai'
        };
    } else if (type === 'channel') {
        data = {
            type,
            channelConvId: conversation,
            channelName: chatData.channel.channelName,
            action: 'add',
            userDomain: chatData.channel.userDomain
        };
    } else {
        data = {
            type,
            botId: conversation,
            action: 'add',
            userDomain: domain ? domain : 'frontmai'
        };
    }
    performSetFavAction(data, callRefresh, otherUserId, updateFunc);
};

const performSetFavAction = (
    data,
    callRefresh,
    otherUserId = undefined,
    updateFunc = undefined
) => {
    Conversation.setFavorite(data, updateFunc)
        .then(() => {
            // console.log('Conversation Set as favorite');
            Contact.getAddedContacts().then((contactsData) => {
                const updateContacts = contactsData.map((elem) => {
                    if (elem.userId === otherUserId) {
                        elem.isFavourite = data.action == 'add' ? true : false;
                    }

                    return elem;
                });
                Contact.saveContacts(updateContacts);
                if (data.conversationId) {
                    EventEmitter.emit(ContactsEvents.contactsRefreshed);
                }
                return callRefresh;
            });
        })
        .catch((err) => {
            // console.log('Cannot set un favorite', err);
            if (data.action === 'remove') data.action = 'add';
            else data.action = 'remove';
            Conversation.setFavorite(data, updateFunc, true);
            Toast.show({
                text1:
                    'Something went wrong while updating favorite. Please try again later.'
            });
            return callRefresh;
        });
};
const setConversationUnFavorite = (
    conversation,
    chatData = undefined,
    type,
    otherUserId,
    domain,
    callRefresh,
    updateFunc
) => {
    // console.log('Setting unfavorite..', conversation, type, chatData);
    let data;
    if (type === 'conversation') {
        data = {
            type,
            conversationId: conversation,
            action: 'remove',
            userDomain: domain ? domain : 'frontmai'
        };
    } else if (type === 'channel') {
        data = {
            type,
            channelConvId: conversation,
            channelName: chatData.channel.channelName,
            action: 'remove',
            userDomain: chatData.channel.userDomain
        };
    } else {
        data = {
            type,
            botId: conversation,
            action: 'remove',
            userDomain: domain ? domain : 'frontmai'
        };
    }
    performSetFavAction(data, callRefresh, otherUserId, updateFunc);
};

const getrandomizedColor = (uuid) => {
    let bigSum = 0;
    if (uuid)
        for (let i = 0; i < uuid.length; i++) {
            bigSum += uuid.charCodeAt(i);
        }
    return ligthColors[bigSum % 8];
};

export {
    ChatImageType,
    setConversationFavorite,
    setConversationUnFavorite,
    getrandomizedColor
};
