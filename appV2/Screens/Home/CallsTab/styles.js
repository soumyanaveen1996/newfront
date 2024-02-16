import { StyleSheet, Platform } from 'react-native';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp
} from 'react-native-responsive-screen';
import GlobalColors from '../../../config/styles';
import AppFonts from '../../../config/fontConfig';

const stylesheet = StyleSheet.create({
    modal: {
        width: wp('90%'),
        height: hp('55%'),
        borderRadius: 10,
        flexDirection: 'column',
        backgroundColor: 'white',
        alignItems: 'center',
        padding: 5,
        marginTop: 10,
        backgroundColor: GlobalColors.appBackground
    },
    container: {
        flex: 1,
        backgroundColor: GlobalColors.appBackground,
        flexDirection: 'column'
    },
    searchBar: Platform.select({
        ios: {
            backgroundColor: GlobalColors.appBackground,
            height: hp('5%')
        },
        android: {
            backgroundColor: GlobalColors.appBackground,
            height: hp('5%')
        }
    }),
    searchTextInput: {
        marginHorizontal: 20,
        marginVertical: 5,
        fontSize: 13,
        paddingHorizontal: 5,
        flex: 1,
        backgroundColor: GlobalColors.appBackground,
        borderRadius: 2,
        borderColor: GlobalColors.darkGray,
        height: 24,
        color: GlobalColors.darkGray
    },
    addressBookContainer: {
        flex: 1
    },
    addressBook: {
        flex: 1
    },
    sectionHeaderContainer: {
        height: hp('4%'),
        paddingHorizontal: 15,
        alignItems: 'center',
        flexDirection: 'row'
        // backgroundColor: 'rgb(246, 247, 248)'
    },
    sectionHeaderTitle: {
        fontSize: hp('2.5%'),
        fontWeight: AppFonts.NORMAL,
        color: 'rgba(177,177,177,1)'
    },
    contactItemContainer: {
        backgroundColor: GlobalColors.appBackground,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: 10
    },
    contactItemLeftContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center'
    },
    contactItemDetailsContainer: {
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'stretch',
        marginLeft: 8,
        flex: 1
    },
    contactItemName: {
        color: GlobalColors.titleText,
        fontSize: 16
    },
    contactDetailItemName: {
        color: GlobalColors.formText,
        fontSize: 16,
        fontWeight: AppFonts.BOLD
    },
    contactItemEmail: {
        color: 'rgb(180, 180, 180)',
        fontSize: 12
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
        height: 22,
        width: 22
    },
    separator: {
        height: 1,
        backgroundColor: 'rgb(246, 247, 248)'
    },
    sideIndex: {
        width: 20,
        height: hp('75%'),
        position: 'absolute',
        top: 0,
        right: 0,
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        marginRight: 5,
        marginTop: 5,
        borderRadius: 10,
        borderColor: 'rgba(222, 222, 222, 1)',
        backgroundColor: GlobalColors.appBackground
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
    propicCD: {
        width: 120,
        height: 120,
        borderRadius: 60
    },
    detailMainInfoRenderContainer: {
        width: '100%',
        height: 55,
        flexDirection: 'row',
        paddingHorizontal: 12,
        borderBottomColor: GlobalColors.itemDevider,
        borderBottomWidth: 1,
        alignItems: 'stretch'
    },

    labelContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginHorizontal: '5%'
    },

    labelStyle: {
        color: GlobalColors.descriptionText,
        fontSize: 14,
        marginLeft: 10,
        textTransform: 'capitalize'
    },

    infoContainer: {
        flex: 3,
        marginLeft: 12,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'stretch',
        justifyContent: 'flex-start',
        alignItems: 'center'
    },
    infoLabelStyle: {
        color: 'rgba(102, 102, 102, 1)',
        fontSize: 12,
        alignSelf: 'center'
    },
    inputNumber: {
        flex: 1,
        backgroundColor: 'transparent',
        color: GlobalColors.descriptionText,
        fontSize: 14,
        alignSelf: 'center',
        // borderBottomWidth: 1,
        borderBottomColor: '#BDBDBD'
    },
    avatarImage: {
        height: 44,
        width: 44,
        borderRadius: 22,
        resizeMode: 'cover'
        // alignItems: 'center',
        // justifyContent: 'center'
        // marginLeft: wp('2%'),
        // marginRight: wp('3%')
    },
    avatarImageModal: {
        height: hp('15%'),
        width: hp('15%'),
        borderRadius: hp('15%') / 2,
        marginLeft: wp('2%'),
        marginRight: wp('2%')
    },
    contactModal: {
        width: wp('90%'),
        backgroundColor: 'rgba(244, 244, 244, 1)',
        borderRadius: 10
    },
    modalContainer: {
        // margin: 5,
        backgroundColor: GlobalColors.appBackground,
        display: 'flex',
        // flex: 1,
        // height: hp('60%'),
        flexDirection: 'column',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        paddingTop: 16,
        borderRadius: 10
    },
    modalContactName: {
        fontSize: hp('4%'),
        fontWeight: AppFonts.SEMIBOLD,
        color: 'rgba(74,74,74,1)'
    },
    nameContainer: {
        height: hp('10%'),
        width: '100%',
        borderBottomWidth: 0.5,
        display: 'flex',
        flexDirection: 'row',
        marginTop: 10,
        justifyContent: 'center',
        alignItems: 'flex-start',
        borderBottomColor: 'rgba(91, 91, 91, 0.2)'
    },
    phoneContainer: {
        height: hp('8%'),
        width: '100%',
        borderBottomWidth: 0.5,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomColor: 'rgba(91, 91, 91, 0.2)',
        paddingBottom: 2
    },
    phoneContainerNoBorder: {
        height: hp('7%'),
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    callButton: {
        height: hp('4%'),
        width: hp('4%'),
        borderRadius: hp('4%') / 2,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(47,199,111,1)'
    },
    recallButton: {
        height: 30,
        width: 30,
        borderRadius: 30 / 2,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: GlobalColors.green
    },
    chatButton: {
        height: 30,
        width: 30,
        borderRadius: 30 / 2,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 4
    },
    callButtonDisabled: {
        height: hp('4%'),
        width: hp('4%'),
        borderRadius: hp('4%') / 2,
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
        marginHorizontal: 10
    },
    modalNumberContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: wp('45%')
    },
    modalCallButContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: wp('10%'),
        marginRight: 10
    },
    modalText: {
        color: 'rgba(155,155,155,1)',
        marginLeft: 10
    },
    modalImage: {
        width: 22,
        height: 22
    },
    balanceContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: 16,
        backgroundColor: 'rgba(244, 244, 244, 1)',
        width: '100%',
        display: 'flex',
        borderBottomRightRadius: 10,
        borderBottomLeftRadius: 10
    },
    balanceText: {
        fontSize: 14,
        color: 'rgba(155,155,155,1)'
    },
    getCretidButton: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 5,
        paddingHorizontal: 8
    },
    getCreditText: {
        fontSize: 18,
        color: GlobalColors.primaryButtonColor
    },
    waitingConfirmation: {
        width: 90,
        height: 40
    },
    waitingConfirmationText: {
        fontSize: 12,
        fontWeight: AppFonts.THIN,
        color: 'rgba(174,174,174,1)',
        textAlign: 'center'
    },
    callDetailsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginEnd: 8
    },
    verticalSeparator: {
        height: '75%',
        width: 1,
        marginHorizontal: 5,
        backgroundColor: 'rgb(180, 180, 180)'
    },
    filterMenu: {
        position: 'absolute',
        width: '90%',
        alignItems: 'stretch',
        alignSelf: 'center',
        marginVertical: 10,
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 6
    },
    selectedFilter: {
        paddingVertical: 14,
        paddingHorizontal: 23,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: GlobalColors.appBackground
    },
    filterText: {
        fontSize: 14,
        fontWeight: AppFonts.THIN,
        color: GlobalColors.textBlack
    },
    filterList: {
        borderBottomRightRadius: 10,
        borderBottomLeftRadius: 10,
        backgroundColor: GlobalColors.appBackground
    },
    callHistoryTitle: {
        color: GlobalColors.chatTitle,
        fontWeight: AppFonts.SEMIBOLD,
        fontSize: 14
    },
    callHistoryTime: {
        color: GlobalColors.chatSubTitle,
        fontSize: 12
    },
    callHistoryType: {
        color: GlobalColors.chatSubTitle,
        fontWeight: AppFonts.SEMIBOLD,
        fontSize: 12
    }
});

export default stylesheet;
