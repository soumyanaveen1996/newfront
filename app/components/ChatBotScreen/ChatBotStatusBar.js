import React from 'react';
import { View, TextInput ,TouchableOpacity , NetInfo} from "react-native";
import chatStyles from "./styles";
import styles from "../Slider/styles";
import {Icons} from "../../config/icons";


export default class ChatBotStatusBar extends React.Component {

    componentWillMount() {
        this.setInitialState();
        NetInfo.isConnected.addEventListener('connectionChange', this.handleConnectionChange);
    }

    setInitialState() {
        this.setState({ showStatusBar: 'true',statusMessage: 'Online over Satellite',network:'true'});
    }

    componentWillUnmount() {
        NetInfo.isConnected.removeEventListener('connectionChange', this.handleConnectionChange);
    }

    handleConnectionChange = (isConnected) => {
        if(isConnected){
            this.setState({ network: 'true',showStatusBar: 'true', statusMessage: 'Online Over Satellite'});
        } else {
            this.setState({ network: 'false',showStatusBar: 'true', statusMessage: 'Offline' });
        }
    }

    closeStatus() {
        this.setState({ showStatusBar: false });
    }

    render() {
        if(this.state.showStatusBar) {
            return (
                <View style={this.state.network === "true" ? chatStyles.statusBarNetOn : chatStyles.statusBarNetOff}>
                    <TextInput
                        style={this.state.network === "true" ? chatStyles.statusMessageNetOn : chatStyles.statusMessageNetOff}
                        value={this.state.statusMessage}
                    />
                    <TouchableOpacity style={styles.closeButton} onPress={this.closeStatus.bind(this)} >
                        {this.state.network === "true" ? Icons.statusBarCloseNetOn() : Icons.statusBarCloseNetOff()}
                    </TouchableOpacity>
                </View>
            );
        } else {
            return (null);
        }
    }

};

