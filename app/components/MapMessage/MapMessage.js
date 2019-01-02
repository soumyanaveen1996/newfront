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
        this.props.openMap(this.props.mapData);
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
