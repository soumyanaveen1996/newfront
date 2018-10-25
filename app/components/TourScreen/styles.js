import { StyleSheet } from 'react-native';
import { GlobalColors } from '../../config/styles';
import { Platform } from 'react-native';

export default StyleSheet.create({
    modalBackground: {
        flex: 1,
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'space-around',
        backgroundColor: 'rgba(0,0,0,0.1)'
    },
    activityIndicatorWrapper: {
        backgroundColor: '#FFFFFF',
        height: 250,
        width: 300,
        borderRadius: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around'
    },
    welcomeHeader: {
        color: GlobalColors.chatLeftTextColor,
        fontFamily: 'SF Pro Text',
        fontSize: 28,
        letterSpacing: 1,
        textAlign: 'center'
    }
});
