import { StyleSheet } from 'react-native';
import { SCREEN_WIDTH ,scrollViewConfig }  from './config'
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

    tileContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white'
    },
    tileTitle: {
        color: '#333333',
        fontSize: 15,
        marginTop : 10
    },
    iconStyle :{
        height:80,
        width:80,
        borderRadius : 40 ,

    }, authenticateButton : {
        backgroundColor : '#bbb',
        borderRadius : 60 ,
        width : 80 ,
        height : 80,
        alignItems:'center',
        justifyContent :'center'
    },
    plusText: {
        color: '#333333',
        fontSize: 30,
        fontWeight : 'normal'
    },
    gridStyle :{
        flex: 1
    },
    listViewContentContainerStyle : {
        width :scrollViewConfig.width ,
        alignSelf : 'center'
    }
})


