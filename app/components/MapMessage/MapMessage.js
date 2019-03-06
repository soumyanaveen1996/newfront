import React from 'react';
import {
    FlatList,
    Text,
    View,
    TouchableOpacity,
    ImageBackground,
    Dimensions
} from 'react-native';
import styles from './styles';
import { Actions } from 'react-native-router-flux';
import Mapbox from '@mapbox/react-native-mapbox-gl';

Mapbox.setAccessToken(
    'pk.eyJ1IjoiZ2FjaWx1IiwiYSI6ImNqcHh0azRhdTFjbXQzeW8wcW5vdXhlMzkifQ.qPfpVkrWbk-GSBY3uc6z3A'
);

export default class WebCards extends React.Component {
    constructor(props) {
        super(props);
        this.mapData = this.props.mapData;
        this.state = {
            mapSnapshotUri: ''
        };
    }

    openMap() {
        this.MAPDATATEST = {
            region: {
                latitude: -75.343,
                longitude: 39.984,
                zoom: 7
            },
            markers: [
                {
                    id: 'LH204',
                    title: 'marker 2',
                    description: 'marker 2 description',
                    draggable: false,
                    coordinate: { latitude: -75.438, longitude: 39.553 },
                    iconType: 'poi' //arrow, aircraft, poi, circle
                }
            ],
            planeRoutes: [
                {
                    id: 'LH204', //flight number
                    start: {
                        id: 'LGW', //airport code, station
                        time: '10:30', //departure time
                        longitude: 39.123,
                        latitude: -75.534
                    },
                    end: {
                        id: 'JFK',
                        time: '23:30', //rrival time
                        longitude: 39.984,
                        latitude: -75.343
                    },
                    showTracker: true //id must be the same of a marker
                },
                {
                    id: 'route2', //flight number
                    start: {
                        id: 'MXP',
                        time: '10:30',
                        longitude: 38,
                        latitude: -70
                    },
                    end: {
                        id: 'LLT',
                        time: '20:30',
                        longitude: 40,
                        latitude: -72
                    },
                    showTracker: false
                }
            ]
        };

        // this.props.openMap(this.props.mapData);
        this.props.openMap(this.MAPDATATEST);
    }

    async componentDidMount() {
        const { width, height } = Dimensions.get('window');
        const uri = await Mapbox.snapshotManager.takeSnap({
            centerCoordinate: [
                this.mapData.region.longitude,
                this.mapData.region.latitude
            ],
            width: width,
            height: width,
            zoomLevel: 11,
            styleURL: Mapbox.StyleURL.Street,
            writeToDisk: true // creates a temp file
        });
        this.setState({ mapSnapshotUri: uri });
    }

    render() {
        let areaStyle;
        let textContainer;
        let textStyle;
        let text;
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
        return (
            <View style={areaStyle}>
                <TouchableOpacity
                    onPress={this.openMap.bind(this)}
                    style={styles.container}
                >
                    <ImageBackground
                        source={{ uri: this.state.mapSnapshotUri }}
                        style={styles.mapSnapShot}
                        imageStyle={{ borderRadius: 20 }}
                        resizeMode="cover"
                        borderRadius={20}
                    >
                        <View style={textContainer}>
                            <Text style={textStyle}>{text}</Text>
                        </View>
                    </ImageBackground>
                </TouchableOpacity>
            </View>
        );
    }
}
