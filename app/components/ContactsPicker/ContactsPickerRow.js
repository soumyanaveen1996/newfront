import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import styles from './styles';
import { checkBoxConfig } from './config';
import { CheckBox } from 'react-native-elements';
import _ from 'lodash';
import ProfileImage from '../ProfileImage';
import Images from '../../config/images';
import { GlobalColors } from '../../config/styles';
import Icon from 'react-native-vector-icons';

export default class ContactsPickerRow extends React.Component {
    onItemPressed() {
        if (this.props.onContactSelected) {
            this.props.onContactSelected(this.props.contact);
        }
    }

    renderCheckbox = () => {
        if (this.props.checkBoxEnabled) {
            return (
                <CheckBox
                    uncheckedIcon={checkBoxConfig.uncheckedIcon}
                    checkedIcon={checkBoxConfig.checkedIcon}
                    checkedColor={checkBoxConfig.checkedColor}
                    iconType={checkBoxConfig.iconType}
                    checked={this.props.selected}
                    onPress={this.onItemPressed.bind(this)}
                    size={20}
                    containerStyle={styles.checkboxIconStyle}
                />
            );
        }
    };

    render() {
        const contact = this.props.contact;

        const uuid = contact.id || contact.userId;
        return (
            <TouchableOpacity onPress={this.onItemPressed.bind(this)}>
                <View
                    style={
                        this.props.color
                            ? [
                                styles.contactItemContainer,
                                { backgroundColor: this.props.color }
                            ]
                            : styles.contactItemContainer
                    }
                >
                    {this.renderCheckbox()}
                    <ProfileImage
                        uuid={uuid}
                        placeholder={Images.user_image}
                        style={styles.contactItemImage}
                        placeholderStyle={styles.contactItemImage}
                        resizeMode="cover"
                    />
                    <View style={styles.contactItemDetailsContainer}>
                        <Text style={styles.contactItemName}>
                            {contact.name || contact.userName}
                        </Text>
                        {contact.emails && contact.emails.length > 0 ? (
                            <Text style={styles.contactItemEmail}>
                                {contact.emails[0].email}
                            </Text>
                        ) : null}
                    </View>
                </View>
            </TouchableOpacity>
        );
    }
}
