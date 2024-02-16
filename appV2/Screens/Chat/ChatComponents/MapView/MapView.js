import React from 'react';
import {
    Text,
    View,
    TouchableOpacity,
    Platform,
    Image,
    LayoutAnimation
} from 'react-native';
import _ from 'lodash';
import Mapbox from '@rnmapbox/maps';
import turf from '@turf/turf';
import { CheckBox } from '@rneui/themed';
import { styles, layerStyles } from './styles';
import { NetworkHandler } from '../../../../lib/network';

import Icons from '../../../../config/icons';
import images from '../../../../config/images';
import GlobalColors from '../../../../config/styles';
import { MarkerIconTypes, UserTrackingMode } from './config';
import { ChatNotificationBar } from '../NonConversationalControl';
import BottomSheet from '../Widgets/BottomSheet';
import { generateMapData } from './MapViewHelper';
import { Pressable } from 'react-native';
import { DeviceLocation } from '../../../../lib/capability';
import AppFonts from '../../../../config/fontConfig';
Mapbox.setAccessToken(
    'pk.eyJ1IjoiZ2FjaWx1IiwiYSI6ImNqcHh0azRhdTFjbXQzeW8wcW5vdXhlMzkifQ.qPfpVkrWbk-GSBY3uc6z3A'
);

// Mapbox descibes coordinates with two positions arrays. The first element is always the longitude.

class MapView extends React.Component {
    constructor(props) {
        super(props);
        // UIManager.setLayoutAnimationEnabledExperimental &&
        //     UIManager.setLayoutAnimationEnabledExperimental(true);
        this.defaultRegion = {
            zoom: 0,
            latitude: 0,
            longitude: 0
        };
        if (this.props.mapData?.region) {
            this.region = this.props.mapData.region;
        } else {
            this.region = this.defaultRegion;
        }
        this.state = {
            currentTrackingMode: UserTrackingMode.NONE,
            followUserLocation: false,
            showUserLocation: true,
            locateUserButtonIcon: images.map_locate_blue,
            slideshowOpen: false,
            slideshowContext: [],
            chatModalContent: {},
            isModalVisible: false,
            showRouteTracker: false,
            routeTrackerClosed: false,
            trackerData: {},
            GEOJson: {},
            POI: [],
            ViewType: Mapbox.StyleURL.Street,
            zoomLevel: this.region.zoom == undefined ? 11 : this.region.zoom,
            centerCoordinate: [
                this.region.longitude ? this.region.longitude : 0,
                this.region.latitude ? this.region.latitude : 0
            ]
        };
        console.log(
            '~~~~ MapView constructor mapdata region',
            this.props.mapData.region
        );
        console.log(
            '~~~~ MapView constructor actuial region',
            this.state.centerCoordinate
        );
    }
    checkForPermission = () => {
        DeviceLocation.getDeviceLocation();
    };

    componentDidMount() {
        this.checkForPermission();
        this.refreshMap();
        if (this.props.navigation) {
            this.props.navigation.setParams({
                refresh: this.readLambdaQueue.bind(this),
                showConnectionMessage: this.showConnectionMessage.bind(this)
            });
        }
    }

    componentDidUpdate(prevProps) {
        const { mapData } = this.props;
        const region = _.get(mapData, 'region');
        if (mapData && !_.isEqual(prevProps.mapData, mapData)) {
            this.refreshMap();
            if (
                region &&
                (region.longitude !== prevProps.mapData.region.longitude ||
                    region.latitude !== prevProps.mapData.region.latitude)
            ) {
                if (region.longitude != null && region.latitude != null)
                    this.flyTo(
                        [region.longitude, region.latitude],
                        1500,
                        region.zoom
                    );
            }
        }
    }

    componentWillUnmount() {
        this.props.onClosing();
    }

    readLambdaQueue() {
        NetworkHandler.readLambda();
    }

    // Create a new GEOJson
    refreshMap() {
        const { GEOJson, trackerData, pointsOfInterest } = generateMapData(
            this.props.mapData
        );
        this.setState(
            this.setState({
                GEOJson,
                showRouteTracker: !!trackerData,
                trackerData,
                POI: pointsOfInterest
            })
        );
    }

