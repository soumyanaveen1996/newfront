import { StyleSheet } from 'react-native';
import { scrollViewConfig }  from './config'
export default StyleSheet.create({
    tileContainer: {

    },
    gridStyle :{
        width: scrollViewConfig.width * 0.5 - 1,
        height: scrollViewConfig.width * 0.5 - 1
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
    iconStyle: {
        height:80,
        width:80,
        borderRadius : 40 ,
    },
    authenticateButton : {
        backgroundColor : '#bbb',
        borderRadius : 60 ,
        width : 80 ,
        height : 80,
        alignItems:'center',
        justifyContent :'center'
    },
    plusText: {
        color: '#333333',
        fontSize: 50,
        fontWeight : 'normal'
    },
    listViewContentContainerStyle : {
        flex: 1,
        paddingVertical: 0
    }
})


