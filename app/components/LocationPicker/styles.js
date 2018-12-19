import { StyleSheet } from 'react-native';
import { GlobalColors } from '../../config/styles';
import Utils from '../../lib/utils';
import Mapbox from '@mapbox/react-native-mapbox-gl';

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        right: 0,
        left: 0,
        alignItems: 'center',
        justifyContent: 'center'
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
        top: Utils.isiPhoneX() ? 30 : 10,
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
    bottomLayer: {
        padding: 10,
        bottom: 5,
        backgroundColor: GlobalColors.accent,
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center'
    },
    bottomLayerText: {
        fontSize: 14,
        color: GlobalColors.white,
        textAlign: 'center'
    },
    doneButton: {
        position: 'absolute',
        width: 140,
        height: 60,
        backgroundColor: GlobalColors.sideButtons,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        bottom: 60,
        alignSelf: 'center'
    },
    doneButtonText: {
        color: GlobalColors.white,
        fontSize: 20,
        textAlign: 'center'
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

export default styles;
