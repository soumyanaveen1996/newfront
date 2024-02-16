import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    TouchableOpacity,
    View,
    Text,
    Image
} from 'react-native';
import images from '../../../../images';
import {
    setConversationFavorite,
    setConversationUnFavorite
} from '../../../../lib/utils/ChatUtils';
import { DeviceStorage } from '../../../../lib/capability';
import { Conversation } from '../../../../lib/conversation';
import { useDispatch, useSelector } from 'react-redux';
import { setChennalForFavUpdate } from '../../../../redux/actions/UserActions';
import Store from '../../../../redux/store/configureStore';
const HeaderFavIcon = (props) => {
    // for updating fav of channel when its updated from group info functionality-2

    const currentChennalFavUpdated = useSelector(
        (state) => state.user.updatedFavChannelIds
    );

    useEffect(() => {
        if (
            props.channelId &&
            currentChennalFavUpdated &&
            currentChennalFavUpdated[props.channelId]
        ) {
            if (currentChennalFavUpdated[props.channelId] == props.channelId) {
                setIsFav(!isFav);
                Store.dispatch(setChennalForFavUpdate(null));
            }
        }
    }, [currentChennalFavUpdated]);

    /// done functionality-2

    const [isFav, setIsFav] = useState(
        props.isFromNotification
            ? props.isFromNotification.isFavorite
            : props.isFavorite
    );

    useEffect(() => {
        setIsFav(props.isFavorite);
    }, [props.isFavorite]);

    // get conversation for contact functionality

    const getConvForContact = async () => {
        let conv = await Conversation.getIMConversation(
            props.isFromNotification.conversationId
        );
        if (conv && conv.favorite) {
            setIsFav(true);
        }
    };

    useEffect(() => {
        if (
            props.isFromNotification &&
            props.isFromNotification.getConversation
        ) {
            getConvForContact();
        }
    }, [props.isFromNotification]);

    // end of contact conversation fav functionality
    const [loader, setLoader] = useState(false);

    // for handlling bots fav status by notification and from apps Tab functionality 1

    const checkForBots = async () => {
        const favBotsArray = await DeviceStorage.getArrayValues(
            'favourite_bots'
        );
        const botIndex = props?.isFromNotification.botId;
        if (favBotsArray && favBotsArray.indexOf(botIndex) !== -1) {
            // bot.favorite = 1;
            setIsFav(true);
        }
    };
    useEffect(() => {
        if (
            props?.isFromNotification &&
            props.isFromNotification.notificationFor == 'bot'
        ) {
            checkForBots();
        }
    }, [props?.isFromNotification]);

    const checkNotifcationType = async (data) => {
        let conversationId = data.conversationId,
            botId = data.botId,
            chatData = data,
            domain = data.userDomain;

        let setType = null;
        let favId = data.conversationId;
        if (data.notificationFor == 'bot') {
            setType = 'bot';
            favId = botId;
        } else if (data.notificationFor == 'peopleChat') {
            setType = 'conversation';
        } else {
            setType = 'channel';
        }
        console.log('the TYPE FOR ONE TO ONE', data);

        if (!isFav) {
            await setConversationFavorite(
                favId,
                chatData,
                setType,
                chatData?.otherUserId,
                domain,
                (onRefresh = data.onRefresh),
                updateState
            );
        } else {
            await setConversationUnFavorite(
                favId,
                chatData,
                setType,
                chatData?.otherUserId,
                domain,
                (onRefresh = data.onRefresh),
                updateState
            );
        }
    };

    // functionality 1 end

    const updateState = () => {
        setLoader(false);
        setIsFav(!isFav);
    };

    const checkTypeOfConv = async (item) => {
        let conversationId = item.bot.conversationId,
            botId = item.bot.botId,
            chatData = item.chatData,
            type = item.type,
            domain = item.bot?.userDomain,
            elemType = item.elemType;
        let setType = type;
        let favId = conversationId;
        if (item.type === 'conversation') {
            if (chatData.channel) {
                setType = 'channel';
            }
        }
        if (item.type === 'bot') {
            favId = botId;
        }
        if (!isFav) {
            await setConversationFavorite(
                favId,
                chatData,
                setType,
                chatData?.otherUserId,
                domain,
                (onRefresh = props.onRefresh),
                updateState
            );
        } else {
            await setConversationUnFavorite(
                favId,
                chatData,
                setType,
                chatData?.otherUserId,
                domain,
                (onRefresh = props.onRefresh),
                updateState
            );
        }
    };

    return (
        <TouchableOpacity
            accessibilityLabel="Header Right Icon Image"
            testID="header-right-icon-image"
            style={{ marginHorizontal: 2 }}
            onPress={() => {
                setLoader(true);
                if (props.isFromNotification !== undefined) {
                    checkNotifcationType(props.isFromNotification);
                } else {
                    checkTypeOfConv(props.item);
                }
            }}
        >
            {loader ? (
                <View
                    style={{
                        height: 32,
                        width: 32,
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <Text>
                        <ActivityIndicator color={'#dedede'} size={'small'} />
                    </Text>
                </View>
            ) : (
                <View style={{ height: 32, width: 32 }}>
                    <Image
                        source={isFav ? images.chatFavActive : images.chatFav}
                        style={{ height: '100%', width: '100%' }}
                    />
                </View>
            )}
        </TouchableOpacity>
    );
};

export { HeaderFavIcon };
