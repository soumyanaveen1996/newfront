import React from 'react';
import {
    FlatList,
    Text,
    View,
    LayoutAnimation,
    UIManager,
    Platform
} from 'react-native';
import Suggestion from './Suggestion';
import styles from './styles';

export default class SmartSuggestions extends React.Component {
    constructor(props) {
        super(props);
        UIManager.setLayoutAnimationEnabledExperimental &&
            UIManager.setLayoutAnimationEnabledExperimental(true);
        this.state = {
            suggestions: [] //array
        };
    }

    smartSuggestion = ({ item }) => (
        <Suggestion reply={item} onReplySelected={this.onReplySelected} />
    );

    onReplySelected = (messageStr) => {
        this.props.onReplySelected(messageStr);
        this.update([]);
    };

    update = (suggestions) => {
        return new Promise((resolve, reject) => {
            if (Platform.OS === 'ios') {
                LayoutAnimation.configureNext(
                    LayoutAnimation.Presets.easeInEaseOut
                );
            }
            this.setState({ suggestions: [] }, () => {
                this.setState({ suggestions: suggestions }, () => {
                    if (this.flatListRef && suggestions.length > 0) {
                        this.flatListRef.scrollToOffset({
                            animated: true,
                            offset: 0
                        });
                    }
                    resolve();
                });
            });
        });
    };

    render() {
        return (
            <View
                style={{
                    overflow: 'visible',
                    marginLeft: 20
                }}
            >
                <FlatList
                    keyExtractor={(item, index) => index.toString()}
                    ref={(ref) => {
                        this.flatListRef = ref;
                    }}
                    keyboardShouldPersistTaps="always"
                    data={this.state.suggestions}
                    renderItem={this.smartSuggestion.bind(this)}
                    horizontal={true}
                    style={
                        Platform.OS === 'ios'
                            ? styles.smartSuggestionsIOS
                            : styles.smartSuggestionsAndroid
                    }
                    extraData={this.props}
                    showsHorizontalScrollIndicator={false}
                    decelerationRate="fast"
                />
            </View>
        );
    }
}
