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
        <Suggestion
            reply={item}
            onReplySelected={this.onReplySelected.bind(this)}
        />
    );

    onReplySelected(messageStr) {
        this.props.onReplySelected(messageStr);
        this.update([]);
    }

    update = suggestions => {
        if (Platform.OS === 'ios') {
            LayoutAnimation.configureNext(
                LayoutAnimation.Presets.easeInEaseOut
            );
        }
        this.setState(
            {
                suggestions: suggestions
            },
            () => {
                this.flatListRef.scrollToOffset({ animated: true, offset: 0 });
            }
        );
    };

    render() {
        return (
            <View>
                <FlatList
                    ref={flatListRef => {
                        this.flatListRef = flatListRef;
                    }}
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
