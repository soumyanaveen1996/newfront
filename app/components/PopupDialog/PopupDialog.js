import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Styles, { dialogStyle } from './styles';
import { Icons } from '../../config/icons';


export default class PopupDialog extends React.Component {

    onClose() {
        this.props.onClose();
    }

    render(){
        return (
            <View style={dialogStyle(this.props.fullScreenMode, this.props.width, this.props.height)}>
                <View style={Styles.headerContainer}>
                    <View style={Styles.headerTitleContainer}>
                        <Text style={Styles.headerTitle}>{this.props.title}</Text>
                    </View>
                    <TouchableOpacity onPress={this.onClose.bind(this)} style={Styles.headerCloseButton}>
                        { Icons.sliderClose() }
                    </TouchableOpacity>
                </View>
                {this.props.mainView}
            </View>
        );
    }
}
