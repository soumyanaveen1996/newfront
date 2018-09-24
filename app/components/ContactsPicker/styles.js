import { StyleSheet, Platform } from 'react-native';
import { GlobalColors } from '../../config/styles';
import { SECTION_HEADER_HEIGHT } from './config';

const stylesheet = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: GlobalColors.white,
        flexDirection: 'column'
    },
    searchBar: Platform.select({
        ios: {
            backgroundColor: GlobalColors.accent,
            height: 36
        },
        android: {
            backgroundColor: GlobalColors.accent,
            height: 45
        }
    }),
    searchTextInput: {
        marginHorizontal: 20,
        marginVertical: 5,
        fontSize: 13,
        paddingHorizontal: 5,
        flex: 1,
        backgroundColor: GlobalColors.headerTextInputBackground,
        borderRadius: 2,
        height: 24,
        color: GlobalColors.white
    },
    addressBookContainer: {
        flex: 1,
        backgroundColor: GlobalColors.background
    },
    addressBook: {
        flex: 1
    },
    sectionHeaderContainer: {
        backgroundColor: 'rgb(246, 247, 248)',
        height: SECTION_HEADER_HEIGHT,
        paddingHorizontal: 15,
        alignItems: 'center',
        flexDirection: 'row'
    },
    sectionHeaderTitle: {
        fontSize: 11,
        fontWeight: '700',
        color: 'rgb(23, 21, 21)'
    },
    contactItemContainer: {
        backgroundColor: GlobalColors.white,
        flexDirection: 'row',
        alignItems: 'center',
        height: 55,
        paddingHorizontal: 10
    },
    contactItemImage: {
        height: 44,
        width: 44,
        borderRadius: 22,
        marginLeft: 10,
        marginRight: 12
    },
    contactItemDetailsContainer: {
        flexDirection: 'column',
        justifyContent: 'space-between'
    },
    contactItemName: {
        color: 'rgb(23, 19, 19)',
        fontSize: 16
    },
    contactItemEmail: {
        color: 'rgb(180, 180, 180)',
        fontSize: 12
    },
    headerRightButton: {
        fontSize: 17,
        color: GlobalColors.white,
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
