import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import styles from './styles';
import { Icons } from '../../config/icons';
import Modal from 'react-native-modal';
import { Actions, ActionConst } from 'react-native-router-flux';
import SystemBot from '../../lib/bot/SystemBot';

export default class CallModal extends React.Component {
    constructor(props) {
        super(props);
        // this.dataSource = new FrontMAddedContactsPickerDataSource(this)
        this.state = {
            contactsData: [],
            isVisible: this.props.isVisible,
            contactSelected: this.props.contact
        };
    }

    makePhoneCall = number => {
        this.props.setVisible(false);
        Actions.dialler({
            call: true,
            number: number,
            contact: this.props.contact,
            newCallScreen: true
        });
    };

    makeVoipCall() {
        this.props.setVisible(false);
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

    render() {
        const contactSelected = this.state.contactSelected;
        const phoneNumbers = contactSelected.phoneNumbers;
        return (
            <Modal
                isVisible={this.props.isVisible}
                onBackdropPress={() => {
                    this.props.setVisible(false);
                }}
                onBackButtonPress={() => {
                    this.props.setVisible(false);
                }}
                onSwipe={() => this.props.setVisible(false)}
                swipeDirection="right"
            >
                <View style={styles.modal}>
                    {phoneNumbers && phoneNumbers.mobile ? (
                        <View style={styles.phoneContainer}>
                            <View style={styles.modalTextContainer}>
                                <View>{Icons.greenCallBlue()}</View>
                                <Text style={styles.modalText}>Mobile</Text>
                            </View>
                            <View style={styles.modalNumberContainer}>
                                <Text
                                    style={{
                                        color: 'rgba(155,155,155,1)'
                                    }}
                                >
                                    {contactSelected.phoneNumbers
                                        ? contactSelected.phoneNumbers.mobile
                                        : 'Not Available'}
                                </Text>
                            </View>
                            <View style={styles.modalCallButContainer}>
                                <TouchableOpacity
                                    style={
                                        contactSelected.phoneNumbers
                                            ? styles.callButton
                                            : styles.callButtonDisabled
                                    }
                                    disabled={
                                        !(
                                            contactSelected.phoneNumbers &&
                                            contactSelected.phoneNumbers.mobile
                                        )
                                    }
                                    onPress={() =>
                                        this.makePhoneCall(phoneNumbers.mobile)
                                    }
                                >
                                    {Icons.greenCallOutline()}
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : null}
                    {phoneNumbers && phoneNumbers.local ? (
                        <View style={styles.phoneContainer}>
                            <View style={styles.modalTextContainer}>
                                <View>{Icons.greenCallLocal()}</View>
                                <Text style={styles.modalText}>Phone*</Text>
                            </View>
                            <View style={styles.modalNumberContainer}>
                                <Text
                                    style={{
                                        color: 'rgba(155,155,155,1)'
                                    }}
                                >
                                    {contactSelected.phoneNumbers
                                        ? contactSelected.phoneNumbers.local
                                        : 'Not Available'}
                                </Text>
                            </View>
                            <View style={styles.modalCallButContainer}>
                                <TouchableOpacity
                                    style={
                                        contactSelected.phoneNumbers
                                            ? styles.callButton
                                            : styles.callButtonDisabled
                                    }
                                    disabled={
                                        !(
                                            contactSelected.phoneNumbers &&
                                            contactSelected.phoneNumbers.mobile
                                        )
                                    }
                                    onPress={() =>
                                        this.makePhoneCall(phoneNumbers.local)
                                    }
                                >
                                    {Icons.greenCallOutline()}
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : null}
                    {phoneNumbers && phoneNumbers.satellite ? (
                        <View style={styles.phoneContainer}>
                            <View style={styles.modalTextContainer}>
                                <View>{Icons.greenSatBlue()}</View>
                                <Text style={styles.modalText}>Satellite</Text>
                            </View>
                            <View style={styles.modalNumberContainer}>
                                <Text
                                    style={{
                                        color: 'rgba(155,155,155,1)'
                                    }}
                                >
                                    {phoneNumbers.satellite}
                                </Text>
                            </View>
                            <View style={styles.modalCallButContainer}>
                                <TouchableOpacity
                                    style={styles.callButton}
                                    onPress={() => {
                                        this.makePhoneCall(
                                            phoneNumbers.satellite
                                        );
                                    }}
                                >
                                    {Icons.greenCallOutline()}
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : null}
                    <View style={styles.phoneContainer}>
                        <View style={styles.modalTextContainerImg}>
                            <Image
                                style={styles.modalImage}
                                source={require('../../images/tabbar-marketplace/tabbar-marketplace.png')}
                            />
                            <Text style={styles.modalText}>FrontM</Text>
                        </View>
                        <View style={styles.modalNumberContainer}>
                            <Text
                                style={{
                                    color: 'rgba(155,155,155,1)'
                                }}
                            >
                                Free
                            </Text>
                        </View>
                        <View style={styles.modalCallButContainer}>
                            <TouchableOpacity
                                style={styles.callButton}
                                onPress={this.makeVoipCall.bind(this)}
                            >
                                {Icons.greenCallOutline()}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        );
    }
}
