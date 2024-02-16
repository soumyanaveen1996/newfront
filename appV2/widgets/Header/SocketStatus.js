import React, { useEffect,useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { View, Text, Platform } from 'react-native';
import GlobalColors from '../../config/styles';
import ChatStatusBar from '../ChatStatusBar';
import Store from '../../redux/store/configureStore';
import { setNetwork, setNetworkMsgUI } from '../../redux/actions/UserActions';

const SocketStatus=(props)=>{

    const [globalNetworkStatus,setGlobalNetworkStatus] =useState('none');
    const [globalSocketStatus,setLocalSocketStatus] =useState('connected'); 
    const [networkMsgUI,setMsgUI] =useState(false); 

    const reduxValueOfNetwork = useSelector(
        (state) => state.user.network
    );
    const reduxNetworkStatusMsgUI = useSelector(
        (state) => state.user.networkMsgUI
    );
    useEffect(()=>{
        setMsgUI(reduxNetworkStatusMsgUI)
    },[reduxNetworkStatusMsgUI]);
   
    useEffect(()=>{
        setGlobalNetworkStatus(reduxValueOfNetwork)
    },[reduxValueOfNetwork]);

    const closeMsgAll=()=>{
        Store.dispatch(setNetworkMsgUI(false))
        return props.onChatStatusBarClose()
    }

    const reduxValueOfSocketAlive = useSelector(
        (state) => state.user.socketAlive
    );
    useEffect(()=>{
        setLocalSocketStatus(reduxValueOfSocketAlive)
    },[reduxValueOfSocketAlive])

return (<View>
    {networkMsgUI && globalSocketStatus!=='connected'?<View>
            <ChatStatusBar
                network={globalNetworkStatus}
                onChatStatusBarClose={closeMsgAll}
            />
            </View>:
            null}
        </View>
        );

}

export default SocketStatus;
