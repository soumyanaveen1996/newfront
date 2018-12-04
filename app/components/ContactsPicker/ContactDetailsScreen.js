import React from 'react';
import { View, Text, Image, Button, TouchableOpacity } from 'react-native';
import styles from './styles';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { GlobalColors } from '../../config/styles';
import ProfileImage from '../ProfileImage';
import Images from '../../config/images';
import Contact from '../../lib/capability/Contact';

export default class ContactDetailsScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    renderNameArea(contact) {
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
                        uuid={contact.id}
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
                <Text style={styles.nameCD}>{contact.name}</Text>
            </View>
        );
    }

    renderActionButtons() {
        return (
            <View style={styles.actionAreaCD}>
                <TouchableOpacity style={styles.actionButtonCD}>
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
                <TouchableOpacity style={styles.actionButtonCD}>
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

    renderDetails() {}

    renderFooterButtons() {}

    render() {
        Contact.getContactFieldForUUIDs(this.props.contact.id).then(res =>
            console.log('>>>>>>>>>>' + JSON.stringify(res, undefined, 2))
        );
        return (
            <View>
                {this.renderNameArea(this.props.contact)}
                {this.renderActionButtons()}
                {this.renderDetails()}
                {this.renderFooterButtons()}
            </View>
        );
    }
}
