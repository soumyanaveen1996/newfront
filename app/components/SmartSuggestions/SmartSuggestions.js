import React from 'react';
import { FlatList, Text, View, LayoutAnimation, UIManager } from 'react-native';
import Suggestion from './Suggestion';
import styles from './styles';

export default class SmartSuggestions extends React.Component {
    constructor(props) {
        super(props);
        // UIManager.setLayoutAnimationEnabledExperimental &&
        // UIManager.setLayoutAnimationEnabledExperimental(true);
        this.state = {
            suggestions: [] //array
        };
    }

    componentDidMount() {
        this.update([]);
    }

    smartSuggestion = ({ item }) => (
        <Suggestion reply={item} onReplySelected={this.props.onReplySelected} />
    );

    update = suggestions => {
        if (Platform.OS === 'ios') {
            LayoutAnimation.configureNext(
                LayoutAnimation.Presets.easeInEaseOut
            );
        }
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
                    showsHorizontalScrollIndicator={false}
                    ListFooterComponent={<View style={styles.emptyFooter} />}
                    decelerationRate="fast"
                />
            </View>
        );
    }
}
