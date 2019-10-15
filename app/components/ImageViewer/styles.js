import { StyleSheet } from 'react-native';
import { GlobalColors } from '../../config/styles';

const stylesheet = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: GlobalColors.textBlack
    },
    image: {
        flex: 1,
        zIndex: 1
    },
    toolbar: {
        alignItems: 'stretch',
        zIndex: 2
    },
    saveIcon: {
        alignSelf: 'center'
    }
});

export default stylesheet;
