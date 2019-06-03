import React from 'react';
import {
    Text,
    View,
    TouchableOpacity,
    TouchableWithoutFeedback
} from 'react-native';
import styles from './styles';

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
            <TouchableWithoutFeedback onPress={this.onReplySelected}>
                <View style={styles.suggestionButton}>
                    <Text style={styles.suggestionText}>{this.reply}</Text>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}
