import { StyleSheet, Platform, Dimensions } from 'react-native';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp
} from 'react-native-responsive-screen';
import GlobalColors from '../../../config/styles';
import { SECTION_HEADER_HEIGHT, scrollViewConfig } from './config';
import AppFonts from '../../../config/fontConfig';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

const stylesheet = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: GlobalColors.appBackground,
        flexDirection: 'column'
    },
    innerContainer: {
        flexDirection: 'column',
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'stretch'
    },
    searchBar: {
        // marginTop: 10,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        backgroundColor: GlobalColors.appBackground,
        borderWidth: 1,
        borderColor: GlobalColors.borderBottom,
        height: 40,
        // marginVertical: 3,
        paddingHorizontal: 15,
        // borderWidth: 1,
        // borderColor: GlobalColors.textDarkGrey,
        // marginBottom: 10,
        // borderColor: 'transparent',
        marginHorizontal: 20,
        marginVertical: 5,
        borderRadius: 33
    },
    formContainer: {
        alignItems: 'stretch',
        justifyContent: 'space-between'
    },
    placeholderText: {
        fontWeight: AppFonts.LIGHT,
        color: 'rgba(74,74,74,1)',
        width: 300,
        paddingVertical: 4,
        paddingHorizontal: 8,
        letterSpacing: 1,
        lineHeight: 20,
        fontSize: 14,
        marginTop: 20
    },
    entryFieldLabel: {
        fontWeight: AppFonts.LIGHT,
        color: 'rgba(74,74,74,1)',
        width: '33%',
        letterSpacing: 1,
        lineHeight: 20,
        fontSize: 14
    },
    entryFields: {
        backgroundColor: 'transparent',
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 32,
        borderBottomColor: 'rgba(224, 224, 224, 0.2)',
        borderBottomWidth: 1
    },

    errorContainer: Platform.select({
        ios: {
            position: 'absolute',
            minWidth: 180,
            bottom: -30,
            right: 0
        },
        android: {
            minWidth: 180,
            flex: 1,
            alignItems: 'flex-end'
        }
    }),
    userError: Platform.select({
        ios: {
            backgroundColor: 'rgba(229,69,59,1)',
            zIndex: 999999,
            minWidth: 180,
            borderTopRightRadius: 10,
            borderBottomLeftRadius: 10,
            borderBottomRightRadius: 10,
            borderTopLeftRadius: 0,
            alignItems: 'center'
        },
        android: {
            backgroundColor: 'rgba(229,69,59,1)',
            width: 180,
            borderTopRightRadius: 10,
            borderBottomLeftRadius: 10,
            borderBottomRightRadius: 10,
            borderTopLeftRadius: 0,
            alignItems: 'center'
        }
    }),
    errorText: {
        color: '#ffffff',
        textAlign: 'center',
        padding: 6
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
        fontSize: 14,
        // backgroundColor: '#fff',
        color: GlobalColors.textDarkGrey
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
        // height: hp('4%'),
        paddingHorizontal: 22,
        alignItems: 'center',
        flexDirection: 'row'
    },
    sectionHeaderTitle: {
        fontSize: 14,
        color: '#9c9ea7',
        textAlign: 'center'
    },
    contactItemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        marginVertical: 1
    },
    selectedContactItemContainer: {
        backgroundColor: GlobalColors.secondaryBackground,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        marginVertical: 1
    },
    selectedIcon: {
        alignSelf: 'center'
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
        paddingVertical: 5,
        paddingHorizontal: 15
    },
    profileImageStyle: {
        height: 40,
        width: 40,
        borderRadius: 20,
        marginRight: 17
    },
    emptyContactItemImage: {
        height: 40,
        width: 40,
        borderRadius: 20,
        marginRight: 17
    },
    contactItemImage: {
        height: 40,
        width: 40,
        borderRadius: 40 / 2,
        marginRight: 17
    },
    contactItemDetailsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignSelf: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#f4f4f4',
        flex: 1,
        paddingVertical: 15,
        alignItems: 'center'
    },
    contactItemName: {
        color: GlobalColors.chatTitle,
        fontWeight: AppFonts.SEMIBOLD,
        fontSize: 14,
        alignSelf: 'center'
    },
    contactItemEmail: {
        color: GlobalColors.descriptionText,
        fontSize: 14
    },
    headerRightButton: {
        fontSize: 17,
        color: GlobalColors.primaryButtonColor,
        fontWeight: AppFonts.SEMIBOLD,
        marginBottom: 10
    },
    headerTitle: {
        fontSize: 17,
        color: GlobalColors.white,
        fontWeight: AppFonts.SEMIBOLD,
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
        backgroundColor: '#000000'
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

    // CONTACT DETAILS SCREEN
    containerCD: {
        backgroundColor: GlobalColors.appBackground,
        flex: 1
    },
    topContainerCD: {
        backgroundColor: GlobalColors.appBackground,
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
        backgroundColor: GlobalColors.appBackground,
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
        fontWeight: AppFonts.SEMIBOLD,
        color: GlobalColors.headerBlack,
        marginTop: 18,
        textAlign: 'center'
    },
    actionAreaCD: {
        // height: 100,
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: GlobalColors.appBackground,
        borderColor: '#e7e1e1',
        borderBottomWidth: 1,
        borderTopWidth: 1,
        paddingVertical: 20
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
        backgroundColor: GlobalColors.appBackground,
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
        backgroundColor: GlobalColors.appBackground
    },
    // SEARCH USERS
    containerSU: {
        flex: 1,
        flexDirection: 'column'
        // backgroundColor: GlobalColors.white
    },
    searchContainerSU: {
        flexDirection: 'column',
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'stretch'
        // backgroundColor: GlobalColors.white
    },
    selectedContactsList: {
        height: 400
    },
    buttonAreaSU: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        // alignItems: 'center',
        paddingVertical: 20,
        backgroundColor: GlobalColors.appBackground,
        borderTopWidth: 0.3,
        borderTopColor: GlobalColors.grey
    },
    doneButtonSU: {
        flex: 1,
        alignSelf: 'center',
        width: '5%',
        height: 40,
        borderRadius: 10,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10
    },
    // MODAL
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
    // INVITE MODAL
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
        fontWeight: AppFonts.LIGHT
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
        borderColor: GlobalColors.primaryButtonColor,
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
        backgroundColor: GlobalColors.frontmLightBlue,
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
        backgroundColor: GlobalColors.primaryButtonColor,
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
    separateRowItems: {
        width: 100,
        alignItems: 'center',
        justifyContent: 'center',
        height: 8
    },
    contactPickerRowContainer: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    contactContainer: {
        backgroundColor: GlobalColors.appBackground,
        flexDirection: 'row',
        // marginBottom: 10,
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 20,
        marginVertical: 1
    },
    selectedContactContainer: {
        backgroundColor: GlobalColors.secondaryBackground,
        flexDirection: 'row',
        // marginBottom: 10,
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 20,
        marginVertical: 1
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
        flex: 1,
        borderBottomWidth: 1,
        borderBottomColor: '#f4f4f4',
        paddingVertical: 10
    },
    participantName: {
        color: '#44485a',
        fontSize: 18
    },
    participantPhoneNumber: {
        fontSize: 14
    },
    importContactPhoneNumber: {
        fontSize: 12,
        color: GlobalColors.grey
    },
    myProfileContainer: {
        width: wp('100%'),
        height: 80,
        backgroundColor: GlobalColors.appBackground,
        paddingVertical: 10,
        paddingHorizontal: 20
    },
    myProfileItemContainer: {
        position: 'relative',
        backgroundColor: GlobalColors.appBackground,
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
        fontWeight: AppFonts.SEMIBOLD
    },
    input: {
        height: 40,
        width: '60%',
        padding: 10,
        color: '#666666',
        fontSize: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#BDBDBD',
        textAlign: 'center'
    },
    addressInput: {
        height: 40,
        flex: 1,
        width: '75%',
        color: '#666666',
        fontSize: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#BDBDBD',
        textAlign: 'left'
    },
    inputNumber: {
        flex: 1,
        backgroundColor: 'transparent',
        color: '#44485a',
        fontSize: 14,
        alignSelf: 'center',
        // borderBottomWidth: 1,
        borderBottomColor: '#BDBDBD'
    },
    inputPrefix: {
        width: '30%',
        height: '100%',
        backgroundColor: 'transparent',
        color: GlobalColors.descriptionText,
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
        height: 55,
        flexDirection: 'row',
        paddingHorizontal: 12,
        borderBottomColor: 'rgba(224, 224, 224, 0.2)',
        borderBottomWidth: 1,
        alignItems: 'stretch'
    },
    detailMainInfoRenderContainer: {
        width: '100%',
        // height: 55,
        flexDirection: 'row',
        paddingHorizontal: 12,
        borderBottomColor: '#E0E0E0',
        borderBottomWidth: 1,
        alignItems: 'stretch',
        paddingVertical: 18
    },
    mainInfoRenderContainerEdit: {
        width: '100%',
        height: 55,
        flexDirection: 'row',
        paddingHorizontal: 12,
        borderBottomColor: 'rgba(224, 224, 224, 0.2)',
        borderBottomWidth: 1,
        alignItems: 'stretch'
    },
    labelContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start'
        // marginHorizontal: '5%'
    },
    phoneIcon: { width: 22, height: 22, resizeMode: 'contain' },
    satelliteIcon: { width: 14, height: 14, resizeMode: 'contain' },
    emailIcon: { width: 14, height: 14, resizeMode: 'contain' },
    labelStyle: {
        color: GlobalColors.descriptionText,
        fontSize: 14,
        marginLeft: 20,
        textTransform: 'capitalize'
    },
    arrowStyle: { width: 12, height: 7 },
    infoContainer: {
        flex: 3,
        marginLeft: 12,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'stretch',
        justifyContent: 'flex-start'
    },
    infoLabelStyle: {
        color: 'rgba(102, 102, 102, 1)',
        fontSize: 12,
        alignSelf: 'center'
    },
    safeAreaStyle: { flex: 1, backgroundColor: GlobalColors.appBackground },
    mainViewContainer: {
        flex: 1,
        backgroundColor: GlobalColors.white
    },
    profileImageContainer: {
        width: '100%',
        marginTop: 10,
        justifyContent: 'center',
        alignItems: 'center'
    },
    profilePic: {
        width: 120,
        height: 120
    },
    profileImgStyle: {
        width: 130,
        height: 130,
        borderRadius: 65
        // borderWidth: 1,
        // borderColor: 'rgba(224,224,224,1)'
    },
    nameContainerStyle: {
        width: '100%',
        height: 70,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24
    },
    nameLabel: {
        textAlign: 'left',
        marginBottom: 10,
        color: '#4A4A4A',
        fontSize: 14
    },
    userInfoNumberContainer: {
        borderTopColor: ' rgba(224, 224, 224, 0.2)',
        borderTopWidth: 1
    },
    userInfoEmailContainer: {
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
    switcStyle: {
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
        fontSize: 14,
        textAlign: 'left'
    },
    cancel_text: {
        color: GlobalColors.primaryButtonColor,
        fontSize: 16
    },

    import_btn: {
        width: 310,
        height: 40,
        backgroundColor: '#ffffff',
        borderColor: GlobalColors.primaryButtonColor,
        borderWidth: 1.5,
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center'
    },
    cancel_btn: {
        width: 120,
        height: 40,
        backgroundColor: '#ffffff',
        borderColor: GlobalColors.primaryButtonColor,
        borderWidth: 1.5,
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center'
    },
    searchAppBtn: {
        // width: 120,
        // height: 40,
        paddingHorizontal: 8,
        paddingVertical: 8,
        backgroundColor: '#ffffff',
        borderColor: GlobalColors.primaryButtonColor,
        borderWidth: 1.5,
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center'
    },
    searchAppText: {
        color: GlobalColors.white,
        fontSize: 12,
        alignSelf: 'center'
    },
    save_btn: {
        width: 120,
        height: 40,
        backgroundColor: GlobalColors.primaryButtonColor,
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center'
    },
    save_btn_disabled: {
        width: 120,
        height: 30,
        backgroundColor: GlobalColors.primaryButtonColor,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 0.2
    },
    save_btn_text: {
        color: 'rgba(255,255,255,1)',
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
    },
    invitationBlock: {
        // position: 'absolute',
        // bottom: 0,
        paddingVertical: 20,
        backgroundColor: '#ffffff',
        alignSelf: 'center',
        width: '100%',
        flexDirection: 'column',
        justifyContent: 'center'
    },
    sendInvBtn: {
        alignSelf: 'center',
        borderRadius: 6,
        backgroundColor: '#0095f2',
        padding: 10,
        marginVertical: 10,
        flexDirection: 'row'
    },
    sendEmailInvBtn: {
        alignSelf: 'center',
        borderRadius: 6,
        backgroundColor: '#0095f2',
        padding: 20,
        marginVertical: 10,
        flexDirection: 'row'
    },
    noContactSubText: {
        textAlign: 'center',
        alignSelf: 'center',
        marginTop: 10
    },
    noContactText: {
        textAlign: 'center',
        alignSelf: 'center',
        fontSize: 15,
        fontWeight: AppFonts.BOLD
    },
    noContactContainer: {
        textAlign: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        justifyContent: 'center',
        flex: 1,
        backgroundColor: GlobalColors.transparent
    },
    contactIcons: { height: 30, width: 30, marginRight: 10 },
    contactIconLast: { height: 30, width: 30 },
    groupConfirm: {
        backgroundColor: '#ffffff',
        borderRadius: 10
    },
    groupModalInnerContainer: {
        paddingTop: 10,
        paddingBottom: 30,
        paddingHorizontal: 30
    },
    groupConfirmText: {
        fontWeight: AppFonts.BOLD,
        fontSize: 18,
        color: '#2a2d3c',
        textAlign: 'center'
    },
    redMsg: {
        color: GlobalColors.red,
        textAlign: 'center',
        fontSize: 15,
        marginVertical: 30
    },
    adminSubMsg: {
        color: '#44485a',
        textAlign: 'center',
        fontSize: 15,
        marginVertical: 30
    },
    confirmBtnContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around'
    },
    confirmBtn: {
        backgroundColor: GlobalColors.red,
        paddingHorizontal: 35,
        paddingVertical: 12,
        borderRadius: 5
    },
    confirmImportBtn: {
        backgroundColor: 'rgb(0, 149, 242)',
        paddingHorizontal: 40,
        paddingVertical: 12,
        borderRadius: 5
    },
    adminConfirmBtn: {
        backgroundColor: '#0096fb',
        paddingHorizontal: 35,
        paddingVertical: 12,
        borderRadius: 5
    },
    cancelModalBtn: {
        backgroundColor: '#e5f4fd',
        paddingHorizontal: 35,
        paddingVertical: 12,
        borderRadius: 5
    },
    cancelText: {
        color: '#0095f2',
        fontSize: 14,
        textAlign: 'center'
    },
    confirmText: {
        color: '#ffffff',
        fontSize: 14,
        textAlign: 'center'
    },
    closeModalContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingTop: 10,
        paddingRight: 10
    },
    groupTextName: {
        fontSize: 22,
        fontWeight: AppFonts.BOLD,
        fontStyle: 'normal',
        letterSpacing: -0.56,
        textAlign: 'center',
        color: '#44485a',
        marginTop: 10
    },
    selectedItem: {
        paddingHorizontal: 8
    },
    selectedContactItemImage: {
        height: 50,
        width: 50,
        borderRadius: 50 / 2,
        marginRight: 17,
        alignSelf: 'center'
    },
    selectedName: {
        color: '#44485a',
        fontWeight: AppFonts.BOLD,
        width: 80,
        paddingHorizontal: 10,
        alignSelf: 'center'
    },
    cancelBtn: {
        position: 'absolute',
        right: 20,
        top: 0,
        marginBottom: 25,
        backgroundColor: GlobalColors.primaryColor,
        borderRadius: 50,
        height: 28,
        width: 28,
        justifyContent: 'center'
    },
    selectedContainer: {
        marginLeft: 10,
        marginVertical: 10
    },
    searchArea: {
        // flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff'
        // borderRadius: 10
    },
    iosSearchArea: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: GlobalColors.searchBorder,
        borderRadius: 10,
        marginHorizontal: 22,
        marginVertical: 15
    },
    iosSearchIcon: {
        paddingHorizontal: 10
    },
    input: {
        flex: 1,
        color: 'rgba(155,155,155,1)',
        ...Platform.select({
            ios: {
                height: 50
            },
            android: {
                borderWidth: 1,
                borderColor: GlobalColors.searchBorder,
                borderRadius: 10,
                marginHorizontal: 22,
                marginVertical: 15,
                paddingLeft: 10,
                backgroundColor: '#fff'
            }
        })
    },
    headerRightCall: {
        marginRight: 17
    }
});

export default stylesheet;
