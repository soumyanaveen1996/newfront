import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import RadioForm from 'react-native-simple-radio-button';
import Modal from 'react-native-modal';
import GlobalColors from '../../../config/styles';
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
                onSwipeComplete={() => this.props.setVisible(false)}
                swipeDirection="right"
                avoidKeyboard={true}
            >
                <View
                    style={{
                        width: 200,
                        height: 200,
                        backgroundColor: GlobalColors.appBackground,
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
                        onPress={(value) => {
                            this.setState({ selectValue: value });
                        }}
                        initial={this.radio_props.findIndex(
                            (x) => x.value === this.state.selectValue
                        )}
                        borderWidth={1}
                        buttonInnerColor={GlobalColors.frontmLightBlue}
                        buttonOuterColor={GlobalColors.frontmLightBlue}
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
                            backgroundColor: GlobalColors.frontmLightBlue,
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
