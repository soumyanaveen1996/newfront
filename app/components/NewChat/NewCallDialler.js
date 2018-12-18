import React from 'react';
import {
    View,
    SafeAreaView,
    SectionList,
    TextInput,
    KeyboardAvoidingView,
    ActivityIndicator,
    Platform
} from 'react-native';
import styles from './styles';
import { Actions, ActionConst } from 'react-native-router-flux';
import _ from 'lodash';
import SystemBot from '../../lib/bot/SystemBot';
import { Contact } from '../../lib/capability';
import EventEmitter, { AuthEvents } from '../../lib/events';
import { connect } from 'react-redux';
import I18n from '../../config/i18n/i18n';
import Store from '../../redux/store/configureStore';
import {
    setCurrentScene,
    refreshContacts
} from '../../redux/actions/UserActions';
import { NetworkStatusNotchBar } from '../NetworkStatusBar';
import NewChatItemSeparator from './NewChatItemSeparator';
import NewChatSectionHeader from './NewChatSectionHeader';
import NewChatIndexView from './NewChatIndexView';
import NewChatRow from './NewChatRow';
import {
    SECTION_HEADER_HEIGHT,
    searchBarConfig,
    addButtonConfig
} from './config';
import Images from '../../config/images';
import ProfileImage from '../ProfileImage';
import ROUTER_SCENE_KEYS from '../../routes/RouterSceneKeyConstants';

const R = require('ramda');

class NewDialler extends React.Component {
    constructor(props) {
        super(props);
    }

    async componentDidMount() {
        console.log('Mount', this.props);

        if (Actions.prevScene === ROUTER_SCENE_KEYS.dialler && this.props.bot) {
            Actions.botChat({ bot: this.props.bot });
            return;
        }
        if (
            Actions.prevScene === ROUTER_SCENE_KEYS.dialler &&
            this.props.summary
        ) {
            Actions.callSummary({
                time: this.props.callTime,
                contact: this.props.dialContact,
                dialledNumber: this.props.dialledNumber
            });
            return;
        }
        if (Actions.prevScene === ROUTER_SCENE_KEYS.dialler) {
            Actions.pop();
        }
    }

    componentDidUpdate(prevProps) {}

    static onEnter() {
        EventEmitter.emit(
            AuthEvents.tabTopSelected,
            I18n.t('Dial_call'),
            I18n.t('Dial_call')
        );
        console.log(Actions.prevScene);
        if (
            Actions.prevScene === ROUTER_SCENE_KEYS.contactsCall ||
            Actions.prevScene === ROUTER_SCENE_KEYS.botChat
        ) {
            Actions.push(ROUTER_SCENE_KEYS.dialler, {
                newCallScreen: true
            });
        }
    }

    static onExit() {
        Store.dispatch(setCurrentScene('none'));
    }

    render() {
        return <SafeAreaView style={styles.container} />;
    }
}
const mapStateToProps = state => ({
    appState: state.user
});

const mapDispatchToProps = dispatch => {
    return {};
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(NewDialler);
