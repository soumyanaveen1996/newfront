import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    TextInput,
    SafeAreaView,
    Keyboard,
    TouchableWithoutFeedback
} from 'react-native';
import RadioForm, {
    RadioButton,
    RadioButtonInput,
    RadioButtonLabel
} from 'react-native-simple-radio-button';
import styles from './styles';
import config from '../../config/config';
import Modal from 'react-native-modal';
import { Actions, ActionConst } from 'react-native-router-flux';
import SystemBot from '../../lib/bot/SystemBot';
import { Auth, Network } from '../../lib/capability';
import { GlobalColors } from '../../config/styles';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp
} from 'react-native-responsive-screen';
const BUTTON_INNER = hp('1%');
const BUTTON_OUTER = hp('2.5%');

export default class PhoneTypeModal extends React.Component {
    constructor(props) {
        super(props);
        // this.dataSource = new FrontMAddedContactsPickerDataSource(this)
        this.state = {
            contactsData: [],
            isVisible: '',
            contactSelected: '',
            keyboard: false,
            selectValue: 'mobile'
        };

        this.radio_props = [
            { label: 'Mobile', value: 'mobile' },
            { label: 'Satellite', value: 'satellite' },
            { label: 'Land', value: 'land' }
        ];
    }

    setType = () => {
        this.props.settingType(this.state.selectValue);
    };
    render() {
        return (
            <Modal
                style={{
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
                isVisible={this.props.isVisible}
                onBackdropPress={() => {
                    this.props.setVisible(false);
                }}
                onBackButtonPress={() => {
                    this.props.setVisible(false);
                }}
                onSwipe={() => this.props.setVisible(false)}
                swipeDirection="right"
                avoidKeyboard={true}
            >
                <View
                    style={{
                        width: 200,
                        height: 200,
                        backgroundColor: GlobalColors.white,
                        borderRadius: 10,
                        padding: 10,
                        alignItems: 'center'
                    }}
                >
                    <Text style={{ marginBottom: 20, fontSize: 20 }}>
                        Select Type
                    </Text>
                    <RadioForm
                        radio_props={this.radio_props}
                        onPress={value => {
                            this.setState({ selectValue: value });
                        }}
                        borderWidth={1}
                        buttonInnerColor={'#00BDF2'}
                        buttonOuterColor={'#00BDF2'}
                        buttonSize={BUTTON_INNER}
                        buttonOuterSize={BUTTON_OUTER}
                        buttonStyle={{ marginRight: 10 }}
                        labelStyle={{
                            color: GlobalColors.modalBackground,
                            fontSize: 16
                        }}
                    />

                    <TouchableOpacity
                        onPress={() => {
                            this.setType();
                        }}
                        style={{
                            marginTop: 20,
                            width: 100,
                            height: 30,
                            backgroundColor: '#00BDF2',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 6
                        }}
                    >
                        <Text style={{ color: '#fff' }}>Select</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        );
    }
}