    renderElements() {
        console.log('GEOJson', this.state.GEOJson);
        return (
            <Mapbox.ShapeSource id="routeSource" shape={this.state.GEOJson}>
                {/* POLYLINES */}
                <Mapbox.LineLayer id="routes" style={layerStyles.route} />
                {/* MARKERS */}
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
        const POIs = this.state.POI.map((poi, index) =>
            Platform.OS == 'android' ? (
                <Mapbox.MarkerView
                    key={poi.id}
                    id={poi.id}
                    onSelected={this.onPOISelected.bind(this, poi.id, index)}
                    coordinate={poi.coordinate}
                >
                    <Pressable
                        style={styles.markerViewItemContainer}
                        onPress={this.onPOISelected.bind(this, poi.id, index)}
                    >
                        <View style={styles.markerViewItem}>
                            {poi.selected
                                ? Icons.locationSelected({ color: poi.color })
                                : Icons.location({ color: poi.color })}
                        </View>
                    </Pressable>
                </Mapbox.MarkerView>
            ) : (
                <Mapbox.PointAnnotation
                    key={poi.id}
                    id={poi.id}
                    onSelected={this.onPOISelected.bind(this, poi.id, index)}
                    // onDeselected={this.onPOIDeselected.bind(this)}
                    coordinate={poi.coordinate}
                >
                    {poi.selected
                        ? Icons.locationSelected({ color: poi.color })
                        : Icons.location({ color: poi.color })}
                </Mapbox.PointAnnotation>
            )
        );
        return POIs;
    }

    onPOISelected(id, index, feature) {
        console.log('~~~~ onPOISelected');
        if (this.slideshow) {
            this.slideshow.scrollToCard(id);
        }
        this.selectPOI(index, id);
    }

    showViewOptions = () => {
        // Mapbox.StyleURL.Satellite : Mapbox.StyleURL.Street
        this.setState({ showMapOptions: true });
    };

    renderMapOptions = () => (
        <BottomSheet
            visible={this.state.showMapOptions}
            transparent
            onPressOutside={() => {
                this.setState({ showMapOptions: false });
            }}
            onDismiss={() => {
                this.setState({ showMapOptions: false });
            }}
        >
            <View style={{ flex: 1 }}>
                <CheckBox
                    title="Satellite"
                    onPress={() => {
                        this.setState({
                            ViewType: Mapbox.StyleURL.Satellite,
                            showMapOptions: false
                        });
                    }}
                    checked={this.state.ViewType === Mapbox.StyleURL.Satellite}
                    containerStyle={{
                        backgroundColor: 'transparent',
                        borderWidth: 0,
                        marginLeft: 16,
                        paddingVertical: 4
                    }}
                    size={20}
                    iconType="ionicon"
                    checkedIcon="ios-radio-button-on"
                    uncheckedIcon="ios-radio-button-off"
                    checkedColor={GlobalColors.primaryButtonColor}
                    uncheckedColor={GlobalColors.grey}
                    activeOpacity={1}
                />
                <CheckBox
                    title="Vector"
                    onPress={() => {
                        this.setState({
                            ViewType: Mapbox.StyleURL.Street,
                            showMapOptions: false
                        });
                    }}
                    checked={this.state.ViewType === Mapbox.StyleURL.Street}
                    containerStyle={{
                        backgroundColor: 'transparent',
                        borderWidth: 0,
                        marginLeft: 16,
                        paddingVertical: 4
                    }}
                    size={20}
                    iconType="ionicon"
                    checkedIcon="ios-radio-button-on"
                    uncheckedIcon="ios-radio-button-off"
                    checkedColor={GlobalColors.primaryButtonColor}
                    uncheckedColor={GlobalColors.grey}
                    activeOpacity={1}
                />
                <View style={{ flexGrow: 1, paddingHorizontal: 25 }}>
                    <TouchableOpacity
                        style={{ height: 50, justifyContent: 'center' }}
                        onPress={() => {
                            this.setState({ showMapOptions: false });
                        }}
                    >
                        <Text
                            style={{
                                color: GlobalColors.primaryButtonColor,
                                fontSize: 14,
                                fontWeight: AppFonts.BOLD,
                                textAlign: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            Cancel
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </BottomSheet>
    );

    renderDevButtons = () => {
        return (
            <View
                style={{
                    position: 'absolute',
                    flexDirection: 'column',
                    left: 10,
                    bottom: 10,
                    justifyContent: 'space-between'
                }}
            >
                {__DEV__ && (
                    <TouchableOpacity
                        style={[styles.zoomInButton, { marginTop: 12 }]}
                        onPress={this.zoomIn.bind(this)}
                    >
                        {Icons.zoomIn()}
                    </TouchableOpacity>
                )}
                {__DEV__ && (
                    <TouchableOpacity
                        style={styles.zoomOutButton}
                        onPress={this.zoomOut.bind(this)}
                    >
                        {Icons.zoomOut()}
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    renderButtons() {
        return (
            <View
                style={{
                    position: 'absolute',
                    flexDirection: 'row',
                    left: 10,
                    right: 10,
                    top: 10,
                    justifyContent: 'space-between'
                }}
            >
                <View>{this.props.renderLeftIcons?.()}</View>
                <View
                    style={{
                        flexDirection: 'row'
                    }}
                >
                    {this.props.renderRightIcons?.()}
                    <TouchableOpacity
                        style={styles.locateButton}
                        onPress={this.showViewOptions}
                    >
                        <Image
                            style={{ resizeMode: 'contain' }}
                            source={images.map_settings}
                        />
                    </TouchableOpacity>
                </View>
            </View>
        );
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
        seconds %= 60;
        let hour = Math.floor(minute / 60);
        minute %= 60;
        hour %= 24;
        const trackerValue = `${JSON.stringify(
            (travelledTime * 100) / fullTime
        )}%`;

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
        // this.props.TEST()
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
            locateUserButtonIcon: images.map_locate_blue
        });
    }

    onUserTrackingModeChange(e) {
        const { followUserMode, followUserLocation } = e.nativeEvent.payload;
        this.setState({
            followUserLocation,
            currentTrackingMode: followUserMode || UserTrackingMode.NONE,
            locateUserButtonIcon: followUserLocation
                ? images.map_locate_blue
                : images.map_locate_grey
        });
    }

    renderMap() {
        return (
            <Mapbox.MapView
                ref={(map) => {
                    this.map = map;
                }}
                styleURL={this.state.ViewType}
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
                    animationMode="flyTo"
                    animationDuration={2000}
                />
                {this.renderElements()}
                {this.renderPointsOfInterest()}
            </Mapbox.MapView>
        );
    }

    onAction(elementId) {
        const response = {
            type: 'map_response',
            mapId: this.props.mapId,
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
                // this.props.onAction(response);
                message = new Message();
                message.mapResponseMessage(response);
                message.setCreatedBy(this.props.userId);
                this.props.sendMessage(message);
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

    hideChatModal() {
        this.setState({ isModalVisible: false });
    }

    focusOnMarker(id) {
        let foundIndex;
        const foundMarker = _.find(this.state.POI, (poi, index) => {
            foundIndex = index;
            return poi.id === id;
        });
        if (foundMarker) {
            this.flyTo(foundMarker.coordinate, 1500);
            this.selectPOI(foundIndex, id);
            return true;
        }
        return false;
    }

    selectPOI(index, id) {
        console.log('~~~~ selectPOI');
        this.props.onMarkerSelect(id);
        if (this.state.POI && this.state.POI[index]) {
            this.state.POI[index].selected = true;
            if (
                this.lastPOISelected &&
                this.state.POI &&
                this.state.POI[this.lastPOISelected]
            ) {
                this.state.POI[this.lastPOISelected].selected = false;
            }
            this.lastPOISelected = index;
            this.setState({ POI: this.state.POI });
        }
    }

    async flyTo(coordinate, time = 1500, zoom = 15) {
        console.log('~~~~ flyTo', coordinate);
        if (coordinate.latitude == null) coordinate.latitude = 0;
        if (coordinate.longitude == null) coordinate.longitude = 0;
        this.setState({ centerCoordinate: coordinate, zoomLevel: zoom });
    }

    renderNonConversationalContent() {
        return (
            <View style={styles.nonConvContainer}>
                {this.props.nonConversationalContent}
            </View>
        );
    }

    render() {
        return (
            <View style={{ flex: 1, borderRadius: 4, overflow: 'hidden' }}>
                {this.renderMap()}
                {this.renderButtons()}
                {this.renderDevButtons()}
                {this.state.showRouteTracker ? this.renderRouteTracker() : null}
                {this.props.nonConversationalContent}
                {this.props.isWaiting && (
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
                {this.state.showMapOptions && this.renderMapOptions()}
                <ChatNotificationBar botId={this.props.botId} />
            </View>
        );
    }
}
export default MapView;
