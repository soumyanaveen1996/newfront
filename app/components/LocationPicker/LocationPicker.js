import React from 'react';
import { Text, View, TouchableOpacity, SafeAreaView } from 'react-native';
import MapView from 'react-native-maps';
import styles from './styles';
import { Actions } from 'react-native-router-flux';
import Icons from '../../config/icons';
import I18n from '../../config/i18n/i18n';


export default class LocationPicker extends React.Component {

    close() {
        if (this.props.onCancel) {
            this.props.onCancel();
        }
        Actions.pop()
    }

    done() {
        if (this.props.onLocationPicked) {
            this.props.onLocationPicked({ coordinate: this.state.coordinate });
        }
        Actions.pop()
    }

    renderMarker(markers) {
        if (!this.state || !this.state.coordinate) {
            return;
        }
        let marker = {
            coordinate: this.state.coordinate,
            draggable: false,
        }
        return (
            <MapView.Marker {...marker} key={'location_marker'} />
        );
    }

    onPress(event) {
        this.setState({
            coordinate: event.nativeEvent.coordinate,
        });
    }

    renderDoneButton() {
        if (this.state && this.state.coordinate) {
            return (
                <TouchableOpacity style={styles.doneButton} onPress={this.done.bind(this)}>
                    <Text style={styles.doneButtonText}>{I18n.t('Done')}</Text>
                </TouchableOpacity>
            );
        }
    }


    renderMap() {
        return (
            <MapView ref={ref => { this.map = ref; }} style={styles.mapView} onLongPress={this.onPress.bind(this)} showsUserLocation>
                {this.renderMarker()}
            </MapView>
        );
    }

    /*
    onMapReady() {
        navigator.geolocation.getCurrentPosition((location) => {
            console.log('Location : ', location);
            this.map.animateToRegion({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.3,
                longitudeDelta: 0.3
            })
            this.setState({
                region: {
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    latitudeDelta: 0.3,
                    longitudeDelta: 0.3
                }
            })

        }, (error) => {
            console.log('error in geolocation : ', error);
        });
    } */



    renderBottomLayer() {
        const message = this.state && this.state.coordinate ? I18n.t('Tap_on_Map_to_Change') : I18n.t('Tap_on_Map')
        return (
            <View style={styles.bottomLayer}>
                <Text style={styles.bottomLayerText}>{message}</Text>
            </View>
        )
    }

    render() {
        return (
            <View style={styles.container}>
                {this.renderMap()}
                <TouchableOpacity style={styles.closeButton} onPress={this.close.bind(this)}>
                    { Icons.mapViewClose() }
                </TouchableOpacity>
                {this.renderDoneButton()}
                {this.renderBottomLayer()}
            </View>
        );
    }
}
