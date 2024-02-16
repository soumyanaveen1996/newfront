import React from 'react';
import {
    View,
    Text,
    Dimensions,
    FlatList,
    UIManager,
    LayoutAnimation,
    TouchableOpacity
} from 'react-native';
import { connect } from 'react-redux';
import _ from 'lodash';
import { updateNonConvChat } from '../../../../redux/actions/UserActions';
import GlobalColors from '../../../../config/styles';
import Icons from '../../../../config/icons';

const WIDTH = Dimensions.get('window').width / 2;
const HEIGHT = Dimensions.get('window').height;

class ChatBubblesOverlay extends React.Component {
    constructor(props) {
        super(props);
        UIManager.setLayoutAnimationEnabledExperimental &&
            UIManager.setLayoutAnimationEnabledExperimental(true);
        this.state = {
            show: false,
            updating: false,
            touched: false
        };
        this.messageCount = 0;
    }

    componentDidUpdate(prevProps) {
        const { nonConvChatMessages, updateNonConvChat } = this.props;
        const lastMessage = _.get(nonConvChatMessages, '[0].message');
        const previousLastMessage = _.get(
            prevProps.nonConvChatMessages,
            '[0].message'
        );
        if (
            lastMessage &&
            (!previousLastMessage ||
                lastMessage.getMessageId() !==
                    previousLastMessage.getMessageId())
        ) {
            console.log('bubble componentDidUpdate');
            this.messageCount++;
            LayoutAnimation.configureNext(
                LayoutAnimation.Presets.easeInEaseOut
            );
            if (!this.state.show) this.setState({ show: true });
            setTimeout(() => this.autoHide(), 5000);
        }
        // const {nonConvChatMessages} = this.props
        // if (
        //     nonConvChatMessages &&
        //     prevProps.nonConvChatMessages &&
        //     this.props.lastMessage.message.getMessageId() !==
        //         prevProps.lastMessage.message.getMessageId()
        // ) {
        //     this.setState({ show: true });
        //     setTimeout(() => {
        //         this.setState({ show: false });
        //     }, 2000);
        // }
    }

    autoHide() {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.linear);
        if (!this.state.touched && --this.messageCount < 1) {
            this.props.updateNonConvChat({ list: [], id: this.props.botId });
            this.setState({ show: false });
        }
    }

    hide() {
        this.props.updateNonConvChat({ list: [], id: this.props.botId });
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        this.setState({ touched: false, show: false });
    }

    renderItem({ item }) {
        if (item.message.getMessageType() !== 'string') return;
        const message = item.message.getMessage();
        return (
            <View
                style={{
                    paddingHorizontal: 15,
                    paddingVertical: 10,
                    marginVertical: 10,
                    marginLeft: 10,
                    backgroundColor: GlobalColors.primaryButtonColor,
                    borderRadius: 10,
                    // borderBottomLeftRadius: 0,
                    shadowOffset: { width: 0, height: 0 },
                    shadowColor: 'black',
                    shadowOpacity: 0.5
                }}
            >
                <Text
                    style={{
                        color: GlobalColors.white,
                        fontSize: 16
                    }}
                >
                    {message}
                </Text>
            </View>
        );
    }

    render() {
        const { nonConvChatMessages, updateNonConvChat } = this.props;
        const { touched, show } = this.state;
        return (
            show && (
                <View
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        alignSelf: 'center'
                    }}
                >
                    <FlatList
                        ListHeaderComponent={
                            <TouchableOpacity
                                style={{
                                    backgroundColor:
                                        GlobalColors.primaryButtonColor,
                                    width: 30,
                                    height: 30,
                                    borderRadius: 15,
                                    alignSelf: 'center',
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}
                                onPress={() => this.hide()}
                            >
                                {Icons.keyboardArrowDown({
                                    size: 25,
                                    color: GlobalColors.white
                                })}
                            </TouchableOpacity>
                        }
                        extraData={nonConvChatMessages}
                        style={{
                            width: WIDTH,
                            maxHeight: 400,
                            overflow: 'visible',
                            alignSelf: 'center'
                        }}
                        contentContainerStyle={{
                            width: WIDTH
                        }}
                        data={nonConvChatMessages}
                        renderItem={this.renderItem.bind(this)}
                        onScroll={() => {
                            if (!touched) this.setState({ touched: true });
                        }}
                        showsVerticalScrollIndicator={false}
                    />
                    {/* {touched
                    && <TouchableOpacity
                        style={{
                            backgroundColor: GlobalColors.frontmLightBlue,
                            width: 30,
                            height: 30,
                            borderRadius: 15,
                            position: 'absolute',
                            right: -35
                        }}
                        onPress={() => {
                            updateNonConvChat([])
                            LayoutAnimation.configureNext(
                                LayoutAnimation.Presets.easeInEaseOut
                            );
                            this.setState({ touched: false, show: false })
                        }}
                    >
                        {Icons.close({ size: 25, color: GlobalColors.white })}
                    </TouchableOpacity>
                } */}
                </View>
            )
        );
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        nonConvChatMessages: state.bots.nonConvChatMessages[ownProps.bot.botId]
    };
};

const mapDispatchToProps = (dispatch) => ({
    updateNonConvChat: (messages) => dispatch(updateNonConvChat(messages))
});

export default connect(mapStateToProps, mapDispatchToProps)(ChatBubblesOverlay);
