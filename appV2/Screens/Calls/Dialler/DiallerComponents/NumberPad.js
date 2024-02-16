import React from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import GlobalColors from '../../../../config/styles';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp
} from 'react-native-responsive-screen';

export const diameter = hp('24%');
const digits = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['*', '0', '#']
];

export const NumberPad = ({ onButtonPress, textColor }) => {
    function alphaForNumber(char) {
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
    }
    function renderButtonForChar(char) {
        if (char === '#') {
            return (
                <TouchableOpacity
                    key={char}
                    style={Styles.roundButton}
                    onPress={() => onButtonPress(char)}
                >
                    <Text
                        style={[Styles.roundButtonStar, { color: textColor }]}
                    >
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
                    onPress={() => onButtonPress(char)}
                >
                    <Text
                        style={[Styles.roundButtonStar, { color: textColor }]}
                    >
                        {char}
                    </Text>
                </TouchableOpacity>
            );
        }
        return (
            <TouchableOpacity
                key={char}
                style={Styles.roundButton}
                onPress={() => onButtonPress(char)}
            >
                <Text style={[Styles.roundButtonText, { color: textColor }]}>
                    {char}
                </Text>
                <Text style={Styles.roundButtonAlpha}>
                    {alphaForNumber(char)}
                </Text>
            </TouchableOpacity>
        );
    }
    return (
        <View>
            {digits.map((row, index) => {
                return (
                    <View key={index} style={Styles.buttonRow}>
                        {row.map((char) => renderButtonForChar(char))}
                    </View>
                );
            })}
        </View>
    );
};

const Styles = StyleSheet.create({
    roundButton: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%'
    },
    roundButtonStar: {
        color: GlobalColors.black,
        fontSize: hp('4.5%'),
        textAlign: 'center'
    },
    roundButtonText: {
        color: GlobalColors.black,
        fontSize: hp('3.5%'),
        textAlign: 'center'
    },
    roundButtonAlpha: {
        color: GlobalColors.descriptionText,
        fontSize: hp('1.5%'),
        textAlign: 'center'
    },
    modalDialPadContainer: {
        height: '50%',
        width: '100%'
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        height: '25%'
    }
});

export default Styles;
