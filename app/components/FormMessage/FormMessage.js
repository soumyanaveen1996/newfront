import React from 'react';
import { Text, View, TouchableHighlight } from 'react-native';
import { FormLabel, FormInput } from 'react-native-elements';
import styles from './styles';

var formTextArr = [];
export default class FormMessage extends React.Component {
    constructor(props) {
        super(props);
    }

    CTAResponseOnPress() {
        var formData = this.props.formData;
        for (var i = 0; i < formData.length; i++) {
            var eachFormData = formData[i];
            eachFormData.value = formTextArr[i];
            formData[i] = eachFormData;
        }
        this.props.onCTAClicked(formData);
    }

    onChangeText(i, text) {
        formTextArr[i] = text;
    }

    render() {
        var buttons = [];
        var formData = this.props.formData;
        for (var i = 0; i < formData.length; i++) {
            if (formData[i].type === 'text') {
                buttons.push(
                    <View style={styles.buttonMsgParent} key={i}>
                        <FormLabel>{formData[i].title}</FormLabel>
                    </View>
                );
            } else if (formData[i].type === 'text_field') {
                buttons.push(
                    <View style={styles.buttonMsgParent} key={i}>
                        <FormInput
                            onChangeText={this.onChangeText.bind(this, i)}
                            inputStyle={styles.inputStyle}
                            placeholder={formData[i].title}
                        />
                    </View>
                );
            } else if (formData[i].type === 'button') {
                buttons.push(
                    <View style={styles.buttonMsgParent} key={i}>
                        <TouchableHighlight
                            underlayColor="white"
                            onPress={this.CTAResponseOnPress.bind(this)}
                            style={styles.buttonMessage}
                        >
                            <Text>{formData[i].title}</Text>
                        </TouchableHighlight>
                    </View>
                );
            }
        }

        return <View style={{ flexDirection: 'column' }}>{buttons}</View>;
    }
}
