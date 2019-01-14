import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import styles from './styles';
import Icons from '../../config/icons';
import { Actions } from 'react-native-router-flux';

export default class Form2Message extends React.Component {
    constructor(props) {
        super(props);
    }

    openForm() {
        Actions.form2({
            formData: this.props.formData,
            id: this.props.messageData.id,
            title: this.props.messageData.title,
            cancel: this.props.messageData.cancel,
            confirm: this.props.messageData.confirm
        });
    }

    render() {
        console.log(
            'MESSAGEDATA: ' +
                JSON.stringify(this.props.messageData, undefined, 2)
        );
        return (
            <View style={styles.container}>
                <View style={styles.topArea}>
                    <Text style={styles.title}>
                        {this.props.messageData.title}
                    </Text>
                    <TouchableOpacity onPress={this.openForm.bind(this)}>
                        {Icons.formMessageArrow()}
                    </TouchableOpacity>
                </View>
                <Text style={styles.description}>
                    {this.props.messageData.description}
                </Text>
                <TouchableOpacity
                    style={styles.button}
                    onPress={this.openForm.bind(this)}
                >
                    <Text style={styles.buttonText}>Continue</Text>
                </TouchableOpacity>
            </View>
        );
    }
}
