import { StyleSheet } from 'react-native';
import GlobalColors from '../../../config/styles';
import Utils from '../../../lib/utils';
import AppFonts from '../../../config/fontConfig';

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
        fontWeight: AppFonts.BOLD,
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
        paddingVertical: 20,
        paddingHorizontal: 28,
        backgroundColor: GlobalColors.white,
        borderBottomWidth: 1,
        borderTopWidth: 1,
        borderColor: GlobalColors.translucentDark,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.08,
        shadowRadius: 4
    },
    bottomLayerText: {
        fontSize: 16,
        color: GlobalColors.black,
        textAlign: 'left',
        marginLeft: 20
    },
    doneButton: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
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
