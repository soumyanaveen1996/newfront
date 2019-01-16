import React from 'react';
import {
    FlatList,
    Text,
    View,
    TouchableOpacity,
    ScrollView
} from 'react-native';
import styles from './styles';
import _ from 'lodash';
import { Icons } from '../../config/icons';
import Modal from 'react-native-modal';

export default class ChatModal extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return <Modal {...this.props}>{this.props.content}</Modal>;
    }
}
