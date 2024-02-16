import { StyleSheet, StatusBar, Platform } from 'react-native';
import GlobalColors from '../../../config/styles';
import AppFonts from '../../../config/fontConfig';

const stylesheet = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: GlobalColors.appBackground
    },
    item: {
        flex: 1,
        flexDirection: 'row',
        paddingLeft: 26,
        paddingRight: 20,
        paddingVertical: 10,
        marginVertical: 2,
        justifyContent: 'space-between'
        // marginHorizontal: 16
    },
    chatItem: {
        flex: 1,
        flexDirection: 'row',
        paddingLeft: 26,
        paddingRight: 20,
        paddingVertical: 10,
        marginVertical: 2
        // marginHorizontal: 16
    },
    groupInnerContainer: {
        flexDirection: 'row'
    },
    selectedItemContainer: {
        backgroundColor: GlobalColors.contentBackgroundColor,
        justifyContent: 'space-between'
    },
    selectedIcon: {
        alignSelf: 'center'
    },
    selectedName: {
        color: GlobalColors.primaryTextColor,
        fontWeight: AppFonts.BOLD,
        width: 80,
        textAlign: 'center'
    },
    contactItemImage: {
        height: 50,
        width: 50,
        borderRadius: 50 / 2,
        marginRight: 17
    },
    participantItemImage: {
        height: 40,
        width: 40,
        borderRadius: 40 / 2,
        marginRight: 17
    },
    contactName: {
        fontSize: 14,
        alignSelf: 'center',
        color: GlobalColors.chatTitle,
        fontWeight: AppFonts.BOLD
    },
    groupText: {
        fontSize: 16,
        alignSelf: 'center',
        color: GlobalColors.primaryColor,
        marginTop: 10,
        fontWeight: AppFonts.BOLD
    },
    groupAddIcon: {
        backgroundColor: GlobalColors.primaryColor,
        height: 50,
        width: 50,
        borderRadius: 50 / 2,
        marginRight: 17,
        marginTop: 10,
        alignSelf: 'center',
        justifyContent: 'center'
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
    addressBookContainer: {
        flex: 1,
        backgroundColor: GlobalColors.appBackground
    },
    noSearchFound: {
        justifyContent: 'center',
        flex: 1,
        alignSelf: 'center',
        height: '100%'
    },
    noSearchText: {
        textAlign: 'center',
        color: GlobalColors.menuSubLable,
        fontSize: 16
    },
    noSearchSubText: {
        textAlign: 'center',
        color: GlobalColors.headerGreyBtn,
        fontSize: 14
    },
    selectedContainer: {
        marginLeft: 10,
        marginVertical: 10
    },
    cancelBtn: {
        position: 'absolute',
        right: 18,
        top: 0,
        marginBottom: 25,
        backgroundColor: GlobalColors.primaryColor,
        borderRadius: 50,
        height: 28,
        width: 28,
        justifyContent: 'center'
    },
    selectedItem: {
        paddingHorizontal: 8,
        justifyContent: 'center',
        alignItems: 'center'
    },
    createGroupContainer: {
        alignItems: 'center'
    },
    groupIconContainer: {
        marginTop: 40,
        marginBottom: 10
    },
    participantText: {
        fontSize: 18,
        marginHorizontal: 38,
        marginTop: 15,
        marginBottom: 15,
        color: GlobalColors.primaryTextColor
    },
    participantSecondText: {
        fontSize: 18,
        color: GlobalColors.primaryTextColor
    },
    addBtn: {
        fontSize: 16,
        color: GlobalColors.primaryButtonColor,
        alignSelf: 'center',
        paddingLeft: 5,
        fontWeight: AppFonts.BOLD
    },
    addContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginLeft: 30,
        marginRight: 22,
        marginTop: 15,
        marginBottom: 15
    },
    groupNameContainer: {
        width: '65%',
        justifyContent: 'center',
        alignSelf: 'center',
        display: 'flex',
        paddingBottom: 20
    },
    groupDescContainer: {
        width: '85%',
        justifyContent: 'center',
        alignSelf: 'center',
        display: 'flex',
        marginBottom: 15
    },
    groupName: {
        height: 42,
        borderColor: GlobalColors.itemDevider,
        borderBottomWidth: 1,
        textAlign: 'center',
        fontSize: 20,
        fontWeight: AppFonts.BOLD,
        color: GlobalColors.formText
    },
    groupDesc: {
        paddingHorizontal: 10,
        borderColor: GlobalColors.formBorderColor,
        borderWidth: 1,
        borderRadius: 10,
        color: GlobalColors.formText,
        alignItems: 'flex-start',
        ...Platform.select({
            ios: {
                height: 80
            }
        })
    },
    divider: {
        backgroundColor: GlobalColors.itemDevider,
        height: 5
    },
    options: {
        paddingHorizontal: 15,
        paddingVertical: 15,
        borderBottomWidth: 1,
        marginHorizontal: 10,
        borderBottomColor: '#e8e8e8'
    },
    cancelOption: {
        paddingHorizontal: 15,
        paddingVertical: 15,
        marginHorizontal: 10
    },
    optionsText: {
        fontSize: 18,
        color: '#2a2d3c'
    },
    cancelOptionsText: {
        fontSize: 18,
        color: GlobalColors.primaryButtonColor,
        textAlign: 'center'
    },
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
        marginBottom: 20
    },
    fromOtherOption: {
        paddingVertical: 15,
        paddingHorizontal: 30
    },
    fromOptionText: {
        fontSize: 15,
        fontWeight: AppFonts.LIGHT,
        fontStyle: 'normal',
        color: GlobalColors.primaryTextColor
    },
    fromDivider: {
        backgroundColor: GlobalColors.itemDevider,
        height: 1
    }
});

export default stylesheet;
