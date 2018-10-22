import React from 'react';
import { Text, View } from 'react-native';
import { Button } from 'react-native-elements';
import styles, { FONT_COLOR, FONT_SIZE } from './styles';

export default class Suggestion extends React.Component {
    constructor(props) {
        super(props);
        this.reply = this.props.reply;
    }

    onReplySelected = () => {
        this.props.onReplySelected(this.reply);
    };

    render() {
        return (
            <Button
                title={this.reply}
                color={FONT_COLOR}
                fontSize={FONT_SIZE}
                buttonStyle={styles.suggestionButton}
                onPress={this.onReplySelected}
            />
        );
    }
}
