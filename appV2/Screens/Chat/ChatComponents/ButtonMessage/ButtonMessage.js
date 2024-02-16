import React from 'react';
import { View, FlatList, Text } from 'react-native';
import { Button } from '@rneui/themed';
import { fontColor, FONT_SIZE, buttonStyle, styles } from './styles';

export default class ButtonMessage extends React.Component {
    constructor(props) {
        super(props);
    }

    button = ({ item }) => (
        <Button
            title={item.title}
            titleStyle={{ color: fontColor(item.style) }}
            buttonStyle={buttonStyle(item.style)}
            fontSize={FONT_SIZE}
            onPress={() => this.props.onButtonClick(item)}
        />
    );

    renderTitle = () => {
        if (this.props.title) {
            return <Text style={styles.title}>{this.props.title}</Text>;
        }
    };

    renderBody = () => {
        if (this.props.body) {
            return <Text style={styles.body}>{this.props.body}</Text>;
        }
    };

    render() {
        return (
            <View style={styles.container}>
                {this.renderTitle()}
                {this.renderBody()}
                <FlatList
                    data={this.props.buttons}
                    renderItem={this.button.bind(this)}
                    horizontal={true}
                    bounces={false}
                    style={styles.buttons}
                    extraData={this.state}
                    showsHorizontalScrollIndicator={false}
                />
            </View>
        );
    }
}
