import { StyleSheet, Platform } from 'react-native';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp
} from 'react-native-responsive-screen';

const Styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        backgroundColor: 'rgba(255,255,255,1)',
        flex: 1,
        flexDirection: 'column'
    },

    imageBack: {
        width: 15,
        height: 15
    },

    imageAvatar: {
        height: hp('10%'),
        width: hp('10%'),
        borderRadius: hp('10%') / 2
    },
    topBar: {
        display: 'flex',
        height: hp('10%'),
        ...Platform.select({
            android: {
                marginTop: 10
            },
            ios: {
                marginTop: 54
            }
        })
    },
    callDetails: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        height: hp('50%')
    },

    createContact: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: hp('20%')
    }
});

export default Styles;
