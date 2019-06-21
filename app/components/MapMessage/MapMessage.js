import React from 'react';
import {
    FlatList,
    Text,
    View,
    TouchableOpacity,
    ImageBackground,
    Dimensions
} from 'react-native';
import { ControlDAO } from '../../lib/persistence';
import styles from './styles';
import Mapbox from '@react-native-mapbox-gl/maps';

Mapbox.setAccessToken(
    'pk.eyJ1IjoiZ2FjaWx1IiwiYSI6ImNqcHh0azRhdTFjbXQzeW8wcW5vdXhlMzkifQ.qPfpVkrWbk-GSBY3uc6z3A'
);

export default class MapMessage extends React.Component {
    constructor(props) {
        super(props);
        this.mapOptions = this.props.mapOptions;
        this.state = {
            mapSnapshotUri: ''
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
        const { width, height } = Dimensions.get('window');
        let content;
        if (this.props.mapData) {
            content = this.props.mapData;
            Mapbox.snapshotManager
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
