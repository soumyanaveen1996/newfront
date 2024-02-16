import { StyleSheet, PixelRatio } from 'react-native';
import GlobalColors from '../../../config/styles';

export default StyleSheet.create({
    container: {
        width: '100%',
        height: '100%',
        backgroundColor: '#2a2d3c',
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: 'white',
        justifyContent: 'space-between'
    },
    bottomRow: {
        backgroundColor: '#2a2d3c',
        width: '100%',
        paddingHorizontal: 20,
        justifyContent: 'space-evenly',
        alignItems: 'center',
        flexDirection: 'row'
    },
    topRow: {
        backgroundColor: '#2a2d3c',
        width: '100%',
        flexDirection: 'row-reverse',
        paddingHorizontal: 20,
        paddingVertical: 20,
        justifyContent: 'flex-start',
        alignItems: 'center'
    },
    content: {
        flex: 1,
        width: '100%',
        backgroundColor: '#44485a'
    },
    actionSheetCancel: {
        color: GlobalColors.frontmLightBlue,
        fontSize: 16,
        textAlign: 'center',
        justifyContent: 'center'
    },
    actionSheetText: {
        color: '#2a2d3c',
        textAlign: 'left',
        fontSize: 16
    },
    actionSheetTitle: {
        color: '#2a2d3c',
        textAlign: 'left',
        fontSize: 18,
        marginBottom: 15
    }
});
