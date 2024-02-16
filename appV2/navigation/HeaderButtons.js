import React, { useEffect } from 'react';
import {
    View,
    TouchableOpacity,
    Text,
    Platform,
    Dimensions
} from 'react-native';
import config from '../config/config';
import Icons from '../config/icons';
import GlobalColors from '../config/styles';
import {
    BotListItemStyles,
    MainScreenStyles
} from '../Screens/Home/HomeTab/styles';
import images from '../config/images';
import ProfileImage from '../widgets/ProfileImage';
import { HeaderRightIcon } from '../widgets/Header';
import { CachedImage } from '../widgets/CachedImage';
import Utils from '../lib/utils';
import { HeaderFavIcon } from '../Screens/Chat/ChatComponents/Widgets/HeaderFavIcon';
import { useSelector } from 'react-redux';
import DomainLogo from '../widgets/DomainLogo/DomainLogo';
import UserDomainsManager from '../lib/UserDomainsManager/UserDomainsManager';
import AppFonts from '../config/fontConfig';

const userChatRightHeader = (params) => {
    let callButton = null;
    if (config.showVoipCalls) {
        callButton =
            params.callDisabled === true ? (
                <HeaderRightIcon
                    icon={Icons.callDisabled({
                        size: 25,
                        color: GlobalColors.primaryButtonColorDisabled
                    })}
                    style={MainScreenStyles.callDisabledStyle}
                    disabled={true}
                />
            ) : (
                <HeaderRightIcon
                    // icon={Icons.call({ size: 25 })}
                    image={images.contactCall}
                    onPress={() => {
                        if (params.showCallMessage) {
                            params.showCallMessage();
                        }
                    }}
                    style={[{ height: 32, width: 32 }]}
                />
            );
    }

    let videocallButton = null;
    if (config.showVoipCalls) {
        videocallButton = params.callDisabled ? (
            <HeaderRightIcon
                icon={Icons.videocam({
                    size: 35,
                    color: GlobalColors.primaryButtonColorDisabled
                })}
                style={MainScreenStyles.voiceCallDisabled}
                disabled={true}
            />
        ) : (
            <HeaderRightIcon
                image={images.contactVideoCall}
                onPress={() => {
                    if (params.showCallMessage) {
                        params.showCallMessage(undefined, true);
                    }
                }}
                style={[{ height: 32, width: 32 }]}
            />
        );
    }
    return (
        <View
            style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-around'
            }}
        >
            <HeaderFavIcon
                item={params.allConvData}
                isFromNotification={params.comingFromNotif}
                isFavorite={params.isFavorite}
                onRefresh={() => params.onRefresh}
            />
            {callButton}
            {videocallButton}
        </View>
    );
};
const userBotRightHeader = (params) => {
    return (
        <View
            style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-around'
            }}
        >
            <HeaderFavIcon
                item={
                    params.allConvData
                        ? params.allConvData
                        : { bot: params.bot, otherUserId: false, type: 'bot' }
                }
                isFromNotification={params.comingFromNotif}
                isFavorite={params.isFavorite}
                onRefresh={() => params.onRefresh}
                channelId={params?.channelId}
            />
            {params?.channelId && params?.onInfoClick ? (
                <TouchableOpacity
                    style={{ padding: 2, marginRight: 0, width: 40 }}
                    onPress={params?.onInfoClick}
                >
                    {Icons.newInfoicon({ size: 20, color: '#c8ccd9' })}
                </TouchableOpacity>
            ) : null}
        </View>
    );
};
const useChatHeaderTitle = (params) => {
    let favIcon = null;
    let headerRightWidth = 0;
    let title = params.botName ? params.botName : params?.title;
    let headerImage = (
        <ProfileImage
            uuid={params?.otherUserId}
            placeholder={images.user_image}
            style={BotListItemStyles.headerImage}
            placeholderStyle={BotListItemStyles.headerImage}
            resizeMode="cover"
            userName={title}
            textSize={12}
        />
    );
    if (params.otherUserId) {
        headerRightWidth = 140;
        headerImage = (
            <ProfileImage
                uuid={params?.otherUserId}
                placeholder={images.user_image}
                style={BotListItemStyles.headerImage}
                placeholderStyle={BotListItemStyles.headerImage}
                resizeMode="cover"
                userName={params?.otherUserName ? params.otherUserName : title}
                textSize={12}
            />
        );
    } else if (params?.channelId) {
        let uri = Utils.userUploadedChannelLogoUrl(params?.channelId);
        // console.log('the uri is ---------CHECK---->', uri);
        headerRightWidth = 100;
        headerImage = (
            <CachedImage
                source={{ uri }}
                placeholder={images.user_image}
                style={BotListItemStyles.headerImage}
                placeholderSource={images.channels_bot_logo}
                resizeMode="contain"
            />
        );
    } else if (params?.bot) {
        headerRightWidth = 60;
        if (params?.hideLogo) headerImage = null;
        else
            headerImage = (
                <CachedImage
                    source={{
                        uri: params.botLogoUrl
                            ? params.botLogoUrl
                            : params.bot.logoUrl
                    }}
                    placeholder={images.user_image}
                    style={BotListItemStyles.headerImage}
                    placeholderStyle={BotListItemStyles.headerImage}
                    resizeMode="cover"
                />
            );
    }

    return (
        <View
            style={[
                MainScreenStyles.leftIconWithTitle,
                {
                    width: '100%',
                    maxWidth: Dimensions.get('screen').width - headerRightWidth
                }
            ]}
        >
            <View>{headerImage}</View>
            <View
                style={{
                    paddingHorizontal: 10,
                    flex: 1
                }}
            >
                <Text
                    style={[
                        {
                            color: GlobalColors.white,
                            fontSize: 14,
                            fontWeight: AppFonts.BOLD
                        }
                    ]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                >
                    {title}
                </Text>
            </View>
        </View>
    );
};

const createNewGroupHeaderRight = (params) => {
    params?.isOwner || !params?.isFromInfo ? (
        <TouchableOpacity
            style={{ marginRight: 16 }}
            accessibilityLabel="Call Icon"
            testID="call-icon"
            onPress={
                params?.isGroupCreate
                    ? params?.isGroupEdit
                        ? params?.saveGroup
                        : params?.createNewGroup
                    : null
            }
        >
            <Text
                style={{
                    fontSize: 18,
                    fontWeight: AppFonts.BOLD,
                    color: params.isGroupCreate ? '#0095f2' : '#c0c3cf'
                }}
            >
                {params?.isGroupEdit ? 'Save' : 'Create'}
            </Text>
        </TouchableOpacity>
    ) : null;
};

const HeaderDmainLogo = (params) => {
    const domainName = useSelector((state) => state.user.currentDomain);
    const domain = UserDomainsManager.getDomainInformation(domainName);
    return <DomainLogo domain={domain} size={32} showDefault />;
};
export {
    userChatRightHeader,
    createNewGroupHeaderRight,
    useChatHeaderTitle,
    userBotRightHeader,
    HeaderDmainLogo
};
