import React from 'react';
import {
    Text,
    View,
    TouchableOpacity,
    Dimensions,
    Alert,
    SafeAreaView
} from 'react-native';
import MapView from 'react-native-maps';
import { HeaderRightIcon, HeaderBack } from '../Header';
import styles from './styles';
import { Actions } from 'react-native-router-flux';
import Icons from '../../config/icons';
import DeviceLocation from '../../lib/capability/DeviceLocation';
import I18n from '../../config/i18n/i18n';
import Mapbox from '@mapbox/react-native-mapbox-gl';

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
        this.state = {
            userTrackingMode: Mapbox.UserTrackingModes.Follow,
            locateUserButtonIcon: Icons.userPosition()
        };
    }

    close() {
        if (this.props.onCancel) {
            this.props.onCancel();
        }
        Actions.pop();
    }

    done() {
        if (this.props.onLocationPicked) {
            this.props.onLocationPicked({ coordinate: this.state.coordinate });
        }
        Actions.pop();
    }

    sendCurrentLocation() {
        let userPosition;
        navigator.geolocation.getCurrentPosition(position => {
            userPosition = [
                position.coords.longitude,
                position.coords.latitude
            ];
            this.setState({ coordinate: userPosition });
            if (this.props.onLocationPicked) {
                this.props.onLocationPicked({
                    coordinate: this.state.coordinate
                });
            }
            Actions.pop();
        });
    }

    renderMarker(markers) {
        if (!this.state || !this.state.coordinate) {
            return;
        }
        // let marker = {
        //     coordinate: this.state.coordinate,
        //     draggable: false
        // };
        // return <MapView.Marker {...marker} key={'location_marker'} />;
        return (
            <Mapbox.PointAnnotation
                id="marker"
                coordinate={this.state.coordinate}
            />
        );
    }

    onPress(event) {
        this.setState({
            // coordinate: event.nativeEvent.coordinate
            coordinate: event.geometry.coordinates
        });
    }

    renderDoneButton() {
        if (this.state && this.state.coordinate) {
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

    onMapReady() {
        const { width, height } = Dimensions.get('window');
        const aspectRatio = width / height;
        //Setting latitudeDelta to 28 so that user's current country is displayed
        const latitudeDelta = 28.0;
        const longitudeDelta = latitudeDelta + aspectRatio;
        DeviceLocation.getDeviceLocation()
            .then(location => {
                this.map.animateToRegion({
                    latitude: location.latitude,
                    longitude: location.longitude,
                    latitudeDelta: latitudeDelta,
                    longitudeDelta: longitudeDelta
                });
            })
            .catch(error => {
                if (error.code === 2) {
                    Alert.alert(
                        I18n.t('Enable_GPS_title'),
                        I18n.t('Enable_GPS_to_view_currentLocation'),
                        [{ text: 'OK', onPress: this.goBack }],
                        { cancelable: false }
                    );
                }
            });
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
                {Icons.userPositionActive()}
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
            this.map.getCenter().then(center => {
                this.map.setCamera({
                    centerCoordinate: center,
                    zoom: zoom + 1,
                    duration: 500
                });
            });
        });
    }

    zoomOut() {
        this.map.getZoom().then(zoom => {
            this.map.getCenter().then(center => {
                this.map.setCamera({
                    centerCoordinate: center,
                    zoom: zoom - 1,
                    duration: 500
                });
            });
        });
    }

    locateUser() {
        if (this.state.userTrackingMode === Mapbox.UserTrackingModes.Follow) {
            this.setState({
                userTrackingMode: Mapbox.UserTrackingModes.FollowWithHeading
            });
        } else {
            this.setState({
                userTrackingMode: Mapbox.UserTrackingModes.Follow
            });
        }
        this.setState({ locateUserButtonIcon: Icons.userPositionActive() });
    }

    onUserTrackingModeChange(e) {
        const mode = e.nativeEvent.payload.userTrackingMode;
        this.setState({ userTrackingMode: mode });
        if (mode === 0) {
            this.setState({ locateUserButtonIcon: Icons.userPosition() });
        } else {
            this.setState({ locateUserButtonIcon: Icons.userPositionActive() });
        }
    }

    renderMap() {
        let userPosition;
        navigator.geolocation.getCurrentPosition(
            position => {
                userPosition = [
                    position.coords.longitude,
                    position.coords.latitude
                ];
            },
            () => {
                userPosition = null;
            }
        );
        return (
            <SafeAreaView style={{ flex: 1 }}>
                <Mapbox.MapView
                    ref={map => (this.map = map)}
                    styleURL={Mapbox.StyleURL.Street}
                    zoomLevel={11}
                    centerCoordinate={userPosition}
                    showsUserLocation={true}
                    userTrackingMode={this.state.userTrackingMode}
                    onUserTrackingModeChange={this.onUserTrackingModeChange.bind(
                        this
                    )}
                    logoEnabled={false}
                    style={{ flex: 1 }}
                    onLongPress={this.onPress.bind(this)}
                    zoomEnabled={true}
                >
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
