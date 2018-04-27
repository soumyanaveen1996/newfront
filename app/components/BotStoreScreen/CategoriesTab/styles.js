import { StyleSheet } from 'react-native';
import { SCREEN_WIDTH , scrollViewConfig }  from './config'
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

    },
    gridStyle :{
        flex: 1,
        padding: 0,
        backgroundColor: 'red',
    },
    listViewContentContainerStyle : {
        width :scrollViewConfig.width ,
        alignSelf : 'center'
    }
})


