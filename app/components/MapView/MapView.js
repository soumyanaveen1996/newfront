import React from 'react';
import {
    Text,
    View,
    TouchableOpacity,
    Dimensions,
    Platform,
    Image,
    SafeAreaView,
    Alert,
    LayoutAnimation,
    UIManager,
    Slider
} from 'react-native';
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
import {
    EventEmitter,
    SatelliteConnectionEvents,
    PollingStrategyEvents,
    MessageEvents
} from '../../lib/events';
import { Settings, PollingStrategyTypes } from '../../lib/capability';
import Icons from '../../config/icons';
import Icon from 'react-native-vector-icons/Ionicons';
import images from '../../config/images';
import _ from 'lodash';
import Mapbox from '@mapbox/react-native-mapbox-gl';
import ContextSlideshow from './ContextSlideshow';
import ChatModal from '../ChatBotScreen/ChatModal';
import turf_great_circle from '@turf/great-circle';
import turf_distance from '@turf/distance';
import turf_helpers from '@turf/helpers';
import GlobalColors from '../../config/styles';
import { MarkerIconTypes } from './config';
import Store from '../../redux/store/configureStore';
import { setOpenMap } from '../../redux/actions/UserActions';
import { connect } from 'react-redux';

Mapbox.setAccessToken(
    'pk.eyJ1IjoiZ2FjaWx1IiwiYSI6ImNqcHh0azRhdTFjbXQzeW8wcW5vdXhlMzkifQ.qPfpVkrWbk-GSBY3uc6z3A'
);

//Mapbox descibes coordinates with two positions arrays. The first element is always the longitude.

