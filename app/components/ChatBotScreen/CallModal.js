import React from 'react';
import Modal from 'react-native-modalbox';
import { Platform } from 'react-native';
import chatStyles from './styles';
import { createIconSet } from 'react-native-vector-icons';

var glyphMap = {
    speaker: '\uE600',
    'mic-mute': '\uE601',
    keypad: '\uE602',
    'snd-mute': '\uE603',
    phone: '\uE604',
    hangup: '\uE605',
    'flip-camera': '\uE606'
};

if (Platform.OS == 'ios') {
    Icon = createIconSet(glyphMap, 'icomoon');
} else {
    Icon = createIconSet(glyphMap, 'Custom');
}

const callStates = {
    CALL_INITIATED: 'CALL_INITIATED',
    CALL_CONNECTED: 'CALL_CONNECTED',
    CALL_DISCONNECTED: 'CALL_DISCONNECTED'
};

export default class CallModal extends React.Component {
    constructor(props) {
        super(props);
    }

    componentWillMount() {
        this.setState({
            modalVisible: this.props.isVisible,
            state: callStates.CALL_INITIATED
        });
    }

    showCallModal = () => {
        this.setState({ modalVisible: true });
        this.refs.myModal.open();
    };

    render() {
        return (
            <Modal
                style={chatStyles.callModal}
                position="center"
                backdrop={true}
                onClosed={() => {}}
                isVisible={this.state.modalVisible}
            />
        );
    }
}
