import { StyleSheet } from 'react-native';
import { GlobalColors } from '../../config/styles';
import Config from './config.js';

const stylesheet = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        width: 160,
        height: 40,
        marginHorizontal: 15,
        paddingHorizontal: 5,
    },
    button: {
        marginRight: 10,
    },
    loadingIndicator: {
        width: 30,
        height: 30,
        marginRight: 10,
    },
    progress: {
        height: Config.CIRCLE_SIZE,
        flex: 1,
    },
    line: {
        height: 2,
        backgroundColor: GlobalColors.white,
        width: Config.BAR_WIDTH,
        position: 'absolute',
        top: Config.CIRCLE_SIZE / 2 - 1,
        left: Config.CIRCLE_SIZE / 2,
    },
    circle: {
        position: 'absolute',
    }
});




export default stylesheet;
