import { StyleSheet } from 'react-native';
import { GlobalColors } from '../../config/styles';
import { TextColor, BotFilter } from './config';

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
        flexDirection: 'column',
    },
    botfilterContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: BotFilter.height,
        backgroundColor: GlobalColors.white,
    },
    header: {
        height: 55,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: TextColor,
    },
    searchTextInput: {
        fontSize: 13,
        height: 40,
        backgroundColor: GlobalColors.background,
        color: TextColor,
        paddingHorizontal: 10,
    },
    bot: {
        width: '49.9%',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 15,
        paddingBottom: 17,
        marginBottom: 1,
        backgroundColor: GlobalColors.white,
    },
    botImage: {
        height: 80,
        width: 80,
        marginBottom: 10,
    },
    botTitle: {
        fontSize: 14,
        fontWeight: '400',
        color: 'rgb(173, 185, 214)',
        textAlign: 'center',
    },
    botScrollView: {
        flex: 1,
        backgroundColor: GlobalColors.background,
    },
    botsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        backgroundColor: GlobalColors.background
    },
    loading: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    }
});
