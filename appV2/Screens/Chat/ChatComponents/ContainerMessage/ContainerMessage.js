import React from 'react';
import {
    Text,
    View,
    TouchableOpacity,
    ActivityIndicator,
    Keyboard
} from 'react-native';
// import { TabBar } from 'react-native-tab-view';
// import { Tab, TabView } from '@rneui/themed';
import ActionSheet from 'react-native-action-sheet';
import GlobalColors from '../../../../config/styles';
import { Message } from '../../../../lib/capability';
import EventEmitter from '../../../../lib/events';
import ContainersEvents from '../../../../lib/events/Containers';
import { Form2 } from '../Form2Message';
import { TableMessage } from '../TableMessage/TableMessageV2';
import styles from './styles';
import { MapMessage } from '../MapMessage/MapMessageV2';
import AlertDialog from '../../../../lib/utils/AlertDialog';
import { Tab, TabView } from '@rneui/themed';

export default class ContainerMessage extends React.Component {
    constructor(props) {
        super(props);
        const { options } = this.props;
        let { confirm, cancel, more } = options;
        if (more && more.length === 0) {
            more = undefined;
            options.more = more;
        }
        const showActionButtons = confirm || cancel || more;
        this.state = {
            index: 0,
            routes: [],
            options,
            showActionsMenu: false,
            showActionButtons,
            keyBoadrVisible: false,
            tabIndex: 0
        };
        this.screensCollection = [];
    }

    componentDidMount() {
        const routes = this.props.fields.map((field, indexKey) => {
            const { message, type } = field;
            this.screensCollection[indexKey] = React.createRef();
            return {
                key: message.options.controlId,
                indexKey,
                title: message.options.title,
                type,
                message,
                parentMessageOptions: this.props.options
            };
        });

        this.eventListeners = [];
        this.eventListeners.push(
            EventEmitter.addListener(
                ContainersEvents.updateContainer,
                this.updateContainer.bind(this)
            )
        );
        this.eventListeners.push(
            Keyboard.addListener('keyboardDidShow', this.keyboardDidShow)
        );
        this.eventListeners.push(
            Keyboard.addListener('keyboardDidHide', this.keyboardDidHide)
        );
        this.setState({ routes });
    }

    componentWillUnmount() {
        this.closeContianer();
        this.eventListeners.forEach((listener) => {
            listener.remove();
        });
    }

    keyboardDidShow = () => {
        this.setState({ keyBoadrVisible: true });
    };

    keyboardDidHide = () => {
        this.setState({ keyBoadrVisible: false });
    };

    updateContainer(message) {
        const fields = message.getMessage();
        const options = message.getMessageOptions();

        fields.forEach((field) => {
            if (field.type === 'form2') {
                EventEmitter.emit(
                    ContainersEvents.updateFormField,
                    field.message
                );
            } else if (field.type == 'table') {
                EventEmitter.emit(
                    ContainersEvents.updateTableField,
                    field.message
                );
            }
        });
        let { confirm, cancel, more } = options;
        if (more && more.length === 0) {
            more = undefined;
            options.more = more;
        }
        const showActionButtons = confirm || cancel || more;
        this.setState({ options, showActionButtons });
        if (options.title) this.props.setTitle?.(options.title);
    }

    confirmContianer() {
        Keyboard.dismiss();
        const containerResponse = this.getCurrentContainerState(
            'confirm',
            true
        );
        if (containerResponse === null) {
            AlertDialog.show('Please fill all mandatory fields.');
            return;
        }
        const response = {
            controlId: this.state.options.controlId,
            action: 'confirm',
            container: containerResponse,
            tabId: this.state.options.tabId
        };
        const message = new Message();
        message.messageByBot(false);
        message.containerResponseMessage(response);
        message.setCreatedBy(this.props.userId);
        this.props.sendMessage(message);
        if (
            this.props.nonConvOnConfirm &&
            this.state.options?.minimizeOnConfirm
        )
            this.props.nonConvOnConfirm();
    }

    closeContianer() {
        const response = {
            controlId: this.state.options.controlId,
            action: 'close',
            tabId: this.state.options.tabId,
            docId: this.state.options.docId
        };
        const message = new Message();
        message.messageByBot(false);
        message.containerResponseMessage(response);
        message.setCreatedBy(this.props.userId);
        this.props.sendMessage(message);
    }

    cancelContainer() {
        const response = {
            controlId: this.state.options.controlId,
            action: 'cancel'
        };
        const message = new Message();
        message.messageByBot(false);
        message.containerResponseMessage(response);
        message.setCreatedBy(this.props.userId);
        this.props.sendMessage(message);
        if (this.props.nonConvOnConfirm) this.props.nonConvOnConfirm();
    }

    containerAction(buttonText) {
        const response = {
            controlId: this.state.options.controlId,
            action: 'more',
            button: buttonText,
            tabId: this.state.options.tabId,
            container: this.getCurrentContainerState()
        };
        const message = new Message();
        message.messageByBot(false);
        message.containerResponseMessage(response);
        message.setCreatedBy(this.props.userId);
        this.props.sendMessage(message);
    }

