import { StyleSheet } from 'react-native';
import GlobalColors from '../../../../config/styles';

export default StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        backgroundColor: GlobalColors.timelineMessageBackground
    },
    filterContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap'
    },
    filterItem: {
        height: 32,
        marginHorizontal: 4,
        marginTop: 14,
        borderColor: GlobalColors.itemDevider,
        justifyContent: 'center',
        borderWidth: 1,
        borderRadius: 20
    },
    filterItemSelected: {
        height: 32,
        marginTop: 14,
        marginHorizontal: 4,
        backgroundColor: GlobalColors.green,
        justifyContent: 'center',
        borderRadius: 20
    },
    filterItemText: {
        marginHorizontal: 8,
        color: GlobalColors.tableDeatilValue,
        fontSize: 14
    },
    filterItemTextSelected: {
        marginHorizontal: 8,
        fontSize: 14,
        color: GlobalColors.white
    },
    tabIconStyle: {
        height: 36,
        width: 36,
        justifyContent: 'center'
    }
});
