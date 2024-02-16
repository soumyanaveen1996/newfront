import React from 'react';
import {
    Text,
    View,
    TouchableOpacity,
    Platform,
    Image,
    SafeAreaView,
    LayoutAnimation
} from 'react-native';
import { styles, layerStyles } from './styles';
import { NetworkHandler } from '../../../../lib/network';
import Icons from '../../../../config/icons';
import images from '../../../../config/images';
import _ from 'lodash';
import Mapbox from '@rnmapbox/maps';
import ContextSlideshow from './ContextSlideshow';
import ChatModal from '../../ChatComponents/ChatModal';
import turf from '@turf/turf';
import turf_helpers from '@turf/helpers';
import GlobalColors from '../../../../config/styles';
import { MarkerIconTypes, UserTrackingMode } from './config';
import { connect } from 'react-redux';
import { ChatNotificationBar } from '../../ChatComponents/NonConversationalControl';
import AppFonts from '../../../../config/fontConfig';

Mapbox.setAccessToken(
    'pk.eyJ1IjoiZ2FjaWx1IiwiYSI6ImNqcHh0azRhdTFjbXQzeW8wcW5vdXhlMzkifQ.qPfpVkrWbk-GSBY3uc6z3A'
);

//Mapbox descibes coordinates with two positions arrays. The first element is always the longitude.

//TODO: refactor this just to disply location message
class LocationViewer extends React.Component {
    constructor(props) {
        super(props);
        // UIManager.setLayoutAnimationEnabledExperimental &&
        //     UIManager.setLayoutAnimationEnabledExperimental(true);
        this.defaultRegion = {
            zoom: 0,
            latitude: 0,
            longitude: 0
        };
        if (!this.props.mapData || !this.props.mapData.region) {
            this.region = this.defaultRegion;
        } else {
            this.region = this.props.mapData.region;
        }
        this.state = {
            currentTrackingMode: UserTrackingMode.NONE,
            followUserLocation: false,
            showUserLocation: true,
            locateUserButtonIcon: Icons.userPosition(),
            slideshowOpen: false,
            slideshowContext: [],
            chatModalContent: {},
            isModalVisible: false,
            showRouteTracker: false,
            routeTrackerClosed: false,
            trackerData: {},
            GEOJson: {},
            POI: [],
            zoomLevel: this.region.zoom == undefined ? 11 : this.region.zoom,
            centerCoordinate: [this.region.longitude, this.region.latitude]
        };
    }

    async componentDidMount() {
        this.refreshMap();
        if (this.props.route.params.navigation)
            this.props.route.params.navigation.setParams({
                refresh: this.readLambdaQueue.bind(this),
                showConnectionMessage: this.showConnectionMessage.bind(this)
            });
    }

    componentDidUpdate(prevProps) {
        const { mapData } = this.props.route.params;
        const region = _.get(mapData, 'region');
        if (mapData && !_.isEqual(prevProps.mapData, mapData)) {
            this.refreshMap();
            if (
                region &&
                (region.longitude !== prevProps.mapData.region.longitude ||
                    region.latitude !== prevProps.mapData.region.latitude)
            ) {
                this.flyTo(
                    [region.longitude, region.latitude],
                    1500,
                    region.zoom
                );
            }
        }
    }

    componentWillUnmount() {
        this.props.route.params.onClosing();
    }

    readLambdaQueue() {
        NetworkHandler.readLambda();
    }

