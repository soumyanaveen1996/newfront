import { StyleSheet, Platform } from 'react-native';
import { scrollViewConfig } from './config';
export default StyleSheet.create({
    gridStyle: {
        width: scrollViewConfig.width * 0.5 - 1,
        height: scrollViewConfig.width * 0.5 - 1
    },
    tileContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white'
    },
    tileTitle: {
        color: '#333333',
        fontSize: 15,
        marginTop: 10
    },
    iconStyle: {
        height: 80,
        width: 80,
        borderRadius: 40
    },
    authenticateButton: {
        backgroundColor: '#bbb',
        borderRadius: 60,
        width: 80,
        height: 80,
        alignItems: 'center',
        justifyContent: 'center'
    },
    plusText: Platform.select({
        ios: {
            color: '#333333',
            fontSize: 50,
            fontWeight: 'normal',
            textAlign: 'center',
            lineHeight: 50
        },
        android: {
            color: '#333333',
            fontSize: 50,
            fontWeight: 'normal',
            textAlign: 'center'
        }
    }),
    listViewContentContainerStyle: {
        flex: 1,
        paddingVertical: 0
    },
    rowTitle: {
        textAlign: 'center'
    },
    newProvider: {
        height: 40,
        width: 300,
        borderRadius: 10,
        margin: 10,
        backgroundColor: 'rgba(0, 189, 242, 1)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    newProviderText: {
        color: 'rgba(255, 255, 255, 1)',
        fontFamily: 'SF Pro Text',
        fontSize: 16
    }
});
