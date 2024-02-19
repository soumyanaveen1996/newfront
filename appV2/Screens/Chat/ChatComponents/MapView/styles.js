import { StyleSheet } from 'react-native';
import GlobalColors from '../../../../config/styles';
import images from '../../../../config/images';
import AppFonts from '../../../../config/fontConfig';

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
        fontWeight: AppFonts.BOLD,
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
    markerViewItemContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        maxWidth: 24
    },
    markerViewItem: {
        alignItems: 'center'
    },

    // Buttons
    buttonsContainer: {
        position: 'absolute',
        flexDirection: 'row',
        justifyContent: 'space-between',
        left: 10,
        right: 10,
        top: 10,
        backgroundColor: 'red'
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
        width: 42,
        height: 40,
        marginHorizontal: 2
    },

    // ROUTE SLIDER
    containerRS: {
        position: 'absolute',
        left: 0,
        top: 13,
        height: 110,
        flexDirection: 'row',
        alignItems: 'center',
        overflow: 'hidden'
    },
    containerRSClosed: {
        position: 'absolute',
        left: -260,
        top: 13,
        height: 110,
        flexDirection: 'row',
        alignItems: 'center',
        borderTopRightRadius: 10,
        borderBottomRightRadius: 10,
        overflow: 'hidden'
    },
    leftContainerRS: {
        width: 260,
        height: 110,
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'stretch',
        paddingHorizontal: 17,
        paddingVertical: 7,
        borderTopRightRadius: 10,
        borderBottomRightRadius: 10,
        backgroundColor: GlobalColors.grey
    },
    rightContainerRS: {
        width: 40,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        borderTopRightRadius: 10,
        borderBottomRightRadius: 10,
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
    separatorRS: {
        width: '100%',
        height: 1,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: GlobalColors.chatLeftTextColor,
        overflow: 'visible'
    },
    leftTrackRS: {
        height: '100%',
        backgroundColor: GlobalColors.primaryButtonColor
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
        fontWeight: AppFonts.BOLD,
        color: GlobalColors.primaryButtonColor
    },
    bottomTextRS: {
        fontSize: 12,
        fontWeight: AppFonts.THIN,
        color: GlobalColors.white
    },

    // CONTEXT SLIDESHOW
    CSContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: 280,
        // width: '100%',
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
        backgroundColor: GlobalColors.appBackground
    },
    bigCard: {
        height: 200,
        width: 280,
        overflow: 'hidden',
        marginHorizontal: 10,
        borderRadius: 12,
        borderColor: 'gray',
        borderWidth: 0.1,
        backgroundColor: GlobalColors.appBackground
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
        fontWeight: AppFonts.BOLD,
        color: GlobalColors.primaryButtonColor
    },
    description: {
        fontSize: 16,
        fontWeight: AppFonts.THIN,
        color: GlobalColors.headerBlack
    },
    footer: {
        fontSize: 14,
        fontWeight: AppFonts.THIN,
        color: GlobalColors.translucentDark
    },
    seeMore: {
        fontSize: 16,
        fontWeight: AppFonts.THIN,
        color: GlobalColors.primaryButtonColor
    },

    // MODAL
    modal: {
        width: '90%',
        height: '75%',
        flexDirection: 'column',
        alignItems: 'stretch',
        paddingBottom: 40,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        borderRadius: 10,
        borderWidth: 0.2,
        backgroundColor: GlobalColors.appBackground,
        overflow: 'hidden'
    },
    imageModal: {
        height: 180
    },
    fieldsModal: {
        alignItems: 'flex-start',
        paddingHorizontal: 20
    },
    titleModal: {
        textAlign: 'left',
        fontSize: 20,
        marginTop: 40,
        marginBottom: 15,
        fontWeight: AppFonts.NORMAL,
        color: GlobalColors.textBlack
    },
    descriptionModal: {
        marginVertical: 15,
        fontSize: 16,
        fontWeight: AppFonts.THIN,
        textAlign: 'justify',
        color: GlobalColors.darkGray
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
        fontWeight: AppFonts.THIN,
        textAlign: 'right',
        color: GlobalColors.headerBlack
    },
    dataTitle: {
        textAlign: 'center',
        fontSize: 19,
        marginBottom: 13,
        color: GlobalColors.primaryButtonColor,
        textTransform: 'uppercase'
    },
    action: {
        marginHorizontal: 18,
        marginTop: 7,
        fontSize: 16,
        fontWeight: AppFonts.THIN,
        textAlign: 'center',
        color: GlobalColors.primaryButtonColor
    }
});

const layerStyles = {
    // POLYLINES for routes and great circle routes
    route: {
        lineCap: 'round',
        lineWidth: 3,
        // lineJoin: 'round',
        // lineColor: GlobalColors.primaryButtonColor,
        lineBlur: 1,
        lineColor: ['get', 'color']
    },
    // MARKERS
    blackCircleMarker: {
        iconAllowOverlap: true,
        iconIgnorePlacement: true,
        iconImage: images.current_location_inactive,
        iconSize: 1.5
    },
    whiteCircleMarker: {
        iconAllowOverlap: true,
        iconIgnorePlacement: true,
        iconImage: images.map_arrival_point,
        iconSize: 1.5
    },
    grayCircleMarker: {
        iconAllowOverlap: true,
        iconIgnorePlacement: true,
        iconImage: images.map_starting_point,
        iconSize: 1.5
    },
    poiMarker: {
        iconAllowOverlap: true,
        iconIgnorePlacement: true,
        iconImage: images.map_regularpin_normal,
        iconSize: 1.5
    },
    poiMarker_selected: {
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
        iconRotate: ['get', 'rotation']
    },
    arrowMarker: {
        iconAllowOverlap: true,
        iconIgnorePlacement: true,
        iconImage: images.maps_maritime_icon,
        iconSize: 1.0,
        iconRotationAlignment: 'map',
        iconRotate: ['get', 'rotation']
    },

    // NON CONVERSATIONAL
    nonConvContainer: {
        // position: 'absolute',
        // left: 0,
        // right: 0,
        height: 280,
        width: '100%',
        paddingBottom: 10,
        flexDirection: 'column',
        justifyContent: 'flex-end',
        alignItems: 'center',
        backgroundColor: GlobalColors.transparent
    }
};

export { styles, layerStyles };