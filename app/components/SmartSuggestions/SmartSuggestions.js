import React from 'react';
import { FlatList, Text, View } from 'react-native';

export default class SmartSuggestions extends React.Component {
    smartSuggestion = ({ item }) => {
        <Text>ggg</Text>;
    };

    render() {
        return (
            <View>
                <FlatList
                    data={[{ key: 'a' }, { key: 'b' }]}
                    renderItem={({ item }) => <Text>{item.key}</Text>}
                    horizontal={true}
                />
            </View>
        );
    }
}
