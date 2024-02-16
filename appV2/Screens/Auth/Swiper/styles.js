import { StyleSheet, Platform } from 'react-native';
import GlobalColors from '../../../config/styles';

import { SCREEN_HEIGHT, SCREEN_WIDTH } from './config';
import AppFonts from '../../../config/fontConfig';

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
    backgroundImage: {
        height: null,
        paddingTop: 25,
        width: SCREEN_WIDTH,
        flex: 2,
        backgroundColor: 'rgba(255,255,255,1)',
        alignItems: 'center'
    },
    innerBox: {
        marginHorizontal: 48,
        alignItems: 'center',
        justifyContent: 'center'
    },
    headerText: {
        textAlign: 'center',
        color: 'rgba(74,74,74,1)',
        fontSize: 24,
        fontWeight: AppFonts.LIGHT,
        letterSpacing: 1,
        lineHeight: 26,
        marginBottom: 24
    },
    text: Platform.select({
        ios: {
            textAlign: 'center',
            color: 'rgba(102,102,102,1)',
            fontSize: 16,
            fontWeight: AppFonts.LIGHT,
            letterSpacing: 1,
            lineHeight: 22
        },
        android: {
            textAlign: 'center',
            color: 'rgba(102,102,102,1)',
            fontSize: 16,
            letterSpacing: 1,
            lineHeight: 22
        }
    }),
    slide: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff'
    },
    sliderImageContainer: {
        flex: 3,
        backgroundColor: '#e7e7e7'
    },
    slider: {
        width: SCREEN_WIDTH,
        flex: 1
    },

    sliderLogo: {
        position: 'absolute',
        left: 0,
        right: 0,
        marginTop: 44,
        alignItems: 'center',
        justifyContent: 'center'
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
    bottomBox: {
        backgroundColor: GlobalColors.tableItemBackground,
        padding: 5
    },

    goToLine: {
        marginVertical: 10,
        height: 20,
        fontWeight: AppFonts.BOLD,
        color: GlobalColors.frontmLightBlue,
        fontSize: 14,
        letterSpacing: 1,
        lineHeight: 20,
        justifyContent: 'center',
        alignItems: 'center'
    },
    bolder: {
        fontWeight: AppFonts.BOLDER,
        fontSize: 15
    },
    arrow: {
        width: 15,
        height: 10,
        tintColor: GlobalColors.frontmLightBlue
    },
    logoStyle: {
        width: 160,
        height: 65,
        marginBottom: 20,
        resizeMode: 'contain'
    }
});
