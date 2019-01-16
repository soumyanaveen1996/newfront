import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import styles from './styles';
import Icons from '../../config/icons';
import { Actions } from 'react-native-router-flux';
import { formStatus } from './config';
export default class Form2Message extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            status: this.props.message.getStage()
                ? this.props.message.getStage()
                : formStatus.NEW
        };
    }

    openForm() {
        if (this.state.status === formStatus.NEW) {
            this.setState({ status: formStatus.OPENED });
            this.props.message.setStage(this.state.status);
        }
        Actions.form2({
            formData: this.props.formData,
            id: this.props.messageData.id,
            title: this.props.messageData.title,
            cancel: this.props.messageData.cancel,
            confirm: this.props.messageData.confirm,
            onDone: this.onFormCompleted.bind(this),
            saveMessage: this.saveMessage.bind(this),
            formStatus: this.state.status
        });
    }

    saveMessage(formData) {
        this.props.message.form2Message(formData, this.props.messageData);
        this.props.message.setStage(this.state.status);
        this.props.saveMessage(this.props.message);
    }

    onFormCompleted(formData, response) {
        this.setState({ status: formStatus.COMPLETED });
        this.saveMessage(formData);
        this.props.onSubmit(response);
    }

    renderTopRightIcon() {
        if (this.state.status === formStatus.NEW) {
            return Icons.formMessageArrow();
        } else if (this.state.status === formStatus.OPENED) {
            return Icons.circleSlice();
        } else if (this.state.status === formStatus.COMPLETED) {
            return this.renderCompletedCheck();
        }
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
                        disabled={this.state.status === formStatus.COMPLETED}
                    >
                        {this.renderTopRightIcon()}
                    </TouchableOpacity>
                </View>
                <Text style={styles.description}>
                    {this.props.messageData.description}
                </Text>
                <TouchableOpacity
                    style={
                        this.state.status === formStatus.COMPLETED
                            ? styles.buttonSee
                            : styles.buttonContinue
                    }
                    onPress={this.openForm.bind(this)}
                >
                    <Text
                        style={
                            this.state.status === formStatus.COMPLETED
                                ? styles.buttonTextSee
                                : styles.buttonTextContinue
                        }
                    >
                        {this.state.status === formStatus.COMPLETED
                            ? 'See form'
                            : 'Continue'}
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }
}
