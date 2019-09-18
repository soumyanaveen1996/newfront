import { StyleSheet, Platform, Dimensions } from 'react-native';
import { GlobalColors } from '../../config/styles';
import { SECTION_HEADER_HEIGHT, scrollViewConfig } from './config';

import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp
} from 'react-native-responsive-screen';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

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
        borderBottomWidth: 1,
        borderBottomColor: GlobalColors.borderBottom,
        height: 40,
        marginVertical: 3,
        paddingHorizontal: 15
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
        fontSize: 18
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
        height: hp('4%'),
        paddingHorizontal: 22,
        alignItems: 'center',
        flexDirection: 'row'
    },
    sectionHeaderTitle: {
        fontSize: hp('2.5%'),
        color: GlobalColors.darkGray,
        textAlign: 'center'
    },
    contactItemContainer: {
        backgroundColor: GlobalColors.white,
        flexDirection: 'row',
        alignItems: 'center',
        height: 55,
        paddingHorizontal: 14,
        paddingVertical: 17,
        justifyContent: 'space-between'
    },

    allSelectedContacts: {
        backgroundColor: '#F4F4F4',
        flex: 1,
        alignItems: 'flex-start',
        paddingVertical: 20,
        paddingHorizontal: 15
    },
    allContacts: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 20,
        paddingHorizontal: 15
    },
    profileImageStyle: {
        height: 35,
        width: 35,
        borderRadius: 17,
        marginRight: 17
    },
    emptyProfileContainer: {
        height: 35,
        width: 35,
        borderRadius: 17,
        backgroundColor: 'rgba(244,244,244,1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 17
    },
    emptyContactItemImage: {
        height: 20,
        width: 20,
        borderRadius: 10
    },
    contactItemImage: {
        height: 35,
        width: 35,
        borderRadius: 35 / 2,
        marginRight: 17
    },
    contactItemDetailsContainer: {
        flexDirection: 'column',
        justifyContent: 'space-between'
    },
    contactItemName: {
        color: GlobalColors.headerBlack,
        fontSize: 16
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
        width: 30,
        height: 30,
        paddingHorizontal: 2,
        paddingVertical: 2,
        alignItems: 'center',
        justifyContent: 'center',
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
        borderBottomWidth: 0.5,
        borderTopWidth: 0.5
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        backgroundColor: GlobalColors.white,
        borderBottomWidth: 0.5,
        borderColor: GlobalColors.translucentDark
    },
    labelCD: {
        fontSize: 16,
        marginLeft: 12,
        color: GlobalColors.headerBlack
    },
    rowContentCD: {
        minWidth: 200,
        fontSize: 16,
        textAlign: 'left',
        paddingHorizontal: 40
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
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        backgroundColor: GlobalColors.white
    },
    selectedContactsList: {
        height: 400
    },
    buttonAreaSU: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
        backgroundColor: GlobalColors.white,
        borderTopWidth: 0.3,
        borderTopColor: GlobalColors.grey
    },
    doneButtonSU: {
        alignSelf: 'center',
        width: '75%',
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
    modal: Platform.select({
        ios: {
            width: wp('90%'),
            height: hp('55%'),
            borderRadius: 10,
            flexDirection: 'column',
            backgroundColor: 'white',
            alignItems: 'center',
            padding: 5
        },
        android: {
            width: wp('90%'),
            height: hp('60%'),
            borderRadius: 10,
            flexDirection: 'column',
            backgroundColor: 'white',
            alignItems: 'center',
            padding: 5
        }
    }),

    localContactModal: Platform.select({
        ios: {
            width: wp('90%'),
            height: hp('70%'),
            borderRadius: 10,
            flexDirection: 'column',
            backgroundColor: 'white',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: 10
        },
        android: {
            width: wp('90%'),
            height: hp('80%'),
            borderRadius: 10,
            flexDirection: 'column',
            backgroundColor: 'white',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: 10
        }
    }),

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
        textAlign: 'center',
        fontSize: 20,
        marginTop: 5,
        color: 'rgba(68,72,90,1)'
    },
    inviteText: {
        textAlign: 'center',
        fontSize: 16,
        color: 'rgba(102,102,102,1)',
        marginTop: 26,
        marginBottom: 15,
        fontWeight: '300'
    },
    inviteEmail: {
        fontSize: 16,
        color: 'rgba(102,102,102,1)',
        textAlign: 'center',
        marginLeft: 15
    },
    inviteInput: {
        backgroundColor: 'rgba(255,255,255,1)',
        borderColor: 'rgba(221,222,227,1)',
        borderWidth: 0.8,
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
        marginVertical: 20
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
        height: 50,
        width: wp('80%'),
        backgroundColor: 'rgba(0,189,242,1)',
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 20
    },
    searchText: {
        fontSize: 16,
        color: 'rgba(255,255,255,1)'
    },
    addressBookContainerStyle: {
        height: 30,
        width: wp('80%'),
        alignItems: 'center',
        justifyContent: 'center'
    },
    addressBookStyle: {
        textAlign: 'center',
        color: 'rgba(0, 189, 242, 1)',
        fontFamily: 'Roboto',
        fontSize: 16
    },
    contactSelectedContainer: {
        backgroundColor: GlobalColors.transparent,
        flexDirection: 'row',
        width: SCREEN_WIDTH - 40,
        height: 40,
        marginBottom: 10,
        alignItems: 'center',
        padding: 5
    },
    contactContainer: {
        backgroundColor: GlobalColors.white,
        flexDirection: 'row',
        width: SCREEN_WIDTH - 40,
        height: 40,
        marginBottom: 10,
        alignItems: 'center',
        padding: 5
    },
    filterButtonContainer: {
        width: SCREEN_WIDTH,
        marginVertical: 20,
        height: 120,
        alignItems: 'center'
    },
    doneButton: {
        height: 40,
        width: 300,
        borderRadius: 10,
        backgroundColor: 'rgba(0, 189, 242, 1)',
        alignItems: 'center',
        justifyContent: 'center'
    },
    buttonContainerDone: {
        backgroundColor: GlobalColors.white,
        borderTopWidth: 1,
        borderTopColor: GlobalColors.borderBottom,
        height: 70,
        width: '100%',
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center'
    },
    selectedChip: {
        paddingBottom: wp('2%'),
        paddingHorizontal: wp('2%')
    },
    chipFont: {
        fontSize: wp('3.5%'),
        color: 'rgba(102,102,102,1)'
    },
    contactNameContainer: {
        display: 'flex',
        flexDirection: 'column',
        flex: 1
    },

    participantName: {
        color: 'rgba(0,0,0,1)'
    },
    myProfileContainer: {
        width: wp('100%'),
        height: 80,
        backgroundColor: GlobalColors.white,
        paddingVertical: 10,
        paddingHorizontal: 20
    },
    myProfileItemContainer: {
        position: 'relative',
        backgroundColor: GlobalColors.white,
        flexDirection: 'row',
        alignItems: 'center'
    },
    myProfileItemImage: {
        height: 60,
        width: 60,
        borderRadius: 30,
        marginRight: 17
    },
    myProfilePlaceholderImage: {
        height: 60,
        width: 60,
        borderRadius: 30,
        marginRight: 17
        // borderWidth: 1,
        // borderColor: 'rgba(224,224,224,1)'
    },
    myProfileName: {
        color: GlobalColors.headerBlack,
        fontSize: 18,
        lineHeight: 21,
        fontWeight: '600',
        fontFamily: 'SF Pro Text'
    },
    input: {
        height: 40,
        width: 300,
        backgroundColor: 'rgba(244,244,244,1)',
        padding: 10,
        color: '#666666',
        fontSize: 16,
        borderTopRightRadius: 0,
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
        borderTopLeftRadius: 10
    },
    inputNumber: {
        flex: 1,
        backgroundColor: 'transparent',
        color: 'rgba(102, 102, 102, 1)',
        fontFamily: 'SF Pro Text',
        fontSize: 12,
        paddingHorizontal: 10,
        alignSelf: 'center'
    },
    inputPrefix: {
        width: '30%',
        height: '100%',
        backgroundColor: 'transparent',
        color: 'rgba(102, 102, 102, 1)',
        fontFamily: 'SF Pro Text',
        fontSize: 12,
        borderRightWidth: 1,
        borderRightColor: 'rgba(221,222,227,1)',
        borderLeftWidth: 1,
        borderLeftColor: 'rgba(221,222,227,1)',
        textAlign: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        flexDirection: 'row',
        paddingHorizontal: 5
    },
    mainInfoRenderContainer: {
        width: '100%',
        height: 50,
        flexDirection: 'row',
        borderBottomColor: 'rgba(221,222,227,1)',
        borderBottomWidth: 1,
        alignItems: 'stretch'
    },
    labelContainer: {
        flex: 2,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-evenly'
    },
    phoneIcon: { width: 16, height: 16 },
    satelliteIcon: { width: 24, height: 24 },
    emailIcon: { width: 20, height: 14 },
    labelStyle: {
        color: 'rgba(155, 155, 155, 1)',
        fontFamily: 'SF Pro Text',
        fontSize: 12
    },
    arrowStyle: { width: 12, height: 7 },
    infoContainer: {
        flex: 3,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'stretch',
        justifyContent: 'flex-start'
    },
    infoLabelStyle: {
        color: 'rgba(102, 102, 102, 1)',
        fontFamily: 'SF Pro Text',
        fontSize: 12,
        alignSelf: 'center'
    },
    safeAreaStyle: { flex: 1, backgroundColor: GlobalColors.white },
    mainViewContainer: {
        flex: 1,
        backgroundColor: GlobalColors.white,
        paddingVertical: 20
    },
    profileImageContainer: {
        width: '100%',
        position: 'relative',
        height: 130,
        justifyContent: 'center',
        alignItems: 'center'
    },
    profilePic: {
        width: 120,
        height: 120
    },
    profileImgStyle: {
        width: 120,
        height: 120,
        borderRadius: 60
        // borderWidth: 1,
        // borderColor: 'rgba(224,224,224,1)'
    },
    nameContainerStyle: {
        width: '100%',
        height: 70,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30
    },
    nameLabel: {
        textAlign: 'left',
        marginBottom: 10,
        color: '#4A4A4A',
        fontSize: 14,
        fontFamily: 'SF Pro Text'
    },
    userInfoNumberContainer: {
        borderTopColor: 'rgba(222,222,222,1)',
        borderTopWidth: 5,
        marginBottom: 25
    },
    userInfoEmailContainer: {
        borderTopColor: 'rgba(222,222,222,1)',
        borderTopWidth: 1,
        marginBottom: 25
    },
    addContainer: {
        height: 30,
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24
    },
    iconStyle: {
        height: 8,
        width: 8,
        marginRight: 15
    },
    addLabel: {
        color: 'rgba(0, 189, 242, 1)',
        fontFamily: 'SF Pro Text',
        fontSize: 12
    },
    bottomSettingContainer: {
        height: 130,
        width: '100%',
        justifyContent: 'space-evenly',
        alignItems: 'stretch',
        borderBottomWidth: 5,
        borderTopWidth: 5,
        borderColor: 'rgba(222,222,222,1)'
    },
    switchContainer: {
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        textAlign: 'left'
    },
    swithcStyle: {
        borderWidth: 1,
        borderColor: 'rgba(222,222,222,1);',
        borderRadius: 15
    },
    btn_container: {
        height: 90,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingHorizontal: 15
    },
    longTextStyle: {
        width: '70%',
        color: 'rgba(102, 102, 102, 1)',
        fontFamily: 'SF Pro Text',
        fontSize: 14,
        textAlign: 'left'
    },
    cancel_text: {
        color: 'rgba(0,167,214,1)',
        fontFamily: 'SF Pro Text',
        fontSize: 16
    },

    import_btn: {
        width: 310,
        height: 30,
        backgroundColor: '#ffffff',
        borderColor: 'rgba(0,167,214,1)',
        borderWidth: 1,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center'
    },
    cancel_btn: {
        width: 120,
        height: 30,
        backgroundColor: '#ffffff',
        borderColor: 'rgba(0,167,214,1)',
        borderWidth: 1,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center'
    },
    save_btn: {
        width: 120,
        height: 30,
        backgroundColor: 'rgba(0,189,242,1)',
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center'
    },
    save_btn_text: {
        color: 'rgba(255,255,255,1)',
        fontFamily: 'SF Pro Text',
        fontSize: 16
    },
    selectedContactsListSU: {
        maxHeight: (SCREEN_HEIGHT / 100) * 30,
        overflow: 'scroll'
    },
    searchUsersTitle: {
        color: GlobalColors.grey,
        margin: 14,
        marginBottom: 7
    }
});

export default stylesheet;
