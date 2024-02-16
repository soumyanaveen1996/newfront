import { StyleSheet, Dimensions } from 'react-native';
import GlobalColors from '../../../../config/styles';
const screen = Dimensions.get('screen');

export default StyleSheet.create({
    container: {
        // width: '100%',
        // paddingHorizontal: 25,
        // marginVertical: 12
    },
    message: {
        width: screen.width - 80,
        height: parseInt((screen.width - 66) * (61 / 100)),
        backgroundColor: GlobalColors.white
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain'
    }
});
