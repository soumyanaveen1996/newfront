import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import styles from './styles';
import Icons from '../../../../config/icons';
import { formStatus } from './config';
import { ControlDAO } from '../../../../lib/persistence';
import EventEmitter from '../../../../lib/events';
import FormsEvents from '../../../../lib/events/Forms';
import NavigationAction from '../../../../navigation/NavigationAction';
export default class Form2Message extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            status: formStatus.NEW
        };
    }

    async componentDidMount() {
        // const currentForm = Store.getState().user.currentForm;
        // if (
        //     currentForm &&
        //     currentForm.formMessage.formId === this.props.messageData.formId
        // ) {
        //     this.openForm();
        // }
        const localControlId = this.props.messageData.controlId
            ? this.props.messageData.controlId + this.props.conversationId
            : this.props.messageData.formId + this.props.conversationId;
        const options = await ControlDAO.getOptionsById(localControlId);
        if (options.stage) {
            this.setState({ status: options.stage });
        }
        this.formEventListener = EventEmitter.addListener(
            FormsEvents.complete,
            this.onFormCompleted.bind(this)
        );
    }

    componentWillUnmount() {
        this.formEventListener?.remove();
    }

    componentDidUpdate(prevProps) {
        // if (prevProps.messageData.stage !== this.props.messageData.stage) {
        //     this.setState({ status: this.props.messageData.stage });
        // }
    }

    async openForm() {
        if (this.state.status === formStatus.NEW) {
            this.setState({ status: formStatus.OPENED });
        }
        // Store.dispatch(
        //     setCurrentForm({
        //         formData: this.props.formData,
        //         formMessage: this.props.messageData,
        //         currentResults: null,
        //         change: null
        //     })
        // );
        // const formData = await ControlDAO.getContentById(this.props.messageData.formId)
        NavigationAction.push(NavigationAction.SCREENS.form2, {
            // formData: this.props.formData,
            // formData: formData,
            // formMessage: this.props.messageData,
            localControlId: this.props.messageData.controlId
                ? this.props.messageData.controlId + this.props.conversationId
                : this.props.messageData.formId + this.props.conversationId,
            // onDone: this.onFormCompleted.bind(this),
            // saveMessage: this.saveMessage.bind(this),
            // formStatus: this.state.status,
            // sendResponse: this.props.onSubmit,
            // setCompleted: () => this.setState({ status: formStatus.COMPLETED }),
            conversationId: this.props.conversationId,
            sendMessage: this.props.sendMessage,
            userId: this.props.userId,
            title: this.props.messageData.title
        });
    }

    // saveMessage(formData) {
    //     this.props.messageData.stage = this.state.status;
    //     this.props.message.form2Message(formData, this.props.messageData);
    //     this.props.saveMessage(this.props.message);
    // }

    onFormCompleted(formId) {
        if (this.props.messageData.formId === formId) {
            this.setState({ status: formStatus.COMPLETED }, () => {
                // this.saveMessage(formData);
                // this.props.onSubmit(response);
            });
        }
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
