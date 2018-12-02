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
        flex: 1,
        backgroundColor: GlobalColors.background
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
    contactItemImage: {
        height: 44,
        width: 44,
        borderRadius: 22,
        marginLeft: 10,
        marginRight: 12
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
    }
});

export default stylesheet;
