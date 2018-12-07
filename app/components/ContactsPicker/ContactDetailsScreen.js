import React from 'react';
import {
    View,
    Text,
    Image,
    Button,
    TouchableOpacity,
    Alert
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
        this.setModalVisible(true);
    }

    renderNameArea() {
        return (
            <View style={styles.topContainerCD}>
                <View style={styles.topAreaCD}>
                    <TouchableOpacity style={styles.topButtonCD}>
                        <Icon
                            name="share"
                            size={16}
                            color={GlobalColors.sideButtons}
                        />
                    </TouchableOpacity>
                    <ProfileImage
                        uuid={this.contact.id}
                        placeholder={Images.user_image}
                        style={styles.propicCD}
                        placeholderStyle={styles.propicCD}
                        resizeMode="cover"
                    />
                    <TouchableOpacity style={styles.topButtonCD}>
                        <Icon
                            name="edit"
                            size={16}
                            color={GlobalColors.sideButtons}
                        />
                    </TouchableOpacity>
                </View>
                <Text style={styles.nameCD}>{this.contact.name}</Text>
            </View>
        );
    }

    renderActionButtons() {
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
                <TouchableOpacity style={styles.actionButtonCD}>
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
    }

    renderDetails() {
        return (
            <View>
                {this.renderEmails()}
                {this.contact.phoneNumbers ? this.renderNumbers() : null}
            </View>
        );
    }

    renderFooterButtons() {
        return <View style={styles.footerCD} />;
    }

    renderEmails() {
        return _.map(this.contact.emails, () =>
            this.renderDetailRow('email', 'Email', this.contact.emails[0].email)
        );
    }

    renderNumbers() {
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
                        this.contact.phoneNumbers.mobile
                    )
                    : null}
            </View>
        );
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
        return (
            <View style={styles.containerCD}>
                {this.renderNameArea()}
                {this.renderActionButtons()}
                {this.renderDetails()}
                {this.renderFooterButtons()}
                <CallModal
                    isVisible={this.state.modalVisible}
                    setVisible={this.setModalVisible.bind(this)}
                    contact={this.props.contact}
                />
            </View>
        );
    }
}
