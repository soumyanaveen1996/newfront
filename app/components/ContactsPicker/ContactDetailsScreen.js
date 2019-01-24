import React from 'react';
import {
    View,
    Text,
    Image,
    Button,
    TouchableOpacity,
    Alert,
    ScrollView
} from 'react-native';
import _ from 'lodash';
import styles from './styles';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { GlobalColors } from '../../config/styles';
import ProfileImage from '../ProfileImage';
import Images from '../../config/images';
import Contact from '../../lib/capability/Contact';
import config from '../../config/config';
import { Auth, Network } from '../../lib/capability';
import { Actions, ActionConst } from 'react-native-router-flux';
import SystemBot from '../../lib/bot/SystemBot';
import CallModal from './CallModal';
import images from '../../images';

export default class ContactDetailsScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            modalVisible: false
        };
        this.contact = this.props.contact;
    }

    startChat() {
        console.log('ID ' + this.contact.id);
        let participants = [
            {
                userId: this.contact.id,
                userName: this.contact.name
            }
        ];
        SystemBot.get(SystemBot.imBotManifestName).then(imBot => {
            Actions.peopleChat({
                bot: imBot,
                otherParticipants: participants,
                // type: ActionConst.REPLACE,
                onBack: this.props.onBack
            });
        });
    }

    callContact() {
        console.log(this.props.contact);
        if (this.props.contact.phoneNumbers) {
            this.setModalVisible(true);
            return;
        }
        this.makeVoipCall();
    }

    renderNameArea() {
        return (
            <View style={styles.topContainerCD}>
                <View style={styles.topAreaCD}>
                    {/* <TouchableOpacity style={styles.topButtonCD}>
                        <Icon
                            name="share"
                            size={16}
                            color={GlobalColors.sideButtons}
                        />
                    </TouchableOpacity> */}
                    <ProfileImage
                        uuid={this.contact.id}
                        placeholder={Images.user_image}
                        style={styles.propicCD}
                        placeholderStyle={styles.propicCD}
                        resizeMode="cover"
                    />
                    {/* <TouchableOpacity style={styles.topButtonCD}>
                        <Icon
                            name="edit"
                            size={16}
                            color={GlobalColors.sideButtons}
                        />
                    </TouchableOpacity> */}
                </View>
                <Text style={styles.nameCD}>{this.contact.name}</Text>
                {this.contact.isWaitingForConfirmation ? (
                    <Text
                        style={{
                            textAlign: 'center',
                            color: 'rgba(155, 155, 155, 1)',
                            fontFamily: 'SF Pro Text',
                            fontSize: 14
                        }}
                    >
                        Awaiting for authorization
                    </Text>
                ) : null}
            </View>
        );
    }

    // addToFavourite = () => {
    //     console.log('add to favourite');

    //     Auth.getUser()
    //         .then(user => {
    //             const options = {
    //                 method: 'post',
    //                 url:
    //                     config.proxy.protocol +
    //                     config.proxy.host +
    //                     config.proxy.addFavourite,
    //                 headers: {
    //                     sessionId: user.creds.sessionId
    //                 },
    //                 data: {
    //                     conversationId: '',
    //                     userDomain: '',
    //                     action: 'add'
    //                 }
    //             };
    //             return Network(options);
    //         })
    //         .then(
    //             data => {
    //                 if (data.status === 200 && data.data.error === 0) {
    //                     console.log('added favourite');
    //                 }
    //             },
    //             err => {
    //                 console.log('error in favourite', err);
    //             }
    //         );
    // };

    renderActionButtons() {
        if (!this.contact.isWaitingForConfirmation) {
            return (
                <View style={styles.actionAreaCD}>
                    <TouchableOpacity
                        style={styles.actionButtonCD}
                        onPress={this.startChat.bind(this)}
                    >
                        <View
                            style={[
                                styles.actionIconCD,
                                { backgroundColor: GlobalColors.sideButtons }
                            ]}
                        >
                            <Icon name="chat" size={16} color={'white'} />
                        </View>
                        <Text>Chat</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.actionButtonCD}
                        onPress={this.callContact.bind(this)}
                    >
                        <View
                            style={[
                                styles.actionIconCD,
                                { backgroundColor: GlobalColors.green }
                            ]}
                        >
                            <Icon name="call" size={16} color={'white'} />
                        </View>
                        <Text>Call</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.actionButtonCD}
                        onPress={() => {
                            this.addToFavourite();
                        }}
                    >
                        <View
                            style={[
                                styles.actionIconCD,
                                { backgroundColor: GlobalColors.darkGray }
                            ]}
                        >
                            <Icon name="star" size={16} color={'white'} />
                        </View>
                        <Text>Favourite</Text>
                    </TouchableOpacity>
                </View>
            );
        } else {
            return (
                <View
                    style={{
                        height: 75,
                        borderTopColor: 'rgba(221,222,227,1)',
                        borderTopWidth: 1,
                        borderBottomWidth: 5,
                        borderBottomColor: 'rgba(221,222,227,1)',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <TouchableOpacity
                        style={styles.actionButtonCD}
                        onPress={this.startChat.bind(this)}
                    >
                        <View
                            style={[
                                styles.actionIconCD,
                                { backgroundColor: GlobalColors.sideButtons }
                            ]}
                        >
                            <Image
                                style={{ width: 32, height: 32 }}
                                source={images.contact_chat_btn}
                            />
                        </View>
                        <Text>Conversation</Text>
                    </TouchableOpacity>
                </View>
            );
        }
    }

    renderDetails() {
        if (!this.contact.isWaitingForConfirmation) {
            return (
                <View>
                    {this.contact.phoneNumbers ? this.renderNumbers() : null}
                    {this.renderEmails()}
                </View>
            );
        } else {
            return null;
        }
    }

    renderFooterButtons() {
        return <View style={styles.footerCD} />;
    }

    renderEmails() {
        if (!this.contact.isWaitingForConfirmation) {
            return _.map(this.contact.emails, () =>
                this.renderDetailRow(
                    'email',
                    'Email',
                    this.contact.emails[0].email
                )
            );
        }
    }

    renderNumbers() {
        if (this.contact.isWaitingForConfirmation) {
            return (
                <View>
                    {this.contact.phoneNumbers.mobile
                        ? this.renderDetailRow(
                            'smartphone',
                            'Mobile',
                            this.contact.phoneNumbers.mobile
                        )
                        : null}
                    {this.contact.phoneNumbers.land
                        ? this.renderDetailRow(
                            'local_phone',
                            'Land',
                            this.contact.phoneNumbers.land
                        )
                        : null}
                    {this.contact.phoneNumbers.satellite
                        ? this.renderDetailRow(
                            'satellite',
                            'Satellite',
                            // this.contact.phoneNumbers.satellite
                            'Unavailable'
                        )
                        : null}
                </View>
            );
        } else {
            return null;
        }
    }

    makeVoipCall() {
        this.setModalVisible(false);
        let participants = [
            {
                userId: this.props.contact.id,
                userName: this.props.contact.name
            }
        ];
        SystemBot.get(SystemBot.imBotManifestName).then(imBot => {
            Actions.peopleChat({
                bot: imBot,
                otherParticipants: participants,
                call: true
            });
        });
    }

    renderDetailRow(icon, label, content) {
        return (
            <View style={styles.detailRowCD} key={icon}>
                <Icon name={icon} size={16} color={GlobalColors.sideButtons} />
                <Text style={styles.labelCD}>{label}</Text>
                <Text style={styles.rowContentCD}>{content}</Text>
            </View>
        );
    }

    setModalVisible(value) {
        this.setState({ modalVisible: value });
    }

    render() {
        console.log('contact ', this.contact);

        return (
            <ScrollView style={styles.containerCD}>
                {this.renderNameArea()}
                {this.renderActionButtons()}
                {this.renderDetails()}
                {this.renderFooterButtons()}
                <CallModal
                    isVisible={this.state.modalVisible}
                    setVisible={this.setModalVisible.bind(this)}
                    contact={this.props.contact}
                />
            </ScrollView>
        );
    }
}
