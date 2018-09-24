import { StyleSheet } from 'react-native';
import { scrollViewConfig } from './config';
export default StyleSheet.create({
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
    gridStyle: {
        width: scrollViewConfig.width * 0.5 - 1,
        height: scrollViewConfig.width * 0.5 - 1
    },
    listViewContentContainerStyle: {
        flex: 1,
        paddingVertical: 0
    }
});
