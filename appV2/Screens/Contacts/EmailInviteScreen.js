import React from 'react';
import {
    NativeModules,
    Platform,
    SafeAreaView,
    Text,
    TouchableOpacity,
    View,
    KeyboardAvoidingView
} from 'react-native';
import ReactNativeChipInput from './ContactComponents/ReactNativeChipInput';
import { HeaderBack, HeaderTitle } from '../../widgets/Header';
import styles from './styles';
import I18n from '../../config/i18n/i18n';
import { Loader } from '../../widgets/';
import GlobalColors from '../../config/styles';
import ContactServices from '../../apiV2/ContactServices';
import NavigationAction from '../../navigation/NavigationAction';
import AlertDialog from '../../lib/utils/AlertDialog';
import { Toast } from 'react-native-toast-message/lib/src/Toast';
import { PrimaryButton } from '../../widgets/PrimaryButton';
import AppFonts from '../../config/fontConfig';

export default class EmailInvite extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            emails: [],
            loading: false
        };
        this.child = React.createRef();
    }

    sendInvite = () => {
        const { emails } = this.state;
        if (emails && emails.length === 0) {
            return;
        }
        this.setState({ loading: true });
        ContactServices.invite(emails).then(
            (data) => {
                if (data.error === 0) {
                    this.setState({ loading: false, emails: [] }, () => {
                        if (!this.state.loading) {
                            this.child.current.clearInputValues();
                            setTimeout(() => {
                                this.emailInvitationSent();
                            }, 500);
                        }
                    });
                } else {
                    this.setState({ loading: false });
                }
            },
            (err) => {
                AlertDialog.show(err);
                console.log('error in sending invitation', err);
                this.setState({ loading: false });
            }
        );
    };

    emailInvitationSent = () =>
        Toast.show({
            text1: 'Invitation sent successfully.',
            type: 'success'
        });

    render() {
        const { emails, loading } = this.state;
        return (
            <SafeAreaView
                style={{ flex: 1, backgroundColor: GlobalColors.appBackground }}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : null}
                >
                    <View style={{ alignSelf: 'center', marginTop: 30 }}>
                        <Text
                            style={{
                                fontSize: 18,
                                color: GlobalColors.primaryTextColor,
                                fontWeight: AppFonts.BOLD
                            }}
                        >
                            Invite people to join {I18n.t('AppName')}
                        </Text>
                        {/* eslint-disable-next-line max-len */}
                        <Text
                            style={{
                                marginVertical: 10,
                                color: GlobalColors.descriptionText
                            }}
                        >
                            Start interacting with people for free
                        </Text>
                    </View>
                    <View style={{ marginHorizontal: 40, marginTop: 20 }}>
                        <ReactNativeChipInput
                            ref={this.child}
                            variant="contained"
                            inputVarint="outlined"
                            showChipIcon
                            size="small"
                            // label="email"
                            placeholder={
                                emails && emails.length === 0
                                    ? "Enter your contacts' email addresses"
                                    : ''
                            }
                            placeholderTextColor={
                                GlobalColors.formPlaceholderText
                            }
                            inputTextStyle={{
                                color: GlobalColors.formText,
                                borderColor: GlobalColors.itemDevider,
                                borderWidth: 1,
                                padding: 10
                            }}
                            autoCapitalize="none"
                            autoCorrect={false}
                            autoFocus={false}
                            onDone={(emails) => {
                                this.setState({
                                    emails
                                });
                            }}
                        />
                    </View>
                    <Loader loading={this.state.loading} />

                    <View
                        style={{
                            flexDirection: 'row',
                            marginHorizontal: 36,
                            marginTop: 24
                        }}
                    >
                        <PrimaryButton
                            disabled={emails.length === 0}
                            text={'Send invite'}
                            onPress={() => {
                                this.sendInvite();
                            }}
                        />
                    </View>
                    <TouchableOpacity
                        onPress={() => {
                            NavigationAction.replace(
                                NavigationAction.SCREENS.addressBookScreen,
                                {
                                    title: `Import Contacts`,
                                    contactImport: true,
                                    isFromInvite: true
                                }
                            );
                        }}
                        style={{ alignSelf: 'center', marginTop: 30 }}
                    >
                        {/* eslint-disable-next-line max-len */}
                        <Text style={{ color: GlobalColors.primaryColor }}>
                            Import contacts from your phone directory
                        </Text>
                    </TouchableOpacity>
                </KeyboardAvoidingView>
            </SafeAreaView>
        );
    }
}
