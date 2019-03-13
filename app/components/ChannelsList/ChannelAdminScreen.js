import React from 'react';
import {
    View,
    ScrollView,
    Text,
    TouchableOpacity,
    TextInput,
    Image,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-navigation';
import { Actions } from 'react-native-router-flux';
import RadioForm, {
    RadioButton,
    RadioButtonInput,
    RadioButtonLabel
} from 'react-native-simple-radio-button';
import { HeaderBack, HeaderRightIcon } from '../Header';
import { Icons } from '../../config/icons';
import styles from './styles';
import I18n from '../../config/i18n/i18n';
import { Channel } from '../../lib/capability';
import Loader from '../Loader/Loader';
import images from '../../images';
import { connect } from 'react-redux';
import {
    setChannelParticipants,
    setChannelTeam
} from '../../redux/actions/ChannelActions';
import { setCurrentScene } from '../../redux/actions/UserActions';
import ROUTER_SCENE_KEYS from '../../routes/RouterSceneKeyConstants';
import Store from '../../redux/store/configureStore';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp
} from 'react-native-responsive-screen';
import { Auth } from '../../lib/capability';
import { GlobalColors } from '../../config/styles';
import Utils from '../../lib/utils';
import CachedImage from '../CachedImage';

const SeparatorSize = {
    SMALL: 2,
    BIG: 5
};

export default class ChannelAdminScreen extends React.Component {
    static navigationOptions({ navigation, screenProps }) {
        const { state } = navigation;

        let navigationOptions = {
            headerTitle: state.params.title
        };
        if (state.params.noBack === true) {
            navigationOptions.headerLeft = null;
        } else {
            navigationOptions.headerLeft = (
                <HeaderBack
                    onPress={() => {
                        state.params.onBack();
                    }}
                />
            );
        }
        if (state.params.button) {
            if (state.params.button === 'manual') {
                navigationOptions.headerRight = (
                    <HeaderRightIcon
                        onPress={() => {
                            state.params.refresh();
                        }}
                        icon={Icons.refresh()}
                    />
                );
            } else if (state.params.button === 'gsm') {
                navigationOptions.headerRight = (
                    <HeaderRightIcon
                        image={images.gsm}
                        onPress={() => {
                            state.params.showConnectionMessage('gsm');
                        }}
                    />
                );
            } else if (state.params.button === 'satellite') {
                navigationOptions.headerRight = (
                    <HeaderRightIcon
                        image={images.satellite}
                        onPress={() => {
                            state.params.showConnectionMessage('satellite');
                        }}
                    />
                );
            } else {
                navigationOptions.headerRight = (
                    <HeaderRightIcon
                        icon={Icons.automatic()}
                        onPress={() => {
                            state.params.showConnectionMessage('automatic');
                        }}
                    />
                );
            }
        }
        return navigationOptions;
    }

    constructor(props) {
        super(props);
        console.log('>>>>>>>>', this.props.channel);
        this.state = {};
        this.channel = this.props.channel;
    }

    componentDidMount() {
        this.props.navigation.setParams({ onBack: this.onBack.bind(this) });
    }

    onBack() {}

    renderTopArea() {
        return (
            <View style={styles.adminTopArea}>
                <CachedImage
                    imageTag="channelLogo"
                    source={{ uri: Utils.channelLogoUrl(this.channel.logo) }}
                    style={styles.adminLogo}
                    resizeMode="contain"
                />
                <View style={styles.adminTopRightArea}>
                    <Text style={styles.adminH1}>
                        {this.channel.channelName}
                    </Text>
                    <Text style={styles.adminH2}>
                        {this.channel.description}
                    </Text>
                </View>
            </View>
        );
    }

    renderAdminArea() {
        return (
            <View>
                <TouchableOpacity style={styles.adminRow}>
                    <Text style={styles.adminH2}>Add to favourite</Text>
                </TouchableOpacity>
                {this.renderSeparator(SeparatorSize.SMALL)}
                <TouchableOpacity style={styles.adminRow}>
                    <Text style={styles.adminH2}>Transfer ownership</Text>
                </TouchableOpacity>
                {this.renderSeparator(SeparatorSize.SMALL)}
                <TouchableOpacity style={styles.adminRow}>
                    <Text style={[styles.adminH2, { color: GlobalColors.red }]}>
                        Leave channel
                    </Text>
                </TouchableOpacity>
                {this.renderSeparator(SeparatorSize.SMALL)}
                <TouchableOpacity style={styles.adminRow}>
                    <Text style={[styles.adminH2, { color: GlobalColors.red }]}>
                        Delete channel
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }

    renderParticipantsArea() {
        return (
            <View>
                <TouchableOpacity style={styles.adminRow}>
                    <Text>Partecipants</Text>
                </TouchableOpacity>
                {this.renderSeparator(SeparatorSize.SMALL)}
                <TouchableOpacity style={styles.adminRow}>
                    <View>
                        <Text style={styles.adminH2}>
                            Participants awaiting authorization
                        </Text>
                        <Text style={styles.adminH3}>
                            Pending authotization:
                        </Text>
                    </View>
                    {Icons.formMessageArrow()}
                </TouchableOpacity>
                {this.renderSeparator(SeparatorSize.SMALL)}
                <TouchableOpacity style={styles.adminRow}>
                    <View>
                        <Text style={styles.adminH2}>Manage participants</Text>
                        <Text style={styles.adminH3}>
                            Participants in this channel:
                        </Text>
                    </View>
                    {Icons.formMessageArrow()}
                </TouchableOpacity>
                {this.renderSeparator(SeparatorSize.SMALL)}
                <TouchableOpacity style={styles.adminRow}>
                    <Text style={styles.adminH2}>Manage admins</Text>
                    {Icons.formMessageArrow()}
                </TouchableOpacity>
                {this.renderSeparator(SeparatorSize.SMALL)}
            </View>
        );
    }

    renderSeparator(size) {
        return (
            <View
                style={{
                    height: size,
                    backgroundColor: GlobalColors.disabledGray
                }}
            />
        );
    }

    render() {
        return (
            <ScrollView style={styles.adminContainer}>
                {this.renderTopArea()}
                {this.renderSeparator(SeparatorSize.BIG)}
                {this.renderAdminArea()}
                {this.renderSeparator(SeparatorSize.BIG)}
                {this.renderParticipantsArea()}
            </ScrollView>
        );
    }
}
