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
    'pk.eyJ1IjoiZGFtYWNjaGkiLCJhIjoiY2pwbWhwdDc0MDJncjQ4bng2cXlwNnR5aSJ9.F2iu_0iGlGFiXqkDwn1CiA'
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

    // renderMap() {
    //     return (
    //         <MapView
    //             ref={ref => {
    //                 this.map = ref;
    //             }}
    //             style={styles.mapView}
    //             onMapReady={this.onMapReady.bind(this)}
    //             onLongPress={this.onPress.bind(this)}
    //             showsUserLocation={true}
    //             zoomEnabled={true}
    //         >
    //             {this.renderMarker()}
    //         </MapView>
    //     );
    // }

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
        const message =
            this.state && this.state.coordinate
                ? I18n.t('Tap_on_Map_to_Change')
                : I18n.t('Tap_on_Map');
        return (
            <View style={styles.bottomLayer}>
                <Text style={styles.bottomLayerText}>{message}</Text>
            </View>
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
                    {Icons.userPosition()}
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
        navigator.geolocation.getCurrentPosition(userPosition => {
            this.map
                .flyTo(
                    [
                        userPosition.coords.longitude,
                        userPosition.coords.latitude
                    ],
                    800
                )
                .then(() => {
                    this.map.zoomTo(13, 200);
                });
        });
    }

    renderMap() {
        let userPosition;
        DeviceLocation.getDeviceLocation()
            .then(location => {
                userPosition = [location.longitude, location.latitude];
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
        return (
            <SafeAreaView style={{ flex: 1 }}>
                <Mapbox.MapView
                    ref={map => (this.map = map)}
                    styleURL={Mapbox.StyleURL.Street}
                    zoomLevel={11}
                    centerCoordinate={userPosition || null}
                    showsUserLocation={true}
                    userTrackingMode={1}
                    logoEnabled={false}
                    compassEnabled={true}
                    style={{ flex: 1 }}
                    onLongPress={this.onPress.bind(this)}
                    zoomEnabled={true}
                >
                    {this.renderMarker()}
                    {/* <TouchableOpacity
                        style={styles.closeButton}
                        onPress={this.close.bind(this)}
                    >
                        {Icons.mapViewClose()}
                    </TouchableOpacity> */}
                </Mapbox.MapView>
                {this.renderDoneButton()}
                {this.renderButtons()}
            </SafeAreaView>
        );
    }

    render() {
        return (
            <View style={{ flex: 1 }}>
                {this.renderMap()}
                {this.renderBottomLayer()}
            </View>
        );
    }
}
