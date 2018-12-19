import React from 'react';
import {
    Alert,
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    Image
} from 'react-native';
import Styles from './styles';
import { Icons } from '../../config/icons';
import { Actions } from 'react-native-router-flux';
import I18n from '../../config/i18n/i18n';
import _ from 'lodash';
import { Auth } from '../../lib/capability';
import { Network } from '../../lib/capability';
import ROUTER_SCENE_KEYS from '../../routes/RouterSceneKeyConstants';
import GlobalColors from '../../config/styles';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp
} from 'react-native-responsive-screen';
import ProfileImage from '../ProfileImage';
import moment from 'moment';

export default class CallSummary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {}

    renderAvatar = () => {
        if (this.props.contact) {
            return (
                <ProfileImage
                    uuid={this.props.contact.id}
                    placeholder={require('../../images/contact/GreenGoblin.png')}
                    style={Styles.imageAvatar}
                    placeholderStyle={Styles.imageAvatar}
                    resizeMode="center"
                />
            );
        }
        return (
            <Image
                style={Styles.imageAvatar}
                resizeMode="center"
                source={require('../../images/contact/GreenGoblin.png')}
            />
        );
    };

    renderCallerDet = () => {
        if (this.props.contact) {
            return (
                <View
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginTop: hp('3%')
                    }}
                >
                    <Text
                        style={{
                            fontSize: hp('3.5%'),
                            color: 'rgba(102,102,102,1)'
                        }}
                    >
                        {this.props.contact.name || 'Unknown'}
                    </Text>
                    <Text
                        style={{
                            fontSize: hp('2%'),
                            color: 'rgba(102,102,102,1)'
                        }}
                    >
                        {this.props.dialledNumber}
                    </Text>
                </View>
            );
        }

        return (
            <View
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: hp('3%')
                }}
            >
                <Text
                    style={{
                        fontSize: hp('3.5%'),
                        color: 'rgba(102,102,102,1)'
                    }}
                >
                    {this.props.dialledNumber}
                </Text>
            </View>
        );
    };

    renderCallSummary = () => {
        const seconds = parseInt(this.props.time, 10);
        const derivedSeconds = seconds - 10 < 0 ? 0 : seconds - 10;

        const duration =
            '00' +
            ':' +
            moment.duration(derivedSeconds, 'seconds').minutes() +
            ':' +
            moment.duration(derivedSeconds, 'seconds').seconds();
        const callTime = moment
            .utc(moment.duration(duration).asMilliseconds())
            .format('mm:ss');
        return (
            <View
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: hp('3%')
                }}
            >
                <Text
                    style={{
                        color: 'rgba(229,69,59,1)',
                        fontSize: hp('2.5%'),
                        fontWeight: '500'
                    }}
                >
                    {callTime}
                </Text>
                <Text
                    style={{ color: 'rgba(229,69,59,1)', fontSize: hp('1.5%') }}
                >
                    Call Ended
                </Text>
            </View>
        );
    };

    render() {
        return (
            <View style={Styles.container}>
                <View style={Styles.topBar}>
                    <TouchableOpacity
                        style={{
                            height: 30,
                            width: 30,
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginLeft: 10
                        }}
                        onPress={() => Actions.pop()}
                    >
                        <Image
                            style={Styles.imageBack}
                            source={require('../../images/contact/header-back-arrow.png')}
                            resizeMode="center"
                        />
                    </TouchableOpacity>
                </View>
                <View style={Styles.callDetails}>
                    {this.renderAvatar()}
                    {this.renderCallerDet()}
                    {this.renderCallSummary()}
                </View>
                <View style={Styles.createContact} />
            </View>
        );
    }
}