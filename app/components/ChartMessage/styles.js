import { Platform, StyleSheet, Dimensions } from 'react-native';
import { GlobalColors } from '../../config/styles';

export default StyleSheet.create({
    container: {
        width: '95%',
        alignItems: 'stretch',
        alignSelf: 'center',
        borderRadius: 15,
        marginVertical: 20,
        backgroundColor: GlobalColors.white
    },
    topBarContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 22,
        borderBottomWidth: 1,
        borderColor: GlobalColors.disabledGray
        // marginBottom: 10
    },
    topBarTextContainer: {},
    topBarImage: {},
    title: {
        fontSize: 20,
        color: GlobalColors.textBlack
    },
    description: {
        fontSize: 16,
        color: GlobalColors.textBlack,
        fontWeight: '100'
    },
    chartContainer: {
        aspectRatio: 1
    },
    bottomBarContiner: {
        flexWrap: 'wrap',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        borderTopWidth: 1,
        borderColor: GlobalColors.disabledGray,
        marginTop: 5,
        paddingVertical: 10,
        paddingHorizontal: 20
    },
    keyContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 5
    },
    chartScreenContainer: {
        width: '100%',
        height: '100%',
        alignItems: 'stretch',
        justifyContent: 'space-between',
        alignSelf: 'center',
        backgroundColor: GlobalColors.white
    }
});
