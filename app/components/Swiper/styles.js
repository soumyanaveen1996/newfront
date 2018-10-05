import { StyleSheet } from 'react-native';
import { GlobalColors } from '../../config/styles';
import { Platform } from 'react-native';
import { SCREEN_HEIGHT } from './config';
import { SCREEN_WIDTH } from './config';

export default StyleSheet.create({
    wrapper: {
        backgroundColor: '#fff'
    },
    slide: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#9DD6EB'
    },
    textBox: {
        paddingTop: 25,
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT - 460,
        backgroundColor: 'rgba(255,255,255,1)',
        alignItems: 'center'
    },
    innerBox: {
        width: 300,
        alignItems: 'center',
        justifyContent: 'center'
    },
    headerText: {
        textAlign: 'center',
        color: '#070707',
        fontSize: 30,
        fontWeight: 'bold',
        color: 'rgba(74,74,74,1)',
        fontSize: 30,
        fontWeight: '300',
        letterSpacing: 1,
        lineHeight: 36,
        textAlign: 'center',
        marginBottom: 24
    },
    text: {
        textAlign: 'center',
        color: 'rgba(102,102,102,1)',
        fontSize: 16,
        fontWeight: '300',
        letterSpacing: 1,
        lineHeight: 20,
        textAlign: 'center'
    },
    slider: {
        width: SCREEN_WIDTH,
        flex: 1
    },
    login: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT - 80
    },
    bottomBox: {
        height: 10,
        backgroundColor: '#fff',
        borderTopColor: 'rgba(91,91,91,0.2)',
        borderTopWidth: 1,
        padding: 10
    },
    goToLine: {
        marginTop: 20,
        height: 20,
        color: 'rgba(0,189,242,1)',
        fontSize: 14,
        letterSpacing: 1,
        lineHeight: 20,
        fontWeight: 'bold',
        justifyContent: 'center',
        alignItems: 'center'
    },
    bolder: {
        fontWeight: '900',
        fontSize: 15
    }
});
