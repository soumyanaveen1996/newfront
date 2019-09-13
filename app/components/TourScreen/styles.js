import { StyleSheet, Platform } from 'react-native';
import { GlobalColors } from '../../config/styles';
import { Dimensions } from 'react-native';
export const SCREEN_WIDTH = Dimensions.get('window').width;
export const SCREEN_HEIGHT = Dimensions.get('window').height;
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp
} from 'react-native-responsive-screen';

export default StyleSheet.create({
    modalBackground: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: 'rgba(0,0,0,0.4)'
    },
    welcomeWrapper: {
        backgroundColor: '#ffffff',
        top: '15%',
        left: '10%',
        height: 300,
        width: wp('80%'),
        borderRadius: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    topContainer: {
        display: 'flex',
        flex: 5,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'space-around',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(244,244,244,1)'
    },
    readyContainer: {
        display: 'flex',
        flex: 5,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'space-around'
    },
    welcomeHeader: {
        color: GlobalColors.chatLeftTextColor,
        fontFamily: 'SF Pro Text',
        fontSize: 28,
        letterSpacing: 1,
        paddingTop: 10,
        marginTop: 10,
        textAlign: 'center'
    },
    welcomeSubHeader: {
        color: 'rgba(102, 102, 102, 1)',
        fontFamily: 'SF Pro Text',
        fontSize: 16,
        padding: 5,
        textAlign: 'center'
    },
    buttonContainer: {
        height: 40,
        width: 260,
        backgroundColor: 'rgba(0,189,242,1)',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center'
    },
    buttonText: {
        color: '#fff',
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '300'
    },

    bottomContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    skipButtonContainer: {
        height: 20,
        width: 250
    },
    skipButtonText: {
        textAlign: 'center',
        fontSize: 14,
        fontWeight: '200',
        color: 'rgba(153, 153, 153, 1)',
        fontFamily: 'SF Pro Text'
    },
    networkTutorial: {
        position: 'absolute',
        top: '1.5%',
        left: '15%',
        backgroundColor: '#ffffff',
        height: 170,
        width: 300,
        borderRadius: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    dotSider: {
        alignItems: 'center'
    },
    innerWidth: {
        width: 35,
        height: 10,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    topTutorialContainer: {
        display: 'flex',
        flex: 2.5,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'space-around',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(244,244,244,1)'
    },
    topTutorialContainerForBotTab: Platform.select({
        ios: {
            display: 'flex',
            flex: 2.5,
            width: '100%',
            alignItems: 'center',
            justifyContent: 'space-around',
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(244,244,244,1)'
        },
        android: {
            top: 10,
            display: 'flex',
            flex: 2.5,
            width: '100%',
            alignItems: 'center',
            justifyContent: 'space-around',
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(244,244,244,1)'
        }
    }),
    bottomTutorialContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row'
    },
    skipTotorialContainer: {
        alignItems: 'center',
        flex: 1
    },
    nextTutorialContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: hp('5%'),
        flex: 1
    },
    tutorialArrow: {
        marginLeft: wp('3%'),
        marginTop: 1
    },
    skipTutorialButtonText: {
        textAlign: 'center',
        fontSize: 14,
        fontWeight: '200',
        color: 'rgba(0,189,242,1)',
        fontFamily: 'SF Pro Text'
    },
    satelliteCircle: Platform.select({
        ios: {
            position: 'absolute',
            left: -48,
            top: -8,
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: '#ffffff',
            alignItems: 'center',
            justifyContent: 'center'
        },
        android: {
            position: 'absolute',
            left: -48,
            top: -4,
            width: 35,
            height: 35,
            borderRadius: 20,
            backgroundColor: '#ffffff',
            alignItems: 'center',
            justifyContent: 'center'
        }
    }),

    imageSatellite: {
        width: 35,
        height: 35,
        resizeMode: 'contain'
    },
    triangle: Platform.select({
        ios: {
            position: 'absolute',
            left: -10,
            top: 6,
            width: 0,
            height: 0,
            backgroundColor: 'transparent',
            borderStyle: 'solid',
            borderLeftWidth: 7,
            borderRightWidth: 7,
            borderBottomWidth: 20,
            borderLeftColor: 'transparent',
            borderRightColor: 'transparent',
            borderBottomColor: '#fff',
            transform: [{ rotate: '-90deg' }],
            margin: 0,
            marginLeft: -6,
            borderWidth: 0,
            borderColor: 'black'
        },
        android: {
            position: 'absolute',
            left: -6,
            top: 2,
            width: 0,
            height: 0,
            backgroundColor: 'transparent',
            borderStyle: 'solid',
            borderLeftWidth: 14,
            borderRightWidth: 14,
            borderBottomWidth: 25,
            borderLeftColor: 'transparent',
            borderRightColor: 'transparent',
            borderBottomColor: '#fff',
            transform: [{ rotate: '30deg' }],
            margin: 0,
            borderColor: 'transparent'
        }
    }),
    tabBarTutorial: {
        backgroundColor: '#ffffff',
        height: 165,
        width: 300,
        borderRadius: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 11
    },
    bottomTriangle: Platform.select({
        ios: {
            position: 'absolute',
            bottom: -17,
            width: 0,
            height: 0,
            backgroundColor: 'transparent',
            borderStyle: 'solid',
            borderLeftWidth: 7,
            borderRightWidth: 7,
            borderBottomWidth: 20,
            borderLeftColor: 'transparent',
            borderRightColor: 'transparent',
            borderBottomColor: '#fff',
            transform: [{ rotate: '180deg' }],
            margin: 0,
            marginLeft: -6,
            borderWidth: 0,
            borderColor: 'black'
        },
        android: {
            position: 'absolute',
            bottom: -12,
            width: 0,
            height: 0,
            backgroundColor: 'transparent',
            borderStyle: 'solid',
            borderLeftWidth: 14,
            borderRightWidth: 14,
            borderBottomWidth: 25,
            borderLeftColor: 'transparent',
            borderRightColor: 'transparent',
            borderBottomColor: '#fff',
            transform: [{ rotate: '180deg' }],
            margin: 0,
            borderColor: 'transparent'
        }
    }),
    bottomNavBarTutorial: {
        position: 'absolute',
        height: 65,
        width: SCREEN_WIDTH,
        backgroundColor: '#fff',
        bottom: -75,
        flexDirection: 'row',
        textAlign: 'center',
        justifyContent: 'center'
    },
    tabsStyleTutorial: {
        width: SCREEN_WIDTH * 0.25,
        alignItems: 'center',
        justifyContent: 'center'
    },
    tabBarIcon: {
        width: 25,
        height: 25,
        alignItems: 'center',
        justifyContent: 'center'
    },
    tabBarTitle: {
        textAlign: 'center',
        fontSize: 12,
        color: 'rgba(74,74,74,0.4)'
    },
    botTutorial: {
        // position: 'absolute',
        // top: '21%',
        // right: (SCREEN_WIDTH - 300) / 2,
        marginTop: 15,
        backgroundColor: '#ffffff',
        height: 165,
        width: 300,
        borderRadius: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    topTriangle: Platform.select({
        ios: {
            position: 'absolute',
            top: -18,
            width: 0,
            height: 0,
            backgroundColor: 'transparent',
            borderStyle: 'solid',
            borderLeftWidth: 7,
            borderRightWidth: 7,
            borderBottomWidth: 20,
            borderLeftColor: 'transparent',
            borderRightColor: 'transparent',
            borderBottomColor: '#fff',
            transform: [{ rotate: '0deg' }],
            margin: 0,
            marginLeft: -6,
            borderWidth: 0,
            borderColor: 'black'
        },
        android: {
            position: 'absolute',
            top: -12,
            width: 0,
            height: 0,
            backgroundColor: 'transparent',
            borderStyle: 'solid',
            borderLeftWidth: 14,
            borderRightWidth: 14,
            borderBottomWidth: 25,
            borderLeftColor: 'transparent',
            borderRightColor: 'transparent',
            borderBottomColor: '#fff',
            transform: [{ rotate: '0deg' }],
            margin: 0,
            borderColor: 'transparent'
        }
    }),
    botSreen: {
        // position: 'absolute',
        // top: -(SCREEN_HEIGHT / 8),
        height: 80,
        width: SCREEN_WIDTH,
        backgroundColor: 'rgba(255,255,255,1)',
        display: 'flex',
        flexDirection: 'row',
        paddingHorizontal: 10,
        // paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'space-around'
    },
    image: {},
    textContainer: {
        flex: 1,
        marginLeft: 15
    },
    subTitle: {
        color: 'rgba(153, 153, 153, 1)',
        fontSize: 14,
        fontFamily: 'Roboto',
        fontWeight: '300',
        marginTop: 5,
        marginBottom: 5
    },
    title: {
        color: 'rgba(74, 74, 74, 1)',
        fontFamily: 'SF Pro Text',
        fontSize: 18,
        fontWeight: '300',
        alignSelf: 'center'
    },
    rightContainer: {
        width: 60,
        flexDirection: 'row-reverse',
        alignItems: 'center',
        justifyContent: 'center'
    }
});