class MapView extends React.Component {
    static navigationOptions({ navigation, screenProps }) {
        const { state } = navigation;
        let navigationOptions = {
            headerTitle: state.params.title
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
        // UIManager.setLayoutAnimationEnabledExperimental &&
        //     UIManager.setLayoutAnimationEnabledExperimental(true);
        this.defaultRegion = {
            zoom: 0,
            latitude: 0,
            longitude: 0
        };
        if (!this.props.mapData.region) {
            this.region = this.defaultRegion;
        } else {
            this.region = this.props.mapData.region;
        }
        this.state = {
            userTrackingMode:
                Platform.OS === 'android' ? Mapbox.UserTrackingModes.Follow : 0,
            locateUserButtonIcon: Icons.userPosition(),
            slideshowOpen: false,
            slideshowContext: [],
            chatModalContent: {},
            isModalVisible: false,
            showRouteTracker: false,
            routeTrackerClosed: false,
            trackerData: {},
            GEOJson: {},
            POI: []
        };
    }

    async componentDidMount() {
        this.refreshMap();
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

    componentDidUpdate(prevProps) {
        if (!_.isEqual(prevProps.mapData, this.props.mapData)) {
            this.refreshMap();
        }
    }

    componentWillUnmount() {
        this.props.onClosing();
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

    // _renderTrailArrows(polylines) {
    //     return _.map(polylines, polyline => {
    //         return polyline.coordinates.map((coo, index, coos) => {
    //             if (index === coos.length - 1) {
    //                 return;
    //             }
    //             let deltaLatitute = coos[index + 1].latitude - coo.latitude;
    //             let deltaLongitude = coos[index + 1].longitude - coo.longitude;
    //             let angle =
    //                 -Math.atan2(deltaLatitute, deltaLongitude) *
    //                 (180 / Math.PI);
    //             let angleStringRad = angle + 'deg';
    //             return (
    //                 <RNMapView.Marker
    //                     coordinate={coo}
    //                     image={images.trail_arrow}
    //                     anchor={{ x: 0.5, y: 0.5 }}
    //                     style={{ transform: [{ rotateZ: angleStringRad }] }}
    //                 />
    //             );
    //         });
    //     });
    // }

    getRegion() {
        return new Promise((resolve, reject) => {
            let region = {};
            this.map
                .getZoom()
                .then(zoom => {
                    region.zoom = zoom;
                    return this.map.getCenter();
                })
                .then(center => {
                    region.longitude = center[0];
                    region.latitude = center[1];
                    resolve(region);
                })
                .catch(() => {
                    reject(this.defaultRegion);
                });
        });
    }

    //Create a new GEOJson
    async refreshMap() {
        //REGION
        // let region = {};
        // if (this.props.mapData.region) {
        //     if (
        //         !this.props.mapData.region.zoom ||
        //         !this.props.mapData.region.longitude ||
        //         !this.props.mapData.region.latitude
        //     ) {
        //         region = await this.getRegion();
        //     } else {
        //         region = this.props.mapData.region;
        //     }
        // } else {
        //     region = await this.getRegion();
        // }
        // this.region = region;
        //GREAT CIRCLE
        const planeRoutes = _.map(this.props.mapData.planeRoutes, route => {
            let start = turf_helpers.point([
                route.start.longitude,
                route.start.latitude
            ]);
            let end = turf_helpers.point([
                route.end.longitude,
                route.end.latitude
            ]);
            return turf_great_circle(start, end, { name: route.id });
        });
        //MARKERS and POI
        let markers = [];
        let pointsOfInterest = [];
        this.props.mapData.markers.forEach(marker => {
            if (marker.iconType === MarkerIconTypes.POI) {
                const position = [
                    marker.coordinate.longitude,
                    marker.coordinate.latitude
                ];
                const poi = {
                    id: marker.id,
                    coordinate: position
                };
                pointsOfInterest.push(poi);
            } else {
                const position = [
                    marker.coordinate.longitude,
                    marker.coordinate.latitude
                ];
                const markerObject = {
                    type: 'Feature',
                    properties: {
                        iconType: marker.iconType || MarkerIconTypes.CIRCLE,
                        id: marker.id,
                        title: marker.title,
                        description: marker.description,
                        draggable: marker.draggable,
                        rotation: marker.coordinate.direction
                    },
                    geometry: {
                        type: 'Point',
                        coordinates: position
                    }
                };
                markers.push(markerObject);
            }
        });

        // const markers = _.map(this.props.mapData.markers, marker => {
        //     const position = [
        //         marker.coordinate.longitude,
        //         marker.coordinate.latitude
        //     ];
        //     const markerObject = {
        //         type: 'Feature',
        //         properties: {
        //             iconType: marker.iconType || MarkerIconTypes.CIRCLE,
        //             id: marker.id,
        //             title: marker.title,
        //             description: marker.description,
        //             draggable: marker.draggable,
        //             rotation: marker.coordinate.direction - 90
        //         },
        //         geometry: {
        //             type: 'Point',
        //             coordinates: position
        //         }
        //     };
        //     return markerObject;
        // });

        //POLYLINES
        const polylines = _.map(this.props.mapData.polylines, polyline => {
            vertices = _.map(polyline.coordinates, coords => {
                const vertex = [coords.longitude, coords.latitude];
                return vertex;
            });
            const lineString = {
                type: 'Feature',
                properties: {
                    id: polyline.id,
                    title: polyline.title,
                    description: polyline.description
                },
                geometry: {
                    type: 'LineString',
                    coordinates: vertices
                }
            };
            return lineString;
        });

        //GENERATE GEOJSON
        let GEOJson = {
            type: 'FeatureCollection',
            features: polylines.concat(planeRoutes).concat(markers)
        };

        //ROUTE TRACKER
        let trackerData = this.getRouteTracker();

        if (trackerData) {
            this.setState({
                GEOJson: GEOJson,
                showRouteTracker: true,
                trackerData: trackerData,
                POI: pointsOfInterest
            });
        } else {
            this.setState({
                GEOJson: GEOJson,
                POI: pointsOfInterest
            });
        }
    }

    renderElements() {
        return (
            <Mapbox.ShapeSource id="routeSource" shape={this.state.GEOJson}>
                {/* POLYLINES */}
                <Mapbox.LineLayer id="routes" style={layerStyles.route} />
                {/* MARKERS*/}
                <Mapbox.SymbolLayer
                    id={MarkerIconTypes.ARROW}
                    filter={['==', 'iconType', MarkerIconTypes.ARROW]}
                    style={layerStyles.arrowMarker}
                />
                <Mapbox.SymbolLayer
                    id={MarkerIconTypes.AIRCRAFT}
                    filter={['==', 'iconType', MarkerIconTypes.AIRCRAFT]}
                    style={layerStyles.aircraftMarker}
                />
                <Mapbox.SymbolLayer
                    id={MarkerIconTypes.POI}
                    filter={['==', 'iconType', MarkerIconTypes.POI]}
                    style={layerStyles.poiMarker}
                />
                <Mapbox.SymbolLayer
                    id={MarkerIconTypes.BLACK_CIRCLE}
                    filter={['==', 'iconType', MarkerIconTypes.BLACK_CIRCLE]}
                    style={layerStyles.blackCircleMarker}
                />
                <Mapbox.SymbolLayer
                    id={MarkerIconTypes.WHITE_CIRCLE}
                    filter={['==', 'iconType', MarkerIconTypes.WHITE_CIRCLE]}
                    style={layerStyles.whiteCircleMarker}
                />
                <Mapbox.SymbolLayer
                    id={MarkerIconTypes.GRAY_CIRCLE}
                    filter={['==', 'iconType', MarkerIconTypes.GRAY_CIRCLE]}
                    style={layerStyles.grayCircleMarker}
                />
            </Mapbox.ShapeSource>
        );
    }

    renderPointsOfInterest() {
        const POIs = this.state.POI.map((poi, index) => {
            return (
                <Mapbox.PointAnnotation
                    key={poi.id}
                    id={poi.id}
                    onSelected={this.onPOISelected.bind(this, poi.id, index)}
                    // onDeselected={this.onPOIDeselected.bind(this)}
                    coordinate={poi.coordinate}
                >
                    <Image
                        resizeMode="cover"
                        style={
                            poi.selected
                                ? { width: 30, height: 30, overflow: 'visible' }
                                : { width: 20, height: 20, overflow: 'visible' }
                        }
                        source={
                            poi.selected
                                ? images.map_pin
                                : images.map_regularpin_normal
                        }
                    />
                </Mapbox.PointAnnotation>
            );
        });
        return POIs;
    }

    onPOISelected(id, index, feature) {
        this.slideshow.scrollToCard(id);
        this.selectPOI(index);
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

    getRouteTracker() {
        let markerToTrack;
        let routeToTrack = _.find(this.props.mapData.planeRoutes, route => {
            return route.showTracker;
        });
        if (routeToTrack) {
            markerToTrack = _.find(this.props.mapData.markers, marker => {
                return routeToTrack.id === marker.id;
            });
            if (markerToTrack) {
                const trackerData = {
                    routeId: markerToTrack.id,
                    startId: routeToTrack.start.id,
                    endId: routeToTrack.end.id,
                    //metric system ftw!
                    altitude:
                        (markerToTrack.coordinate.altitude
                            ? JSON.stringify(markerToTrack.coordinate.altitude)
                            : '-') +
                        (markerToTrack.coordinate.imperial ? ' ft' : ' m'),
                    speed:
                        (markerToTrack.coordinate.speed
                            ? JSON.stringify(markerToTrack.coordinate.speed)
                            : '-') +
                        (markerToTrack.coordinate.imperial ? ' mph' : ' km/h'),
                    // startCoord: [
                    //     routeToTrack.start.longitude,
                    //     routeToTrack.start.latitude
                    // ],
                    // endCoord: [
                    //     routeToTrack.end.longitude,
                    //     routeToTrack.end.latitude
                    // ],
                    // currentCoord: [
                    //     markerToTrack.coordinate.longitude,
                    //     markerToTrack.coordinate.latitude
                    // ],
                    startTime: routeToTrack.start.time,
                    currentTime: new Date().getTime(),
                    arrivalTime: routeToTrack.end.time
                };
                return trackerData;
            }
        }
        return null;
    }

    renderRouteTracker() {
        // const from = turf_helpers.point(this.state.trackerData.startCoord);
        // const to = turf_helpers.point(this.state.trackerData.endCoord);
        // const now = turf_helpers.point(this.state.trackerData.currentCoord);
        // const fullDistance = turf_distance(from, to);
        // const travelled = turf_distance(from, now);
        // const trackerValue =
        //     JSON.stringify((travelled * 100) / fullDistance) + '%';

        const travelledTime =
            this.state.trackerData.currentTime -
            this.state.trackerData.startTime;
        const fullTime =
            this.state.trackerData.arrivalTime -
            this.state.trackerData.startTime;
        const timeLeftMs =
            this.state.trackerData.arrivalTime -
            this.state.trackerData.currentTime;
        let seconds = Math.floor(timeLeftMs / 1000);
        let minute = Math.floor(seconds / 60);
        seconds = seconds % 60;
        let hour = Math.floor(minute / 60);
        minute = minute % 60;
        hour = hour % 24;
        const trackerValue =
            JSON.stringify((travelledTime * 100) / fullTime) + '%';

        return (
            <View
                style={
                    this.state.routeTrackerClosed
                        ? styles.containerRSClosed
                        : styles.containerRS
                }
            >
                <View style={styles.leftContainerRS}>
                    <View style={styles.dataContainerRS}>
                        <Text style={styles.topTextRS}>
                            {this.state.trackerData.startId}
                        </Text>
                        <Text style={styles.topTextRS}>
                            {this.state.trackerData.endId}
                        </Text>
                    </View>
                    {/* TRACKER */}
                    <View style={styles.sliderTrackRS}>
                        <View
                            style={[
                                styles.leftTrackRS,
                                { width: trackerValue }
                            ]}
                        />
                        <Image
                            source={images.moving_maps_plane_blue_icon}
                            style={styles.trackIconRS}
                        />
                    </View>
                    <View style={styles.dataContainerRS}>
                        <Text style={styles.bottomTextRS}>
                            {this.state.trackerData.routeId}
                        </Text>
                        <Text style={styles.bottomTextRS}>
                            Arriving in{' '}
                            <Text style={{ fontWeight: 'bold' }}>
                                {hour <= 0 ? '00' : hour} :{' '}
                                {minute <= 0 ? '00' : minute}
                            </Text>
                        </Text>
                    </View>
                    <View style={styles.separatorRS} />
                    <View style={styles.dataContainerRS}>
                        <Text style={styles.bottomTextRS}>
                            Altitude:{' '}
                            <Text style={{ fontWeight: 'bold' }}>
                                {this.state.trackerData.altitude}
                            </Text>
                        </Text>
                        <Text style={styles.bottomTextRS}>
                            Speed:{' '}
                            <Text style={{ fontWeight: 'bold' }}>
                                {this.state.trackerData.speed}
                            </Text>
                        </Text>
                    </View>
                </View>
                <TouchableOpacity
                    style={styles.rightContainerRS}
                    onPress={() => {
                        if (Platform.OS === 'ios') {
                            LayoutAnimation.configureNext(
                                LayoutAnimation.Presets.easeInEaseOut
                            );
                        }
                        this.setState({
                            routeTrackerClosed: !this.state.routeTrackerClosed
                        });
                    }}
                >
                    {this.state.routeTrackerClosed
                        ? Icons.planeRSWhite()
                        : Icons.closeRouteSlider()}
                </TouchableOpacity>
            </View>
        );
    }

    zoomIn() {
        let cameraSetting = {};
        cameraSetting.duration = 500;
        this.map
            .getZoom()
            .then(zoom => {
                cameraSetting.zoom = zoom + 1;
                return this.map.getCenter();
            })
            .then(center => {
                cameraSetting.centerCoordinate = center;
                this.map.setCamera(cameraSetting);
            });
    }

    zoomOut() {
        // this.props.TEST()
        let cameraSetting = {};
        cameraSetting.duration = 500;
        this.map
            .getZoom()
            .then(zoom => {
                cameraSetting.zoom = zoom - 1;
                return this.map.getCenter();
            })
            .then(center => {
                cameraSetting.centerCoordinate = center;
                this.map.setCamera(cameraSetting);
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
        this.setState({ locateUserButtonIcon: Icons.userPositionActive });
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

    onMapRendered() {
        if (Platform.OS === 'android') {
            this.setState({ userTrackingMode: 0 });
            this.map.moveTo([this.region.longitude, this.region.latitude]);
        }
    }

    renderMap() {
        return (
            <Mapbox.MapView
                ref={map => (this.map = map)}
                styleURL={Mapbox.StyleURL.Street}
                zoomLevel={
                    this.region.zoom == undefined ? 11 : this.region.zoom
                } // == instead of === catch also null
                centerCoordinate={[this.region.longitude, this.region.latitude]}
                showsUserLocation={true}
                userTrackingMode={this.state.userTrackingMode}
                onUserTrackingModeChange={this.onUserTrackingModeChange.bind(
                    this
                )}
                onDidFinishRenderingMapFully={this.onMapRendered.bind(this)}
                logoEnabled={false}
                style={{ flex: 1 }}
            >
                {this.renderElements()}
                {this.renderPointsOfInterest()}
            </Mapbox.MapView>
        );
    }

    renderSlideShow() {
        if (this.props.mapData.cards && this.props.mapData.cards.length > 0) {
            return (
                <ContextSlideshow
                    ref={ref => {
                        this.slideshow = ref;
                    }}
                    contentData={this.props.mapData.cards}
                    isOpen={this.state.slideshowOpen}
                    closeAndOpenSlideshow={this.closeAndOpenSlideshow.bind(
                        this
                    )}
                    onDataCardSelected={this.openModalWithContent.bind(this)}
                    onCardSelected={this.onAction.bind(this)}
                    focusOnMarker={this.focusOnMarker.bind(this)}
                />
            );
        }
    }

    onAction(elementId) {
        let response = {
            type: 'map_response',
            mapId: this.props.mapId,
            cardId: elementId,
            markerId: elementId
        };
        this.map
            .getZoom()
            .then(zoom => {
                response.zoom = zoom;
                return this.map.getCenter();
            })
            .then(center => {
                response.center = {
                    longitude: center[0],
                    latitude: center[1]
                };
                this.props.onAction(response);
            });
    }

    closeAndOpenSlideshow() {
        if (Platform.OS === 'ios') {
            LayoutAnimation.configureNext(
                LayoutAnimation.Presets.easeInEaseOut
            );
        }
        this.setState({ slideshowOpen: !this.state.slideshowOpen });
    }

    renderChatModal() {
        return (
            <ChatModal
                content={this.state.chatModalContent}
                isVisible={this.state.isModalVisible}
                backdropOpacity={0.1}
                onBackButtonPress={this.hideChatModal.bind(this)}
                onBackdropPress={() => this.setState({ isModalVisible: false })}
                style={{ justifyContent: 'center', alignItems: 'center' }}
            />
        );
    }

    hideChatModal() {
        this.setState({ isModalVisible: false });
    }

    openModalWithContent(content) {
        this.setState({
            chatModalContent: content,
            isModalVisible: true
        });
    }

    focusOnMarker(id) {
        let foundIndex;
        const foundMarker = _.find(this.state.POI, (poi, index) => {
            foundIndex = index;
            return poi.id === id;
        });
        if (foundMarker) {
            this.flyTo(foundMarker.coordinate, 1500);
            this.selectPOI(foundIndex);
        }
    }

    selectPOI(index) {
        if (this.state.POI && this.state.POI[index]) {
            this.state.POI[index].selected = true;
            if (this.lastPOISelected) {
                this.state.POI[this.lastPOISelected].selected = false;
            }
            this.lastPOISelected = index;
            this.setState({ POI: this.state.POI });
        }
    }

    async flyTo(coordinate, time) {
        await this.map.flyTo(coordinate, time);
        this.map.zoomTo(16, 1000);
    }

    render() {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
                {this.renderMap()}
                {this.renderButtons()}
                {this.state.showRouteTracker ? this.renderRouteTracker() : null}
                {this.renderSlideShow()}
                {this.renderChatModal()}
            </SafeAreaView>
        );
    }
}

const mapStateToProps = state => {
    return {
        mapData: state.user.currentMap
    };
};

const mapDispatchToProps = dispatch => {
    return {
        setCurrentMap: currentMap => dispatch(setCurrentMap(currentMap))
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(MapView);
