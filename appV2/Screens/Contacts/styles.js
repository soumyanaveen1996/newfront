import { StyleSheet, Platform, Dimensions } from 'react-native';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp
} from 'react-native-responsive-screen';
import GlobalColors from '../../config/styles';
import { SECTION_HEADER_HEIGHT, scrollViewConfig } from './config';
import AppFonts from '../../config/fontConfig';

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
        color: GlobalColors.formLable,
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
        paddingHorizontal: 32
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
    pnrScreenDevider: {
        width: SCREEN_WIDTH - 8,
        marginHorizontal: 8,

        ...Platform.select({
            ios: {
                shadowColor: '#dbe4f9',
                shadowOffset: {
                    width: 0,
                    height: 1
                },
                shadowRadius: 2,
                shadowOpacity: 1
            },
            android: {
                elevation: 2
            }
        })
    },
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
        color: GlobalColors.descriptionText,
        textAlign: 'center'
    },
    shGTitle: {
        fontSize: 14,
        color: GlobalColors.chatTitle,
        fontWeight: AppFonts.BOLD,
        textAlign: 'center',
        marginLeft: 6
    },
    shGCount: {
        fontSize: 12,
        color: GlobalColors.chatTitle,
        textAlign: 'center',
        marginLeft: 6
    },
    inputValueNewUI: {
        fontSize: 14,
        color: 'rgb(79,91,125)',
        textAlign: 'left'
    },
    contactItemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        marginVertical: 1
    },
    contactItemContainerNew: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 4,
        marginHorizontal: 13,
        paddingVertical: 8,
        marginVertical: 1
    },
    selectedContactItemContainer: {
        backgroundColor: GlobalColors.contentBackgroundColor,
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
        // backgroundColor: '#F4F4F4',
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
        height: 35,
        width: 35,
        borderRadius: 40 / 2,
        marginRight: 17
    },
    contactItemDetailsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignSelf: 'center',
        flex: 1,
        // paddingVertical: 15,
        alignItems: 'center'
    },
    contactItemName: {
        color: GlobalColors.chatTitle,
        fontWeight: AppFonts.SEMIBOLD, // Medium-bold
        fontSize: 14,
        alignSelf: 'center'
    },
    contactItemNameNew: {
        color: GlobalColors.chatTitle,
        fontSize: 14,
        fontWeight: AppFonts.NORMAL
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
    rankLogoCD: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        height: 30,
        width: 30,
        borderRadius: 15,
        backgroundColor: '#FFF',
        alignItems: 'center',
        justifyContent: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#dbe4f9',
                shadowOffset: {
                    width: 0,
                    height: 2
                },
                shadowRadius: 4,
                shadowOpacity: 1
            },
            android: {
                elevation: 2
            }
        })
    },
    containerCD: {
        backgroundColor: GlobalColors.appBackground,
        flex: 1
    },
    topContainerCD: {
        backgroundColor: GlobalColors.appBackground,
        width: '100%',
        // marginTop: 10,
        justifyContent: 'center',
        alignItems: 'center'
    },
    topAreaCD: {
        width: 120,
        height: 120,
        borderRadius: 60
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
        fontSize: 22,
        fontWeight: AppFonts.BOLD,
        color: GlobalColors.primaryTextColor,
        textAlign: 'center'
    },
    aboutUser: {
        fontSize: 14
        // fontWeight: 'bold',
        // color: 'rgb(79,91,125)',
        // textAlign: 'center'
    },
    aboutUserCD: {
        fontSize: 14,
        fontWeight: AppFonts.LIGHT
        // textAlign: 'center'
    },
    rankColorContainer: {
        paddingHorizontal: 5,
        paddingVertical: 3,
        borderRadius: 4
    },
    actionAreaCD: {
        backgroundColor: GlobalColors.appBackground,
        paddingTop: 19,
        paddingBottom: 27
    },
    actionButtonCD: {
        justifyContent: 'center',
        alignItems: 'center',
        width: Dimensions.get('window').width * (25 / 100)
    },
    actionIconCD: {
        width: 32,
        height: 32,
        marginBottom: 5,
        justifyContent: 'center',
        alignItems: 'center'
    },
    detailRowCD: {
        height: 62,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        backgroundColor: GlobalColors.appBackground
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
    deleteText: {
        color: 'rgba(229,69,59,1)',
        fontSize: 16,
        marginHorizontal: 25
    },
    deleteContainer: {
        marginVertical: 10,
        marginBottom: 10
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
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center'
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
        backgroundColor: GlobalColors.appBackground,
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
        textAlign: 'center'
    },
    addressInput: {
        height: 40,
        flex: 1,
        width: '75%',
        color: '#666666',
        fontSize: 16,
        textAlign: 'left'
    },
    addressInputNewUI: {
        minHeight: 40,
        flex: 1,
        width: '75%',
        color: GlobalColors.formText,
        fontSize: 14,

        textAlign: 'justify'
    },
    deviderNewUI: {
        height: 10,
        width: '100%',
        backgroundColor: GlobalColors.itemDevider2
    },
    deviderSmallNewUI: {
        height: 1,
        width: '100%',
        backgroundColor: GlobalColors.itemDevider
    },
    inputNumberCD: {
        backgroundColor: 'transparent',
        color: GlobalColors.formText,
        fontSize: 12,
        textAlign: 'justify'
    },
    inputNumber: {
        flex: 1,
        backgroundColor: 'transparent',
        color: GlobalColors.primaryTextColor,
        fontSize: 14,
        alignSelf: 'center'
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
        alignItems: 'stretch'
    },
    mainInfoRenderContainerNewUI: {
        width: '100%',
        minHeight: 55,
        flexDirection: 'row',
        paddingHorizontal: 12,
        alignItems: 'stretch'
    },
    detailMainInfoRenderContainer: {
        width: '100%',
        // height: 55,
        flexDirection: 'row',

        paddingHorizontal: 12,
        paddingLeft: 20,
        paddingRight: 26,
        alignItems: 'stretch',
        // alignItems: 'stretch',
        paddingVertical: 18
    },
    detailMainInfoRenderContainerCD: {
        width: '100%',
        flexDirection: 'row',
        paddingLeft: 20,
        paddingRight: 26,

        // alignItems: 'stretch',
        paddingVertical: 22
    },
    mainInfoRenderContainerEdit: {
        width: '100%',
        height: 55,
        flexDirection: 'row',
        paddingHorizontal: 12,

        alignItems: 'stretch'
    },
    labelContainer: {
        flex: 3.5,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start'
        // marginHorizontal: '5%'
    },
    labelContainerNewUI: {
        flex: 4,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        // marginHorizontal: '5%',
        paddingHorizontal: 8
    },
    leftIconCD: {
        width: 18,
        height: 18,
        resizeMode: 'cover',
        tintColor: GlobalColors.primaryButtonColor
    },

    phoneIconNewUI: {
        width: 16,
        height: 16,
        tintColor: GlobalColors.primaryButtonColor
    },
    phoneIcon: {
        width: 22,
        height: 22,
        resizeMode: 'contain',
        tintColor: GlobalColors.primaryButtonColor
    },
    satelliteIcon: {
        width: 14,
        height: 14,
        resizeMode: 'contain',
        tintColor: GlobalColors.primaryButtonColor
    },
    emailIcon: {
        width: 14,
        height: 14,
        resizeMode: 'contain',
        tintColor: GlobalColors.primaryButtonColor
    },
    emailIconNew: {
        width: 16,
        height: 16,
        resizeMode: 'contain',
        tintColor: GlobalColors.primaryButtonColor
    },

    labelStyle: {
        color: GlobalColors.descriptionText,
        fontSize: 14,
        marginLeft: 20,
        textTransform: 'capitalize'
    },
    labelStyleNewCD: {
        color: GlobalColors.tableDeatilKey,
        fontSize: 12,
        marginLeft: 10
        // textTransform: 'capitalize'
    },
    labelStyleNewUI: {
        color: 'rgb(156,158,167)',
        fontSize: 14,
        marginLeft: 10,
        textTransform: 'capitalize'
    },
    arrowStyle: { width: 12, height: 7 },
    infoContainer: {
        flex: 3,
        marginLeft: 12,
        // marginLeft: 12,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'stretch',
        justifyContent: 'flex-start'
    },
    infoContainerCD: {
        flex: 6,
        // marginLeft: 12,
        // paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    infoContainerNewUI: {
        flex: 7,
        marginLeft: 12,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'stretch',
        justifyContent: 'flex-start'
    },
    infoContainerNewUITimeZone: {
        flex: 8,
        marginLeft: 12,
        paddingLeft: 16,
        flexDirection: 'row',
        alignItems: 'stretch',
        justifyContent: 'flex-start'
    },
    infoContainerNewUIAddress: {
        flex: 7,
        marginLeft: 12,
        paddingHorizontal: 8,
        flexDirection: 'row',
        alignItems: 'stretch',
        justifyContent: 'flex-start'
    },
    infoLabelStyle: {
        color: 'rgba(102, 102, 102, 1)',
        fontSize: 12,
        alignSelf: 'center'
    },
    safeAreaStyle: {
        flex: 1,
        backgroundColor: GlobalColors.appBackground
    },
    mainViewContainer: {
        flex: 1
    },
    profileImageContainer: {
        width: '100%',
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
    nameContainerStyleProfile: {
        width: '100%',
        justifyContent: 'center',
        marginBottom: 14
    },
    profileNameContainerInput: {
        height: 40,
        width: '60%',
        padding: 10,
        color: GlobalColors.formText,
        fontWeight: AppFonts.BOLD,
        fontSize: 20,
        textAlign: 'center'
    },
    roleInputField: {
        // height: 40,
        width: '100%',
        color: '#666666',
        fontWeight: AppFonts.BOLD,
        fontSize: 16,
        // textAlign: 'center',
        paddingVertical: 10,
        paddingHorizontal: 6
    },
    roleAndPositionBtn: {
        height: 40,
        width: '60%',
        padding: 10,
        backgroundColor: GlobalColors.primaryButtonColor,
        borderRadius: 20
    },
    roleAndPositionTextBtn: {
        fontSize: 14,
        fontWeight: AppFonts.BOLD,
        color: GlobalColors.primaryButtonText,
        textAlign: 'center'
    },
    roleAndPositionView: {
        height: 40,
        width: '60%',
        padding: 10
    },
    roleAndPositionTextView: {
        fontSize: 14,
        color: 'rgb(79,91,125)',
        textAlign: 'center'
    },
    nameLabel: {
        textAlign: 'left',
        marginBottom: 10,
        color: '#4A4A4A',
        fontSize: 14
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
        // height: 130,
        width: '100%',
        justifyContent: 'space-evenly',
        alignItems: 'stretch'
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
        color: GlobalColors.formText,
        fontSize: 14,
        textAlign: 'left'
    },
    longTextStyleNewUi: {
        width: '70%',
        color: GlobalColors.formText,
        fontWeight: AppFonts.LIGHT,
        fontSize: 14,
        textAlign: 'left'
    },
    cancel_text: {
        color: GlobalColors.secondaryButtonText,
        fontSize: 14,
        fontWeight: AppFonts.BOLD
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
        backgroundColor: GlobalColors.secondaryButtonColor,
        borderRadius: 20,
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
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center'
    },
    save_btn_disabled: {
        width: 120,
        height: 40,
        backgroundColor: GlobalColors.primaryButtonColorDisabled,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center'
    },
    save_btn_text: {
        color: GlobalColors.primaryButtonText,
        fontSize: 14,
        fontWeight: AppFonts.BOLD
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
        alignSelf: 'center',
        width: '100%',
        flexDirection: 'column',
        justifyContent: 'center'
    },
    sendInvBtn: {
        alignSelf: 'center',
        alignItems: 'center',
        borderRadius: 20,
        backgroundColor: GlobalColors.primaryButtonColor,
        paddingHorizontal: 20,
        height: 40,
        marginVertical: 10,
        flexDirection: 'row'
    },
    sendEmailInvBtn: {
        alignSelf: 'center',
        borderRadius: 20,
        backgroundColor: GlobalColors.primaryButtonColor,
        paddingHorizontal: 20,
        height: 40,
        marginVertical: 10,
        flexDirection: 'row'
    },
    noContactSubText: {
        textAlign: 'center',
        alignSelf: 'center',
        marginTop: 10,
        color: GlobalColors.primaryTextColor
    },
    noContactText: {
        textAlign: 'center',
        alignSelf: 'center',
        fontSize: 15,
        fontWeight: AppFonts.BOLD,
        color: GlobalColors.primaryTextColor
    },
    noContactContainer: {
        textAlign: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        justifyContent: 'center',
        flex: 1,
        backgroundColor: GlobalColors.transparent
    },
    contactIcons: {
        height: 30,
        width: 30,
        marginRight: 10
    },
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
        color: GlobalColors.primaryTextColor,
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
        paddingHorizontal: 12,
        paddingVertical: 10
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
    },
    profileAboutText: {
        alignSelf: 'center',
        fontSize: 12,
        color: GlobalColors.descriptionText
    },
    contactPickerListContainer: {
        flexGrow: 1,
        flex: 1
    },
    contactDSactiontext: {
        fontSize: 12,
        color: GlobalColors.chatSubTitle,
        textAlign: 'center'
    },
    contactDSLabel: {
        fontSize: 12,
        color: GlobalColors.textLableCool
    },
    mainContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 4,
        marginLeft: 9,
        marginRight: 7,
        paddingVertical: 8,
        marginVertical: 1,
        borderBottomColor: '#f4f4f4',
        borderBottomWidth: 1
    },
    subContainer1: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    imageStyle: {
        height: 20,
        width: 20,
        marginRight: 10
    },
    subContainer2: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignSelf: 'center',
        flex: 1,
        alignItems: 'center'
    },
    nameContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    buttonStyle: {
        paddingVertical: 5,
        paddingHorizontal: 14,
        borderRadius: 6
    },
    rejectButtonStyle: {
        backgroundColor: GlobalColors.rejectButtonBgColor
    },
    acceptButtonStyle: {
        backgroundColor: GlobalColors.primaryButtonColor
    },
    buttonText: {
        fontSize: 12
    },
    rejectButtonText: {
        color: GlobalColors.rejectButtonTxtColor
    },
    acceptButtonText: {
        color: GlobalColors.primaryButtonText,
        fontWeight: AppFonts.BOLD
    },
    connectText: {
        alignSelf: 'center',
        color: GlobalColors.primaryButtonColor,
        paddingLeft: 5,
        fontSize: 14
    },
    container: {
        flex: 1,
        backgroundColor: GlobalColors.appBackground
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    textStyle: {
        fontSize: 12,
        color: 'rgb(156,158,167)'
    },
    pendingContainer: {
        paddingHorizontal: 15,
        paddingVertical: 10
    },
    pendingText: {
        fontSize: 14,
        color: 'rgb(156,158,167)'
    },
    unBlockContainer: {
        backgroundColor: GlobalColors.rejectButtonBgColor,
        paddingVertical: 5,
        paddingHorizontal: 14,
        borderRadius: 6
    },
    unBlockContainerText: {
        fontSize: 12,
        color: GlobalColors.rejectButtonTxtColor
    },
    acceptButtonContainer: {
        backgroundColor: GlobalColors.primaryButtonColor,
        paddingVertical: 5,
        paddingHorizontal: 14,
        borderRadius: 6
    },
    acceptButtonText: {
        fontSize: 12,
        color: GlobalColors.primaryButtonText,
        fontWeight: AppFonts.BOLD
    },
    connectText: {
        alignSelf: 'center',
        color: GlobalColors.primaryButtonColor,
        paddingLeft: 5,
        fontSize: 14
    }
});

export default stylesheet;
