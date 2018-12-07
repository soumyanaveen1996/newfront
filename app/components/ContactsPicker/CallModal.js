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

    makePhoneCall() {
        this.props.setVisible(false);
        Actions.dialler({
            call: true,
            number: this.props.contact.phoneNumbers.mobile,
            newCallScreen: true
        });
    }

    makeVoipCall() {
        this.props.setVisible(false);
        let participants = [
            {
                userId: this.props.contact.userId,
                userName: this.props.contact.userName
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
                                onPress={this.makePhoneCall.bind(this)}
                            >
                                {Icons.greenCallOutline()}
                            </TouchableOpacity>
                        </View>
                    </View>
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
                                Not Available
                            </Text>
                        </View>
                        <View style={styles.modalCallButContainer}>
                            <TouchableOpacity
                                disabled={true}
                                style={styles.callButtonDisabled}
                                onPress={() => console.log('Call Phone')}
                            >
                                {Icons.greenCallOutline()}
                            </TouchableOpacity>
                        </View>
                    </View>
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
