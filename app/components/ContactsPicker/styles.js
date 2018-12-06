import { StyleSheet, Platform } from 'react-native';
import { GlobalColors } from '../../config/styles';
import { SECTION_HEADER_HEIGHT } from './config';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp
} from 'react-native-responsive-screen';

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
        height: 70,
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
        paddingHorizontal: 2,
        paddingVertical: 1,
        backgroundColor: GlobalColors.transparent,
        borderWidth: 0
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
    },

    //CONTACT DETAILS SCREEN
    containerCD: {
        backgroundColor: GlobalColors.white,
        flex: 1
    },
    topContainerCD: {
        backgroundColor: GlobalColors.white,
        height: 252,
        justifyContent: 'center'
    },
    topAreaCD: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center'
    },
    topButtonCD: {
        width: 46,
        height: 46,
        borderRadius: 23,
        backgroundColor: GlobalColors.white,
        shadowColor: 'black',
        shadowRadius: 5,
        shadowOpacity: 0.5,
        justifyContent: 'center',
        alignItems: 'center'
    },
    propicCD: {
        width: 120,
        height: 120,
        borderRadius: 60
    },
    nameCD: {
        fontSize: 26,
        fontWeight: '600',
        color: GlobalColors.headerBlack,
        marginTop: 11,
        textAlign: 'center'
    },
    actionAreaCD: {
        height: 100,
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: GlobalColors.white,
        borderColor: GlobalColors.translucentDark,
        borderBottomWidth: 1,
        borderTopWidth: 1
    },
    actionButtonCD: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 100
    },
    actionIconCD: {
        width: 32,
        height: 32,
        marginBottom: 5,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center'
    },
    detailRowCD: {
        height: 62,
        paddingLeft: 20,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: GlobalColors.white,
        borderBottomWidth: 1,
        borderColor: GlobalColors.translucentDark
    },
    labelCD: {
        fontSize: 16,
        marginLeft: 12,
        color: GlobalColors.headerBlack
    },
    rowContentCD: {
        fontSize: 16,
        marginLeft: 64
    },
    footerCD: {
        backgroundColor: GlobalColors.white
    },
    //SEARCH USERS
    containerSU: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: GlobalColors.white
    },
    searchContainerSU: {
        flexDirection: 'column',
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: GlobalColors.white
    },
    selectedContactsList: {
        height: 400
    },
    buttonAreaSU: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: GlobalColors.white
    },
    doneButtonSU: {
        width: 300,
        borderRadius: 10,
        flexDirection: 'row',
        justifyContent: 'center'
    }
});

export default stylesheet;
