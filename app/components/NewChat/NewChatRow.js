import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import styles from './styles';
import { checkBoxConfig } from './config';
import { CheckBox } from 'react-native-elements';
import _ from 'lodash';
import ProfileImage from '../ProfileImage';
import Images from '../../config/images';

const NewChatRow = ({
    item,
    title,
    id,
    image,
    onItemPressed,
    email = undefined
}) => {
    console.log(title);

    return (
        <TouchableOpacity onPress={() => onItemPressed(item)}>
            <View style={styles.contactItemContainer}>
                {image}
                <View style={styles.contactItemDetailsContainer}>
                    <Text style={styles.contactItemName}>{title}</Text>
                    {email ? (
                        <Text style={styles.contactItemEmail}>{email}</Text>
                    ) : null}
                </View>
            </View>
        </TouchableOpacity>
    );
};

export default NewChatRow;