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
        height: 40,
        marginTop: 3
    },
    searchIcon: {
        paddingHorizontal: 10
    },
    searchTextInput: {
        flex: 1,
        paddingTop: 10,
        paddingRight: 10,
        paddingBottom: 10,
        paddingLeft: 10,
        backgroundColor: '#fff',
        color: 'rgba(155,155,155,1)'
    },
    buttonsContainer: {
        width: wp('100%'),
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    button: {
        height: hp('6.5'),
        width: wp('20%'),
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        margin: wp('5%'),
        flexDirection: 'row',

        shadowOffset: { width: 1, height: 1 },
        shadowColor: 'black',
        shadowOpacity: 0.7
    },
    buttonText: {
        color: '#fff',
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '500'
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
        height: 40,
        borderRadius: 10,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    //MODAL
    callModal: {
        flex: 1,
        borderRadius: 10,
        backgroundColor: 'rgba(91, 91, 91, 0.2)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    modal: {
        width: wp('90%'),
        borderRadius: 10,
        flexDirection: 'column',
        backgroundColor: 'white'
    },
    phoneContainer: {
        height: hp('10%'),
        width: '100%',
        borderBottomWidth: 0.5,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        borderBottomColor: 'rgba(91, 91, 91, 0.2)'
    },
    callButton: {
        height: hp('5%'),
        width: hp('5%'),
        borderRadius: hp('5%') / 2,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(47,199,111,1)'
    },
    callButtonDisabled: {
        height: hp('5%'),
        width: hp('5%'),
        borderRadius: hp('5%') / 2,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#dddddd'
    },
    modalTextContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        width: wp('25%'),
        marginLeft: 10
    },
    modalTextContainerImg: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        width: wp('25%'),
        marginLeft: 5
    },
    modalNumberContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: wp('50%')
    },
    modalCallButContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: wp('10%'),
        marginRight: 5
    },
    modalText: {
        color: 'rgba(155,155,155,1)',
        marginLeft: 5
    },
    modalImage: {
        width: wp('5%'),
        height: wp('5%')
    },
    //INVITE MODAL
    inviteTitle: {
        textAlign: 'left',
        fontSize: 20,
        marginTop: 5,
        color: 'rgba(68,72,90,1)'
    },
    inviteText: {
        textAlign: 'left',
        fontSize: 16,
        color: 'rgba(102,102,102,1)',
        marginTop: 26,
        marginBottom: 15
    },
    inviteEmail: {
        fontSize: 16,
        color: 'rgba(102,102,102,1)',
        textAlign: 'center',
        marginVertical: 15
    },
    inviteInput: {
        backgroundColor: 'rgba(255,255,255,1)',
        borderRadius: 5,
        marginTop: 5,
        height: 36,
        fontSize: 16,
        width: wp('80%'),
        paddingHorizontal: 10,
        ...Platform.select({
            android: {
                height: 40,
                fontSize: 15
            }
        })
    },
    inviteButtonArea: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginVertical: 30
    },
    inviteButton: {
        width: wp('80%'),
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.2,
        borderColor: GlobalColors.sideButtons,
        borderRadius: 5,
        height: 30
    },
    inviteButtonText: {
        fontSize: 16,
        color: 'rgba(0,167,214,1)'
    },
    headerRight: {
        display: 'flex',
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: 'rgba(0,189,242,1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 15,
        marginBottom: 5,
        ...Platform.select({
            android: {
                marginTop: 2
            }
        })
    },
    searchContactButtonContainer: {
        height: 30,
        width: wp('80%'),
        backgroundColor: 'rgba(0,189,242,1)',
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center'
    },
    searchText: {
        fontSize: 16,
        color: 'rgba(255,255,255,1)'
    }
});

export default stylesheet;
