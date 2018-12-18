import React from 'react';
import {
    Text,
    View,
    TouchableOpacity,
    Dimensions,
    Platform,
    Image,
    SafeAreaView,
    Alert
} from 'react-native';
import RNMapView from 'react-native-maps';
import { styles, layerStyles } from './styles';
import { Actions } from 'react-native-router-flux';
import I18n from '../../config/i18n/i18n';
import { HeaderRightIcon, HeaderBack } from '../Header';
import {
    NetworkHandler,
    AsyncResultEventEmitter,
    NETWORK_EVENTS_CONSTANTS,
    Queue
} from '../../lib/network';
import { Settings, PollingStrategyTypes } from '../../lib/capability';
import Icons from '../../config/icons';
import images from '../../config/images';
import _ from 'lodash';
import Mapbox from '@mapbox/react-native-mapbox-gl';

Mapbox.setAccessToken(
    'pk.eyJ1IjoiZGFtYWNjaGkiLCJhIjoiY2pwbWhwdDc0MDJncjQ4bng2cXlwNnR5aSJ9.F2iu_0iGlGFiXqkDwn1CiA'
);

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

        if (state.params.button) {
            if (state.params.button === 'manual') {
                navigationOptions.headerRight = (
                    <HeaderRightIcon
                        onPress={() => {
                            state.params.refresh();
                        }}
                        icon={Icons.refresh()}
                    />
                );
            } else if (state.params.button === 'gsm') {
                navigationOptions.headerRight = (
                    <HeaderRightIcon
                        image={images.gsm}
                        onPress={() => {
                            state.params.showConnectionMessage('gsm');
                        }}
                    />
                );
            } else if (state.params.button === 'satellite') {
                navigationOptions.headerRight = (
                    <HeaderRightIcon
                        image={images.satellite}
                        onPress={() => {
                            state.params.showConnectionMessage('satellite');
                        }}
                    />
                );
            } else {
                navigationOptions.headerRight = (
                    <HeaderRightIcon
                        icon={Icons.automatic()}
                        onPress={() => {
                            state.params.showConnectionMessage('automatic');
                        }}
                    />
                );
            }
        }
        return navigationOptions;
    }

    constructor(props) {
        super(props);
        const polylines = _.map(this.props.mapData.polylines, polyLine => {
            return _.map(polyLine.coordinates, coords => {
                const coordArray = [coords.longitude, coords.latitude];
                return coordArray;
            });
        });
        const vessels = _.map(polylines, polyline => {
            const lastIndex = polyline.length - 1;
            const deltaLongitude =
                polyline[lastIndex][0] - polyline[lastIndex - 1][0];
            const deltaLatitute =
                polyline[lastIndex][1] - polyline[lastIndex - 1][1];
            const angle =
                Math.atan2(deltaLongitude, deltaLatitute) * (180 / Math.PI);
            return {
                type: 'Feature',
                properties: { type: 'vessel', rotation: angle },
                geometry: {
                    type: 'Point',
                    coordinates: polyline[lastIndex]
                }
            };
        });
        this.GEOJson = {
            type: 'FeatureCollection',
            features: [
                {
                    type: 'Feature',
                    properties: { type: 'startingPoints' },
                    geometry: {
                        type: 'MultiPoint',
                        coordinates: _.map(polylines, polyline => {
                            return polyline[0];
                        })
                    }
                },
                {
                    type: 'Feature',
                    properties: { type: 'routes' },
                    geometry: {
                        type: 'MultiLineString',
                        coordinates: polylines
                    }
                }
            ].concat(vessels)
        };
    }

    async componentDidMount() {
        this.props.navigation.setParams({
            refresh: this.readLambdaQueue.bind(this),
            showConnectionMessage: this.showConnectionMessage.bind(this)
        });
        this.checkPollingStrategy();
        EventEmitter.addListener(
            PollingStrategyEvents.changed,
            this.checkPollingStrategy.bind(this)
        );
    }

    componentWillMount() {
        this.checkPollingStrategy();
    }

    componentDidUpdate() {
        this.checkPollingStrategy();
    }

    readLambdaQueue() {
        NetworkHandler.readLambda();
    }

    showConnectionMessage(connectionType) {
        let message = I18n.t('Auto_Message');
        if (connectionType === 'gsm') {
            message = I18n.t('Gsm_Message');
        } else if (connectionType === 'satellite') {
            message = I18n.t('Satellite_Message');
        }
        Alert.alert(
            I18n.t('Connection_Type'),
            message,
            [{ text: I18n.t('Ok'), style: 'cancel' }],
            { cancelable: false }
        );
    }

    async checkPollingStrategy() {
        let pollingStrategy = await Settings.getPollingStrategy();
        console.log('Polling strategy changed : ', pollingStrategy);
        this.showButton(pollingStrategy);
    }

    showButton(pollingStrategy) {
        if (pollingStrategy === PollingStrategyTypes.manual) {
            this.props.navigation.setParams({ button: 'manual' });
        } else if (pollingStrategy === PollingStrategyTypes.automatic) {
            this.props.navigation.setParams({ button: 'none' });
        } else if (pollingStrategy === PollingStrategyTypes.gsm) {
            this.props.navigation.setParams({ button: 'gsm' });
        } else if (pollingStrategy === PollingStrategyTypes.satellite) {
            this.props.navigation.setParams({ button: 'satellite' });
        }
    }

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

    _renderTrailArrows(polylines) {
        return _.map(polylines, polyline => {
            return polyline.coordinates.map((coo, index, coos) => {
                if (index === coos.length - 1) {
                    return;
                }
                let deltaLatitute = coos[index + 1].latitude - coo.latitude;
                let deltaLongitude = coos[index + 1].longitude - coo.longitude;
                let angle =
                    -Math.atan2(deltaLatitute, deltaLongitude) *
                    (180 / Math.PI);
                let angleStringRad = angle + 'deg';
                return (
                    <RNMapView.Marker
                        coordinate={coo}
                        image={images.trail_arrow}
                        anchor={{ x: 0.5, y: 0.5 }}
                        style={{ transform: [{ rotateZ: angleStringRad }] }}
                    />
                );
            });
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

    renderLineLayer() {
        return (
            <Mapbox.ShapeSource id="routeSource" shape={this.GEOJson}>
                <Mapbox.LineLayer id="routes" style={layerStyles.route} />
                <Mapbox.SymbolLayer
                    id="startPoints"
                    filter={['==', 'type', 'startingPoints']}
                    style={layerStyles.startingPoint}
                />
                <Mapbox.SymbolLayer
                    id="vessels"
                    filter={['==', 'type', 'vessel']}
                    style={layerStyles.vessel}
                />
            </Mapbox.ShapeSource>
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
        // const mapData = this.__addDeltaValuesToMapData(this.props.mapData);
        return (
            <Mapbox.MapView
                ref={map => (this.map = map)}
                styleURL={Mapbox.StyleURL.Street}
                zoomLevel={11}
                centerCoordinate={[
                    this.props.mapData.region.longitude,
                    this.props.mapData.region.latitude
                ]}
                showsUserLocation={true}
                userTrackingMode={1}
                logoEnabled={false}
                style={{ flex: 1 }}
            >
                {this.renderLineLayer()}
            </Mapbox.MapView>
        );
    }

    render() {
        return (
            <SafeAreaView style={{ flex: 1 }}>
                {this.renderMap()}
                {this.renderButtons()}
            </SafeAreaView>
        );
    }
}
