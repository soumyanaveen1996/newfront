import { StyleSheet, Platform } from 'react-native';
import { SCREEN_WIDTH, SCREEN_HEIGHT, scrollViewConfig } from './config';
import { GlobalColors } from '../../config/styles';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp
} from 'react-native-responsive-screen';

export const ChannelsListItemColors = {
    titleColor: 'rgba(102, 102, 102, 1)',
    titleColor2: 'rgba(74,74,74,1)',
    subTitleColor: 'rgba(153,153,153,1);',
    dateColor: 'rgb(142, 142, 142)',
    backgroundColor: GlobalColors.white,
    countColor: 'rgb(62,137,252)',
    countTextColor: GlobalColors.white,
    button: GlobalColors.iosBlue
};

export default StyleSheet.create({
    tileContainer: {
        width: scrollViewConfig.width * 0.5,
        height: SCREEN_WIDTH * 0.5,
        borderWidth: 4,
        borderTopWidth: 8,
        borderBottomWidth: 2,
        borderColor: 'transparent',
        borderRadius: 15
    },

    rowContainer: {
        width: SCREEN_WIDTH - 20,
        height: 150,
        borderBottomWidth: 1,
        borderColor: 'transparent',
        borderRadius: 15
    },
    rowContent: {
        flex: 1,
        marginBottom: 10,
        justifyContent: 'center',
        backgroundColor: 'white',
        borderRadius: 15
    },
    avatarContainerStyle: {
        height: 50,
        width: 40
    },
    avatarStyle: {
        height: 40,
        width: 30
    },
    containerStyle: {
        height: 100,
        borderBottomColor: 'transparent',
        justifyContent: 'center'
    },
    titleStyle: {
        fontWeight: 'bold',
        color: GlobalColors.red,
        fontSize: 15
    },
    titleContainerStyle: {
        paddingLeft: 5
    },
    subtitleStyle: {
        fontWeight: '400',
        fontSize: 13
    },
    avatarOverlayContainerStyle: {
        backgroundColor: 'transparent'
    },
    subtitleContainerStyle: {
        padding: 5
    },
    gridStyle: {
        flex: 1
    },
    headerTitleStyle: {
        fontSize: 17,
        color: GlobalColors.white,
        fontWeight: '500'
    },

    headerOuterContainerStyles: {
        position: 'relative',
        borderBottomColor: GlobalColors.accent
    },
    headerinnerContainerForSearch: {
        marginTop: 50
    },
    flatList: {
        height: '100%',
        paddingTop: 15
    },
    container: {
        width: wp('100%'),
        height: '100%',
        flexDirection: 'column',
        borderRadius: 15,
        backgroundColor: ChannelsListItemColors.white,
        position: 'relative'
    },

    image: {
        height: 46,
        width: 46,
        marginTop: 5
    },

    rightContainer: {
        width: '20%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    hidden: {
        display: 'none'
    },
    chatImage: {
        marginTop: 5,
        borderRadius: 7,
        overflow: 'hidden',
        width: 40,
        height: 40
    },
    installButtonText: {
        color: ChannelsListItemColors.button,
        fontSize: 12,
        padding: 3
    },
    searchSection: {
        width: wp('100%'),
        height: 40,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        marginTop: 3
    },
    searchIcon: {
        margin: 10
    },

    input: {
        flex: 1,
        paddingTop: 10,
        paddingRight: 10,
        paddingBottom: 10,
        paddingLeft: 0,
        backgroundColor: '#fff',
        color: 'rgba(155,155,155,1)'
    },
    createNewChannelContainer: {
        width: SCREEN_WIDTH,
        alignItems: 'center',
        justifyContent: 'center',
        height: 6
    },
    buttonContainerCreateChannel: {
        height: hp('6%'),
        width: wp('20%'),
        backgroundColor: 'rgba(0,189,242,1)',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 10,

        shadowOffset: { width: 1, height: 1 },
        shadowColor: 'black',
        shadowOpacity: 0.7
    },
    buttonContainer: {
        height: 40,
        width: wp('80%'),
        backgroundColor: 'rgba(0,189,242,1)',
        borderRadius: 10,
        alignItems: 'center',
        alignSelf: 'center',
        justifyContent: 'center',
        marginVertical: 10,
        shadowOffset: { width: 0.5, height: 1 },
        shadowColor: 'black',
        shadowOpacity: 0.4,
        ...Platform.select({
            android: {
                elevation: 2
            }
        })
    },
    buttonContainerDelete: {
        height: 40,
        width: 300,
        backgroundColor: '#CC0000',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center'
    },
    buttonTextUnSub: {
        color: 'rgba(0,167,214,1)',
        textAlign: 'center',
        fontSize: wp('4%'),
        fontWeight: '500',
        paddingHorizontal: 5
    },
    buttonText: {
        color: '#fff',
        textAlign: 'center',
        fontSize: 14,
        fontWeight: '500',
        paddingHorizontal: 5
    },
    filterContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        width: wp('100%'),
        height: hp('5%'),
        alignItems: 'center',
        flexDirection: 'row',
        backgroundColor: '#fff',
        paddingHorizontal: 10
    },
    filterTextContainer: {
        display: 'flex',
        width: wp('25%'),
        height: hp('8%'),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    filterImage: {
        width: hp('2%'),
        height: hp('2%'),
        marginTop: 4,
        marginLeft: 10
    },
    filterText: {
        color: 'rgba(102, 102, 102, 1)',
        fontFamily: 'SF Pro Text',
        fontSize: 16
    },
    filterArea: {
        display: 'flex',
        flex: 5,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start'
    },
    channelHeaderPart: {
        width: '100%',
        height: 70,
        flexDirection: 'row',
        borderBottomWidth: 0.5,
        borderBottomColor: 'rgba(91, 91, 91, 0.2)',
        justifyContent: 'space-between'
    },
    imageContainer: {
        width: '20%',
        alignItems: 'center',
        justifyContent: 'center'
    },
    textContainer: {
        width: '60%',
        borderLeftWidth: 1,
        paddingLeft: 10,
        borderLeftColor: 'rgba(91, 91, 91, 0.2)',
        justifyContent: 'center'
    },

    title: {
        color: ChannelsListItemColors.titleColor2,
        fontFamily: 'SF Pro Text',
        fontSize: 16,
        fontWeight: '300'
    },
    channelOwnerDetails: {
        color: ChannelsListItemColors.subTitleColor,
        fontSize: wp('2.8%'),
        fontFamily: 'SF Pro Text'
    },
    channelDescription: {
        width: '95%',
        height: 110,
        paddingHorizontal: 10
    },
    channelType: {
        marginTop: 10
    },
    channelTypeText: {
        fontFamily: 'SF Pro Text',
        fontSize: 14,
        textAlign: 'center',
        color: 'rgba(47,199,111,1)'
    },
    channelDescriptionContainer: {
        marginTop: 5,
        paddingHorizontal: 5
    },
    subTitle: {
        color: ChannelsListItemColors.subTitleColor,
        fontSize: 14,
        textAlign: 'center',
        fontFamily: 'SF Pro Text',
        fontWeight: '300'
    },
    channelButtonContainer: {
        marginTop: 10,
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    openChannelButtonContainerUnSub: {
        height: 30,
        width: wp('40%'),
        backgroundColor: 'rgba(255,255,255,1)',
        borderColor: 'rgba(0,167,214,1)',
        borderStyle: 'solid',
        borderWidth: 1.2,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
        marginBottom: 25,
        paddingHorizontal: 5
    },
    openChannelButtonContainer: {
        height: 30,
        width: wp('40%'),
        backgroundColor: 'rgba(0,189,242,1)',
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
        marginBottom: 25,
        paddingHorizontal: 5
    },
    editIcon: {},

    filterMaincontainer: {
        height: hp('10%')
    },
    filterScrollView: {
        flex: 1,
        backgroundColor: GlobalColors.white
    },
    filterChipContainer: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        width: wp('100%'),
        height: hp('11%'),
        padding: 10,
        borderBottomWidth: 0.5,
        backgroundColor: GlobalColors.white,
        borderBottomColor: 'rgba(91, 91, 91, 0.2)',
        alignItems: 'center'
    },
    filterbyHeader: {
        color: '#4A4A4A',
        fontFamily: 'SF Pro Text',
        fontSize: 18,
        marginBottom: 20
    },
    filterCheckBoxContainer: {
        padding: 20,
        width: wp('100%')
    },
    filterButtonContainer: {
        width: SCREEN_WIDTH,
        marginVertical: 20,
        height: 120,
        alignItems: 'center'
    },
    clearFilterConatiner: {
        marginTop: 20,
        backgroundColor: 'transparent'
    },
    clearButtonText: {
        color: 'rgba(0,189,242,1)',
        fontFamily: 'SF Pro Text',
        fontSize: 16
    },
    filterListText: {
        color: '#666666',
        fontFamily: 'SF Pro Text',
        fontSize: 14
    },
    scrollViewCreate: {
        backgroundColor: GlobalColors.white,
        flex: 1
    },
    newChannelContainer: {
        backgroundColor: GlobalColors.white,
        flex: 1,
        alignItems: 'center'
    },
    channelInfoContainer: {
        width: SCREEN_WIDTH - 20,
        padding: 20,
        alignItems: 'flex-start',
        borderBottomColor: '#F4F4F4',
        borderBottomWidth: 1
    },

    addParticipantContainer: {
        width: SCREEN_WIDTH - 20,
        height: hp('10%'),
        // padding: 20,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomColor: '#F4F4F4',
        borderBottomWidth: 1
    },
    entryFields: Platform.select({
        ios: {
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            width: wp('80%'),
            backgroundColor: 'transparent'
        },
        android: {
            width: wp('80%'),
            backgroundColor: 'transparent'
        }
    }),
    errorText: {
        fontSize: wp('3.5%'),
        color: GlobalColors.red,
        paddingBottom: 5
    },

    channelDescText: {
        alignSelf: 'flex-end',
        fontSize: wp('3%'),
        color: 'rgba(102,102,102,1)'
    },

    inputChannel: {
        height: 40,
        width: 300,
        backgroundColor: 'rgba(244,244,244,1)',
        padding: 10,
        color: 'rgba(0,0,0,0.8)',
        fontSize: 16,
        borderTopRightRadius: 0,
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
        borderTopLeftRadius: 10,
        marginBottom: 10
    },

    inputChannelDescription: {
        height: 80,
        width: 300,
        justifyContent: 'flex-start',
        backgroundColor: 'rgba(244,244,244,1)',
        padding: 10,
        color: 'rgba(0,0,0,0.8)',
        fontSize: 16,
        borderTopRightRadius: 0,
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
        borderTopLeftRadius: 10
    },
    channelText: {
        color: '#4A4A4A',
        fontFamily: 'SF Pro Text',
        fontSize: 16,
        marginBottom: 20
    },
    channelTextP: {
        color: '#4A4A4A',
        fontFamily: 'SF Pro Text',
        fontSize: 16,
        // marginBottom: 20,
        paddingLeft: 20
    },
    addContactsContainer: {
        height: '100%',
        justifyContent: 'space-between',
        backgroundColor: GlobalColors.white
    },
    contactContainer: {
        flexDirection: 'row',
        width: SCREEN_WIDTH - 40,
        height: 60,
        alignItems: 'center',
        padding: 10
    },
    contactAddedContainer: {
        backgroundColor: 'transparent',
        flexDirection: 'row',
        width: SCREEN_WIDTH - 40,
        height: 60,
        alignItems: 'center',
        padding: 10
    },
    contactImage: {
        marginRight: 10
    },
    selectContactContainer: {
        maxHeight: hp('20%'),
        backgroundColor: '#f4f4f4',
        alignItems: 'stretch'
    },
    selectedChip: {
        paddingBottom: wp('2%'),
        paddingHorizontal: wp('2%'),
        alignSelf: 'flex-start'
    },
    chipFont: {
        fontSize: wp('3.5%'),
        color: 'rgba(102,102,102,1)'
    },
    participantsContainer: {
        maxHeight: hp('50%'),
        flexGrow: 1
    },
    teamContainer: {
        height: hp('70%')
    },
    participantName: {
        fontSize: wp('4%'),
        color: 'rgb(23, 19, 19)'
    },
    participantEmail: {
        fontSize: wp('3%'),
        color: 'rgb(180, 180, 180)'
    },
    filterSelected: {
        paddingHorizontal: wp('2%'),
        paddingVertical: wp('1%')
    },
    selectedFilterTitle: {
        fontSize: wp('3%'),
        color: '#FFFFFF'
    },
    radioLabel: {
        fontSize: hp('2%'),
        color: '#666666'
    },
    radioButton: {
        marginLeft: wp('10%')
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
    propic: {
        height: 30,
        width: 30,
        borderRadius: 15
    },

    //CHANNEL ADMIN
    adminContainer: {
        backgroundColor: GlobalColors.white,
        paddingTop: 30,
        width: '100%',
        overflow: 'hidden'
    },
    adminTopArea: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        paddingBottom: 30,
        paddingLeft: 15,
        overflow: 'hidden',
        width: '100%'
    },
    adminLogo: {
        height: 80,
        width: 80
    },
    adminTopRightArea: {
        width: wp('70%'),
        paddingHorizontal: 10,
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        overflow: 'hidden'
    },
    adminH1: {
        width: SCREEN_WIDTH - 120,
        flexWrap: 'wrap',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        color: GlobalColors.grey
    },
    adminH2: {
        fontSize: 16,
        fontWeight: '400',
        color: GlobalColors.grey
    },
    adminH3: {
        fontSize: 14,
        fontWeight: '100',
        color: GlobalColors.grey
    },
    adminRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 25,
        paddingHorizontal: 20
    },
    requestIgnoreButton: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 75,
        height: 35,
        marginHorizontal: 15,
        borderWidth: 1,
        borderColor: GlobalColors.sideButtons,
        borderRadius: 5,
        backgroundColor: GlobalColors.white
    },
    requestIgnoreText: {
        fontSize: 16,
        color: GlobalColors.sideButtons
    },
    requestAcceptButton: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 75,
        height: 35,
        borderWidth: 1,
        borderColor: GlobalColors.sideButtons,
        borderRadius: 5,
        backgroundColor: GlobalColors.sideButtons
    },
    requestAcceptText: {
        fontSize: 16,
        color: GlobalColors.white
    },
    ownerRowLeft: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center'
    },
    ownerModal: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    ownerModalContainer: {
        width: '90%',
        aspectRatio: 1,
        flexDirection: 'column',
        alignItems: 'stretch',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingVertical: 35,
        borderRadius: 10,
        backgroundColor: GlobalColors.white
    },
    ownerModalButtonArea: {
        flexDirection: 'row',
        justifyContent: 'space-around'
    },
    ownerModalWarningArea: {
        flexDirection: 'row',
        justifyContent: 'center'
    },
    ownerModalButtonCancel: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '45%',
        borderWidth: 1,
        borderColor: GlobalColors.sideButtons,
        borderRadius: 5,
        backgroundColor: GlobalColors.white
    },
    ownerModalButtonYes: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '45%',
        height: 35,
        borderWidth: 1,
        borderColor: GlobalColors.sideButtons,
        borderRadius: 5,
        backgroundColor: GlobalColors.sideButtons
    },
    newOwnerTitle: {
        fontSize: 18,
        fontWeight: '500',
        color: GlobalColors.grey,
        marginTop: 60,
        marginBottom: 20
    },
    emptyComponent: {
        height: 40
    },
    requestModalContainer: {
        width: '90%',
        aspectRatio: 1,
        alignItems: 'center',
        justifyContent: 'space-evenly',
        backgroundColor: GlobalColors.white,
        borderRadius: 10
    },
    requestModalYesButton: {
        width: '80%',
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: GlobalColors.frontmLightBlue,
        borderColor: GlobalColors.frontmLightBlue,
        borderWidth: 1,
        borderRadius: 5
    },
    requestModalNoButton: {
        width: '80%',
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: GlobalColors.white,
        borderColor: GlobalColors.frontmLightBlue,
        borderWidth: 1,
        borderRadius: 5
    }
});
