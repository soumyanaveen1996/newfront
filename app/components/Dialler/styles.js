import { StyleSheet, Platform } from 'react-native';
import { GlobalColors } from '../../config/styles';
import Dimensions from 'Dimensions';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp
} from 'react-native-responsive-screen';

const Styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        backgroundColor: 'rgba(25,29,34,1)',
        flex: 1,
        flexDirection: 'column'
    },
    countryModalContainer: {
        width: wp('90%'),
        height: hp('60%'),
        borderRadius: 10,
        backgroundColor: GlobalColors.white,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
    },
    donwArrowImg: {
        height: hp('1.5%'),
        width: hp('1.5%'),
        marginHorizontal: 10,
        ...Platform.select({
            android: {
                marginTop: 10,
                marginBottom: 30
            },
            ios: {
                marginTop: 60,
                marginBottom: 30
            }
        })
    },
    callingContainer: {
        display: 'flex',
        height: hp('50%'),
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-around',
        ...Platform.select({
            android: {
                marginTop: hp('5%')
            },
            ios: {
                marginTop: hp('10%')
            }
        })
    },
    buttonContainer: {
        display: 'flex',
        height: hp('20%'),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        ...Platform.select({
            android: {
                marginTop: hp('5%')
            },
            ios: {
                marginTop: hp('10%')
            }
        })
    },
    nameContainer: {},
    callingText: {
        color: GlobalColors.botChatBubbleColor,
        fontSize: 20,
        textAlign: 'center',
        height: 30,
        marginTop: hp('5%')
    },
    diallerNumberText: {
        color: GlobalColors.white,
        fontSize: hp('4%'),
        textAlign: 'left',
        paddingHorizontal: 10
    },
    diallerNumberCode: {
        color: GlobalColors.white,
        fontSize: hp('2%'),
        textAlign: 'center',
        ...Platform.select({
            android: {
                marginTop: 10,
                marginBottom: 30
            },
            ios: {
                marginTop: 60,
                marginBottom: 30
            }
        })
    },
    callingNumberText: {
        color: 'rgba(255,255,255,1)',
        fontSize: hp('5%'),
        textAlign: 'center'
    },
    callStatusText: {
        color: 'rgba(47,199,111,1)',
        fontSize: hp('2%'),
        textAlign: 'center',
        marginTop: hp('3%')
    },
    callNumAlt: {
        color: 'rgba(255,255,255,1)',
        fontSize: hp('2%'),
        textAlign: 'center'
    },
    avatarContainer: {},
    avatar: {
        height: hp('20%'),
        width: hp('20%'),
        borderRadius: hp('20%') / 2
    },
    avatarImage: {
        height: hp('20%'),
        width: hp('20%'),
        borderRadius: hp('20%') / 2,
        borderWidth: 10,
        borderColor: 'rgba(47,199,111,1)'
    },
    callButtonContainer: {
        height: hp('15%'),
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: GlobalColors.white,
        width: wp('100%')
    },
    buttonCtr: {
        borderRadius: wp('20%') / 2,
        width: wp('20%'),
        height: wp('20%'),
        justifyContent: 'center',
        alignItems: 'center'
    },
    buttonCtrOn: {
        borderRadius: wp('20%') / 2,
        width: wp('20%'),
        height: wp('20%'),
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(47,199,111,1)'
    },
    btnImg: {
        width: wp('15%'),
        height: wp('15%')
    },
    button: {
        borderRadius: 36,
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center'
    },
    greenCallbutton: {
        borderRadius: hp('8%') / 2,
        width: hp('8%'),
        height: hp('8%'),
        justifyContent: 'center',
        alignItems: 'center'
    },
    callCloseButton: {
        backgroundColor: 'red'
    },
    callButton: {
        backgroundColor: 'green'
    },
    roundButton: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%'
    },
    roundButtonDel: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%'
    },
    backspaceButton: {
        width: hp('2.5%'),
        height: hp('2.5%')
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        height: '25%'
    },
    roundButtonStar: {
        color: GlobalColors.black,
        fontSize: hp('4.5%'),
        textAlign: 'center'
    },

    roundButtonText: {
        color: GlobalColors.black,
        fontSize: hp('3.5%'),
        textAlign: 'center'
    },
    roundButtonAlpha: {
        color: 'rgba(102,102,102,1)',
        fontSize: hp('1.5%'),
        textAlign: 'center'
    },
    swapButtonContainer: {
        backgroundColor: GlobalColors.white
    },
    closeButton: {},
    closeButtonText: {
        fontSize: hp('2%'),
        color: 'rgba(0,189,242,1)'
    },
    mainContainer: {
        paddingTop: 30,
        flex: 1,
        flexDirection: 'column',
        paddingBottom: 30,
        backgroundColor: 'white'
    },
    initialMainContainer: {
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'rgba(47,199,111,1)',
        height: hp('35%'),
        justifyContent: 'flex-start',
        alignItems: 'center'
    },
    diallerContainer: {
        height: hp('40%'),
        backgroundColor: GlobalColors.white
    },
    callQuotaContainer: {
        height: hp('8%'),
        width: wp('100%'),
        backgroundColor: GlobalColors.white,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(221,222,227,1)'
    },
    callQuotaTextContainer: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        marginHorizontal: 15
    },
    callQuotaText: {
        fontSize: wp('3.5%'),
        color: '#96A3AA'
    },
    horizontalRuler: {
        borderBottomColor: 'black',
        borderBottomWidth: 1,
        opacity: 0.5
    },
    callQuotaBuy: {
        borderWidth: 1,
        borderColor: 'rgba(0,167,214,1)',
        borderRadius: 6,
        height: hp('4%'),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 100,
        marginLeft: 'auto',
        marginRight: 10
    },
    callQuotaPrice: {
        fontSize: wp('5%'),
        marginLeft: 'auto',
        paddingHorizontal: 10,
        fontWeight: '500',
        opacity: 0.7
    },
    diallerButtonContainer: {
        flexDirection: 'column',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        paddingVertical: 10
        //backgroundColor: 'red',
    },
    incallDiallerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    incallDiallerButtonContainer: {
        height: 500,
        flexDirection: 'row',
        width: '80%',
        justifyContent: 'space-around',
        alignItems: 'center'
    },
    incallButtonContainer: {
        height: 70,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: GlobalColors.white
    },
    loading: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        backgroundColor: 'rgba(4, 4, 4, 0.9)',
        alignItems: 'center',
        justifyContent: 'center'
    },
    callButtonGreen: {
        height: hp('8%'),
        width: hp('8%')
    },
    modalDialPad: {
        justifyContent: 'flex-end',
        alignItems: 'stretch',
        margin: 0
    },
    modalDialPadTopBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 40,
        paddingVertical: 20,
        backgroundColor: 'rgba(25,29,34,1)',
        borderBottomWidth: 1,
        borderBottomColor: 'black'
    },
    modalDialPadString: {
        fontSize: hp('3.5%'),
        color: 'white'
    },
    modalDialPadContainer: {
        height: '50%',
        width: '100%',
        backgroundColor: 'rgba(25,29,34,1)'
    }
});

export default Styles;
