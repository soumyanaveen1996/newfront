import React from 'react';
import { Text, View } from 'react-native';
import styles from '../styles';

export default class ContactsPickerSectionHeader extends React.Component {
    render() {
        console.log('the header is ', this.props.title);
        return (
            <View style={styles.sectionHeaderContainer}>
                <Text style={styles.sectionHeaderTitle}>
                    {this.props.title}
                </Text>
            </View>
        );
    }
}
