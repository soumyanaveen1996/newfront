import React from 'react';
import { FlatList, Text, View, TouchableOpacity } from 'react-native';
import styles from './styles';
import { Actions } from 'react-native-router-flux';

export default class WebCards extends React.Component {
    constructor(props) {
        super(props);
    }

    card = ({ item }) => {
        return (
            <TouchableOpacity
                onPress={() => this.onCardSelected(item.url)}
                style={styles.card}
            >
                <Text
                    style={styles.cardTitle}
                    ellipsizeMode={'tail'}
                    numberOfLines={3}
                >
                    {item.title}
                </Text>
                <Text style={styles.cardTimeStamp} numberOfLines={1}>
                    {item.timestamp}
                </Text>
                <Text style={styles.cardUrl} numberOfLines={1}>
                    {item.url}
                </Text>
            </TouchableOpacity>
        );
    };

    onCardSelected = url => {
        Actions.webview({ url: url });
    };

    render() {
        return (
            <View>
                <FlatList
                    data={this.props.webCardsList}
                    renderItem={this.card.bind(this)}
                    horizontal={true}
                    style={styles.webCards}
                    showsHorizontalScrollIndicator={false}
                />
            </View>
        );
    }
}
