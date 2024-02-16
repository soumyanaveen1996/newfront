import React from 'react';
import {
    FlatList,
    Text,
    View,
    TouchableOpacity,
    ImageBackground,
    Dimensions,
    Image,
    Platform
} from 'react-native';
import Icons from '../../../../config/icons';

import Images from '../../../../config/images';
import { ContactsCache } from '../../../../lib/ContactsCache';
import utils from '../../../../lib/utils';
import ProfileImage from '../../../../widgets/ProfileImage';
import { ChatImageType } from '../../../../lib/utils/ChatUtils';
import stylesChat, { metadataContainerStyle } from '../../styles';
import { ControlDAO } from '../../../../lib/persistence';
import styles from './styles';
import Mapbox from '@rnmapbox/maps';
import images from '../../../../config/images';
import { BlurView } from '@react-native-community/blur';
import { MarkerIconTypes } from '../MapView/config';
import AppFonts from '../../../../config/fontConfig';
Mapbox.setAccessToken(
    'pk.eyJ1IjoiZ2FjaWx1IiwiYSI6ImNqcHh0azRhdTFjbXQzeW8wcW5vdXhlMzkifQ.qPfpVkrWbk-GSBY3uc6z3A'
);

const getRandomInt = (max) => Math.floor(Math.random() * Math.floor(max));

export default class MapMessage extends React.Component {
    constructor(props) {
        super(props);
        this.mapOptions = this.props.mapOptions;
        this.state = {
            mapSnapshotUri: '',
            iosIcon: undefined,
            iosBackground: undefined,
            userName: null
        };
        if (this.props.showTime) {
            this.fetchUserName();
        }
    }

    openMap() {
        if (this.props.mapData) {
            this.props.openMap(
                Array.isArray(this.props.mapData)
                    ? this.props.mapData[0]
                    : this.props.mapData,
                this.mapOptions.mapId,
                this.mapOptions.title
            );
        } else {
            this.props.openMap(this.mapOptions.mapId, this.mapOptions.title);
        }
    }

