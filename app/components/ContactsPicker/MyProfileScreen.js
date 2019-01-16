import React from 'react';
import {
    View,
    Text,
    Image,
    Switch,
    TouchableOpacity,
    TextInput,
    ScrollView
} from 'react-native';
import _ from 'lodash';
import styles from './styles';
import { SafeAreaView } from 'react-navigation';
import images from '../../config/images';
import config from '../../config/config';
import { Auth, Network } from '../../lib/capability';
import { Actions, ActionConst } from 'react-native-router-flux';
import PhoneTypeModal from './PhoneTypeModal';
import Loader from '../Loader/Loader';

export default class MyProfileScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            myDetails: {},
            myName: '',
            phoneNumbers: [],
            emailAddress: [],
            searchState: false,
            shareState: false,
            inviteModalVisible: false,
            currentIndex: null,
            loading: false
        };
        this.mounted = true;
    }

    componentDidMount() {
        Auth.getUser()
            .then(userDetails => {
                console.log('data', userDetails);

                const info = { ...userDetails.info };
                const emailArray = [];
                emailArray.push(info.emailAddress);
                if (this.mounted) {
                    this.setState({
                        myName: info.userName,
                        emailAddress: [...emailArray],
                        phoneNumbers: info.phoneNumbers
                            ? [...info.phoneNumbers]
                            : [],
                        searchState: info.searchState || false,
                        shareState: info.shareState || false,
                        myDetails: info
                    });
                }
            })
            .catch(err => {
                console.log('Error Loading User details', err);
            });
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    setPhoneNumber = (number, index) => {
        let getPhoneNumbers = [...this.state.phoneNumbers];
        getPhoneNumbers[index].number = number;
        this.setState({ phoneNumbers: [...getPhoneNumbers] });
    };

    saveProfile = async () => {
        this.setState({ loading: true });
        let detailObj = {
            emailAddress: this.state.emailAddress[0],
            phoneNumbers: {
                land: '',
                mobile: '',
                satellite: ''
            },
            searchable: this.state.searchState,
            visible: this.state.shareState
        };

        let userDetails = {
            userName: this.state.myName,
            phoneNumbers: [],
            searchState: this.state.searchState,
            shareState: this.state.shareState
        };

        this.state.phoneNumbers.forEach(elem => {
            userDetails.phoneNumbers.push(elem);
            if (elem.text in detailObj.phoneNumbers) {
                detailObj.phoneNumbers[elem.text] = elem.number;
            }
        });

        const updatedUserInfo = await Auth.updatingUserProfile(detailObj);

        if (!updatedUserInfo) {
            this.setState({ loading: false });
            console.log('error');
        }
        if (updatedUserInfo && !updatedUserInfo[0]) {
            this.setState({ loading: false });
            console.log('error');
        } else {
            Auth.updateUserDetails(userDetails)
                .then(data => {
                    this.setState({ loading: false });
                })
                .catch(err => {
                    this.setState({ loading: false });
                    console.log('error ', err);
                });
        }
    };

    selectNumberType = index => {
        this.setState({ currentIndex: index });
        console.log('select type');
        this.setState({
            inviteModalVisible: !this.state.inviteModalVisible
        });
    };

    addNewNumber = () => {
        let number = [...this.state.phoneNumbers];
        number.push({ label: 'Mobile', number: '', text: 'mobile' });
        this.setState({ phoneNumbers: [...number] });
    };

    removephone = index => {
        let number = [...this.state.phoneNumbers];
        number.splice(index, 1);
        this.setState({ phoneNumbers: [...number] });
    };

    getTheIcon = phoneLabel => {
        if (phoneLabel === 'Mobile') {
            return (
                <Image source={images.phone_icon} style={styles.phoneIcon} />
            );
        }

        if (phoneLabel === 'Land') {
            return (
                <Image source={images.phone_icon} style={styles.phoneIcon} />
            );
        }

        if (phoneLabel === 'Satellite') {
            return (
                <Image source={images.satellite} style={styles.satelliteIcon} />
            );
        }
    };

    infoRender = (type, myInfoData) => {
        return myInfoData.map((info, index) => {
            return (
                <View
                    key={index}
                    indexData={index}
                    style={styles.mainInfoRenderContainer}
                >
                    <View style={styles.labelContainer}>
                        {type === 'phNumber' ? (
                            this.getTheIcon(info.label)
                        ) : (
                            <Image
                                source={images.email_icon}
                                style={styles.emailIcon}
                            />
                        )}
                        {type === 'phNumber' ? (
                            <Text style={styles.labelStyle}>{info.label}</Text>
                        ) : (
                            <Text style={styles.labelStyle}>Email</Text>
                        )}
                        {type === 'phNumber' ? (
                            <TouchableOpacity
                                onPress={() => {
                                    this.selectNumberType(index);
                                }}
                            >
                                <Image
                                    source={images.collapse_gray_arrow_down}
                                    style={styles.arrowStyle}
                                />
                            </TouchableOpacity>
                        ) : null}
                    </View>
                    <View style={styles.infoContainer}>
                        {type === 'phNumber' ? (
                            <TextInput
                                style={styles.inputNumber}
                                value={info.number}
                                keyboardType="numeric"
                                autoCorrect={false}
                                maxLength={10}
                                blurOnSubmit={false}
                                onChangeText={val => {
                                    this.setPhoneNumber(val, index);
                                }}
                                underlineColorAndroid={'transparent'}
                                placeholderTextColor="rgba(155,155,155,1)"
                            />
                        ) : (
                            <Text style={styles.infoLabelStyle}>{info}</Text>
                        )}
                        {type === 'phNumber' ? (
                            <TouchableOpacity
                                onPress={() => {
                                    this.removephone(index);
                                }}
                            >
                                <Image
                                    style={{ width: 10, height: 10 }}
                                    source={images.remove_icon}
                                />
                            </TouchableOpacity>
                        ) : null}
                    </View>
                </View>
            );
        });
    };

    setInviteVisible(value) {
        this.setState({
            inviteModalVisible: value
        });
    }

    setupType(val) {
        console.log('setting yp type ', val);
        let numbers = [...this.state.phoneNumbers];

        this.setState({ inviteModalVisible: false });

        if (val === 'mobile') {
            numbers[this.state.currentIndex].label = 'Mobile';
            numbers[this.state.currentIndex].text = 'mobile';
        }
        if (val === 'satellite') {
            numbers[this.state.currentIndex].label = 'Satellite';
            numbers[this.state.currentIndex].text = 'satellite';
        }
        if (val === 'land') {
            numbers[this.state.currentIndex].label = 'Land';
            numbers[this.state.currentIndex].text = 'land';
        }
    }

    render() {
        return (
            <SafeAreaView style={styles.safeAreaStyle}>
                <ScrollView style={{ flex: 1 }}>
                    <View style={styles.mainViewContainer}>
                        <Loader loading={this.state.loading} />
                        <PhoneTypeModal
                            currentIndex={this.state.currentIndex}
                            isVisible={this.state.inviteModalVisible}
                            setVisible={this.setInviteVisible.bind(this)}
                            settingType={this.setupType.bind(this)}
                        />
                        <View style={styles.profileImageContainer}>
                            <Image
                                source={images.user_image}
                                style={styles.profileImgStyle}
                            />
                        </View>
                        <View style={styles.nameContainerStyle}>
                            <View
                                style={{ width: 300, alignItems: 'flex-start' }}
                            >
                                <Text style={styles.nameLabel}>Name</Text>
                                <TextInput
                                    style={styles.input}
                                    autoCorrect={false}
                                    value={this.state.myName}
                                    onChangeText={val => {
                                        this.setState({ myName: val });
                                    }}
                                    blurOnSubmit={false}
                                    placeholder="Your Name"
                                    underlineColorAndroid={'transparent'}
                                    placeholderTextColor="rgba(155,155,155,1)"
                                    clearButtonMode="always"
                                />
                            </View>
                        </View>
                        <View style={styles.userInfoNumberContainer}>
                            {this.infoRender(
                                'phNumber',
                                this.state.phoneNumbers
                            )}
                            <View style={styles.addContainer}>
                                <Image
                                    source={images.btn_more}
                                    style={styles.iconStyle}
                                />
                                <TouchableOpacity
                                    onPress={() => {
                                        this.addNewNumber();
                                    }}
                                >
                                    <Text style={styles.addLabel}>
                                        Add phone
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={styles.userInfoEmailContainer}>
                            {this.infoRender('email', this.state.emailAddress)}
                            {/* <View
                                style={styles.addContainer}
                            >
                                <Image
                                    source={images.btn_more}
                                    style={{
                                        height: 8,
                                        width: 8,
                                        marginRight: 15
                                    }}
                                />
                                <Text
                                    style={{
                                        color: 'rgba(0, 189, 242, 1)',
                                        fontFamily: 'SF Pro Text',
                                        fontSize: 12
                                    }}
                                >
                                    Add Email
                                </Text>
                            </View> */}
                        </View>
                        <View
                            style={{
                                height: 130,
                                width: '100%',
                                borderBottomWidth: 5,
                                borderTopWidth: 5,
                                borderColor: 'rgba(222,222,222,1)'
                            }}
                        >
                            <View
                                style={{
                                    flex: 1,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'space-evenly'
                                }}
                            >
                                <Text
                                    style={{
                                        color: 'rgba(102, 102, 102, 1)',
                                        fontFamily: 'SF Pro Text',
                                        fontSize: 14
                                    }}
                                >
                                    I don't want to appear in searches
                                </Text>
                                <Switch
                                    style={{
                                        borderWidth: 1,
                                        borderColor: 'rgba(222,222,222,1);',
                                        borderRadius: 15
                                    }}
                                    value={this.state.searchState}
                                    onValueChange={val => {
                                        let stateTint = this.state.searchState;
                                        stateTint = !stateTint;
                                        this.setState({
                                            searchState: stateTint
                                        });
                                    }}
                                    trackColor="rgba(244,244,244,1)"
                                    onTintColor="rgba(244,244,244,1)"
                                    // tintColor="rgba(244,244,244,1)"
                                    thumbColor={
                                        this.state.searchState
                                            ? 'rgba(0,189,242,1)'
                                            : 'rgba(102,102,102,1)'
                                    }
                                />
                            </View>
                            <View
                                style={{
                                    width: '100%',
                                    height: 1,
                                    backgroundColor: 'rgba(221,222,227,1)'
                                }}
                            />
                            <View
                                style={{
                                    flex: 1,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'space-evenly'
                                }}
                            >
                                <Text
                                    style={{
                                        color: 'rgba(102, 102, 102, 1)',
                                        fontFamily: 'SF Pro Text',
                                        fontSize: 14
                                    }}
                                >
                                    Share my information with my contacts
                                </Text>
                                <Switch
                                    style={{
                                        borderWidth: 1,
                                        borderColor: 'rgba(222,222,222,1);',
                                        borderRadius: 15
                                    }}
                                    value={this.state.shareState}
                                    onValueChange={val => {
                                        let stateTint = this.state.shareState;
                                        stateTint = !stateTint;
                                        this.setState({
                                            shareState: stateTint
                                        });
                                    }}
                                    trackColor="rgba(244,244,244,1)"
                                    onTintColor="rgba(244,244,244,1)"
                                    // tintColor="rgba(244,244,244,1)"
                                    thumbColor={
                                        this.state.shareState
                                            ? 'rgba(0,189,242,1)'
                                            : 'rgba(102,102,102,1)'
                                    }
                                />
                            </View>
                        </View>
                        <View
                            style={{
                                height: 90,
                                width: '100%',
                                flexDirection: 'row',
                                justifyContent: 'space-around',
                                alignItems: 'center'
                            }}
                        >
                            <TouchableOpacity
                                style={{
                                    width: 150,
                                    height: 30,
                                    backgroundColor: '#ffffff',
                                    borderColor: 'rgba(0,167,214,1)',
                                    borderWidth: 1,
                                    borderRadius: 6,
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <Text
                                    style={{
                                        color: 'rgba(0,167,214,1)',
                                        fontFamily: 'SF Pro Text',
                                        fontSize: 16
                                    }}
                                >
                                    Cancel
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => {
                                    this.saveProfile();
                                }}
                                style={{
                                    width: 150,
                                    height: 30,
                                    backgroundColor: 'rgba(0,189,242,1)',
                                    borderRadius: 6,
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <Text
                                    style={{
                                        color: 'rgba(255,255,255,1)',
                                        fontFamily: 'SF Pro Text',
                                        fontSize: 16
                                    }}
                                >
                                    Save
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        );
    }
}