    getCurrentContainerState(action, validate = false) {
        let error = false;
        const responseArray = this.screensCollection.map((screen, indexKey) => {
            const { type } = this.state.routes[indexKey];
            if (type === 'table') {
                return {
                    tableId: this.state.routes[indexKey].key,
                    rows: screen.current.getCurrentState().responseData.fields
                };
            }
            if (type === 'form2') {
                const response = screen.current.getCurrentState(action);
                if (response.completed === false) error = true;
                return {
                    formId: this.state.routes[indexKey].key,
                    fields: response.responseData.fields
                };
            }
        });
        if (error && validate) {
            return null;
        } else {
            return responseArray;
        }
    }

    renderScene = (route) => {
        const { key, indexKey, title, type, message, parentMessageOptions } =
            route;

        const { sendMessage, conversationId, userId, botId } = this.props;

        if (type === 'form2') {
            return (
                <Form2
                    parentMessageOptions={parentMessageOptions}
                    localControlId={key + conversationId}
                    ref={this.screensCollection[indexKey]}
                    conversationId={conversationId}
                    sendMessage={sendMessage}
                    userId={userId}
                    botId={botId}
                    conversational={false}
                    hideLogo={this.props.hideLogo}
                    // nonConvOnConfirm={}
                />
            );
        }
        if (type === 'table') {
            return (
                <View style={styles.tableContainer}>
                    <TableMessage
                        parentMessageOptions={parentMessageOptions}
                        ref={this.screensCollection[indexKey]}
                        localControlId={key + conversationId}
                        conversationId={conversationId}
                        sendMessage={sendMessage}
                        userId={userId}
                        botId={botId}
                        conversational={false}
                        hideLogo={this.props.hideLogo}
                        // nonConvOnAction={ }
                    />
                </View>
            );
        }
        if (type === 'map') {
            return (
                <View style={styles.tableContainer}>
                    <MapMessage
                        parentMessageOptions={parentMessageOptions}
                        ref={this.screensCollection[indexKey]}
                        localControlId={key + conversationId}
                        conversationId={conversationId}
                        sendMessage={sendMessage}
                        userId={userId}
                        botId={botId}
                        conversational={false}
                        hideLogo={this.props.hideLogo}
                        // nonConvOnAction={ }
                    />
                </View>
            );
        }
    };

    renderTabBar(props) {
        if (this.state.routes.length == 1) return null;
        return (
            <TabBar
                {...props}
                style={styles.tabBar}
                activeColor={GlobalColors.primaryButtonColor}
                inactiveColor={GlobalColors.primaryTextColor}
                indicatorStyle={{
                    backgroundColor: GlobalColors.primaryButtonColor,
                    height: 2
                }}
                tabStyle={{ width: 'auto' }}
                scrollEnabled
            />
        );
    }

    renderButton(label, action, negetiveButton = false) {
        if (label === '' || label === undefined || label === null)
            return <View></View>;
        return (
            <TouchableOpacity
                style={[
                    styles.button,
                    negetiveButton && {
                        backgroundColor: GlobalColors.secondaryButtonColor
                    }
                ]}
                onPress={action}
            >
                <Text
                    style={[
                        styles.buttonText,
                        negetiveButton && {
                            color: GlobalColors.secondaryButtonText
                        }
                    ]}
                    numberOfLines={1}
                >
                    {label}
                </Text>
            </TouchableOpacity>
        );
    }

    setIndex = (index) => {
        this.setState({ tabIndex: index });
    };
    render() {
        const {
            index,
            routes,
            options: { confirm, cancel, more },
            showActionButtons,
            keyBoadrVisible
        } = this.state;

        if (routes.length === 0) {
            return <ActivityIndicator size="small" />;
        }

        return (
            <View
                style={{
                    flex: 1,
                    backgroundColor: GlobalColors.fullScreenMessageBackgroundV2
                }}
            >
                {/* <TabView
                    navigationState={{ index, routes }}
                    renderScene={this.renderScene.bind(this)}
                    onIndexChange={(newIndex) => {
                        this.setState({ index: newIndex });
                    }}
                    renderTabBar={this.renderTabBar.bind(this)}
                    // initialLayout={initialLayout}
                /> */}

                <Tab
                    scrollable
                    value={this.state.tabIndex}
                    onChange={this.setIndex}
                    indicatorStyle={{
                        backgroundColor: GlobalColors.primaryButtonColor,
                        height: 3
                    }}
                    titleStyle={{ color: GlobalColors.primaryTextColor }}
                >
                    {routes.map((route, index) => (
                        <Tab.Item title={route.title} />
                    ))}
                </Tab>
                <TabView value={this.state.tabIndex} onChange={this.setIndex}>
                    {routes.map((route, index) => (
                        <TabView.Item
                            style={{
                                width: '100%'
                            }}
                        >
                            {this.renderScene(route)}
                        </TabView.Item>
                    ))}
                </TabView>

                {showActionButtons && !keyBoadrVisible && (
                    <View style={styles.actionsButtonContainer}>
                        {this.renderButton(
                            cancel,
                            this.cancelContainer.bind(this),
                            true
                        )}

                        {more &&
                            this.renderButton(
                                'More',
                                () => {
                                    ActionSheet.showActionSheetWithOptions(
                                        {
                                            options: ['CANCEL'].concat(more),
                                            cancelButtonIndex: 0
                                        },
                                        (buttonIndex) => {
                                            this.containerAction(
                                                more[buttonIndex - 1]
                                            );
                                        }
                                    );
                                },
                                true
                            )}
                        {this.renderButton(
                            confirm,
                            this.confirmContianer.bind(this)
                        )}
                    </View>
                )}
            </View>
        );
    }
}
