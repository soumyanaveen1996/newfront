import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    Alert,
    TouchableWithoutFeedback
} from 'react-native';
import styles from '../styles';
import { Icons } from '../../../config/icons';
import SystemBot from '../../../lib/bot/SystemBot';
import Store from '../../../redux/store/configureStore';
import { NETWORK_STATE } from '../../../lib/network';
import { ContactType } from '../../../lib/capability/Contact';
import I18n from '../../../config/i18n/i18n';
import images from '../../../images';
import config from '../../../config/config';
import { Auth } from '../../../lib/capability';
import NavigationAction from '../../../navigation/NavigationAction';
import AlertDialog from '../../../lib/utils/AlertDialog';

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

    makePhoneCall = (number) => {
        if (Store.getState().user.network !== NETWORK_STATE.none) {
            this.props.setVisible(false);
            NavigationAction.push(NavigationAction.SCREENS.dialler, {
                call: true,
                number: number.replace(' ', ''),
                contact: this.props.contact,
                newCallScreen: true
            });
        } else {
            AlertDialog.show('No network connection', 'Cannot make the call');
        }
    };

    makeVoipCall = () => {
        this.props.setVisible(false);
        const user = Auth.getUserData();
        if (user) {
            NavigationAction.push(NavigationAction.SCREENS.meetingRoom, {
                voipCallData: {
                    otherUserId: this.props.contact.id,
                    otherUserName: this.props.contact.name
                },
                userId: user.userId,
                title: this.props.contact.name,
                isVideoCall: false
            });
        }
    };

    makeVideoCall = () => {
        this.props.setVisible(false);
        const user = Auth.getUserData();
        if (user) {
            NavigationAction.push(NavigationAction.SCREENS.meetingRoom, {
                voipCallData: {
                    otherUserId: this.props.contact.id,
                    otherUserName: this.props.contact.name
                },
                title: this.props.contact.name,
                userId: user.userId,

                isVideoCall: true
            });
        }
    };

    makeVideoCall = () => {
        this.props.setVisible(false);
        let participants = [
            {
                userId: this.props.contact.id,
                userName: this.props.contact.name
            }
        ];
        SystemBot.get(SystemBot.imBotManifestName).then((imBot) => {
            NavigationAction.goToUsersChat({
                bot: imBot,
                otherParticipants: participants,
                call: true,
                videoCall: true
            });
        });
    };

    render() {
        const { contactSelected } = this.state;
        const { phoneNumbers } = contactSelected;
        const { isVisible, setVisible } = this.props;
        return (
            <TouchableOpacity
                style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    display: isVisible ? 'flex' : 'none',
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}
                onPress={() => setVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => {}}>
                    <View style={[styles.modal]}>
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
                                            ? contactSelected.phoneNumbers
                                                  .mobile
                                            : 'Not Available'}
                                    </Text>
                                </View>
                                <View style={styles.modalCallButContainer}>
                                    {config.showPSTNCalls && (
                                        <TouchableOpacity
                                            style={
                                                contactSelected.phoneNumbers
                                                    ? styles.callButton
                                                    : styles.callButtonDisabled
                                            }
                                            disabled={
                                                !(
                                                    contactSelected.phoneNumbers &&
                                                    contactSelected.phoneNumbers
                                                        .mobile
                                                )
                                            }
                                            onPress={() =>
                                                this.makePhoneCall(
                                                    phoneNumbers.mobile
                                                )
                                            }
                                        >
                                            {Icons.greenCallOutline({
                                                size: 16
                                            })}
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        ) : null}
                        {phoneNumbers && phoneNumbers.land ? (
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
                                            ? contactSelected.phoneNumbers.land
                                            : 'Not Available'}
                                    </Text>
                                </View>
                                <View style={styles.modalCallButContainer}>
                                    {config.showPSTNCalls && (
                                        <TouchableOpacity
                                            style={
                                                contactSelected.phoneNumbers
                                                    ? styles.callButton
                                                    : styles.callButtonDisabled
                                            }
                                            disabled={
                                                !(
                                                    contactSelected.phoneNumbers &&
                                                    contactSelected.phoneNumbers
                                                        .land
                                                )
                                            }
                                            onPress={() =>
                                                this.makePhoneCall(
                                                    phoneNumbers.land
                                                )
                                            }
                                        >
                                            {Icons.greenCallOutline({
                                                size: 16
                                            })}
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        ) : null}
                        {phoneNumbers &&
                        phoneNumbers.satellite &&
                        config.showPSTNCalls ? (
                            <View style={styles.phoneContainer}>
                                <View style={styles.modalTextContainer}>
                                    <View>{Icons.greenSatBlue()}</View>
                                    <Text style={styles.modalText}>
                                        Satellite
                                    </Text>
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
                                        {Icons.greenCallOutline({
                                            size: 16
                                        })}
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ) : null}
                        {contactSelected.contactType !== ContactType.LOCAL ? (
                            <View style={styles.phoneContainer}>
                                <View style={styles.modalTextContainerImg}>
                                    <Image
                                        style={styles.modalImage}
                                        source={images.tabbar_marketplace}
                                    />
                                    <Text style={styles.modalText}>
                                        {I18n.t('AppName')}
                                    </Text>
                                </View>
                                <View style={styles.modalNumberContainer}>
                                    <Text
                                        style={{
                                            color: 'rgba(155,155,155,1)'
                                        }}
                                    >
                                        Free Voice
                                    </Text>
                                </View>
                                <View style={styles.modalCallButContainer}>
                                    <TouchableOpacity
                                        style={styles.callButton}
                                        onPress={this.makeVoipCall}
                                    >
                                        {Icons.greenCallOutline({
                                            size: 16
                                        })}
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ) : null}
                        {contactSelected.contactType !== ContactType.LOCAL ? (
                            <View style={styles.phoneContainer}>
                                <View style={styles.modalTextContainerImg}>
                                    <Image
                                        style={styles.modalImage}
                                        source={images.tabbar_marketplace}
                                    />
                                    <Text style={styles.modalText}>
                                        {I18n.t('AppName')}
                                    </Text>
                                </View>
                                <View style={styles.modalNumberContainer}>
                                    <Text
                                        style={{
                                            color: 'rgba(155,155,155,1)'
                                        }}
                                    >
                                        Free Video
                                    </Text>
                                </View>
                                <View style={styles.modalCallButContainer}>
                                    <TouchableOpacity
                                        style={styles.callButton}
                                        onPress={this.makeVideoCall}
                                    >
                                        {Icons.greenVideoCallOutline({
                                            size: 16
                                        })}
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ) : null}
                    </View>
                </TouchableWithoutFeedback>
            </TouchableOpacity>
        );
    }
}
