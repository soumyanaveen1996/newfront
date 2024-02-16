import { Platform, StyleSheet } from 'react-native';
import GlobalColors from '../../../../config/styles';
import AppFonts from '../../../../config/fontConfig';

export default StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        padding: 10,
        backgroundColor: GlobalColors.fullScreenMessageBackgroundV2
    },
    separator: {
        // backgroundColor: GlobalColors.disabledGray,
        width: '100%',
        height: 6
    },
    table: {
        marginTop: 8,
        backgroundColor: GlobalColors.fullScreenMessageBackgroundV2
    },
    tableContentContainer: {
        backgroundColor: GlobalColors.fullScreenMessageBackgroundV2
    },
    rowsContainerOpen: {
        alignItems: 'stretch'
    },
    rowsContainerClose: {
        alignItems: 'stretch'
    },
    rowContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'stretch',
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10
    },
    detailRowContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        alignContent: 'center',
        borderRadius: 10,
        paddingVertical: 8,
        paddingHorizontal: 20
    },
    rowLeftContainer: {
        flexDirection: 'row',
        flex: 1,
        alignItems: 'center'
    },

    titleRowContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        borderRadius: 10,
        paddingVertical: 4,
        paddingHorizontal: 20,
        paddingVertical: 12
    },
    iconContainer: {
        alignSelf: 'flex-start',
        width: 35,
        flexDirection: 'row',
        alignItems: 'center'
    },
    entryTitleContainer: {
        alignSelf: 'stretch',
        justifyContent: 'center',
        flex: 1,
        minHeight: 18
    },
    mainKeyText: {
        color: GlobalColors.primaryTextColor,
        fontSize: 14,
        fontWeight: AppFonts.LIGHT
    },
    mainKeyValueText: {
        color: GlobalColors.primaryTextColor,
        fontSize: 14,
        fontWeight: AppFonts.BOLD
    },
    mainKeyValueSubText: {
        color: GlobalColors.primaryTextColor,
        fontSize: 12
    },

    keyText: {
        color: GlobalColors.tableDeatilKey,
        fontSize: 12,
        marginRight: 5,
        textTransform: 'capitalize'
    },
    valueText: {
        color: GlobalColors.textBlack,
        fontSize: 12,
        width: '40%'
    },
    callButton: {
        width: '40%'
    },
    callIconContainer: {
        height: 40,
        width: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center'
    },
    errorImage: {
        color: GlobalColors.textDarkGrey,
        height: 24,
        width: 24,
        marginStart: 24,
        alignContent: 'center',
        justifyContent: 'center'
    },
    errorText: {
        color: GlobalColors.textDarkGrey,
        fontSize: 12,
        textTransform: 'capitalize'
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-end'
    },
    rowMenuContainer: {
        position: 'absolute',
        width: 50,
        height: 50,
        alignSelf: 'flex-end',
        top: 40,
        backgroundColor: GlobalColors.green
    },
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: GlobalColors.fullScreenMessageBackgroundV2
    },
    modeSwitch: {
        transform: [{ scaleX: 0.7 }, { scaleY: 0.7 }],
        marginRight: 5
        // marginLeft: 15
    },
    switchText: {
        color: GlobalColors.textBlack
    },
    calendar: {
        // borderBottomColor: GlobalColors.disabledGray,
        backgroundColor: GlobalColors.tableItemBackground
    },
    buttonsContainer: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: GlobalColors.fullScreenMessageBackgroundV2,
        marginBottom: 10
    },
    actionsButton: {
        backgroundColor: GlobalColors.primaryButtonColor,
        justifyContent: 'center',
        alignItems: 'center',
        height: 28,
        width: 28,
        borderRadius: 10
    },
    confirmActionText: {
        color: GlobalColors.white,
        fontWeight: AppFonts.SEMIBOLD
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10
    },
    searchInput: {
        color: GlobalColors.textBlack,
        fontSize: 14,
        paddingVertical: 8,
        paddingLeft: 4,
        flex: 1
    },
    noDataText: {
        fontSize: 18,
        margin: 16,
        alignSelf: 'center',
        color: GlobalColors.grey
    },
    noData: {
        flex: 1,
        alignItems: 'center'
    },
    textButtin: {
        borderColor: GlobalColors.primaryButtonColor,
        borderWidth: 2,
        borderRadius: 4,
        padding: 2,
        color: GlobalColors.frontmLightBlue
    },
    serachBar: {
        borderColor: 'rgba(0, 167, 214, 0.4)',
        borderWidth: 1,
        borderRadius: 6
    },
    filterText: {
        fontSize: 14,
        fontWeight: AppFonts.BOLD,
        flex: 1,
        padding: 8,
        paddingVertical: 16,
        backgroundColor: GlobalColors.fullScreenMessageBackgroundV2
    },
    bottomButtons: {
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        marginTop: 26,
        marginBottom: 20
    },
    button: {
        width: '44%',
        marginHorizontal: 12,
        height: 40,
        justifyContent: 'center',
        backgroundColor: GlobalColors.frontmLightBlue
    },
    filterModalHeader: {
        justifyContent: 'space-between',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        marginVertical: 22
    },
    headerButtonContainer: {
        alignContent: 'flex-end',
        flexDirection: 'row'
    },
    filterBarDropDownIcon: {
        alignSelf: 'flex-end',
        paddingHorizontal: 4
    },
    filterBarIcon: {
        alignSelf: 'flex-end',
        paddingHorizontal: 4
    },
    activeFilerName: {
        color: '#44485a',
        flex: 1,
        fontSize: 14,
        marginLeft: 16
    },
    filterBarInnerContainer: {
        flex: 1,
        marginHorizontal: 8,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center'
    },
    filterBarButton: {
        height: 48,
        width: '100%',
        color: '#666666',
        fontSize: 16,
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: GlobalColors.darkGray,
        textAlign: 'center',
        justifyContent: 'center',
        borderRadius: 6
    },
    filterBarContainerStyle: {
        margin: 0,
        padding: 0,
        borderRadius: 10,
        marginBottom: 10
    },
    filterContainer: { flex: 1, alignContent: 'flex-start' },
    filterModalDivider: {
        marginHorizontal: 24,
        borderBottomWidth: 1,
        borderBottomColor: GlobalColors.formDevider
    },
    filterModalItem: {
        fontSize: 14,
        color: GlobalColors.formText,
        paddingVertical: 16,
        // borderBottomStyle: 'solid',
        paddingLeft: 34
    },
    filterModalCreateButtonText: {
        fontSize: 14,
        color: GlobalColors.frontmLightBlue,
        textTransform: 'capitalize'
    },
    filterModalTitle: {
        fontSize: 14,
        fontWeight: AppFonts.BOLD,
        color: GlobalColors.formText
    },
    savedfiltersLable: {
        opacity: 0.5,
        fontSize: 10,
        color: GlobalColors.formText,
        marginLeft: 24
    },
    swipeActionButton: {
        margin: 0,
        borderRadius: 10,
        padding: 4,
        aspectRatio: 1,
        backgroundColor: GlobalColors.tableItemBackground
    },
    headerButtonLabel: {
        fontSize: 12,
        color: GlobalColors.formText,
        fontWeight: AppFonts.NORMAL
    },
    leftHeaderButton: {
        backgroundColor: GlobalColors.tableItemBackground,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center'
    },
    sectionListHeaderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 0,
        marginHorizontal: 6,
        marginTop: 2,
        backgroundColor: GlobalColors.tableItemBackground,
        borderRadius: 10,
        borderColor: GlobalColors.tableItemBackground,
        paddingVertical: 12,
        paddingHorizontal: 12
    },
    seactionListHeaser: {
        fontSize: 14,
        fontWeight: AppFonts.BOLD,
        fontStyle: 'normal',
        lineHeight: 20,
        letterSpacing: -0.36,
        color: GlobalColors.formText
    },
    sectionListSubHeader: {
        paddingLeft: 10,
        fontSize: 12,
        fontWeight: AppFonts.NORMAL,
        fontStyle: 'normal',
        letterSpacing: 0,
        color: GlobalColors.formLable
    },
    actionSheetItem: {
        borderBottomColor: GlobalColors.itemDevider,
        borderBottomWidth: 1,
        height: 50,
        justifyContent: 'center'
    },
    actionSheetCancel: {
        color: GlobalColors.primaryButtonColor,
        fontSize: 14,
        fontWeight: AppFonts.BOLD,
        textAlign: 'center',
        justifyContent: 'center'
    },
    bootomButtonContainer: {
        height: 70,
        margin: -10,
        marginTop: 0,
        ...Platform.select({
            ios: {},
            android: { elevation: 8 }
        })
    },
    tableRowTitleCard: {
        margin: 6,
        padding: 0,
        ...Platform.select({
            ios: {},
            android: { elevation: 3 }
        }),
        borderRadius: 10,
        backgroundColor: GlobalColors.tableItemBackground
    },
    tableRowDetailCard: {
        margin: 0,
        padding: 0,
        ...Platform.select({
            ios: {},
            android: { elevation: 3 }
        }),
        borderRadius: 10,
        backgroundColor: GlobalColors.tableItemBackground
    },
    notificationIcon: {
        height: 22,
        width: 22,
        resizeMode: 'contain'
    },
    notificationIconContainer: {
        width: 32,
        alignSelf: 'center',
        alignItems: 'flex-start'
    },
    quicActionButtonText: {
        fontSize: 12,
        color: GlobalColors.formText,
        marginTop: 2
    },
    multiSelectOptionButton: {
        width: '100%',
        height: 38,
        borderRadius: 19,
        paddingHorizontal: 12,
        paddingVertical: 4,
        alignContent: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: GlobalColors.frontmLightBlue
    },
    multiSelectOptionButtonText: {
        fontSize: 14,
        fontWeight: AppFonts.BOLD,
        color: GlobalColors.white
    },
    actionButton: {
        borderColor: GlobalColors.primaryButtonColor,
        borderRadius: 6,
        borderWidth: 1,
        padding: 4
    }
});
