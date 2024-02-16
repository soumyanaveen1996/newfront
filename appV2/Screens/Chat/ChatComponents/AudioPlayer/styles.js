import { Dimensions, StyleSheet } from 'react-native';
import GlobalColors from '../../../../config/styles';
import Config from './config.js';

const stylesheet = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        width: Dimensions.get('screen').width - 80,
        height: 52,
        // marginHorizontal: 15,
        paddingHorizontal: 12,
        backgroundColor: 'rgb(99,141,255)',
        borderRadius: 6,
        paddingVertical: 6
    },
    containerRecived: {
        flexDirection: 'row',
        alignItems: 'center',
        width: Dimensions.get('screen').width - 80,
        height: 52,
        // marginHorizontal: 15,
        paddingHorizontal: 12,
        backgroundColor: 'rgb(237,241,247)',

        borderRadius: 6,
        paddingVertical: 6
    },
    button: {
        marginRight: 10,
        borderRadius: 20
    },
    loadingIndicator: {
        width: 30,
        height: 30,
        marginRight: 10
    },
    progress: {
        height: Config.CIRCLE_SIZE,
        flex: 1
    },
    line: {
        height: 2,
        opacity: 0.3,
        backgroundColor: GlobalColors.grey,
        width: Config.BAR_WIDTH,
        position: 'absolute',
        top: Config.CIRCLE_SIZE / 2 - 1,
        left: Config.CIRCLE_SIZE / 2
    },
    circle: {
        position: 'absolute'
    }
});

export default stylesheet;
