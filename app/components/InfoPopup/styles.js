import { StyleSheet } from 'react-native';
import { GlobalColors } from '../../config/styles';

export default StyleSheet.create({
    container: {
        position: 'absolute',
        top:0,
        bottom:0,
        left:0,
        right:0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: GlobalColors.modalBackground,
    },
    infoListRowContainer: {
        paddingTop: 25,
        paddingBottom: 25,
        paddingLeft: 15,
        paddingRight: 15,
        flexDirection: 'row',
        backgroundColor: GlobalColors.white,
    },
    infoListRowTitle: {
        textAlign: 'left',
        flex: 3,
        fontSize: 15,
        fontFamily: 'Helvetica Neue',
        fontWeight: 'bold',
        color: 'rgb(181,186,201)'
    },
    infoListRowSubTitle: {
        textAlign: 'right',
        flex: 7,
        fontSize: 15,
        fontWeight: 'bold',
        color: GlobalColors.accent,
    },
    webView: {
        flex: 1,
        backgroundColor: GlobalColors.background,
    },
    listView: {
        flex: 1,
        backgroundColor: GlobalColors.background,
    },
    separator: {
        height: 1,
        backgroundColor: GlobalColors.background,
    },
    sectionDivider: {
        height: 20,
        backgroundColor: GlobalColors.background,
    },
});
