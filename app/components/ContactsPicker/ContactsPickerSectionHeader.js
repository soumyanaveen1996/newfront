import React from 'react';
import { Text, View } from 'react-native';
import styles from './styles';

export default class ContactsPickerSectionHeader extends React.Component {
    render() {
        return (
            <View style={styles.sectionHeaderContainer}>
                <Text style={styles.sectionHeaderTitle}>
                    {this.props.title}
                </Text>
            </View>
        );
    }
}
