import React from 'react';
import {
    Text,
    View,
    TouchableOpacity,
    LayoutAnimation,
    UIManager
} from 'react-native';
import Icons from '../../../../config/icons';
import styles from './styles';
import GlobalColors from '../../../../config/styles';
import { MessageTypeConstants } from '../../../../lib/capability';
import { Form2 } from '../Form2Message';
import { TableMessage } from '../TableMessage/TableMessageV2';
import { TrackingViewMessage } from '../TrackingViewMessage';
import EventEmitter, {
    TrackerEvents,
    FormsEvents,
    TablesEvents
} from '../../../../lib/events';
import { updateNonConvControlsList } from '../../../../redux/actions/UserActions';
import { connect } from 'react-redux';

export class NonConversationalControl extends React.Component {
    constructor(props) {
        super(props);
        UIManager.setLayoutAnimationEnabledExperimental &&
            UIManager.setLayoutAnimationEnabledExperimental(true);
        this.state = {
            isOpen: false,
            title: this.props.title,
            allowMinimize:
                this.props.allowMinimize === undefined
                    ? true
                    : this.props.allowMinimize,
            allowClose:
                this.props.allowClose === undefined
                    ? true
                    : this.props.allowClose
        };
    }

    componentDidMount() {
        EventEmitter.addListener(
            TrackerEvents.updateTracker,
            this.updateTitle.bind(this)
        );
        EventEmitter.addListener(
            FormsEvents.update,
            this.updateTitle.bind(this)
        );
        EventEmitter.addListener(
            TablesEvents.updateTable,
            this.updateTitle.bind(this)
        );
    }

    updateTitle(message) {
        const options = message.getMessageOptions();
        if (options.controlId === this.props.controlId) {
            this.setState({ title: options.title });
        }
    }

    closeControl = () => {
        if (this.controlContent && this.controlContent.onCloseControl) {
            this.controlContent.onCloseControl();
        }
        this.props.onClose();
    };

    minimize = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        this.setState({
            isOpen: !this.state.isOpen
        });
    };

    renderContent() {
        if (this.props.type === MessageTypeConstants.MESSAGE_TYPE_FORM2) {
            return (
                <Form2
                    ref={(controlContent) => {
                        this.controlContent = controlContent;
                    }}
                    localControlId={
                        this.props.controlId + this.props.conversationId
                    }
                    conversationId={this.props.conversationId}
                    sendMessage={this.props.sendMessage}
                    userId={this.props.userId}
                    conversational={false}
                    nonConvOnConfirm={
                        this.props.minimizeOnConfirm ? this.minimize : null
                    }
                    minimize={this.minimize}
                />
            );
        }
        if (this.props.type === MessageTypeConstants.MESSAGE_TYPE_TABLE) {
            return (
                <TableMessage
                    ref={(controlContent) => {
                        this.controlContent = controlContent;
                    }}
                    localControlId={
                        this.props.controlId + this.props.conversationId
                    }
                    conversationId={this.props.conversationId}
                    sendMessage={this.props.sendMessage}
                    userId={this.props.userId}
                    conversational={false}
                    nonConvOnAction={
                        this.props.minimizeOnAction ? this.minimize : null
                    }
                />
            );
        }
        if (
            this.props.type ===
            MessageTypeConstants.MESSAGE_TYPE_TRACKING_VIEW_MESSAGE
        ) {
            return (
                <TrackingViewMessage
                    ref={(controlContent) => {
                        this.controlContent = controlContent;
                    }}
                    localControlId={
                        this.props.controlId + this.props.conversationId
                    }
                    conversationId={this.props.conversationId}
                    sendMessage={this.props.sendMessage}
                    userId={this.props.userId}
                    conversational={false}
                />
            );
        }
    }

    render() {
        return (
            <View style={styles.container}>
                <TouchableOpacity
                    onPress={this.minimize}
                    style={
                        this.state.isOpen
                            ? [styles.topContainer, { borderBottomWidth: 1 }]
                            : [styles.topContainer, { borderBottomWidth: 0 }]
                    }
                >
                    <Text style={styles.titleText}>{this.state.title}</Text>
                    <View style={styles.buttonsContainer}>
                        {this.state.allowMinimize !== false && (
                            <TouchableOpacity
                                style={[
                                    styles.button,
                                    {
                                        backgroundColor: GlobalColors.green,
                                        marginRight: 7,
                                        alignItems: 'center'
                                    }
                                ]}
                                onPress={this.minimize}
                            >
                                {this.state.isOpen
                                    ? Icons.minus({
                                          size: 12,
                                          color: GlobalColors.white
                                      })
                                    : Icons.squareOutline({
                                          size: 12,
                                          color: GlobalColors.white
                                      })}
                            </TouchableOpacity>
                        )}
                        {this.props.allowClose && (
                            <TouchableOpacity
                                style={[
                                    styles.button,
                                    { backgroundColor: GlobalColors.red }
                                ]}
                                onPress={this.closeControl}
                            >
                                {Icons.close({
                                    size: 15,
                                    color: GlobalColors.white
                                })}
                            </TouchableOpacity>
                        )}
                    </View>
                </TouchableOpacity>
                <View
                    style={
                        this.state.isOpen
                            ? styles.contentContainerOpen
                            : styles.contentContainerClose
                    }
                >
                    {this.renderContent()}
                </View>
            </View>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        nonConvControlsList: state.bots.nonConvControlsList
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        updateNonConvControlsList: (list) =>
            dispatch(updateNonConvControlsList(list))
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(NonConversationalControl);
