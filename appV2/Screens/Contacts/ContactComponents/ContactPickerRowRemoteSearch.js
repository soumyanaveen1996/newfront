import React from 'react';
import {
    Text,
    Image,
    TouchableWithoutFeedback,
    View,
    TouchableOpacity
} from 'react-native';
import { CheckBox } from '@rneui/themed';
import _ from 'lodash';
import styles from '../styles';
import { checkBoxConfig, getContactRankImage } from '../config';
import { ProfileImage } from '../../../widgets';
import Images from '../../../config/images';
import GlobalColors from '../../../config/styles';
import { ContactType } from '../../../lib/capability/Contact';
import Icons from '../../../config/icons';
import images from '../../../config/images';
import { checkMinifiedNameLength } from '../../../lib/utils/TextFormatter';
import Store from '../../../redux/store/configureStore';
import AppFonts from '../../../config/fontConfig';

const R = require('ramda');

export default class ContactPickerRowRemoteSearch extends React.Component {
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

    getContactEmail = (contact) => {
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

    getCityAndCompany = (contact) => {
        const city = R.pathOr(null, ['address', 'city'], contact);
        const text = [contact.userCompanyName, city].filter(Boolean).join(', ');
        if (text) return <Text style={styles.contactItemEmail}>{text}</Text>;
    };

    renderName = (contact) => {
        const name = contact.name || contact.userName || '';

        return (
            <Text style={styles.contactItemNameNew}>
                {name.length > 20 ? `${name.substring(0, 24)}...` : name}
            </Text>
        );
    };

    render() {
        const {
            contact,
            isFromNewCall,
            startChat,
            onDirectCall,
            makeVideoCall,
            isFromSearch,
            onConnect
        } = this.props;
        // const contactGroupIs = contactGroupByRank(contact);
        console.log('Contact--lkp-> ', contact);
        const uuid = contact.id || contact.userId;
        const getContactRankColor = Store.getState().user.roleL2Colors;

        return (
            <TouchableWithoutFeedback onPress={this.onItemPressed.bind(this)}>
                <View>
                    <View style={styles.contactItemContainerNew}>
                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'flex-start'
                            }}
                        >
                            <Image
                                style={{ height: 24, width: 24 }}
                                resizeMode="cover"
                                source={getContactRankImage(contact)}
                            />
                            <ProfileImage
                                accessibilityLabel="Profile Picture"
                                testID="profile-picture"
                                userName={contact.name || contact.userName}
                                uuid={uuid}
                                style={styles.contactItemImage}
                                placeholder={Images.user_image}
                                placeholderStyle={styles.contactItemImage}
                                resizeMode="cover"
                            />
                        </View>
                        <View style={styles.contactItemDetailsContainer}>
                            <View
                                style={{
                                    flex: 1,
                                    // alignItems: 'flex-start'
                                    justifyContent: 'flex-start'
                                }}
                            >
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        justifyContent: 'space-between'
                                    }}
                                >
                                    <View>
                                        {this.renderName(contact)}
                                        {this.getContactEmail(contact)}
                                    </View>

                                    {contact.isWaitingForConfirmation ? (
                                        <View>
                                            <Text
                                                numberOfLines={2}
                                                ellipsizeMode="middle"
                                                style={{
                                                    fontSize: 12,
                                                    fontWeight: AppFonts.THIN,
                                                    color: 'rgb(156,158,167)'
                                                }}
                                            >
                                                Awaiting confirmation
                                            </Text>
                                        </View>
                                    ) : (
                                        <View />
                                    )}
                                </View>
                                {contact.rankLevel2 ? (
                                    <View style={{ flex: 1 }}>
                                        <View
                                            style={{
                                                flexDirection: 'row',
                                                alignItems: 'center'
                                            }}
                                        >
                                            <View
                                                style={{
                                                    backgroundColor:
                                                        getContactRankColor[
                                                            `${contact.rankLevel1}`
                                                        ]['lightColor'],

                                                    paddingHorizontal: 5,
                                                    paddingVertical: 2,
                                                    borderRadius: 4
                                                }}
                                            >
                                                <Text
                                                    style={{
                                                        color: getContactRankColor[
                                                            `${contact.rankLevel1}`
                                                        ]['darkColor'],
                                                        fontSize: 12,
                                                        fontWeight:
                                                            AppFonts.LIGHT
                                                    }}
                                                >
                                                    {contact.rankLevel2
                                                        ? checkMinifiedNameLength(
                                                              contact.rankLevel2
                                                          )
                                                        : null}
                                                </Text>
                                            </View>
                                            {contact.rankLevel3 ? (
                                                <View style={{ marginLeft: 8 }}>
                                                    <Text
                                                        style={{
                                                            color: 'rgb(68,72,90)',
                                                            fontSize: 12,
                                                            fontWeight:
                                                                AppFonts.LIGHT
                                                        }}
                                                    >
                                                        {contact.rankLevel2
                                                            ? checkMinifiedNameLength(
                                                                  contact.rankLevel3
                                                              )
                                                            : null}
                                                    </Text>
                                                </View>
                                            ) : null}
                                        </View>
                                    </View>
                                ) : (
                                    <View />
                                )}
                            </View>
                            {contact.isWaitingForConfirmation ? null : isFromSearch ? (
                                <TouchableOpacity
                                    onPress={onConnect && onConnect}
                                    style={{ flexDirection: 'row' }}
                                >
                                    {Icons.userConnect({ size: 16 })}
                                    <Text
                                        style={{
                                            alignSelf: 'center',
                                            color: GlobalColors.primaryColor,
                                            paddingLeft: 5
                                        }}
                                    >
                                        Connect
                                    </Text>
                                </TouchableOpacity>
                            ) : contact.contactType === ContactType.LOCAL ? (
                                <View style={{ flexDirection: 'row' }}>
                                    <TouchableOpacity
                                        onPress={onDirectCall && onDirectCall}
                                    >
                                        <Image
                                            source={images.contactsCallbtn}
                                            style={styles.contactIcons}
                                        />
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <View style={{ flexDirection: 'row' }}>
                                    <TouchableOpacity
                                        onPress={onDirectCall && onDirectCall}
                                    >
                                        <Image
                                            source={images.contactsCallbtn}
                                            style={styles.contactIcons}
                                        />
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    </View>
                    <View
                        style={{
                            height: 1,
                            marginLeft: 40,
                            marginRight: 12,
                            backgroundColor: GlobalColors.itemDevider
                        }}
                    />
                </View>
            </TouchableWithoutFeedback>
        );
    }
}
