import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import styles from './styles';
import _ from 'lodash';

export default class ContactsPickerIndexView extends React.Component {
    onItemPressed(item) {
        this.props.onItemPressed(item);
    }

    renderItems() {
        return _.map(this.props.items, item => {
            return (
                <TouchableOpacity
                    key={item}
                    onPress={() => this.onItemPressed.bind(this)(item)}
                >
                    <Text style={styles.sideIndexItem}>{item}</Text>
                </TouchableOpacity>
            );
        });
    }

    render() {
        return <View style={styles.sideIndex}>{this.renderItems()}</View>;
    }
}
