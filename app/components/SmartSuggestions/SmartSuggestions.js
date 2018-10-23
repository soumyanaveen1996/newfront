import React from 'react';
import { FlatList, Text, View } from 'react-native';
import Suggestion from './Suggestion';
import styles from './styles';

export default class SmartSuggestions extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            suggestions: [] //array
        };
        this.update();
    }

    smartSuggestion = ({ item }) => (
        <Suggestion
            reply={item.title}
            onReplySelected={this.props.onReplySelected}
        />
    );

    update = suggestions => {
        this.setState({
            suggestions: suggestions
        });
    };

    render() {
        return (
            <View>
                <FlatList
                    data={this.state.suggestions}
                    renderItem={this.smartSuggestion.bind(this)}
                    horizontal={true}
                    style={styles.smartSuggestions}
                    extraData={this.state}
                />
            </View>
        );
    }
}
