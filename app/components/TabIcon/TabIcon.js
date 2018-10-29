import React, { Component } from 'react';
import { View, Image, Text } from 'react-native';
import { Actions, ActionConst } from 'react-native-router-flux';
import styles from './styles';

class TabIcon extends Component {
    render() {
        var color = this.props.selected ? '#00f240' : '#301c2a';

        return (
            <View style={{ alignItems: 'center' }}>
                <Image source={this.props.imageSource} />
                <Text
                    style={{
                        textAlign: 'center',
                        fontSize: 12,
                        color: 'rgba(74,74,74,0.6)'
                    }}
                >
                    {this.props.titleScreen}
                </Text>
            </View>
        );
    }
}

export default TabIcon;
