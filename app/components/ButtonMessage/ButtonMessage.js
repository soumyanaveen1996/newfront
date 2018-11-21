import React from 'react';
import { View, FlatList } from 'react-native';
import { Button } from 'react-native-elements';
import styles from './styles';

export default class ButtonMessage extends React.Component {
    constructor(props) {
        super(props);
    }

    button = ({ item }) => (
        <Button
            title={item.title}
            buttonStyle={styles.suggestionButton}
            onPress={() => this.props.onButtonClick(item)}
        />
    );

    render() {
        return (
            <View>
                <FlatList
                    data={this.props.buttons}
                    renderItem={this.button.bind(this)}
                    horizontal={true}
                    style={styles.buttons}
                    extraData={this.state}
                    showsHorizontalScrollIndicator={false}
                />
            </View>
        );
    }
}
