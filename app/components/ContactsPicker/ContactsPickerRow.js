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

const R = require('ramda');

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

    getContactEmail = contact => {
        // console.log('emails ', contact);

        // https://ramdajs.com/docs/#pathOr

        const homeEmail = R.pathOr(
            null,
            ['emails', 0, 'email', 'home'],
            contact
        );
        const workEmail = R.pathOr(
            null,
            ['emails', 0, 'email', 'work'],
            contact
        );
        const generalEmail =
            typeof R.pathOr(null, ['emails', 0, 'email'], contact) === 'string'
                ? R.pathOr(null, ['emails', 0, 'email'], contact)
                : null;

        if (generalEmail) {
            return (
                <Text style={styles.contactItemEmail}>
                    {contact.emails[0].email}
                </Text>
            );
        }

        if (workEmail) {
            return <Text style={styles.contactItemEmail}>{workEmail}</Text>;
        }
        if (homeEmail) {
            return <Text style={styles.contactItemEmail}>{homeEmail}</Text>;
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

                            {this.getContactEmail(contact)}
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
                                    textAlign: 'center'
                                }}
                            >
                                Awaiting for authorization
                            </Text>
                        </View>
                    ) : null}
                    {contact.contactType === 'Personal' && (
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
                                    textAlign: 'center'
                                }}
                            >
                                Personal
                            </Text>
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        );
    }
}
