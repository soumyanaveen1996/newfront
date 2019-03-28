import { StyleSheet, Platform } from 'react-native';
import { GlobalColors } from '../../config/styles';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp
} from 'react-native-responsive-screen';

export default StyleSheet.create({
    container: {
        width: wp('30%'),
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'center',
        justifyContent: 'center'
    },
    text: {
        textAlign: 'center',
        fontSize: 12,
        marginHorizontal: wp('2.5%'),
        color: 'aliceblue'
    }
});
