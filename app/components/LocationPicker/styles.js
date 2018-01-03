import { StyleSheet } from 'react-native';
import { GlobalColors } from '../../config/styles';

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        right: 0,
        left: 0,
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontSize: 18,
        fontWeight: 'bold',
        fontStyle: 'italic',
        textAlign: 'center',
        color: GlobalColors.accent,
    },
    closeButton: {
        position: 'absolute',
        top: 10,
        left: 0,
        width: 45,
        height: 45,
    },
    mapView: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
    },
    bottomLayer: {
        position: 'absolute',
        padding: 10,
        bottom: 5,
        backgroundColor: GlobalColors.accent,
        borderRadius: 5
    },
    bottomLayerText: {
        fontSize: 14,
        color: GlobalColors.white,
        textAlign: 'center',
    },
    doneButton: {
        position: 'absolute',
        width: 70,
        height: 30,
        right: 5,
        top: 10,
        backgroundColor: GlobalColors.transparent,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'flex-end',
    },
    doneButtonText: {
        color: GlobalColors.accent,
        fontSize: 20,
        position: 'relative',
        textAlign: 'right',
    }
});

export default styles;
