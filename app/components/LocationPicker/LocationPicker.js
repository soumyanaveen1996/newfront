import React from 'react';
import {
    Text,
    View,
    TouchableOpacity,
    Dimensions,
    Alert,
    SafeAreaView,
    Image
} from 'react-native';
import { HeaderBack } from '../Header';
import styles from './styles';
import { Actions } from 'react-native-router-flux';
import Icons from '../../config/icons';
import DeviceLocation from '../../lib/capability/DeviceLocation';
import I18n from '../../config/i18n/i18n';
import Mapbox from '@react-native-mapbox-gl/maps';
import GlobalColors from '../../config/styles';
import { UserTrackingMode } from '../MapView/config';
import images from '../../config/images';

Mapbox.setAccessToken(
    'pk.eyJ1IjoiZ2FjaWx1IiwiYSI6ImNqcHh0azRhdTFjbXQzeW8wcW5vdXhlMzkifQ.qPfpVkrWbk-GSBY3uc6z3A'
);

export default class LocationPicker extends React.Component {
    static navigationOptions({ navigation, screenProps }) {
        const { state } = navigation;
        let navigationOptions = {
            headerTitle: 'Map'
        };
        if (state.params.noBack === true) {
            navigationOptions.headerLeft = null;
        } else {
            navigationOptions.headerLeft = (
                <HeaderBack
                    onPress={() => {
                        Actions.pop();
                    }}
                />
            );
        }
    }

    constructor(props) {
        super(props);
        this.region = {
            zoom: 11,
            latitude: 0,
            longitude: 0
        };
        this.state = {
            currentTrackingMode: UserTrackingMode.NONE,
            followUserLocation: false,
            showUserLocation: true,
            locateUserButtonIcon: Icons.userPosition(),
            zoomLevel: this.region.zoom == undefined ? 11 : this.region.zoom,
            centerCoordinate: [this.region.longitude, this.region.latitude],
            selectedCoordinate: undefined
        };
    }

    componentDidMount() {
        navigator.geolocation.getCurrentPosition(position => {
            this.setState({
                centerCoordinate: [
                    position.coords.longitude,
                    position.coords.latitude
                ]
            });
        });
    }

    close() {
        Actions.pop();
    }

    done() {
        this.props.onLocationPicked({
            coordinate: this.state.selectedCoordinate
        });
        Actions.pop();
    }

    sendCurrentLocation() {
        navigator.geolocation.getCurrentPosition(position => {
            this.props.onLocationPicked({
                coordinate: [
                    position.coords.longitude,
                    position.coords.latitude
                ]
            });
            Actions.pop();
        });
    }

    selectLocation(event) {
        this.setState({
            selectedCoordinate: event.geometry.coordinates
        });
    }

    renderMarker() {
        if (this.state.selectedCoordinate) {
            return (
                <Mapbox.PointAnnotation
                    id="marker"
                    coordinate={this.state.selectedCoordinate}
                >
                    <Image
                        resizeMode="cover"
                        style={{ width: 30, height: 30, overflow: 'visible' }}
                        source={images.map_pin}
                    />
                </Mapbox.PointAnnotation>
            );
        }
    }

    renderDoneButton() {
        if (this.state && this.state.selectedCoordinate) {
            return (
                <TouchableOpacity
                    style={styles.doneButton}
                    onPress={this.done.bind(this)}
                >
                    <Text style={styles.doneButtonText}>{I18n.t('Done')}</Text>
                </TouchableOpacity>
            );
        }
    }

    goBack = () => {
        Actions.pop();
    };

    renderBottomLayer() {
        return (
            <TouchableOpacity
                style={styles.bottomLayer}
                onPress={this.sendCurrentLocation.bind(this)}
            >
                {Icons.userPosition({ color: GlobalColors.frontmLightBlue })}
                <Text style={styles.bottomLayerText}>Current Location</Text>
            </TouchableOpacity>
        );
    }

    renderButtons() {
        return (
            <View style={styles.buttonsContainer}>
                <TouchableOpacity
                    style={styles.zoomInButton}
                    onPress={this.zoomIn.bind(this)}
                >
                    {Icons.zoomIn()}
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.zoomOutButton}
                    onPress={this.zoomOut.bind(this)}
                >
                    {Icons.zoomOut()}
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.locateButton}
                    onPress={this.locateUser.bind(this)}
                >
                    {this.state.locateUserButtonIcon}
                </TouchableOpacity>
            </View>
        );
    }

    zoomIn() {
        this.map.getZoom().then(zoom => {
            this.setState({ zoomLevel: zoom + 1 });
        });
    }

    zoomOut() {
        // this.props.TEST()
        this.map.getZoom().then(zoom => {
            this.setState({ zoomLevel: zoom - 1 });
        });
    }

    locateUser() {
        if (this.state.currentTrackingMode === UserTrackingMode.NORMAL) {
            this.setState({
                followUserLocation: true,
                currentTrackingMode: UserTrackingMode.COMPASS
            });
        } else {
            this.setState({
                followUserLocation: true,
                currentTrackingMode: UserTrackingMode.NORMAL
            });
        }
        this.setState({
            locateUserButtonIcon: Icons.userPosition({
                color: GlobalColors.frontmLightBlue
            })
        });
    }

    onUserTrackingModeChange(e) {
        const { followUserMode, followUserLocation } = e.nativeEvent.payload;
        this.setState({
            followUserLocation: followUserLocation,
            currentTrackingMode: followUserMode || UserTrackingMode.NONE,
            locateUserButtonIcon: followUserLocation
                ? Icons.userPosition({ color: GlobalColors.frontmLightBlue })
                : Icons.userPosition()
        });
    }

    renderMap() {
        return (
            <SafeAreaView style={{ flex: 1 }}>
                <Mapbox.MapView
                    ref={map => (this.map = map)}
                    styleURL={Mapbox.StyleURL.Street}
                    s
                    logoEnabled={false}
                    style={{ flex: 1 }}
                    onLongPress={this.selectLocation.bind(this)}
                >
                    <Mapbox.UserLocation
                        visible={this.state.showUserLocation}
                    />
                    <Mapbox.Camera
                        ref={camera => (this.camera = camera)}
                        centerCoordinate={this.state.centerCoordinate}
                        zoomLevel={this.state.zoomLevel}
                        followUserLocation={this.state.followUserLocation}
                        followUserMode={
                            this.state.currentTrackingMode !==
                            UserTrackingMode.NONE
                                ? this.state.currentTrackingMode
                                : UserTrackingMode.NORMAL
                        }
                        onUserTrackingModeChange={this.onUserTrackingModeChange.bind(
                            this
                        )}
                        animationMode={'flyTo'}
                        animationDuration={2000}
                    />
                    {this.renderMarker()}
                </Mapbox.MapView>
                {this.renderDoneButton()}
                {this.renderButtons()}
            </SafeAreaView>
        );
    }

    render() {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
                {this.renderMap()}
                {this.renderBottomLayer()}
            </SafeAreaView>
        );
    }
}
