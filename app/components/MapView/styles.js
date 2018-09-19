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
    }
});

export default styles;
