import { StyleSheet, Platform } from 'react-native';
import { GlobalColors } from '../../../config/styles';
import { Dimensions } from 'react-native';
export const SCREEN_WIDTH = Dimensions.get('window').width;
export const SCREEN_HEIGHT = Dimensions.get('window').height;

export default StyleSheet.create({
    modalBackground: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: 'rgba(0,0,0,0.4)',
        alignItems: 'center',
        justifyContent: 'center'
    },
    container: {
        position: 'relative',
        width: 320,
        height: 300,
        backgroundColor: '#fff',
        borderRadius: 10,
        paddingTop: 40,
        alignItems: 'center'
    },
    headerText: {
        color: 'rgba(68, 72, 90, 1)',
        fontFamily: 'SF Pro Text',
        fontSize: 20,
        textAlign: 'center'
    },
    descriptionText: {
        marginTop: 30,
        color: 'rgba(102,102,102,1)',
        fontFamily: 'SF Pro Text',
        fontSize: 16,
        textAlign: 'center'
    },
    input: {
        marginTop: 30,
        height: 36,
        width: 275,
        backgroundColor: 'rgba(244,244,244,1)',
        padding: 10,
        color: 'rgba(0,0,0,0.8)',
        fontSize: 16,
        borderTopRightRadius: 0,
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
        borderTopLeftRadius: 10
    },
    cancelBtn: {
        height: 30,
        width: 136,
        borderWidth: 1,
        borderColor: 'rgba(0,167,214,1)',
        backgroundColor: 'rgba(255,255,255,1)',
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8
    },
    cancelText: {
        color: 'rgba(0,167,214,1)'
    },
    submitBtn: {
        height: 30,
        width: 136,
        backgroundColor: 'rgba(155,155,155,1)',
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center'
    },
    submitText: {
        color: 'rgba(255,255,255,1)'
    },
    errorContainer: Platform.select({
        ios: {
            flex: 1,
            alignItems: 'flex-end'
        },
        android: {
            flex: 1,
            alignItems: 'flex-end'
        }
    }),
    userError: Platform.select({
        ios: {
            backgroundColor: 'rgba(229,69,59,1)',
            zIndex: 999999,
            width: 200,
            padding: 5,
            borderTopRightRadius: 10,
            borderBottomLeftRadius: 10,
            borderBottomRightRadius: 10,
            borderTopLeftRadius: 0,
            alignItems: 'center'
        },
        android: {
            backgroundColor: 'rgba(229,69,59,1)',
            width: 150,
            padding: 5,
            borderTopRightRadius: 10,
            borderBottomLeftRadius: 10,
            borderBottomRightRadius: 10,
            borderTopLeftRadius: 0,
            alignItems: 'center'
        }
    }),
    errorText: Platform.select({
        ios: {
            color: '#ffffff',
            textAlign: 'center'
        },
        android: {
            color: '#ffffff',
            textAlign: 'center'
        }
    })
});
