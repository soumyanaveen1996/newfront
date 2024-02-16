import React from 'react';
import { View, Text } from 'react-native';
import GlobalColors from '../../../../config/styles';
import { connect } from 'react-redux';

class ChatNotificationBar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            show: false
        };
    }

    componentDidUpdate(prevProps) {
        if (
            this.props.lastMessage &&
            prevProps.lastMessage &&
            this.props.lastMessage.message.getMessageId() !==
                prevProps.lastMessage.message.getMessageId()
        ) {
            this.setState({ show: true });
            setTimeout(() => {
                this.setState({ show: false });
            }, 2000);
        }
    }

    render() {
        if (this.state.show && this.props.lastMessage) {
            return (
                <View
                    style={{
                        position: 'absolute',
                        top: 0,
                        paddingVertical: 4,
                        paddingHorizontal: 10,
                        backgroundColor: GlobalColors.textBlack,
                        width: '100%'
                    }}
                >
                    <Text style={{ color: GlobalColors.white, fontSize: 11 }}>
                        {this.props.lastMessage.message.getMessage()}
                    </Text>
                </View>
            );
        } else {
            return null;
        }
    }
}

const mapStateToProps = (state, ownProps = {}) => {
    return {
        lastMessage:
            state.bots.nonConvChatMessages[ownProps.botId] &&
            state.bots.nonConvChatMessages[ownProps.botId][0]
    };
};

export default connect(mapStateToProps)(ChatNotificationBar);
