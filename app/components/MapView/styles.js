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
    }
});

export { styles, layerStyles };
