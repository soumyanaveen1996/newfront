import { StyleSheet } from 'react-native';
import { GlobalColors } from '../../config/styles';

const stylesheet = StyleSheet.create({
    headerStyles: {
        backgroundColor: GlobalColors.accent,
    },
    outerContainerStyles: {
        position:'relative'
    },
    defaultHeaderRightButton: {
        fontSize: 17,
        color: GlobalColors.white,
        fontWeight: '600',
        marginRight: 15,
    },
    defaultHeaderLeftButton: {
        fontSize: 17,
        color: GlobalColors.white,
        fontWeight: '600',
        marginLeft: 15,
    },
    defaultHeaderLeftIcon: {
        marginHorizontal: 5,
        paddingHorizontal: 10,
    },
    defaultHeaderRightIcon: {
        marginHorizontal: 5,
        paddingHorizontal: 10,
    },
});

export default stylesheet;
