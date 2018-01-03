import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import styles from './styles';
import { checkBoxConfig } from './config';
import { CheckBox } from 'react-native-elements';
import _ from 'lodash';


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
                    style = {styles.checkboxIconStyle}
                    uncheckedIcon = {checkBoxConfig.uncheckedIcon}
                    checkedIcon = {checkBoxConfig.checkedIcon}
                    checkedColor = {checkBoxConfig.checkedColor}
                    iconType = {checkBoxConfig.iconType}
                    checked={this.props.selected}
                    onPress={this.onItemPressed.bind(this)}
                />
            );
        }
    }

    render() {
        const contact = this.props.contact;
        const emails = _.map(contact.emails, (item) => item.email)
        return (
            <TouchableOpacity onPress={this.onItemPressed.bind(this)}>
                <View style={styles.contactItemContainer}>
                    {this.renderCheckbox()}
                    <Image style={styles.contactItemImage} source={contact.thumbnail}/>
                    <View style={styles.contactItemDetailsContainer}>
                        <Text style={styles.contactItemName}>{contact.name}</Text>
                        <Text style={styles.contactItemEmail}>{contact.screenName + ' - ' + emails.join(',')}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }
}
