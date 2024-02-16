import { StyleSheet, Platform, Dimensions } from 'react-native';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp
} from 'react-native-responsive-screen';
const SCREEN_WIDTH = Dimensions.get('window').width;

import GlobalColors from '../../config/styles';
import AppFonts from '../../config/fontConfig';

export const ChannelsListItemColors = {
    titleColor: 'rgba(102, 102, 102, 1)',
    titleColor2: 'rgba(74,74,74,1)',
    subTitleColor: 'rgba(153,153,153,1);',
    dateColor: 'rgb(142, 142, 142)',
    backgroundColor: GlobalColors.appBackground,
    countColor: 'rgb(62,137,252)',
    countTextColor: GlobalColors.white,
    button: GlobalColors.primaryColor
};

export default StyleSheet.create({
    searchBar: {
        // marginTop: 10,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        backgroundColor: GlobalColors.appBackground,
        borderBottomWidth: 1,
        borderBottomColor: GlobalColors.borderBottom,
        height: 40,
        // marginVertical: 3,
        paddingHorizontal: 15,
        borderWidth: 1,
        // borderColor: GlobalColors.textDarkGrey,
        // marginBottom: 10,
        borderColor: 'transparent',
        marginHorizontal: 20,
        marginVertical: 10,
        borderRadius: 33,
        ...Platform.select({
            ios: {},
            android: { elevation: 5 }
        })
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
    filterButtonContainer: {
        width: SCREEN_WIDTH,
        marginVertical: 20,
        height: 120,
        alignItems: 'center'
    },
    addContactsContainer: {
        flex: 1,
        justifyContent: 'space-between',
        backgroundColor: GlobalColors.appBackground
    },
    selectedChip: {
        marginLeft: 20,
        paddingBottom: wp('2%'),
        paddingHorizontal: wp('2%'),
        alignSelf: 'flex-start',
        flexDirection: 'row'
    },
    chipFont: {
        fontSize: wp('3.5%'),
        color: 'rgba(102,102,102,1)'
    },
    propic: {
        height: 30,
        width: 30,
        borderRadius: 15
    },
    contactPickerListContainer: {
        flexGrow: 1,
        flex: 1
    },
    contactContainer: {
        backgroundColor: GlobalColors.appBackground,
        flexDirection: 'row',
        width: SCREEN_WIDTH - 20,
        height: 50,
        // marginBottom: 8,
        alignItems: 'center',
        // padding: 10,
        // borderWidth: 1,
        borderRadius: 8,
        ...Platform.select({
            ios: {},
            android: { elevation: 8 }
        }),
        marginHorizontal: 10,
        marginVertical: 5
    },
    contactItemImage: {
        height: 40,
        width: 40,
        borderRadius: 40 / 2,
        marginRight: 17
    },
    participantName: {
        fontSize: 18,
        color: GlobalColors.primaryTextColor,
        fontFamily: 'SF Pro Display'
    },
    participantEmail: {
        fontSize: 14,
        color: GlobalColors.descriptionText
    },
    buttonContainer: {
        height: 32,
        width: wp('60%'),
        backgroundColor: GlobalColors.primaryButtonColor,
        borderRadius: 20,
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
    buttonText: {
        color: GlobalColors.primaryButtonText,
        textAlign: 'center',
        fontSize: 14,
        fontWeight: AppFonts.BOLD,
        paddingHorizontal: 5
    }
});
