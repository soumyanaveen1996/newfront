import React from 'react';
import {
    View,
    TouchableOpacity,
    LayoutAnimation,
    UIManager,
    ScrollView
} from 'react-native';
import { connect } from 'react-redux';
import Icons from '../../../../config/icons';
import styles from './styles';
import GlobalColors from '../../../../config/styles';
import NonConversationalControl from './NonConversationalControl';
import { updateNonConvControlsList } from '../../../../redux/actions/UserActions';
import Store from '../../../../redux/store/configureStore';

export class NonConversationalControlsList extends React.Component {
    constructor(props) {
        super(props);
        UIManager.setLayoutAnimationEnabledExperimental &&
            UIManager.setLayoutAnimationEnabledExperimental(true);
        this.state = {
            isOpen: true
        };
    }

    openClose() {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        this.setState({ isOpen: !this.state.isOpen });
    }

    onCloseControl(index) {
        const list = Store.getState().bots.nonConvControlsList[
            this.props.botId
        ];
        list.splice(index, 1);
        this.props.updateNonConvControlsList({
            list: [...list],
            id: this.props.botId
        });
    }

    renderControl = ({ item, index }) => {
        const options = item.message.getMessageOptions();
        return (
            <NonConversationalControl
                key={index}
                controlId={options.controlId}
                title={options.title}
                conversationId={this.props.conversationId}
                sendMessage={this.props.sendMessage}
                userId={this.props.userId}
                type={item.message.getMessageType()}
                allowMinimize={options.allowMinimize}
                allowClose={options.allowClose}
                minimizeOnConfirm={options.minimizeOnConfirm}
                minimizeOnAction={options.minimizeOnAction}
                onClose={() => this.onCloseControl(index)}
            />
        );
    };

    render() {
        return (
            <View style={styles.listContainer}>
                <ScrollView
                    style={
                        this.state.isOpen ? styles.listOpen : styles.listClosed
                    }
                    contentContainerStyle={styles.listContentContainer}
                >
                    {this.props.list.map((item, index) =>
                        this.renderControl({ item, index })
                    )}
                </ScrollView>
                <TouchableOpacity
                    style={styles.listButton}
                    onPress={this.openClose.bind(this)}
                >
                    {this.state.isOpen
                        ? Icons.arrowUp({
                              color: GlobalColors.primaryButtonColor
                          })
                        : Icons.arrowDown({
                              color: GlobalColors.primaryButtonColor
                          })}
                </TouchableOpacity>
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    list: state.bots.nonConvControlsList
});

const mapDispatchToProps = (dispatch) => ({
    updateNonConvControlsList: (list) =>
        dispatch(updateNonConvControlsList(list))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(NonConversationalControlsList);
