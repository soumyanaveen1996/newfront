import { StyleSheet } from 'react-native';
import { GlobalColors } from '../../config/styles';
import { Dimensions } from 'react-native';
export const SCREEN_WIDTH = Dimensions.get('window').width;

export default StyleSheet.create({
    modalBackground: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: 'rgba(0,0,0,0.4)'
    },
    welcomeWrapper: {
        backgroundColor: '#ffffff',
        top: '15%',
        left: (SCREEN_WIDTH - 300) / 2,
        height: 250,
        width: 300,
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
        fontWeight: '200'
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
        top: '3%',
        right: (SCREEN_WIDTH - 300) / 2,
        backgroundColor: '#ffffff',
        height: 165,
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
        alignItems: 'center',
        flex: 1
    },
    skipTutorialButtonText: {
        textAlign: 'center',
        fontSize: 14,
        fontWeight: '200',
        color: 'rgba(0,189,242,1)',
        fontFamily: 'SF Pro Text'
    },
    satelliteCircle: {
        position: 'absolute',
        right: -50,
        top: -5,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#ffffff',
        alignItems: 'center',
        justifyContent: 'center'
    },
    imageSatellite: {
        width: 30,
        height: 30
    },
    triangle: {
        position: 'absolute',
        right: -14,
        top: 4,
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
        transform: [{ rotate: '90deg' }],
        margin: 0,
        marginLeft: -6,
        borderWidth: 0,
        borderColor: 'black'
    },
    tabBarTutorial: {
        position: 'absolute',
        bottom: '10%',
        right: (SCREEN_WIDTH - 300) / 2,
        backgroundColor: '#ffffff',
        height: 165,
        width: 300,
        borderRadius: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    bottomTriangle: {
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
    bottomNavBarTutorial: {
        position: 'absolute',
        height: 60,
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
        textAlign: 'center',
        justifyContent: 'center'
    },
    tabBarTitle: {
        textAlign: 'center',
        fontSize: 12,
        color: 'rgba(74,74,74,0.4)'
    }
});
