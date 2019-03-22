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

export default class MapMessage extends React.Component {
    constructor(props) {
        super(props);
        this.mapData = this.props.mapData;
        this.state = {
            mapSnapshotUri: ''
        };
    }

    openMap() {
        //DATASET to test maps. Please don't remove ;)
        // this.MAPDATATEST = {
        //     region: {
        //         latitude: 15.5528,
        //         longitude: 110.433,
        //         zoom: 10
        //     },
        //     markers: [
        //         {
        //             id: "AK137",
        //             title: "AK137",
        //             description: "AK137",
        //             draggable: false,
        //             coordinate: {
        //                 latitude: 15.5528,
        //                 longitude: 110.433,
        //                 direction: 214.762
        //             },
        //             iconType: "aircraft"
        //         }
        //     ],
        //     planeRoutes: [
        //         {
        //             id: "AK137",
        //             start: {
        //                 id: "HKG",
        //                 time: "18:15:00",
        //                 latitude: 15.5528,
        //                 longitude: 110.433
        //             },
        //             end: {
        //                 id: "KUL",
        //                 time: "22:20:00",
        //                 latitude: 2.755672,
        //                 longitude: 101.70539
        //             },
        //             showTracker: true
        //         }
        //     ]
        // }

        this.props.openMap(this.props.mapData);
        // this.props.openMap(this.MAPDATATEST);
    }

    async componentDidMount() {
        const { width, height } = Dimensions.get('window');
        const uri = await Mapbox.snapshotManager.takeSnap({
            centerCoordinate: [
                this.mapData.map.region.longitude,
                this.mapData.map.region.latitude
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
        if (this.mapData.options) {
            title = this.mapData.options.title;
            description = this.mapData.options.description;
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
                    <ImageBackground
                        source={{ uri: this.state.mapSnapshotUri }}
                        style={styles.mapSnapShot}
                        resizeMode="cover"
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
