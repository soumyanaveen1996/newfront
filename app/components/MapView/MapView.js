import React from 'react';
import { Text, View, TouchableOpacity, Dimensions } from 'react-native';
import RNMapView from 'react-native-maps';
import styles from './styles';
import { Actions } from 'react-native-router-flux';
import Icons from '../../config/icons';
import _ from 'lodash';

class CallOut extends React.Component {
    render() {
        return (
            <View style={styles.callOutContainer}>
                <Text style={styles.callOutText}>{this.props.text}</Text>
            </View>
        );
    }
}

export default class MapView extends React.Component {
    _close() {
        Actions.pop();
    }

    _renderCallOut(callOut) {
        return (
            <RNMapView.Callout>
                <CallOut text={callOut.text} />
            </RNMapView.Callout>
        );
    }

    _renderMarkers(markers) {
        return _.map(markers, (marker, index) => {
            return (
                <RNMapView.Marker {...marker} key={'marker' + index}>
                    {this._renderCallOut(marker.callOut)}
                </RNMapView.Marker>
            );
        });
    }

    _renderPolygons(polygons) {
        return _.map(polygons, (polygon, index) => {
            return <RNMapView.Polygon {...polygon} key={'polygon' + index} />;
        });
    }

    _renderPolylines(polylines) {
        return _.map(polylines, (polyline, index) => {
            return (
                <RNMapView.Polyline {...polyline} key={'polyline' + index} />
            );
        });
    }

    _renderCircles(circles) {
        return _.map(circles, (circle, index) => {
            return <RNMapView.Circle {...circle} key={'circle' + index} />;
        });
    }

    __addDeltaValuesToMapData(mapData) {
        const { width, height } = Dimensions.get('window');
        const aspectRatio = width / height;
        //Setting latitudeDelta to 0.0922 so that zoom radius is small
        const latitudeDelta = 0.0922;
        const longitudeDelta = latitudeDelta + aspectRatio;
        //latitudeDelta and longitudeDelta determines the zoom level
        mapData.region.latitudeDelta = latitudeDelta;
        mapData.region.longitudeDelta = longitudeDelta;
        return mapData;
    }

    _renderMap() {
        const mapData = this.__addDeltaValuesToMapData(this.props.mapData);
        return (
            <RNMapView region={mapData.region} style={styles.mapView}>
                {this._renderMarkers(mapData.markers)}
                {this._renderPolygons(mapData.polygons)}
                {this._renderPolylines(mapData.polylines)}
                {this._renderCircles(mapData.circles)}
            </RNMapView>
        );
    }

    render() {
        return (
            <View style={styles.container}>
                {this._renderMap()}
                <TouchableOpacity
                    style={styles.closeButton}
                    onPress={this._close.bind(this)}
                >
                    {Icons.mapViewClose()}
                </TouchableOpacity>
            </View>
        );
    }
}
