import { StyleSheet } from 'react-native';
import { GlobalColors } from '../../config/styles';
import { Platform } from 'react-native';
import { SCREEN_HEIGHT } from './config';
import { SCREEN_WIDTH } from './config';

export default StyleSheet.create({
    wrapper: {
        backgroundColor: '#fff'
    },
    dotStyle: {
        backgroundColor: 'rgba(222,222,222,1)',
        width: 5,
        height: 5,
        borderRadius: 4,
        marginLeft: 3,
        marginRight: 3,
        marginTop: 3,
        marginBottom: 3
    },
    activeDotStyle: {
        backgroundColor: 'rgba(222,222,222,1)',
        width: 8,
        height: 8,
        borderRadius: 4,
        marginLeft: 3,
        marginRight: 3,
        marginTop: 3,
        marginBottom: 3
    },
    paginationStyles: Platform.select({
        ios: {
            bottom: 30
        },
        android: {
            bottom: 15
        }
    }),
    innerBox: {
        width: 300,
        alignItems: 'center',
        justifyContent: 'center'
    },
    headerText: {
        textAlign: 'center',
        color: 'rgba(74,74,74,1)',
        fontSize: 30,
        fontWeight: '300',
        letterSpacing: 1,
        lineHeight: 36,
        marginBottom: 24
    },
    text: {
        textAlign: 'center',
        color: 'rgba(102,102,102,1)',
        fontSize: 18,
        fontWeight: '300',
        letterSpacing: 1,
        lineHeight: 22
    },
    slide: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff'
    },
    sliderImageContainer: {
        flex: 3,
        justifyContent: 'center',
        backgroundColor: '#e7e7e7'
    },
    slider: {
        width: SCREEN_WIDTH,
        flex: 1
    },

    textBox: {
        paddingTop: 25,
        width: SCREEN_WIDTH,
        flex: 2,
        backgroundColor: 'rgba(255,255,255,1)',
        alignItems: 'center'
    },
    login: {
        flex: 1
        // width: SCREEN_WIDTH,
        // height: SCREEN_HEIGHT - 80
    },
    bottomBox: Platform.select({
        ios: {
            height: 85,
            backgroundColor: '#fff',
            borderTopColor: 'rgba(91,91,91,0.2)',
            borderTopWidth: 1,
            padding: 5
        },
        android: {
            height: 65,
            backgroundColor: '#fff',
            borderTopColor: 'rgba(91,91,91,0.2)',
            borderTopWidth: 1
        }
    }),
    goToLine: Platform.select({
        ios: {
            marginTop: 5,
            height: 20,
            color: 'rgba(0,189,242,1)',
            fontSize: 14,
            letterSpacing: 1,
            lineHeight: 20,
            fontWeight: 'bold',
            justifyContent: 'center',
            alignItems: 'center'
        },
        android: {
            marginTop: 5,
            width: '100%',
            textAlign: 'center',
            color: 'rgba(0,189,242,1)',
            fontSize: 14,
            letterSpacing: 1,
            lineHeight: 20,
            fontWeight: 'bold',
            justifyContent: 'center',
            alignItems: 'center'
        }
    }),
    bolder: {
        fontWeight: '900',
        fontSize: 15
    },
    arrow: Platform.select({
        android: {
            width: 35,
            height: 30
        }
    })
});
