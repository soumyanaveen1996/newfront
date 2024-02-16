import React from 'react';
import { View, Text, TouchableOpacity, Image, Platform } from 'react-native';

import Permissions from 'react-native-permissions';

import { ScrollView } from 'react-native-gesture-handler';
import GlobalColors from '../../../config/styles';
import { Notification } from '../../../lib/capability';
import { synchronizePhoneBook } from '../../../lib/UserData/SyncData';
import PermissionList from '../../../lib/utils/PermissionList';
import NavigationAction from '../../../navigation/NavigationAction';
import I18n from '../../../config/i18n/i18n';
import { Card } from 'react-native-paper';
import images from '../../../config/images';
import { SwitchControll } from '../../../widgets/Switch';
import AppFonts from '../../../config/fontConfig';

const PermissionItme = (props) => (
    <View
        style={{
            flex: 1,
            marginHorizontal: 32,
            marginVertical: 15,
            flexDirection: 'row'
        }}
    >
        <View style={{ height: 8 }}>
            <SwitchControll
                value={props.isCheked}
                onValueChange={props.onPress}
            />
        </View>

        <View style={{ flex: 1, marginLeft: 4 }}>
            <Text
                style={{
                    marginBottom: 5,
                    fontSize: 12,
                    fontWeight: AppFonts.BOLD,
                    color: GlobalColors.chatTitle
                }}
            >
                {props.title}
            </Text>
            <Text
                style={{
                    marginBottom: 5,
                    fontSize: 12,
                    color: GlobalColors.descriptionText,
                    fontWeight: AppFonts.NORMAL
                }}
            >
                {props.subTitle}
            </Text>
        </View>
    </View>
);
export default class PermissionRequest extends React.Component {
    constructor(props) {
        super(props);
        this.props.navigation.setParams({
            showToolbar: images.loginTitleImage ? false : true
        });
        this.checkboxes = [
            {
                name: I18n.t('PermissionTittleLocation'),
                key: 'location',
                label: I18n.t('PermissionSubTittleLocation')
            },
            {
                name: I18n.t('PermissionTittleNotification'),
                key: 'notifications',
                label: I18n.t('PermissionSubTittleNotification')
            },
            {
                name: I18n.t('PermissionTittleContact'),
                key: 'contacts',
                label: I18n.t('PermissionSubTittleContact')
            },
            {
                name: I18n.t('PermissionTittleSound'),
                key: 'mic',
                label: I18n.t('PermissionSubTittleSound')
            },
            {
                name: I18n.t('PermissionTittleCamera'),
                key: 'camera',
                label: I18n.t('PermissionSubTittleCamera')
            }
        ];
        const items = new Map();
        this.checkboxes.forEach((i) => {
            items.set(i.key, true);
        });
        this.userActionRecieved = false;
        this.state = { selectedPermssion: items };
    }

    componentDidMount() {
        this.unsubscribeFromEvent = this.props.navigation.addListener(
            'beforeRemove',
            (e) => {
                console.log('beforeRemoveTriggered');
                if (
                    this.userActionRecieved ||
                    NavigationAction.currentScreen() !=
                        NavigationAction.SCREENS.PermissionRequest
                ) {
                    this.props.navigation.dispatch(e.data.action);
                } else {
                    e.preventDefault();
                }
            }
        );
    }

    componentWillUnmount() {
        this.unsubscribeFromEvent?.();
        this.props.route.params?.finishCallback?.();
    }

    handleSelection = (item) => {
        const { selectedPermssion } = this.state;
        selectedPermssion.set(item.key, !selectedPermssion.get(item.key));
        this.setState({ selectedPermssion });
    };

    onContinuePress = () => {
        this.userActionRecieved = true;
        this.chekLocation();
    };

    chekLocation = () => {
        if (this.state.selectedPermssion.get('location')) {
            Permissions.request(PermissionList.LOCATION).then(() => {
                this.checkCamera();
            });
        } else {
            this.checkCamera();
        }
    };

    checkCamera = () => {
        if (this.state.selectedPermssion.get('camera')) {
            Permissions.request(PermissionList.CAMERA).then(() => {
                this.checkMic();
            });
        } else this.checkMic();
    };

    checkMic = () => {
        if (this.state.selectedPermssion.get('mic')) {
            Permissions.request(PermissionList.MICROPHONE).then(() => {
                this.checkContacts();
            });
        } else this.checkContacts();
    };

    checkContacts = () => {
        if (this.state.selectedPermssion.get('contacts')) {
            Permissions.request(PermissionList.CONTACTS).then(() => {
                synchronizePhoneBook();
                this.checkNotification();
            });
        } else this.checkNotification();
    };

    checkNotification = () => {
        if (this.state.selectedPermssion.get('notifications')) {
            Notification.checkPermissions((res) => {
                if (!(res && res.registered && res.registered.isRegistered)) {
                    Notification.requestPermission();
                }
            });
        }
        NavigationAction.pop();
    };

    render() {
        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: 'flex-start',
                    backgroundColor: GlobalColors.appBackground
                }}
            >
                <ScrollView style={{ flex: 1 }}>
                    {images.loginTitleImage && (
                        <Image
                            style={{
                                marginBottom: 40,
                                alignSelf: 'center',
                                marginTop: 80
                            }}
                            source={images.loginTitleImage}
                        />
                    )}
                    <Text
                        style={{
                            fontSize: 18,
                            color: GlobalColors.primaryTextColor,
                            marginVertical: 28,
                            marginHorizontal: 60,
                            textAlign: 'center'
                        }}
                    >
                        {I18n.t('PermissionScreenTitle')}
                    </Text>
                    {this.checkboxes.map((item, index) => (
                        <View>
                            <PermissionItme
                                title={item.name}
                                subTitle={item.label}
                                onPress={() => this.handleSelection(item)}
                                isCheked={this.state.selectedPermssion.get(
                                    item.key
                                )}
                            />
                            {index !== this.checkboxes.length - 1 && (
                                <View
                                    style={{
                                        backgroundColor:
                                            GlobalColors.itemDevider,
                                        height: 1,
                                        marginHorizontal: 16
                                    }}
                                />
                            )}
                        </View>
                    ))}
                </ScrollView>
                <Card
                    style={{
                        paddingBottom: 24,
                        ...Platform.select({
                            ios: {},
                            android: { elevation: 10 }
                        }),
                        backgroundColor: GlobalColors.appBackground
                    }}
                >
                    <Text
                        style={{
                            textAlign: 'center',
                            margin: 12,
                            fontSize: 12,
                            color: GlobalColors.descriptionText
                        }}
                    >
                        {I18n.t('PermissionScreenSubTittle')}
                    </Text>
                    <View style={{ marginHorizontal: 24 }}>
                        <TouchableOpacity
                            style={{
                                height: 40,
                                width: '100%',
                                backgroundColor:
                                    GlobalColors.primaryButtonColor,
                                borderRadius: 20,
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: 25,
                                alignSelf: 'center'
                            }}
                            onPress={this.onContinuePress}
                        >
                            <Text
                                style={{
                                    color: GlobalColors.primaryButtonText,
                                    textAlign: 'center',
                                    fontSize: 16,
                                    fontWeight: AppFonts.NORMAL
                                }}
                            >
                                Continue
                            </Text>
                        </TouchableOpacity>
                    </View>
                </Card>
            </View>
        );
    }
}
