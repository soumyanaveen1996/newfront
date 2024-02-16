import React from 'react';
import {
    Text,
    View,
    TouchableOpacity,
    SafeAreaView,
    Image
} from 'react-native';
import Mapbox from '@rnmapbox/maps';
import Geolocation from '@react-native-community/geolocation';
import styles from './styles';
import Icons from '../../../config/icons';
import I18n from '../../../config/i18n/i18n';
import GlobalColors from '../../../config/styles';
import { UserTrackingMode } from '../../Chat/ChatComponents/MapView/config';
import images from '../../../config/images';
import NavigationAction from '../../../navigation/NavigationAction';
import { DeviceLocation } from '../../../lib/capability';
import { PrimaryButton } from '../../../widgets/PrimaryButton';

Mapbox.setAccessToken(
    'pk.eyJ1IjoiZ2FjaWx1IiwiYSI6ImNqcHh0azRhdTFjbXQzeW8wcW5vdXhlMzkifQ.qPfpVkrWbk-GSBY3uc6z3A'
);

export default class LocationPicker extends React.Component {
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
        this.checkforLocationOnOrOff();
    }

    checkforLocationOnOrOff = () => {
        DeviceLocation.getDeviceLocation()
            .then((res) => {
                console.log('res', res);
            })
            .catch((err) => {
                this.setPositionOnMap();
            });
    };

    componentDidMount() {
        this.setPositionOnMap();
    }

    setPositionOnMap = () => {
        Geolocation.getCurrentPosition((position) => {
            this.setState({
                centerCoordinate: [
                    position.coords.longitude,
                    position.coords.latitude
                ]
            });
        });
    };

    close() {
        NavigationAction.pop();
    }

    done() {
        this.props.route.params.onLocationPicked({
            coordinate: this.state.selectedCoordinate
        });
        NavigationAction.pop();
    }

    sendCurrentLocation() {
        Geolocation.getCurrentPosition((position) => {
            this.props.route.params.onLocationPicked({
                coordinate: [
                    position.coords.longitude,
                    position.coords.latitude
                ]
            });
            NavigationAction.pop();
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
                <PrimaryButton
                    style={styles.doneButton}
                    text={I18n.t('Done')}
                    onPress={this.done.bind(this)}
                />
            );
        }
    }

    goBack = () => {
        NavigationAction.pop();
    };

    renderBottomLayer() {
        return (
            <TouchableOpacity
                style={styles.bottomLayer}
                onPress={this.sendCurrentLocation.bind(this)}
            >
                {Icons.userPosition({ color: GlobalColors.primaryButtonColor })}
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
        this.map.getZoom().then((zoom) => {
            this.setState({ zoomLevel: zoom + 1 });
        });
    }

    zoomOut() {
        // this.props.route.params.TEST()
        this.map.getZoom().then((zoom) => {
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
                color: GlobalColors.primaryButtonColor
            })
        });
    }

    onUserTrackingModeChange(e) {
        const { followUserMode, followUserLocation } = e.nativeEvent.payload;
        this.setState({
            followUserLocation,
            currentTrackingMode: followUserMode || UserTrackingMode.NONE,
            locateUserButtonIcon: followUserLocation
                ? Icons.userPosition({ color: GlobalColors.primaryButtonColor })
                : Icons.userPosition()
        });
    }

    renderMap() {
        return (
            <SafeAreaView style={{ flex: 1 }}>
                <Mapbox.MapView
                    ref={(map) => (this.map = map)}
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
                        ref={(camera) => (this.camera = camera)}
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
                        animationMode="flyTo"
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
