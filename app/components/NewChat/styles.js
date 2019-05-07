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
    searchBar: Platform.select({
        ios: {
            backgroundColor: GlobalColors.white,
            height: hp('5%')
        },
        android: {
            backgroundColor: GlobalColors.white,
            height: hp('5%')
        }
    }),
    searchTextInput: {
        marginHorizontal: 20,
        marginVertical: 5,
        fontSize: 13,
        paddingHorizontal: 5,
        flex: 1,
        backgroundColor: GlobalColors.white,
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
        flexDirection: 'row',
        backgroundColor: 'rgb(246, 247, 248)'
    },
    sectionHeaderTitle: {
        fontSize: hp('2.5%'),
        fontWeight: '500',
        color: 'rgba(177,177,177,1)'
    },
    contactItemContainer: {
        backgroundColor: GlobalColors.white,
        flexDirection: 'row',
        alignItems: 'center',
        height: 55,
        paddingHorizontal: 10
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
        backgroundColor: GlobalColors.white
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
    avatarImage: {
        height: 26,
        width: 26,
        borderRadius: 13,
        marginLeft: wp('2%'),
        marginRight: wp('3%')
    },
    avatarImageModal: {
        height: hp('15%'),
        width: hp('15%'),
        borderRadius: hp('15%') / 2,
        marginLeft: wp('2%'),
        marginRight: wp('2%')
    },
    contactModal: {
        height: hp('70%'),
        width: wp('90%'),
        backgroundColor: 'rgba(244, 244, 244, 1)',
        borderRadius: 10
    },
    modalContainer: {
        // margin: 5,
        backgroundColor: GlobalColors.white,
        display: 'flex',
        // flex: 1,
        height: hp('60%'),
        flexDirection: 'column',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10
    },
    modalContactName: {
        fontSize: hp('4%'),
        fontWeight: '600',
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
        justifyContent: 'flex-start',
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
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center'
    },
    balanceText: {
        fontSize: 14,
        color: 'rgba(155,155,155,1)'
    },
    getCretidButton: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 7,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderRadius: 3,
        borderColor: GlobalColors.sideButtons
    },
    getCreditText: {
        fontSize: 16,
        color: GlobalColors.sideButtons
    }
});

export default stylesheet;
