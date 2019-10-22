import { StyleSheet } from 'react-native';
import { GlobalColors } from '../../config/styles';

const stylesheet = StyleSheet.create({
    headerStyles: {
        backgroundColor: GlobalColors.headerBlack
    },
    outerContainerStyles: {
        position: 'relative'
    },
    defaultHeaderRightButton: {
        fontSize: 17,
        color: GlobalColors.sideButtons,
        fontWeight: '600',
        marginRight: 15
    },
    defaultHeaderLeftButton: {
        fontSize: 17,
        color: GlobalColors.sideButtons,
        fontWeight: '600',
        marginLeft: 15
    },
    defaultHeaderLeftIcon: {
        marginHorizontal: 15
        // paddingHorizontal: 10
    },
    defaultHeaderRightIcon: {
        marginHorizontal: 5,
        paddingHorizontal: 10,
        color: GlobalColors.sideButtons
    },
    defaultHeaderRightIconImage: {
        maxWidth: 40,
        maxHeight: 40,
        marginRight: 20,
        color: GlobalColors.sideButtons
    }
});

export default stylesheet;
