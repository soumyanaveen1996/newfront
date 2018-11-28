import { StyleSheet, Platform } from 'react-native';
import { GlobalColors } from '../../config/styles';
import { SECTION_HEADER_HEIGHT } from './config';

const stylesheet = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: GlobalColors.white,
        flexDirection: 'column'
    },
    searchBar: {
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        backgroundColor: GlobalColors.white,
        height: 40
    },
    searchIcon: {
        marginLeft: 23
    },
    searchTextInput: {
        marginHorizontal: 16,
        marginVertical: 5,
        fontSize: 16,
        paddingHorizontal: 5,
        flex: 1,
        backgroundColor: GlobalColors.white,
        borderRadius: 2,
        borderColor: GlobalColors.darkGray,
        height: 24,
        color: GlobalColors.darkGray
    },
    buttonsContainer: {
        backgroundColor: GlobalColors.transparent,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 13
    },
    button: {
        width: 170,
        marginHorizontal: 10,
        borderRadius: 10,
        flexDirection: 'row',
        justifyContent: 'center'
    },
    buttonIcon: {
        marginVertical: 10
    },
    buttonText: {
        fontSize: 16,
        color: GlobalColors.white,
        textAlign: 'center',
        marginLeft: 11,
        marginVertical: 10
    },
    addressBookContainer: {
        flex: 1,
        backgroundColor: GlobalColors.transparent
    },
    addressBook: {
        flex: 1,
        backgroundColor: GlobalColors.transparent
    },
    sectionHeaderContainer: {
        backgroundColor: GlobalColors.transparent,
        height: SECTION_HEADER_HEIGHT,
        paddingHorizontal: 22,
        alignItems: 'center',
        flexDirection: 'row'
    },
    sectionHeaderTitle: {
        fontSize: 24,
        color: GlobalColors.darkGray,
        textAlign: 'center'
    },
    contactItemContainer: {
        backgroundColor: GlobalColors.white,
        flexDirection: 'row',
        alignItems: 'center',
        height: 60,
        paddingHorizontal: 24,
        paddingVertical: 17
    },
    contactItemImage: {
        height: 26,
        width: 26,
        borderRadius: 13,
        marginRight: 17
    },
    contactItemDetailsContainer: {
        flexDirection: 'column',
        justifyContent: 'space-between'
    },
    contactItemName: {
        color: GlobalColors.headerBlack,
        fontSize: 18
    },
    contactItemEmail: {
        color: 'rgb(180, 180, 180)',
        fontSize: 12
    },
    headerRightButton: {
        fontSize: 17,
        color: GlobalColors.sideButtons,
        fontWeight: '600',
        marginBottom: 10
    },
    headerTitle: {
        fontSize: 17,
        color: GlobalColors.white,
        fontWeight: '600',
        marginBottom: 10,
        textAlign: 'center'
    },
    checkboxIconStyle: {
        height: 22,
        width: 22
    },
    separator: {
        height: 1,
        backgroundColor: 'rgb(246, 247, 248)'
    },
    sideIndex: {
        width: 20,
        height: '100%',
        position: 'absolute',
        top: 0,
        right: 0,
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10
    },
    sideIndexItem: {
        color: 'rgb(87, 21, 195)',
        fontSize: 11,
        backgroundColor: GlobalColors.transparent
    },
    headerRightView: {
        flexDirection: 'row',
        width: 85,
        height: 40,
        justifyContent: 'space-between',
        paddingTop: 3,
        marginRight: 5
    }
});

export default stylesheet;
