import { StyleSheet } from 'react-native';
import { GlobalColors } from '../../config/styles';

export default StyleSheet.create({
    container: {
        width: '100%',
        paddingHorizontal: 25,
        marginVertical: 12
    },
    message: {
        width: '70%',
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        backgroundColor: GlobalColors.white
    },
    image: {
        width: '98%',
        height: '98%',
        borderRadius: 20
    }
});
