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
import { timeout } from 'rxjs/operator/timeout';

export default class SmartSuggestions extends React.Component {
    constructor(props) {
        super(props);
        // UIManager.setLayoutAnimationEnabledExperimental &&
        // UIManager.setLayoutAnimationEnabledExperimental(true);
        this.state = {
            suggestions: [] //array
        };
    }

    componentDidMount() {}

    componentDidUpdate(prevProps, prevState) {
        // if (prevState.suggestions !== this.state.suggestions) {
        //     console.log('>>>>>>>scroll')
        //     this.flatListRef.scrollToOffset({ animated: true, offset: 10 });
        // }
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
        return new Promise((resolve, reject) => {
            LayoutAnimation.configureNext(
                LayoutAnimation.Presets.easeInEaseOut
            );
            this.setState({ suggestions: [] }, () => {
                setTimeout(() => {
                    this.setState({ suggestions: suggestions }, () => {
                        setTimeout(() => {
                            if (this.flatListRef && suggestions.length > 0) {
                                this.flatListRef.scrollToIndex({
                                    animated: true,
                                    index: 0
                                });
                            }
                        }, 1000);
                        resolve();
                    });
                }, 1000);
            });
        });
    };

    render() {
        return (
            <View style={{ overflow: 'visible' }}>
                <FlatList
                    ref={ref => {
                        this.flatListRef = ref;
                    }}
                    keyboardShouldPersistTaps="always"
                    data={this.state.suggestions}
                    renderItem={this.smartSuggestion.bind(this)}
                    horizontal={true}
                    style={styles.smartSuggestions}
                    extraData={this.props}
                    showsHorizontalScrollIndicator={false}
                    decelerationRate="fast"
                />
            </View>
        );
    }
}
