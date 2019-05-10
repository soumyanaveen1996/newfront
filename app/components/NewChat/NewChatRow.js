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
    email = undefined,
    waitingForConfirmation
}) => {
    return (
        <TouchableOpacity
            style={styles.contactItemContainer}
            onPress={() => onItemPressed(item)}
            disabled={waitingForConfirmation}
        >
            <View style={styles.contactItemLeftContainer}>
                {image}
                <View style={styles.contactItemDetailsContainer}>
                    <Text style={styles.contactItemName}>{title}</Text>
                    {email ? (
                        <Text style={styles.contactItemEmail}>{email}</Text>
                    ) : null}
                </View>
            </View>
            {waitingForConfirmation ? (
                <View style={styles.waitingConfirmation}>
                    <Text
                        numberOfLines={2}
                        ellipsizeMode="middle"
                        style={styles.waitingConfirmationText}
                    >
                        Awaiting for authorization
                    </Text>
                </View>
            ) : null}
        </TouchableOpacity>
    );
};

export default NewChatRow;
