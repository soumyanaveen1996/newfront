import { StyleSheet } from 'react-native';
import { GlobalColors } from '../../config/styles';
import images from '../../config/images';
import Mapbox from '@mapbox/react-native-mapbox-gl';

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        right: 0,
        left: 0,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'red'
    },
    text: {
        fontSize: 18,
        fontWeight: 'bold',
        fontStyle: 'italic',
        textAlign: 'center',
        color: GlobalColors.accent
    },
    closeButton: {
        position: 'absolute',
        top: 20,
        left: 0,
        width: 45,
        height: 45
    },
    mapView: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0
    },
    callOutContainer: {
        maxWidth: 200,
        backgroundColor: GlobalColors.white,
        borderRadius: 5
    },
    callOutText: {
        color: GlobalColors.accent,
        fontSize: 16
    },

    //Buttons
    buttonsContainer: {
        position: 'absolute',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
        right: 16,
        top: 13
    },
    zoomInButton: {
        width: 45,
        height: 45,
        backgroundColor: GlobalColors.white,
        justifyContent: 'center',
        alignItems: 'center',
        borderTopLeftRadius: 7,
        borderTopRightRadius: 7,
        borderBottomWidth: 1,
        borderColor: GlobalColors.translucentDark,
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.08,
        shadowRadius: 4
    },
    zoomOutButton: {
        width: 45,
        height: 45,
        backgroundColor: GlobalColors.white,
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomLeftRadius: 7,
        borderBottomRightRadius: 7,
        borderTopWidth: 1,
        borderColor: GlobalColors.translucentDark,
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.15,
        shadowRadius: 4
    },
    locateButton: {
        width: 45,
        height: 45,
        backgroundColor: GlobalColors.white,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 16,
        borderRadius: 7,
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.08,
        shadowRadius: 4
    },

    //ROUTE SLIDER
    containerRS: {
        position: 'absolute',
        left: 0,
        top: 13,
        height: 70,
        flexDirection: 'row',
        borderTopRightRadius: 10,
        borderBottomRightRadius: 10,
        overflow: 'hidden'
    },
    containerRSClosed: {
        position: 'absolute',
        left: -270,
        top: 13,
        height: 70,
        flexDirection: 'row',
        borderTopRightRadius: 10,
        borderBottomRightRadius: 10,
        overflow: 'hidden'
    },
    leftContainerRS: {
        width: 270,
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'stretch',
        paddingHorizontal: 17,
        paddingVertical: 7,
        backgroundColor: GlobalColors.grey
    },
    rightContainerRS: {
        width: 45,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: GlobalColors.chatLeftTextColor
    },
    sliderTrackRS: {
        width: '100%',
        height: 3,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: GlobalColors.chatLeftTextColor,
        overflow: 'visible'
    },
    leftTrackRS: {
        height: '100%',
        backgroundColor: GlobalColors.sideButtons
    },
    trackIconRS: {
        width: 16,
        height: 16
    },
    dataContainerRS: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    topTextRS: {
        fontSize: 14,
        fontWeight: 'bold',
        color: GlobalColors.sideButtons
    },
    bottomTextRS: {
        fontSize: 12,
        fontWeight: '100',
        color: GlobalColors.white
    },

    //CONTEXT SLIDESHOW
    CSContainer: {
        position: 'absolute',
        left: 0,
        bottom: 0,
        right: 0,
        paddingBottom: 10,
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        backgroundColor: GlobalColors.transparent
    },
    blurContent: {
        top: 0,
        bottom: 0,
        right: 0,
        left: 0,
        position: 'absolute'
    },
    smallCard: {
        height: 130,
        width: 130,
        overflow: 'hidden',
        marginHorizontal: 10,
        paddingVertical: 20,
        paddingHorizontal: 15,
        borderRadius: 10,
        borderColor: 'gray',
        borderWidth: 0.1,
        backgroundColor: GlobalColors.white
    },
    bigCard: {
        height: 200,
        width: 280,
        overflow: 'hidden',
        marginHorizontal: 10,
        borderRadius: 12,
        borderColor: 'gray',
        borderWidth: 0.1,
        backgroundColor: GlobalColors.white
    },
    verticalContainer: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-between'
    },
    horizontalContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        overflow: 'hidden'
    },
    smallCardTitle: {
        fontSize: 16,
        textAlign: 'center',
        color: GlobalColors.headerBlack
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: GlobalColors.sideButtons
    },
    description: {
        fontSize: 16,
        fontWeight: '200',
        color: GlobalColors.headerBlack
    },
    footer: {
        fontSize: 14,
        fontWeight: '100',
        color: GlobalColors.translucentDark
    },
    seeMore: {
        fontSize: 16,
        fontWeight: '100',
        color: GlobalColors.sideButtons
    },

    //MODAL
    modal: {
        width: '90%',
        height: '65%',
        flexDirection: 'column',
        alignItems: 'stretch',
        paddingHorizontal: 20,
        paddingVertical: 40,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        borderRadius: 10,
        borderWidth: 0.2,
        backgroundColor: GlobalColors.white
    },
    fieldModal: {
        width: '100%',
        paddingVertical: 18,
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderColor: GlobalColors.disabledGray
    },
    fieldLabelModal: {
        width: '45%',
        fontSize: 17,
        color: GlobalColors.headerBlack
    },
    fieldText: {
        flex: 1,
        fontSize: 17,
        fontWeight: '100',
        textAlign: 'right',
        color: GlobalColors.headerBlack
    },
    dataTitle: {
        textAlign: 'center',
        fontSize: 19,
        marginBottom: 13,
        color: GlobalColors.sideButtons,
        textTransform: 'uppercase'
    }
});

const layerStyles = Mapbox.StyleSheet.create({
    //POLYLINES for routes and great circle routes
    route: {
        lineCap: 'round',
        lineWidth: 6,
        lineJoin: 'round',
        lineColor: GlobalColors.sideButtons,
        lineBlur: 1
    },
    //Auto-generated MARKERS
    startingPoint: {
        iconAllowOverlap: true,
        iconIgnorePlacement: true,
        iconImage: images.map_starting_point
    },
    arrivalPoint: {
        iconAllowOverlap: true,
        iconIgnorePlacement: true,
        iconImage: images.map_arrival_point
    },
    movingVessel: {
        iconAllowOverlap: true,
        iconImage: images.maps_maritime_icon,
        iconRotationAlignment: 'map',
        iconRotate: Mapbox.StyleSheet.identity('rotation')
    },
    //MARKERS
    circleMarker: {
        iconAllowOverlap: true,
        iconIgnorePlacement: true,
        iconImage: images.current_location_inactive,
        iconSize: 1.5
    },
    poiMarker: {
        iconAllowOverlap: true,
        iconIgnorePlacement: true,
        iconImage: images.map_pin,
        iconSize: 1.5
    },
    aircraftMarker: {
        iconAllowOverlap: true,
        iconIgnorePlacement: true,
        iconImage: images.moving_maps_plane,
        iconSize: 1.5,
        iconRotationAlignment: 'map',
        iconRotate: Mapbox.StyleSheet.identity('rotation')
    },
    arrowMarker: {
        iconAllowOverlap: true,
        iconIgnorePlacement: true,
        iconImage: images.maps_maritime_icon,
        iconSize: 1.5,
        iconRotationAlignment: 'map',
        iconRotate: Mapbox.StyleSheet.identity('rotation')
    }
});

export { styles, layerStyles };
