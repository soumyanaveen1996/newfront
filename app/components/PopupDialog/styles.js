import { StyleSheet, Dimensions } from 'react-native';
import { GlobalColors } from '../../config/styles';

const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = Dimensions.get('window');
// The popup widget will be created with the following default size.
// The 30 and 150, were chosen approximately from the design provided.
const DEFAULT_WIDGET_SIZE = {
    width: DEVICE_WIDTH - 30,
    height: DEVICE_HEIGHT - 150
};

const Styles = StyleSheet.create({
    fullScreenMode: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: GlobalColors.white,
        borderRadius: 5,
        flexDirection: 'column',
        overflow: 'hidden'
    },
    widget: {
        backgroundColor: GlobalColors.white,
        borderRadius: 5,
        flexDirection: 'column',
        overflow: 'hidden'
    },
    headerContainer: {
        height: 58,
        flexDirection: 'row'
    },
    closeButton: {
        height: 24,
        width: 24
    },
    headerCloseButton: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: 40,
        height: 40,
        padding: 8,
        marginTop: 12,
        marginLeft: 5
    },
    headerTitleContainer: {
        flex: 1,
        paddingLeft: 58,
        paddingRight: 58,
        justifyContent: 'center',
        alignItems: 'center'
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: 'bold',
        color: 'rgb(181,186,201)'
    }
});

export function dialogStyle(
    fullScreenMode = false,
    width = DEFAULT_WIDGET_SIZE.width,
    height = DEFAULT_WIDGET_SIZE.height
) {
    if (fullScreenMode) {
        return Styles.fullScreenMode;
    } else {
        return [Styles.widget, { width: width, height: height }];
    }
}

export default Styles;