    async componentDidMount() {
        if (Platform.OS === 'android') {
            const { width, height } = Dimensions.get('window');
            let content;

            if (this.props.mapData) {
                content = Array.isArray(this.props.mapData)
                    ? this.props.mapData[0]
                    : this.props.mapData;
                return Mapbox.snapshotManager
                    .takeSnap({
                        centerCoordinate: [
                            content.region.longitude,
                            content.region.latitude
                        ],
                        width: width,
                        height: width,
                        zoomLevel: 11,
                        styleURL: Mapbox.StyleURL.Street,
                        writeToDisk: true // creates a temp file
                    })
                    .then((uri) => {
                        this.setState({ mapSnapshotUri: uri });
                    })
                    .catch((e) => {
                        console.log('ERROR: ', e);
                    });
            } else {
                ControlDAO.getContentById(
                    this.props.mapOptions.mapId + this.props.conversationId
                )
                    .then((mapData) => {
                        return Mapbox.snapshotManager.takeSnap({
                            centerCoordinate: [
                                mapData.region.longitude,
                                mapData.region.latitude
                            ],
                            width: width,
                            height: width,
                            zoomLevel: 11,
                            styleURL: Mapbox.StyleURL.Street,
                            writeToDisk: true // creates a temp file
                        });
                    })
                    .then((uri) => {
                        this.setState({ mapSnapshotUri: uri });
                    });
            }
        } else {
            let mapData;
            if (this.props.mapData) {
                mapData = Array.isArray(this.props.mapData)
                    ? this.props.mapData[0]
                    : this.props.mapData;
            } else {
                mapData = await ControlDAO.getContentById(
                    this.props.mapOptions.mapId + this.props.conversationId
                );
            }
            if (mapData.markers && mapData.markers.length > 0) {
                const isVessel = mapData.markers.find((marker) => {
                    return (
                        marker.iconType === MarkerIconTypes.ARROW ||
                        marker.iconType === MarkerIconTypes.AIRCRAFT
                    );
                });
                if (isVessel) {
                    if (isVessel.iconType === MarkerIconTypes.ARROW) {
                        this.setState({
                            iosIcon: images.maps_maritime_icon,
                            iosBackground: images.temp_map_ocean
                        });
                        return;
                    } else if (isVessel.iconType === MarkerIconTypes.AIRCRAFT) {
                        this.setState({
                            iosIcon: images.moving_maps_plane,
                            iosBackground: images.temp_map
                        });
                        return;
                    }
                }
            }
            this.setState({
                iosIcon: images.map_pin,
                iosBackground: images.temp_map
            });
        }
    }
    fetchUserName = async () => {
        // const dataNew = this.props.message?.getCreatedBy?.();

        const message = this.props.message;
        if (message?.getCreatedBy?.()) {
            await ContactsCache.getUserDetails(message.getCreatedBy()).then(
                (user) => {
                    let userName = null;
                    if (user.userName && user.userName.length > 0)
                        userName = user.userName;
                    else userName = I18n.t('Unknown');
                    this.setState({ userName });
                }
            );

            // }
            // Throttle this call as too many chat messages trigger multiple API calls before the Ccache can return
        } else {
            if (this.props.isBotNameShown)
                this.setState({ userName: this.props.isBotNameShown });
        }
    };
    image(normalTime = null) {
        const { message, isUserChat, alignRight } = this.props;
        if (normalTime) {
            return (
                <View
                    style={[
                        stylesChat.imageWithName,
                        {
                            marginTop: 15
                        }
                    ]}
                >
                    {this.props.isBotNameShown &&
                    !this.props.isUserChat &&
                    this.props.user.userId !== message.getCreatedBy() ? (
                        this.showBotIcon(stylesChat.chatProfilePic)
                    ) : (
                        <ProfileImage
                            uuid={message.getCreatedBy()}
                            placeholder={Images.user_image}
                            style={stylesChat.chatProfilePic}
                            placeholderStyle={
                                stylesChat.chatPlaceholderProfilePic
                            }
                            resizeMode="cover"
                        />
                    )}
                    <View style={stylesChat.imageWithName}>
                        <View>
                            {this.state.userName && (
                                <Text style={stylesChat.userNameStyle}>
                                    {this.state.userName}
                                </Text>
                            )}
                        </View>
                        {this.renderMetadata()}
                    </View>
                </View>
            );
        } else {
            return null;
        }
    }
    showBotIcon(picStyle) {
        let url = this.props.imageSource;
        return ChatImageType(false, url.uri, picStyle);
    }
    renderMetadata() {
        const { message, alignRight } = this.props;
        return (
            <View style={{ marginLeft: 8 }}>
                <Text style={[stylesChat.date, { lineHeight: 16 }]}>
                    {utils.formattedDateTimeOnly(message.getMessageDate())}
                </Text>
            </View>
        );
    }
    render() {
        let areaStyle;
        let textContainer;
        let textStyle;
        let text;
        let title;
        let description;
        if (!this.props.isFromUser) {
            textContainer = styles.textContainerNotUser;
            textStyle = styles.textNotUser;
            if (this.props.isFromBot) {
                //message from a bot
                areaStyle = styles.centerMapMessage;
                text = 'View map';
            } else {
                // message from another user
                areaStyle = styles.leftMapMessage;
                text = 'View Location';
            }
        } else {
            //message from the user
            textContainer = styles.textContainerUser;
            textStyle = {
                ...styles.textUser,
                fontSize: 14,
                fontWeight: AppFonts.LIGHT
            };
            areaStyle = {
                ...styles.rightMapMessage,
                // marginBottom: 5,
                width: '100%'
            };
            text = 'View Location';
        }
        if (this.mapOptions) {
            title = this.mapOptions.title;
            description = this.mapOptions.description;
        }

        return (
            <>
                <View style={areaStyle}>
                    {this.props.showTime ? (
                        <View style={{ marginLeft: -48 }}>
                            {this.image(true)}
                        </View>
                    ) : null}
                    <View style={{ flexDirection: 'row' }}>
                        <TouchableOpacity
                            onPress={this.openMap.bind(this)}
                            style={[styles.container, stylesChat.mapViewWidth]}
                        >
                            <View>
                                {title && (
                                    <Text style={styles.title}>{title}</Text>
                                )}
                                {description && (
                                    <Text style={styles.description}>
                                        {description}
                                    </Text>
                                )}
                            </View>

                            {Platform.OS === 'android' ? (
                                <ImageBackground
                                    source={{ uri: this.state.mapSnapshotUri }}
                                    style={styles.mapSnapShot}
                                    resizeMode="cover"
                                >
                                    <View style={textContainer}>
                                        <Text style={textStyle}>{text}</Text>
                                    </View>
                                </ImageBackground>
                            ) : (
                                <ImageBackground
                                    source={this.state.iosBackground}
                                    style={styles.mapSnapShot}
                                    resizeMode="cover"
                                >
                                    <BlurView
                                        blurType="light"
                                        blurAmount={2}
                                        style={{
                                            top: 0,
                                            bottom: 0,
                                            right: 0,
                                            left: 0,
                                            position: 'absolute'
                                        }}
                                    />
                                    <Image
                                        source={this.state.iosIcon}
                                        style={{
                                            alignSelf: 'center',
                                            marginBottom: '30%',
                                            width: '30%',
                                            height: '30%',
                                            overflow: 'visible'
                                        }}
                                    />
                                    <View style={textContainer}>
                                        <Text style={textStyle}>{text}</Text>
                                    </View>
                                </ImageBackground>
                            )}
                        </TouchableOpacity>
                        {this.props.user !== undefined &&
                        this.props.message.getCreatedBy() ===
                            this.props.user.userId &&
                        (this.props.message.getStatus() === 1 ||
                            this.props.message.getStatus() === -1) ? (
                            <View style={stylesChat.textMsgDeliveryICon}>
                                {this.props.message.getStatus() === 1
                                    ? Icons.delivered()
                                    : Icons.deliveryFailed()}
                            </View>
                        ) : (
                            <Text />
                        )}
                    </View>
                </View>
            </>
        );
    }
}
