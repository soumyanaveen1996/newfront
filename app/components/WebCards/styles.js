import { StyleSheet } from 'react-native';
import { GlobalColors } from '../../config/styles';

export default StyleSheet.create({
    webCards: {
        paddingLeft: 60
    },
    card: {
        backgroundColor: GlobalColors.white,
        borderRadius: 10,
        borderWidth: 0.2,
        width: 120,
        height: 120,
        marginRight: 20,
        marginVertical: 30,
        padding: 10,
        flexDirection: 'column',
        justifyContent: 'flex-end',
        alignItems: 'center',
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.08,
        shadowRadius: 4
    },
    cardTitle: {
        flex: 4,
        fontSize: 16,
        lineHeight: 20,
        color: GlobalColors.black
    },
    cardUrl: {
        flex: 1,
        fontSize: 14,
        lineHeight: 18,
        color: GlobalColors.darkGray
    },
    cardTimeStamp: {
        flex: 1,
        fontSize: 14,
        lineHeight: 18,
        color: GlobalColors.darkGray
    }
});
