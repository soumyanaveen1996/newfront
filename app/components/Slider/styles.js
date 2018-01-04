import { StyleSheet } from 'react-native';
import { SCREEN_HEIGHT }  from './config';
import { GlobalColors } from '../../config/styles';

export const HEADER_HEIGHT = 50;

export default StyleSheet.create({
    headerView: {
        height: HEADER_HEIGHT,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderTopWidth: 1,
        borderColor: 'lightgrey',
        backgroundColor: 'rgb(242, 242, 242)',
        justifyContent: 'center',
    },
    closeButton: {
        height:24,
        width:24,
        marginLeft:15,
    },
    closeImg: {
        height:24,
        width:24
    },
    sliderIconView: {
        flex:1,
        alignItems:'center'
    },
    listContainer1: {
        paddingLeft:15,
    },
    scrollView: {
        backgroundColor: 'rgb(232, 232, 232)',
    },
    listcontainer2: {
        flex:1,
        borderBottomWidth:1,
        borderColor:'lightgrey',
        flexDirection:'row',
        paddingVertical: 12,
    },
    textContainer: {
        flex:1,
        justifyContent:'center'
    },
    textStyle: {
        fontSize:16,
        color:'#24282f'
    },
    infoImageContainer: {
        width:52,
        justifyContent:'center',
        alignItems:'center'
    },
    infoIconStyle: {
        height:22,
        width:22
    },
    rightButton: {
        flex:1,
        paddingRight:15,
        alignItems:'flex-end'
    },
    rightButtonText: {
        fontSize:17,
        color: GlobalColors.accent,
        fontWeight:'500'
    },
    checkboxContainer: {
        width: 22,
        height: 22,
        marginRight:12.5,
        padding: 0,
        marginLeft: 0,
        marginVertical: 0,
        backgroundColor: GlobalColors.transparent,
    },
    checkboxIconStyle: {
        height:22,
        width:22,
    },
    animatedView: {
        backgroundColor: 'white',
        height: SCREEN_HEIGHT / 1.6,
        width : '100%'
    },
    sliderIconImg: {
        height: 18,
        width: 42,
    }
})


