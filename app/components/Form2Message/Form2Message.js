import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import styles from './styles';
import Icons from '../../config/icons';
import { Actions } from 'react-native-router-flux';

export default class Form2Message extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            formCompleted: false
        };
    }

    openForm() {
        Actions.form2({
            formData: this.props.formData,
            id: this.props.messageData.id,
            title: this.props.messageData.title,
            cancel: this.props.messageData.cancel,
            confirm: this.props.messageData.confirm,
            onDone: this.onFormCompleted.bind(this)
        });
    }

    onFormCompleted(response) {
        console.log(response, 'Form response');
        this.setState({ formCompleted: true });
        // this.props.onSubmit(response)
    }

    renderCompletedCheck() {
        return (
            <View style={styles.completedCheck}>
                {Icons.formCompletedCheck()}
            </View>
        );
    }

    render() {
        return (
            <View style={styles.container}>
                <View style={styles.topArea}>
                    <Text style={styles.title}>
                        {this.props.messageData.title}
                    </Text>
                    <TouchableOpacity
                        onPress={this.openForm.bind(this)}
                        disabled={this.state.formCompleted}
                    >
                        {this.state.formCompleted
                            ? this.renderCompletedCheck()
                            : Icons.formMessageArrow()}
                    </TouchableOpacity>
                </View>
                <Text style={styles.description}>
                    {this.props.messageData.description}
                </Text>
                <TouchableOpacity
                    style={
                        this.state.formCompleted
                            ? styles.buttonSee
                            : styles.buttonContinue
                    }
                    onPress={this.openForm.bind(this)}
                >
                    <Text
                        style={
                            this.state.formCompleted
                                ? styles.buttonTextSee
                                : styles.buttonTextContinue
                        }
                    >
                        {this.state.formCompleted ? 'See form' : 'Continue'}
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }
}
