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
    LayoutAnimation
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
import ContextSlideshow from './ContextSlideshow';
import ChatModal from '../ChatBotScreen/ChatModal';

Mapbox.setAccessToken(
    'pk.eyJ1IjoiZ2FjaWx1IiwiYSI6ImNqcHh0azRhdTFjbXQzeW8wcW5vdXhlMzkifQ.qPfpVkrWbk-GSBY3uc6z3A'
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
        this.state = {
            userTrackingMode:
                Platform.OS === 'android' ? Mapbox.UserTrackingModes.Follow : 0,
            locateUserButtonIcon: Icons.userPosition(),
            slideshowOpen: false,
            slideshowContext: this.props.mapData.options
                ? this.props.mapData.options.cards
                : [],
            chatModalContent: {},
            isModalVisible: false
        };
        const vesselsPositions = _.map(this.props.mapData.markers, marker => {
            const position = [
                marker.coordinate.longitude,
                marker.coordinate.latitude
            ];
            return position;
        });
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
        this.GEOJson = {
            type: 'FeatureCollection',
            features: [
                {
                    type: 'Feature',
                    properties: { type: 'vesselPosition' },
                    geometry: {
                        type: 'MultiPoint',
                        coordinates: vesselsPositions
                    }
                },
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
            ].concat(movingVessels)
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

    renderElements() {
        return (
            <Mapbox.ShapeSource id="routeSource" shape={this.GEOJson}>
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
                {/* STATIC POSITIONS OF VESSELS or SHARED LOCATIONS*/}
                <Mapbox.SymbolLayer
                    id="vesselsPositions"
                    filter={['==', 'type', 'vesselPosition']}
                    style={
                        this.props.isSharedLocation
                            ? layerStyles.sharedLocation
                            : layerStyles.vesselPosition
                    }
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

    closeAndOpenSlideshow() {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
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
            <SafeAreaView style={{ flex: 1 }}>
                {this.renderMap()}
                {this.renderButtons()}
                <ContextSlideshow
                    contentData={this.state.slideshowContext || []}
                    isOpen={this.state.slideshowOpen}
                    closeAndOpenSlideshow={this.closeAndOpenSlideshow.bind(
                        this
                    )}
                    onDataCardSelected={this.openModalWithContent.bind(this)}
                />
                {this.renderChatModal()}
            </SafeAreaView>
        );
    }
}
