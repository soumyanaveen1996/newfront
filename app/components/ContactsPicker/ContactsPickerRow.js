import React from 'react';
import { Text, Image, TouchableOpacity, View } from 'react-native';
import styles from './styles';
import { checkBoxConfig } from './config';
import { CheckBox } from 'react-native-elements';
import _ from 'lodash';
import ProfileImage from '../ProfileImage';
import Images from '../../config/images';
import { GlobalColors } from '../../config/styles';
import Icon from 'react-native-vector-icons';
import images from '../../images';

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

        // console.log('let check contact ', contact);

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
                    <View
                        style={{ flexDirection: 'row', alignItems: 'center' }}
                    >
                        {contact.isWaitingForConfirmation ? (
                            <Image
                                style={{
                                    width: 14,
                                    height: 14,
                                    marginRight: 10
                                }}
                                source={images.clock_icon}
                            />
                        ) : (
                            <View
                                style={{
                                    width: 14,
                                    height: 14,
                                    marginRight: 10
                                }}
                            >
                                <Text />
                            </View>
                        )}
                        {this.renderCheckbox()}
                        <ProfileImage
                            accessibilityLabel="Profile Picture"
                            testID="profile-picture"
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
                    {contact.isWaitingForConfirmation ? (
                        <View style={{ width: 90, height: 40 }}>
                            <Text
                                numberOfLines={2}
                                ellipsizeMode="middle"
                                style={{
                                    fontSize: 12,
                                    fontWeight: '100',
                                    color: 'rgba(174,174,174,1)',
                                    textalign: 'center'
                                }}
                            >
                                Awaiting for authorization
                            </Text>
                        </View>
                    ) : null}
                    {contact.contactType === 'Personal' ? (
                        <View
                            style={{
                                width: 90,
                                height: 40,
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}
                        >
                            <Text
                                numberOfLines={1}
                                ellipsizeMode="middle"
                                style={{
                                    fontSize: 12,
                                    fontWeight: '100',
                                    color: 'rgba(174,174,174,1)',
                                    textalign: 'center'
                                }}
                            >
                                Personal
                            </Text>
                        </View>
                    ) : null}
                </View>
            </TouchableOpacity>
        );
    }
}
