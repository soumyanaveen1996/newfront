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
import { ControlDAO } from '../../lib/persistence';
import styles from './styles';
import Mapbox from '@react-native-mapbox-gl/maps';
import images from '../../config/images';
import { BlurView } from 'react-native-blur';
import { MarkerIconTypes } from '../MapView/config';

Mapbox.setAccessToken(
    'pk.eyJ1IjoiZ2FjaWx1IiwiYSI6ImNqcHh0azRhdTFjbXQzeW8wcW5vdXhlMzkifQ.qPfpVkrWbk-GSBY3uc6z3A'
);

export default class MapMessage extends React.Component {
    constructor(props) {
        super(props);
        this.mapOptions = this.props.mapOptions;
        this.state = {
            mapSnapshotUri: '',
            iosIcon: undefined,
            iosBackground: undefined
        };
    }

    openMap() {
        if (this.props.mapData) {
            this.props.openMap(
                this.props.mapData,
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
                content = this.props.mapData;
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
                    .then(uri => {
                        this.setState({ mapSnapshotUri: uri });
                    })
                    .catch(e => {
                        console.log('>>>>>>>e', e);
                    });
            } else {
                ControlDAO.getContentById(this.props.mapOptions.mapId)
                    .then(mapData => {
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
                    .then(uri => {
                        this.setState({ mapSnapshotUri: uri });
                    });
            }
        } else {
            let mapData;
            if (this.props.mapData) {
                mapData = this.props.mapData;
            } else {
                mapData = await ControlDAO.getContentById(
                    this.props.mapOptions.mapId
                );
            }
            if (mapData.markers && mapData.markers.length > 0) {
                const isVessel = mapData.markers.find(marker => {
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
            textStyle = styles.textUser;
            areaStyle = styles.rightMapMessage;
            text = 'View Location';
        }
        if (this.mapOptions) {
            title = this.mapOptions.title;
            description = this.mapOptions.description;
        }
        return (
            <View style={areaStyle}>
                <TouchableOpacity
                    onPress={this.openMap.bind(this)}
                    style={styles.container}
                >
                    {title ? <Text style={styles.title}>{title}</Text> : null}
                    {title ? (
                        <Text style={styles.description}>{description}</Text>
                    ) : null}
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
            </View>
        );
    }
}
