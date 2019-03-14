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
        // UIManager.setLayoutAnimationEnabledExperimental &&
        //     UIManager.setLayoutAnimationEnabledExperimental(true);
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
            GEOJson: {}
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
        this.props.setOpenMap(null);
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

    //Create a new GEOJson
    refreshMap() {
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
        //MARKERS
        const markers = _.map(this.props.mapData.markers, marker => {
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
                    rotation: marker.coordinate.direction - 90
                },
                geometry: {
                    type: 'Point',
                    coordinates: position
                }
            };
            return markerObject;
        });
        //POLYLINES
        const polylines = _.map(this.props.mapData.polylines, polyLine => {
            return _.map(polyLine.coordinates, coords => {
                const coordArray = [coords.longitude, coords.latitude];
                return coordArray;
            });
        });
        const movingVessels = _.map(polylines, polyline => {
            const lastIndex = polyline.length - 1;
            //check if the polyline is made of more than one position
            if (lastIndex > 0) {
                const deltaLongitude =
                    polyline[lastIndex][0] - polyline[lastIndex - 1][0];
                const deltaLatitute =
                    polyline[lastIndex][1] - polyline[lastIndex - 1][1];
                const angle =
                    Math.atan2(deltaLongitude, deltaLatitute) * (180 / Math.PI);
                return {
                    type: 'Feature',
                    properties: { type: 'movingVessel', rotation: angle },
                    geometry: {
                        type: 'Point',
                        coordinates: polyline[lastIndex]
                    }
                };
            } else {
                return {
                    type: 'Feature',
                    properties: { type: 'vesselPosition' },
                    geometry: {
                        type: 'Point',
                        coordinates: polyline[0]
                    }
                };
            }
        });

        //GENERATE GEOJSON
        let GEOJson = {
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
            ]
                .concat(movingVessels)
                .concat(planeRoutes)
                .concat(markers)
        };

        //ROUTE TRACKER
        let trackerData = this.getRouteTracker();
        if (trackerData) {
            this.setState({
                GEOJson: GEOJson,
                showRouteTracker: true,
                trackerData: trackerData
            });
        } else {
            this.setState({
                GEOJson: GEOJson
            });
        }
    }

    renderElements() {
        return (
            <Mapbox.ShapeSource id="routeSource" shape={this.state.GEOJson}>
                {/* VESSELS ROUTES */}
                <Mapbox.LineLayer id="routes" style={layerStyles.route} />
                {/* ROUTES STARTING POINTS */}
                <Mapbox.SymbolLayer
                    id="startPoints"
                    filter={['==', 'type', 'startingPoints']}
                    style={layerStyles.startingPoint}
                />
                {/* VESSELS MOVING ALONG ROUTES */}
                <Mapbox.SymbolLayer
                    id="movingVessels"
                    filter={['==', 'type', 'movingVessel']}
                    style={layerStyles.movingVessel}
                />
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
                    id={MarkerIconTypes.CIRCLE}
                    filter={['==', 'iconType', MarkerIconTypes.CIRCLE]}
                    style={layerStyles.circleMarker}
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
                    startCoord: [
                        routeToTrack.start.longitude,
                        routeToTrack.start.latitude
                    ],
                    endCoord: [
                        routeToTrack.end.longitude,
                        routeToTrack.end.latitude
                    ],
                    currentCoord: [
                        markerToTrack.coordinate.longitude,
                        markerToTrack.coordinate.latitude
                    ],
                    arrivalTime: routeToTrack.end.time
                };
                return trackerData;
            }
        }
        return null;
    }

    renderRouteTracker() {
        const from = turf_helpers.point(this.state.trackerData.startCoord);
        const to = turf_helpers.point(this.state.trackerData.endCoord);
        const now = turf_helpers.point(this.state.trackerData.currentCoord);
        const fullDistance = turf_distance(from, to);
        const travelled = turf_distance(from, now);
        const trackerValue =
            JSON.stringify((travelled * 100) / fullDistance) + '%';

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
                            Arriving at{' '}
                            <Text style={{ fontWeight: 'bold' }}>
                                {this.state.trackerData.arrivalTime}
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
            this.map.moveTo([
                this.props.mapData.region.longitude,
                this.props.mapData.region.latitude
            ]);
        }
    }

    renderMap() {
        return (
            <Mapbox.MapView
                ref={map => (this.map = map)}
                styleURL={Mapbox.StyleURL.Street}
                zoomLevel={this.props.mapData.region.zoom || 11}
                centerCoordinate={[
                    this.props.mapData.region.longitude,
                    this.props.mapData.region.latitude
                ]}
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
            </Mapbox.MapView>
        );
    }

    renderSlideShow() {
        if (
            this.props.mapData.options &&
            this.props.mapData.options.cards &&
            this.props.mapData.options.cards.length > 0
        ) {
            return (
                <ContextSlideshow
                    contentData={this.props.mapData.options.cards}
                    isOpen={this.state.slideshowOpen}
                    closeAndOpenSlideshow={this.closeAndOpenSlideshow.bind(
                        this
                    )}
                    onDataCardSelected={this.openModalWithContent.bind(this)}
                    onCardSelected={this.onAction.bind(this)}
                />
            );
        }
    }

    onAction(elementId) {
        let response = {
            type: 'map_response',
            mapId: this.props.mapData.options.mapId,
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
    console.log('>>>>>>>state', state);
    return {
        mapData: state.user.openMap
    };
};

const mapDispatchToProps = dispatch => {
    return {
        setOpenMap: mapData => dispatch(setOpenMap(mapData))
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(MapView);
