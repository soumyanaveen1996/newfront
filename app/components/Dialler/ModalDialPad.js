import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import Styles from './styles';
import Modal from 'react-native-modal';
import { Icons } from '../../config/icons';

export default class ModalDialPad extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            numbersString: ''
        };
    }

    renderButtons() {
        const digits = [
            ['1', '2', '3'],
            ['4', '5', '6'],
            ['7', '8', '9'],
            ['*', '0', '#']
        ];
        return digits.map((row, index) => {
            return (
                <View key={index} style={Styles.buttonRow}>
                    {row.map(char => this.renderButtonForChar(char))}
                </View>
            );
        });
    }

    renderButtonForChar(char) {
        if (char === '#') {
            return (
                <TouchableOpacity
                    key={char}
                    style={Styles.roundButton}
                    onPress={this.buttonPressed.bind(this, char)}
                >
                    <Text style={[Styles.roundButtonStar, { color: 'white' }]}>
                        {char}
                    </Text>
                </TouchableOpacity>
            );
        }
        if (char === '*') {
            return (
                <TouchableOpacity
                    key={char}
                    style={Styles.roundButton}
                    onPress={this.buttonPressed.bind(this, char)}
                >
                    <Text style={[Styles.roundButtonStar, { color: 'white' }]}>
                        {char}
                    </Text>
                </TouchableOpacity>
            );
        }
        return (
            <TouchableOpacity
                key={char}
                style={Styles.roundButton}
                onPress={this.buttonPressed.bind(this, char)}
            >
                <Text style={[Styles.roundButtonText, { color: 'white' }]}>
                    {char}
                </Text>
                <Text style={Styles.roundButtonAlpha}>
                    {this.alphaForNumber(char)}
                </Text>
            </TouchableOpacity>
        );
    }

    alphaForNumber = char => {
        switch (char) {
        case '2':
            return 'ABC';
        case '3':
            return 'DEF';
        case '4':
            return 'GHI';
        case '5':
            return 'JKL';
        case '6':
            return 'MNO';
        case '7':
            return 'PQRS';
        case '8':
            return 'TUV';
        case '9':
            return 'WXYZ';
        default:
            '';
        }
    };

    buttonPressed(char) {
        this.setState({ numbersString: this.state.numbersString + char });
        this.props.onButtonPressed(char);
    }

    render() {
        return (
            <Modal
                isVisible={this.props.isVisible}
                style={Styles.modalDialPad}
                onBackdropPress={() => {
                    this.props.onClose();
                }}
            >
                <TouchableOpacity
                    style={Styles.modalDialPadTopBar}
                    onPress={this.props.onClose}
                >
                    <Text
                        style={Styles.modalDialPadString}
                        numberOfLines={1}
                        ellipsizeMode="head"
                    >
                        {this.state.numbersString}
                    </Text>
                    {Icons.redClose({ color: 'white', size: 40 })}
                </TouchableOpacity>
                <View style={Styles.modalDialPadContainer}>
                    {this.renderButtons()}
                </View>
            </Modal>
        );
    }
}