    getRegion() {
        return new Promise((resolve, reject) => {
            let region = {};
            this.map
                .getZoom()
                .then((zoom) => {
                    region.zoom = zoom;
                    return this.map.getCenter();
                })
                .then((center) => {
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
        let {
            mapData: { planeRoutes = [], markers = [], polylines = [] }
        } = this.props.route.params;

        //GREAT CIRCLE
        const planeRoutesGJ = planeRoutes.map((route) => {
            let start = turf_helpers.point([
                route.start.longitude,
                route.start.latitude
            ]);
            let end = turf_helpers.point([
                route.end.longitude,
                route.end.latitude
            ]);
            return turf.greatCircle(start, end, {
                offset: 100, //used to avoid broken line round anti meridian
                name: route.id,
                color: route.color
                    ? '#' + route.color
                    : GlobalColors.frontmLightBlue
            });
        });

        //MARKERS and POI
        let markersGJ = [];
        let pointsOfInterest = [];
        markers.forEach((marker) => {
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
                markersGJ.push(markerObject);
            }
        });

        //POLYLINES
        const polylinesGJ = _.map(polylines, (polyline) => {
            vertices = _.map(polyline.coordinates, (coords) => {
                const vertex = [coords.longitude, coords.latitude];
                return vertex;
            });
            const lineString = {
                type: 'Feature',
                properties: {
                    id: polyline.id,
                    title: polyline.title,
                    description: polyline.description,
                    color: polyline.color
                        ? '#' + polyline.color
                        : GlobalColors.frontmLightBlue
                },
                geometry: {
                    type: 'LineString',
                    coordinates: vertices
                }
            };
            console.log('~~~~ linestring', linestring);
            return lineString;
        });

        //GENERATE GEOJSON
        let GEOJson = {
            type: 'FeatureCollection',
            features: polylinesGJ.concat(planeRoutesGJ).concat(markersGJ)
        };

        //ROUTE TRACKER
        let trackerData = this.getRouteTracker();
        this.setState({
            GEOJson: GEOJson,
            showRouteTracker: trackerData ? true : false,
            trackerData: trackerData,
            POI: pointsOfInterest
        });
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
        if (this.slideshow) {
            this.slideshow.scrollToCard(id);
        }
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
        if (this.props.route.params.conversational) {
            let markerToTrack;
            let routeToTrack = _.find(
                this.props.mapData.planeRoutes,
                (route) => {
                    return route.showTracker;
                }
            );
            if (routeToTrack) {
                markerToTrack = _.find(this.props.mapData.markers, (marker) => {
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
                                ? JSON.stringify(
                                      markerToTrack.coordinate.altitude
                                  )
                                : '-') +
                            (markerToTrack.coordinate.imperial ? ' ft' : ' m'),
                        speed:
                            (markerToTrack.coordinate.speed
                                ? JSON.stringify(markerToTrack.coordinate.speed)
                                : '-') +
                            (markerToTrack.coordinate.imperial
                                ? ' mph'
                                : ' km/h'),

                        startTime: routeToTrack.start.time,
                        currentTime: new Date().getTime(),
                        arrivalTime: routeToTrack.end.time
                    };
                    return trackerData;
                }
            }
            return null;
        } else {
            return null;
        }
    }

    renderRouteTracker() {
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
                            <Text style={{ fontWeight: AppFonts.BOLD }}>
                                {hour <= 0 ? '00' : hour} :{' '}
                                {minute <= 0 ? '00' : minute}
                            </Text>
                        </Text>
                    </View>
                    <View style={styles.separatorRS} />
                    <View style={styles.dataContainerRS}>
                        <Text style={styles.bottomTextRS}>
                            Altitude:{' '}
                            <Text style={{ fontWeight: AppFonts.BOLD }}>
                                {this.state.trackerData.altitude}
                            </Text>
                        </Text>
                        <Text style={styles.bottomTextRS}>
                            Speed:{' '}
                            <Text style={{ fontWeight: AppFonts.BOLD }}>
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
            <Mapbox.MapView
                ref={(map) => (this.map = map)}
                styleURL={Mapbox.StyleURL.Street}
                s
                logoEnabled={false}
                style={{ flex: 1 }}
            >
                <Mapbox.UserLocation visible={this.state.showUserLocation} />
                <Mapbox.Camera
                    ref={(camera) => (this.camera = camera)}
                    centerCoordinate={this.state.centerCoordinate}
                    zoomLevel={this.state.zoomLevel}
                    followUserLocation={this.state.followUserLocation}
                    followUserMode={
                        this.state.currentTrackingMode !== UserTrackingMode.NONE
                            ? this.state.currentTrackingMode
                            : UserTrackingMode.NORMAL
                    }
                    onUserTrackingModeChange={this.onUserTrackingModeChange.bind(
                        this
                    )}
                    animationMode={'flyTo'}
                    animationDuration={2000}
                />
                {this.renderElements()}
                {this.renderPointsOfInterest()}
            </Mapbox.MapView>
        );
    }

    renderSlideShow() {
        if (
            this.props.mapData &&
            this.props.mapData.cards &&
            this.props.mapData.cards.length > 0
        ) {
            return (
                <ContextSlideshow
                    ref={(ref) => {
                        this.slideshow = ref;
                    }}
                    contentData={this.props.mapData.cards}
                    isOpen={this.state.slideshowOpen}
                    closeAndOpenSlideshow={this.closeAndOpenSlideshow.bind(
                        this
                    )}
                    openModalWithContent={this.openModalWithContent.bind(this)}
                    onActionSelected={this.onAction.bind(this)}
                    focusOnMarker={this.focusOnMarker.bind(this)}
                />
            );
        }
    }

    onAction(elementId) {
        let response = {
            type: 'map_response',
            mapId: this.props.route.params.mapId,
            cardId: elementId,
            markerId: elementId
        };
        this.map
            .getZoom()
            .then((zoom) => {
                response.zoom = zoom;
                return this.map.getCenter();
            })
            .then((center) => {
                response.center = {
                    longitude: center[0],
                    latitude: center[1]
                };
                // this.props.route.params.onAction(response);
                message = new Message();
                message.mapResponseMessage(response);
                message.setCreatedBy(this.props.route.params.userId);
                this.props.route.params.sendMessage(message);
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
                backdropOpacity={0.3}
                onBackButtonPress={this.hideChatModal.bind(this)}
                onBackdropPress={() => this.setState({ isModalVisible: false })}
                style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    margin: 0
                }}
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
            return true;
        } else {
            return false;
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

    async flyTo(coordinate, time = 1500, zoom = 15) {
        this.setState({ centerCoordinate: coordinate, zoomLevel: zoom });
    }

    renderNonConversationalContent() {
        return (
            <View style={styles.nonConvContainer}>
                {this.props.route.params.nonConversationalContent}
            </View>
        );
    }

    render() {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
                {this.renderMap()}
                {this.renderButtons()}
                {this.state.showRouteTracker ? this.renderRouteTracker() : null}
                {this.renderSlideShow()}
                {this.props.route.params.nonConversationalContent}
                {this.renderChatModal()}
                {this.props.route.params.isWaiting && (
                    <Image
                        source={images.loadingfGif}
                        style={{
                            height: 150,
                            width: 150,
                            bottom: 150,
                            position: 'absolute',
                            alignSelf: 'center'
                        }}
                    />
                )}
                <ChatNotificationBar botId={this.props.botId} />
            </SafeAreaView>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        mapData: state.user.currentMap
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        setCurrentMap: (currentMap) => dispatch(setCurrentMap(currentMap))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(LocationViewer);
