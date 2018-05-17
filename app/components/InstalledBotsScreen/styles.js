import { StyleSheet } from 'react-native';
import { SCREEN_WIDTH , scrollViewConfig}  from './config';
import { GlobalColors } from '../../config/styles';

export default StyleSheet.create({
    tileContainer: {
        width: scrollViewConfig.width * 0.5,
        height: SCREEN_WIDTH * 0.5,
        borderWidth: 4,
        borderTopWidth : 8,
        borderBottomWidth : 2,
        borderColor: 'transparent',
        borderRadius:15,
    },
    rowContainer: {
        width: SCREEN_WIDTH ,
        height:105 ,
        borderBottomWidth : 1,
        borderColor: 'transparent',
        borderRadius:15,
    },
    rowContent: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'white'
    },
    avatarContainerStyle:{
        height:50 ,
        width:40
    },
    avatarStyle:{
        height:40 ,
        width:30
    },
    containerStyle:{
        height:100,
        borderBottomColor:'transparent',
        justifyContent:'center'
    },
    titleStyle:{
        fontWeight:'bold',
        color:GlobalColors.red,
        fontSize:15
    },
    titleContainerStyle:{
        paddingLeft:5
    },
    subtitleStyle:{
        fontWeight:'400',
        fontSize:13
    },
    avatarOverlayContainerStyle:{
        backgroundColor:'transparent'
    },
    subtitleContainerStyle:{
        padding:5
    },
    gridStyle :{
        flex: 1
    },
    headerTitleStyle: {
        fontSize:17,
        color: GlobalColors.white,
        fontWeight:'500'
    },
    headerOuterContainerStyles:{
        position: 'relative',
        borderBottomColor : GlobalColors.accent
    },
    headerinnerContainerForSearch : {
        marginTop:50
    },

    searchBar: {
        backgroundColor: GlobalColors.accent,
        height: 36,
    },
    searchTextInput: {
        marginHorizontal: 20,
        justifyContent : 'flex-start',
        fontSize: 13,
        paddingHorizontal: 5,
        backgroundColor: GlobalColors.headerTextInputBackground,
        borderRadius: 2,
        height: 27,
        color: GlobalColors.white,
    },
    flatList: {
        height :'100%'
    },
    loading: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center'
    },
    image: {
        height: 40,
        width: 40,
        marginTop: 5,
    },
    swipeBtnStyle: {
        marginTop: 38,
    },
})



