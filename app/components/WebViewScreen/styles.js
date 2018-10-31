import { StyleSheet } from 'react-native';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp
} from 'react-native-responsive-screen';

export default StyleSheet.create({
    closeButton: {
        height: hp('7%'),
        width: wp('10%'),
        paddingTop: hp('2%'),
        paddingLeft: wp('1%')
    },
    closeImg: {
        height: hp('3%'),
        width: wp('10%'),
        paddingTop: hp('5%')
    }
});
