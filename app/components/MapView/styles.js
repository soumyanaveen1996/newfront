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

    //CONTEXT SLIDESHOW
    CSContainer: {
        position: 'absolute',
        left: 0,
        bottom: 0,
        right: 0,
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'stretch'
    },
    smallCard: {
        height: 130,
        width: 130,
        overflow: 'hidden',
        marginHorizontal: 10,
        paddingVertical: 20,
        paddingHorizontal: 15,
        borderRadius: 10,
        backgroundColor: GlobalColors.white
    },
    bigCard: {
        height: 200,
        width: 280,
        overflow: 'hidden',
        marginHorizontal: 10,
        borderRadius: 12,
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
        fontSize: 17,
        fontWeight: '100',
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
    route: {
        lineCap: 'round',
        lineWidth: 6,
        lineJoin: 'round',
        lineColor: GlobalColors.sideButtons,
        lineBlur: 1
    },
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
    vesselPosition: {
        iconAllowOverlap: true,
        iconIgnorePlacement: true,
        iconImage: images.current_location_inactive,
        iconSize: 1.5
    },
    sharedLocation: {
        iconAllowOverlap: true,
        iconIgnorePlacement: true,
        iconImage: images.map_pin,
        iconSize: 1.5
    }
});

export { styles, layerStyles };
