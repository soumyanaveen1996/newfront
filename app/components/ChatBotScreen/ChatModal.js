import React from 'react';
import Modal from 'react-native-modal';

export default class ChatModal extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return <Modal {...this.props}>{this.props.content}</Modal>;
    }
}
