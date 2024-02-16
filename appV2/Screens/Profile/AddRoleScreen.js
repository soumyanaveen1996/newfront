import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Platform,
    KeyboardAvoidingView,
    Alert,
    StyleSheet,
    BackHandler
} from 'react-native';
import { CheckBox, Icon } from '@rneui/themed';
import { connect } from 'react-redux';
import _ from 'lodash';
import I18n from '../../config/i18n/i18n';
import GlobalColors from '../../config/styles';
import NavigationAction from '../../navigation/NavigationAction';
import UserServices from '../../apiV2/UserServices';
import DropDown from '../Chat/ChatComponents/Widgets/DropDown';
import { DeviceStorage } from '../../lib/capability';
import LookupControll from '../Chat/ChatComponents/Widgets/LookupControll';
import { SecondaryButton } from '../../widgets/SecondaryButton';
import { PrimaryButton } from '../../widgets/PrimaryButton';
import AlertDialog from '../../lib/utils/AlertDialog';
import alertForGoingBackDailog from '../../widgets/SaveConfirmationDialog';
import AppFonts from '../../config/fontConfig';

class AddRoleScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            trackChange: false,
            otherInputValue: '',
            roleMap: { ship: [], shore: [] },
            isSailing: this.props.route.params.isSailing,
            rankLevel3: this.props.route.params.rankLevel3 || null,
            rankLevel2: this.props.route.params.rankLevel2 || null,
            shipIMO: this.props.route.params.shipIMO,
            imosearchtext: this.props.route.params.shipIMO,
            shipName:
                this.props.route.params.shipName &&
                this.props.route.params.shipName.length > 0
                    ? this.props.route.params.shipName
                    : null,
            isSeafarer: props.route.params.isSeafarer
        };
        this.mounted = true;
        this.inputs = {};
        this.topHeaderBack = false;
    }

    handleBackButtonClick = (flag) => {
        if (flag) this.topHeaderBack = true;
        if (this.state.trackChange) {
            alertForGoingBackDailog(
                this.isCallbackCalled,
                `Your saved changes will be lost. \n Save changes before closing?`
            );
            return false;
        } else {
            if (flag) {
                NavigationAction.pop();
            } else {
                return true;
            }
        }
    };

    isCallbackCalled = (flag) => {
        if (flag) {
            this.saveProfile();
            return false;
        } else {
            this.setState({ trackChange: false });
            if (this.topHeaderBack) {
                this.topHeaderBack = false;
                NavigationAction.pop();
            }
            return true;
        }
    };

    componentWillUnmount() {
        if (Platform.OS === 'android') this.backhandler?.remove();
    }

    componentDidMount() {
        console.log('i m here -------90909');
        this.props.navigation.setParams({
            onBack: this.handleBackButtonClick
        });
        console.log(this.props.route.params);
        if (Platform.OS === 'android')
            this.backhandler = BackHandler.addEventListener(
                'hardwareBackPress',
                this.handleBackButtonClick
            );
        UserServices.getLevel3Ranks()
            .then((response) => {
                console.log('USERROLE -> respose', response);
                DeviceStorage.save('roleMap', response);
                let level2Data = null;
                if (this.state.isSeafarer) {
                    console.log(
                        'USERROLE -> user is seafarer, search for ' +
                            this.state.rankLevel2
                    );
                    level2Data = response.ship.find(
                        (i) => i.info === this.state.rankLevel2
                    );
                } else {
                    console.log(
                        'USERROLE -> user is shore user, search for ' +
                            this.state.rankLevel2
                    );
                    level2Data = response.shore.find(
                        (i) => i.info === this.state.rankLevel2
                    );
                }
                console.log(
                    'USERROLE -> search result for 2nd levbel data for ' +
                        this.state.rankLevel2,
                    level2Data
                );
                this.setState({
                    roleMap: response,
                    level2Options: level2Data.level2
                });
            })
            .catch((e) => {
                DeviceStorage.get('roleMap').then((roleMap) => {
                    this.setState({
                        roleMap: roleMap
                    });
                });
            });
    }

    showAlert(msg) {
        AlertDialog.show(undefined, msg);
    }

    handleShipSelection = (val) => {
        if (val) {
            this.setState({
                shipIMO: val.info,
                imosearchtext: val.info,
                shipName: val.text,
                validIMO: true,
                shipIMOerror: false,
                trackChange: true
            });
        } else if (val === undefined) {
            this.setState({
                shipIMO: null,
                imosearchtext: null,
                shipName: null,
                validIMO: false,
                shipIMOerror: false,
                trackChange: true
            });
        }
    };

    saveProfile = () => {
        const {
            isSeafarer,
            rankLevel2,
            rankLevel3,
            isSailing,
            shipName,
            shipIMOerror,
            shipIMO
        } = this.state;
        if (isSailing && (shipIMOerror || shipName === null)) {
            this.showAlert('Invalid ship details entered');
            return;
        }
        if (_.isEmpty(rankLevel2) || _.isEmpty(rankLevel3)) {
            this.showAlert('Please select valid role');
            return;
        }

        this.props.route.params.updateRole({
            isSeafarer: isSeafarer,
            rankLevel2: rankLevel2,
            rankLevel3: rankLevel3,
            isSailing: isSailing,
            shipName: isSailing ? shipName : null,
            shipIMO: isSailing ? shipIMO : null
        });
        NavigationAction.pop();
    };

    verifyIMO = () => {
        UserServices.getShipDetails({
            shipIMO: this.state.imosearchtext
        })
            .then((res) => {
                if (res.ships.length > 0) {
                    this.setState({
                        shipIMO: res.ships[0].IMO,
                        shipName: res.ships[0].shipName,
                        validIMO: true,
                        shipIMOerror: false,
                        trackChange: true
                    });
                } else {
                    this.setState({
                        shipIMO: null,
                        shipName: null,
                        validIMO: false,
                        shipIMOerror: true,
                        trackChange: true
                    });
                }
            })
            .catch((e) => {
                this.setState({
                    shipIMO: null,
                    shipName: null,
                    validIMO: false,
                    shipIMOerror: true
                });
            });
    };

    updateSeafarerStatus(status) {
        if (this.state.isSeafarer === status) {
            return;
        }
        this.setState({
            isSeafarer: status,
            rankLevel2: null,
            rankLevel3: null,
            trackChange: true
        });
    }

    mainArea() {
        return (
            <View style={styles.mainAreaContainer}>
                <View
                    style={{
                        marginHorizontal: 22,
                        marginTop: 30
                    }}
                >
                    <Text style={styles.labletext}>Are you a seafarer?</Text>
                    <TouchableOpacity
                        onPress={() => {
                            this.updateSeafarerStatus(true);
                        }}
                        style={[
                            styles.checkBoxViewContainer,
                            {
                                borderColor: this.state.isSeafarer
                                    ? GlobalColors.primaryButtonColor
                                    : GlobalColors.formBorderColor
                            }
                        ]}
                    >
                        <CheckBox
                            title={'Yes'}
                            containerStyle={styles.checkBoxView}
                            checked={this.state.isSeafarer}
                            textStyle={[
                                styles.checkBoxText,
                                {
                                    color: this.state.isSeafarer
                                        ? GlobalColors.primaryButtonColor
                                        : GlobalColors.descriptionText
                                }
                            ]}
                            onPress={() => {
                                this.updateSeafarerStatus(true);
                            }}
                            size={28}
                            iconType="font-awesome"
                            checkedIcon="dot-circle-o"
                            uncheckedIcon="circle-o"
                            checkedColor={GlobalColors.primaryButtonColor}
                            uncheckedColor={GlobalColors.secondaryButtonColor}
                        />
                        <Icon
                            name="ferry"
                            size={24}
                            type="material-community"
                            color={GlobalColors.primaryButtonColor}
                        />
                    </TouchableOpacity>
                    <View style={{ height: 10 }} />
                    <TouchableOpacity
                        onPress={() => {
                            this.updateSeafarerStatus(false);
                        }}
                        style={[
                            styles.checkBoxViewContainer,
                            {
                                borderColor: this.state.isSeafarer
                                    ? GlobalColors.formBorderColor
                                    : GlobalColors.primaryButtonColor
                            }
                        ]}
                    >
                        <CheckBox
                            title={'No'}
                            containerStyle={styles.checkBoxView}
                            checked={!this.state.isSeafarer}
                            textStyle={[
                                styles.checkBoxText,
                                {
                                    color: !this.state.isSeafarer
                                        ? GlobalColors.primaryButtonColor
                                        : GlobalColors.descriptionText
                                }
                            ]}
                            onPress={() => {
                                this.updateSeafarerStatus(false);
                            }}
                            size={28}
                            iconType="font-awesome"
                            checkedIcon="dot-circle-o"
                            uncheckedIcon="circle-o"
                            checkedColor={GlobalColors.primaryButtonColor}
                            uncheckedColor={GlobalColors.secondaryButtonColor}
                        />
                        <Icon
                            name="image-filter-hdr"
                            size={24}
                            type="material-community"
                            color={GlobalColors.green}
                        />
                    </TouchableOpacity>
                    {this.renderRoleOptions()}
                </View>
            </View>
        );
    }

    getStringListList(objectList) {
        if (objectList) {
            const list = objectList.map((l) => l.detail);
            return list;
        } else return [];
    }

    renderRoleOptions = () => {
        const {
            rankLevel2,
            roleMap,
            rankLevel3,
            shipName,
            shipIMO,
            imosearchtext,
            shipIMOerror,
            isSeafarer,
            isSailing,
            level2Options
        } = this.state;
        const subRoleMap = isSeafarer ? roleMap.ship : roleMap.shore;
        const subRoleMapL2 = level2Options ? level2Options : [];

        return (
            <View style={{ flex: 1, marginTop: 44 }}>
                {this.state.roleMap && (
                    <View>
                        <Text style={styles.labletext}>What is your role?</Text>
                        <Text style={styles.subLable}>Type</Text>
                        <DropDown
                            selectedValue={rankLevel2}
                            list={subRoleMap}
                            onValueChange={(val, id, originalItem) => {
                                if (val)
                                    this.setState({
                                        rankLevel2: val,
                                        rankLevel3: null,
                                        level2Options: originalItem.level2,
                                        trackChange: true
                                    });
                            }}
                            fieldData={{
                                type: 'lookup',
                                id: 'id',
                                title: 'Type'
                            }}
                        />
                        <View style={{ height: 12 }} />
                        <Text style={styles.subLable}>Rank</Text>
                        <DropDown
                            disabled={rankLevel2 === ''}
                            selectedValue={rankLevel3}
                            list={subRoleMapL2}
                            displayKey={'detail'}
                            onValueChange={(val) => {
                                if (val)
                                    this.setState({
                                        rankLevel3: val,
                                        trackChange: true
                                    });
                            }}
                            fieldData={{
                                type: 'lookup',
                                id: 'id',
                                title: 'Rank'
                            }}
                        />
                    </View>
                )}
                <View style={{ height: 44 }} />

                <Text style={styles.labletext}>Are you sailing?</Text>
                <CheckBox
                    title={'Yes'}
                    onPress={() => {
                        this.setState({ isSailing: true, trackChange: true });
                    }}
                    containerStyle={[
                        styles.checkBoxContainer,
                        {
                            borderColor: isSailing
                                ? GlobalColors.primaryButtonColor
                                : GlobalColors.formBorderColor
                        }
                    ]}
                    checked={isSailing}
                    textStyle={[
                        styles.checkBoxText,
                        {
                            color: isSailing
                                ? GlobalColors.primaryButtonColor
                                : GlobalColors.descriptionText
                        }
                    ]}
                    size={28}
                    iconType="font-awesome"
                    checkedIcon="dot-circle-o"
                    uncheckedIcon="circle-o"
                    checkedColor={GlobalColors.primaryButtonColor}
                    uncheckedColor={GlobalColors.secondaryButtonColor}
                />
                <View style={{ height: 10 }} />
                <CheckBox
                    title={'No'}
                    onPress={() => {
                        this.setState({ isSailing: false, trackChange: true });
                    }}
                    containerStyle={[
                        styles.checkBoxContainer,
                        {
                            borderColor: !isSailing
                                ? GlobalColors.primaryButtonColor
                                : GlobalColors.descriptionText
                        }
                    ]}
                    checked={!this.state.isSailing}
                    textStyle={[
                        styles.checkBoxText,
                        {
                            color: !isSailing
                                ? GlobalColors.primaryButtonColor
                                : GlobalColors.descriptionText
                        }
                    ]}
                    size={28}
                    iconType="font-awesome"
                    checkedIcon="dot-circle-o"
                    uncheckedIcon="circle-o"
                    checkedColor={GlobalColors.primaryButtonColor}
                    uncheckedColor={GlobalColors.secondaryButtonColor}
                />

                {isSailing && (
                    <View style={{ marginTop: 20 }}>
                        <LookupControll
                            lable={'Search for ship'}
                            getDataForLookup={async (
                                id,
                                value,
                                text,
                                callBack
                            ) => {
                                await UserServices.getShipDetails({
                                    shipName: text
                                }).then((res) => {
                                    const listData = res.ships.map((ship) => {
                                        return {
                                            text: ship.shipName,
                                            info: ship.IMO
                                        };
                                    });
                                    callBack(listData);
                                });
                            }}
                            value={shipName}
                            fieldData={{ title: 'Select ship', type: 'lookup' }}
                            handleChange={this.handleShipSelection}
                            minCharacterReq={8}
                            validationMsg={`Please enter at least eight characters to search for a vessel by name or search it using the IMO number`}
                        />
                        <TextInput
                            style={[
                                styles.shipIMOEditText,
                                {
                                    borderColor: shipIMOerror
                                        ? GlobalColors.red
                                        : GlobalColors.formItemBackgroundColor
                                }
                            ]}
                            onChangeText={(text) => {
                                this.setState({
                                    imosearchtext: text,
                                    validIMO: false,
                                    shipIMOerror: false
                                });
                            }}
                            onEndEditing={this.verifyIMO}
                            placeholderTextColor={
                                GlobalColors.formPlaceholderText
                            }
                            placeholder={'Vessel IMO'}
                            value={imosearchtext}
                        />
                    </View>
                )}
            </View>
        );
    };

    renderBottomButtons() {
        return (
            <View style={[styles.btn_container]}>
                <SecondaryButton
                    onPress={NavigationAction.pop}
                    text={I18n.t('Cancel')}
                />
                <PrimaryButton
                    onPress={this.saveProfile}
                    text={I18n.t('SAVE')}
                />
            </View>
        );
    }

    render() {
        return (
            <KeyboardAvoidingView
                style={{ flex: 1, backgroundColor: GlobalColors.appBackground }}
                behavior={Platform.OS === 'ios' ? 'padding' : null}
            >
                <ScrollView style={{ flex: 1 }}>
                    <View
                        style={[
                            styles.mainViewContainer,
                            {
                                alignContent: 'space-between'
                            }
                        ]}
                    >
                        {this.mainArea()}
                    </View>
                </ScrollView>
                {this.renderBottomButtons()}
            </KeyboardAvoidingView>
        );
    }
}

