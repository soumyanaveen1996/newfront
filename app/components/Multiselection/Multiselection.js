import React from 'react';
import {
    SafeAreaView,
    TouchableOpacity,
    Text,
    View,
    FlatList
} from 'react-native';
import styles from './styles';
import { CheckBox } from 'react-native-elements';
import { Actions } from 'react-native-router-flux';

export default class Multiselection extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            response: this.props.response
        };
        this.key = this.props.index;
    }

    renderListItem({ item, index }) {
        return (
            <CheckBox
                key={index}
                title={item}
                onIconPress={() => {
                    console.log(this.state.response);
                    let res = this.state.response;
                    res[index] = !res[index];
                    this.setState({ response: res });
                }}
                checked={this.state.response[index]}
            />
        );
    }

    render() {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.list}>
                    <FlatList
                        data={this.props.options}
                        extraData={this.state}
                        renderItem={this.renderListItem.bind(this)}
                    />
                </View>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => {
                        this.props.onDone(this.state.response, this.key);
                        Actions.pop();
                    }}
                >
                    <Text style={styles.buttonText}>Done</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }
}
