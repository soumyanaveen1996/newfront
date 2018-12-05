import React from 'react';
import { Text, View } from 'react-native';
import styles from './styles';

const NewChatSectionHeader = title => (
    <View style={styles.sectionHeaderContainer}>
        <Text style={styles.sectionHeaderTitle}>{title.title}</Text>
    </View>
);

export default NewChatSectionHeader;
