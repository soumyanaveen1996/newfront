import { StyleSheet, Platform } from 'react-native';
import { SCREEN_WIDTH, SCREEN_HEIGHT, scrollViewConfig } from './config';
import { GlobalColors } from '../../config/styles';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp
} from 'react-native-responsive-screen';

export const ChannelsListItemColors = {
    titleColor: 'rgba(102, 102, 102, 1)',
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
        height: 180,
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
        height: hp('6%'),
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        marginTop: 3
    },
    searchIcon: {
        padding: 10
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
        backgroundColor: 'rgba(244,244,244,1)',
        alignItems: 'center',
        justifyContent: 'center'
    },
    buttonContainer: {
        height: 40,
        width: 300,
        backgroundColor: 'rgba(0,189,242,1)',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 10
    },
    buttonContainerDelete: {
        height: 40,
        width: 300,
        backgroundColor: '#CC0000',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center'
    },
    buttonText: {
        color: '#fff',
        textAlign: 'center',
        fontSize: wp('4%'),
        fontWeight: '500',
        paddingHorizontal: 5
    },
    filterContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        width: wp('100%'),
        height: hp('10%'),
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
        paddingTop: 15,
        borderLeftColor: 'rgba(91, 91, 91, 0.2)'
    },

    title: {
        color: ChannelsListItemColors.titleColor,
        fontFamily: 'SF Pro Text',
        fontSize: wp('5%'),
        fontWeight: '600'
    },
    channelOwnerDetails: {
        color: ChannelsListItemColors.subTitleColor,
        fontSize: wp('2.8%'),
        fontFamily: 'SF Pro Text'
    },
    channelDescription: {
        width: '100%',
        height: 110
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
        marginTop: 5
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
    openChannelButtonContainer: {
        height: hp('4%'),
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
        height: hp('15%'),
        padding: 10,
        borderBottomWidth: 0.5,
        backgroundColor: GlobalColors.white,
        borderBottomColor: 'rgba(91, 91, 91, 0.2)'
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
        marginBottom: 20,
        paddingLeft: 20
    },
    addContactsContainer: {
        backgroundColor: GlobalColors.white,
        flex: 1
    },
    contactContainer: {
        backgroundColor: GlobalColors.white,
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
        height: hp('20%'),
        backgroundColor: '#f4f4f4'
    },
    selectedChip: {
        paddingBottom: wp('2%'),
        paddingHorizontal: wp('2%')
    },
    chipFont: {
        fontSize: wp('3.5%'),
        color: 'rgba(102,102,102,1)'
    },
    participantsContainer: {
        height: hp('50%')
    },
    teamContainer: {
        height: hp('80%')
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
    }
});
