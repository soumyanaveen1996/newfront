import React from 'react';
import {
    FlatList,
    View,
    TouchableOpacity,
    Text,
    LayoutAnimation,
    StyleSheet
} from 'react-native';

import Icons from '../../../../config/icons';
import { Message } from '../../../../lib/capability';
import EventEmitter from '../../../../lib/events';
import MenusEvents from '../../../../lib/events/Menus';
import { MenuEntry } from './MenuEntry';
import GlobalColors from '../../../../config/styles';

export default class MenuMessage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            menus: this.props.entries,
            selectedEntries: []
        };
        this.menusList = React.createRef();
        // this.dispatch = useDispatch();
    }

    componentDidMount() {
        this.eventListeners = [];
        this.eventListeners.push(
            EventEmitter.addListener(
                MenusEvents.update,
                this.updateMenu.bind(this)
            )
        );
    }

    componentWillUnmount() {
        this.eventListeners.forEach((listener) => {
            listener.remove();
        });
    }

    updateMenu(menuMessage) {
        if (
            menuMessage.getMessageOptions().controlId === this.props.controlId
        ) {
            this.setState({
                menus: menuMessage.getMessage(),
                selectedEntries: []
            });
        }
    }

    onSelectEntry = (id) => {
        const { sendMessage, controlId } = this.props;
        const response = new Message();
        response.menuResponseMessage({
            controlId,
            selectedEntry: id
        });
        sendMessage(response);
    };

    openSubmenu(subMenu, parentMenuIndex, parentEntry) {
        const { menus, selectedEntries } = this.state;
        const newIndex = parentMenuIndex + 1;
        menus.splice(newIndex);
        selectedEntries.splice(parentMenuIndex);
        menus.push(subMenu);
        selectedEntries.push(parentEntry);
        this.menusList.scrollToIndex({ index: newIndex });
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        this.setState({
            menus,
            selectedEntries
        });
    }

    scrollToSubmenu(index) {
        setTimeout(() => {
            this.menusList.scrollToIndex({ index });
        }, 200);
    }

    renderEntry = ({ item, index }) => (
        <MenuEntry onSelectEntry={this.onSelectEntry} item={item} />
    );

    renderBackButton(parentMenuIndex) {
        if (parentMenuIndex > 0) {
            return (
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => {
                        this.scrollToSubmenu(parentMenuIndex - 1);
                    }}
                >
                    {Icons.keyboardArrowLeft()}
                    <Text style={styles.entryTextSelected}>BACK</Text>
                </TouchableOpacity>
            );
        }
        return null;
    }

    render() {
        const { entries } = this.props;
        const { menus } = this.state;
        return (
            <View style={styles.fullScreenContainer}>
                <FlatList
                    data={menus}
                    renderItem={this.renderEntry}
                    keyExtractor={(item) => item.id}
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    fullScreenContainer: {
        // flex: 1,
        height: '100%',
        width: '100%',
        backgroundColor: GlobalColors.fullScreenMessageBackgroundV2,
        overflow: 'visible'
    },
    menusList: {
        width: '100%',
        height: '100%',
        overflow: 'visible'
    },
    menuContainer: {
        borderRadius: 10,
        borderWidth: 1,
        borderColor: GlobalColors.frontmLightBlue
    },
    menu: {
        overflow: 'visible',
        flex: 1
    },
    menuContentContainer: {
        borderRadius: 10,
        borderWidth: 1,
        borderColor: GlobalColors.frontmLightBlue
    },
    entry: {
        alignItems: 'center',
        paddingHorizontal: 15,
        backgroundColor: 'red',
        flexDirection: 'row'
    },
    backButton: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingHorizontal: 15,
        borderBottomColor: GlobalColors.disabledGray,
        borderBottomWidth: 1
    },
    entryText: {
        fontSize: 16,
        marginVertical: 15,
        marginLeft: 15,
        color: GlobalColors.textBlack
    },
    entryTextSelected: {
        fontSize: 16,
        marginVertical: 15,
        marginLeft: 15,
        color: GlobalColors.frontmLightBlue
    },
    separator: {
        width: '99%',
        height: 1,
        backgroundColor: GlobalColors.disabledGray
    },
    separatorHorizontal: {
        width: 10
    },
    separatorHorizontalEdge: {
        width: 30
    }
});