const styles = StyleSheet.create({
    save_btn_text: {
        color: 'rgba(255,255,255,1)',
        fontSize: 16
    },
    mainViewContainer: {
        flex: 1,
        backgroundColor: GlobalColors.appBackground
    },
    btn_container: {
        height: 90,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingHorizontal: 15
    },
    cancel_btn: {
        width: 120,
        height: 40,
        backgroundColor: GlobalColors.secondaryButtonColor,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center'
    },
    cancel_text: {
        color: GlobalColors.secondaryButtonText,
        fontSize: 14,
        fontWeight: AppFonts.BOLD
    },
    save_btn: {
        width: 120,
        height: 40,
        backgroundColor: GlobalColors.primaryButtonColor,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center'
    },
    save_btn_disabled: {
        width: 120,
        height: 30,
        backgroundColor: GlobalColors.primaryButtonColorDisabled,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center'
    },
    save_btn_text: {
        color: GlobalColors.primaryButtonText,
        fontWeight: AppFonts.BOLD,
        fontSize: 14
    },
    mainAreaContainer: {
        flex: 1,
        alignContent: 'center'
    },
    labletext: {
        fontSize: 16,
        fontWeight: AppFonts.BOLD,
        color: GlobalColors.formLable,
        marginBottom: 20
    },
    checkBoxViewContainer: {
        borderWidth: 1,
        backgroundColor: GlobalColors.appBackground,
        padding: 6,
        borderRadius: 6,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    checkBoxView: {
        backgroundColor: GlobalColors.appBackground,
        marginLeft: 2,
        marginTop: 0,
        marginBottom: 0,
        marginRight: 0,
        padding: 0,
        borderWidth: 0
    },
    checkBoxContainer: {
        padding: 0,
        borderWidth: 1,
        backgroundColor: GlobalColors.appBackground,
        padding: 6,
        borderRadius: 6,
        marginLeft: 0,
        marginRight: 0
    },
    checkBoxText: {
        fontSize: 16,
        fontWeight: AppFonts.NORMAL,
        marginTop: -2,
        alignItems: 'center'
    },
    subLable: {
        fontSize: 12,
        marginBottom: 2,
        color: GlobalColors.descriptionText
    },
    textInput: {
        height: 45,
        paddingHorizontal: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: GlobalColors.textField,
        borderRadius: 5,
        borderTopRightRadius: 0,
        borderColor: GlobalColors.textField,
        fontSize: 18,
        color: GlobalColors.textDarkGrey
    },
    shipIMOEditText: {
        marginTop: 10,
        height: 45,
        borderRadius: 6,
        fontSize: 18,
        flex: 1,
        backgroundColor: GlobalColors.formItemBackgroundColor,
        color: GlobalColors.formText,
        paddingLeft: 12,

        borderWidth: 1
    }
});

const mapStateToProps = (state) => ({
    appState: state.user
});

const mapDispatchToProps = (dispatch) => ({
    uploadImage: () => dispatch(uploadImage())
});

export default connect(mapStateToProps, mapDispatchToProps)(AddRoleScreen);
