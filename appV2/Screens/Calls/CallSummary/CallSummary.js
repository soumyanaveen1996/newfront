import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Actions } from 'react-native-router-flux';
import _ from 'lodash';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp
} from 'react-native-responsive-screen';
import moment from 'moment';
import Styles from './styles';
import { Icons } from '../../../config/icons';
import { ProfileImage } from '../../../widgets';
import images from '../../../images';
import NavigationAction from '../../../navigation/NavigationAction';
import AppFonts from '../../../config/fontConfig';

export default class CallSummary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {}

    renderAvatar = () => {
        if (this.props.route.params.contact) {
            return (
                <ProfileImage
                    uuid={this.props.route.params.contact.id}
                    placeholder={images.green_goblin}
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
                source={images.green_goblin}
            />
        );
    };

    renderCallerDet = () => {
        if (this.props.route.params.contact) {
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
                        {this.props.route.params.contact.name || 'Unknown'}
                    </Text>
                    <Text
                        style={{
                            fontSize: hp('2%'),
                            color: 'rgba(102,102,102,1)'
                        }}
                    >
                        {this.props.route.params.dialledNumber}
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
                    {this.props.route.params.dialledNumber}
                </Text>
            </View>
        );
    };

    renderCallSummary = () => {
        const seconds = parseInt(this.props.route.params.time, 10);
        const callTime = moment
            .utc(moment.duration(seconds, 'seconds').as('milliseconds'))
            .format('HH:mm:ss');
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
                        fontWeight: AppFonts.NORMAL
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
                <View style={Styles.topBar}></View>
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
