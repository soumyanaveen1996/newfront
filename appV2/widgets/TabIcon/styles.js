import { StyleSheet, Platform } from 'react-native';
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
        marginHorizontal: 4,
        color: 'aliceblue',
        flexWrap: 'wrap'
    }
});
