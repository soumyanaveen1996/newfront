import React, { Component } from 'react';
import {
    View,
    Text,
    Image,
    BackHandler,
    Modal,
    TouchableOpacity,
    ActivityIndicator,
    AsyncStorage
} from 'react-native';
import styles from './styles';
import { Actions, ActionConst } from 'react-native-router-flux';
import I18n from '../../config/i18n/i18n';
import _ from 'lodash';
import { Auth } from '../../lib/capability';

import images from '../../images';

export default class TourScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            show: true,
            userName: 'UserName'
        };
    }

    async componentWillMount() {
        Auth.getUser()
            .then(user => {
                this.setState({ userName: user.info.userName });
            })
            .catch(err => {
                console.error('>>>>>>>>>>>>Error<<<<<<<<<< : ', err);
            });
    }
    render() {
        return (
            <Modal
                transparent={true}
                animationType={'none'}
                visible={this.state.show}
                onRequestClose={() => {
                    console.log('close modal');
                }}
            >
                <View style={styles.modalBackground}>
                    <View style={styles.activityIndicatorWrapper}>
                        <Text style={styles.welcomeHeader}>
                            Welcome {this.state.userName}!
                        </Text>
                    </View>
                </View>
            </Modal>
        );
    }
}
