import React from 'react';
import { View, ScrollView, Text, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-navigation';
import { Actions } from 'react-native-router-flux';
import { HeaderBack } from '../Header';
import styles from './styles';
import I18n from '../../config/i18n/i18n';

import images from '../../images';

class ChannelsFilter extends React.Component {
    static navigationOptions({ navigation, screenProps }) {
        const { state } = navigation;
        return {
            headerTitle: 'Filters',
            headerLeft: (
                <HeaderBack
                    onPress={
                        state.params.onBack
                            ? () => {
                                Actions.pop();
                                state.params.onBack();
                            }
                            : Actions.pop
                    }
                    refresh={true}
                />
            )
        };
    }
    constructor(props) {
        super(props);
        this.state = {
            filter: [],
            filterList: [
                { checked: false, title: 'Created By me', value: 'created' },
                { checked: false, title: 'Subscribed', value: 'subscribed' },
                {
                    checked: false,
                    title: 'Unsubscribed',
                    value: 'unscubscribed'
                },

                {
                    checked: false,
                    title: 'Team',
                    value: 'team'
                },
                {
                    checked: false,
                    title: 'Platform',
                    value: 'platform'
                },
                {
                    checked: false,
                    title: 'Public',
                    value: 'public'
                },
                {
                    checked: false,
                    title: 'Private',
                    value: 'private'
                }
            ],
            checked: false
        };
    }

    applyFilters() {
        console.log('apply filters');
    }
    clearFilters() {
        console.log('clear filters');
    }

    unSelectFilter(index) {
        let array = [...this.state.filterList];
        let filterArray = [...this.state.filter];
        array[index].checked = false;

        var i = filterArray.indexOf(index);
        if (i > -1) {
            array.splice(i, 1);
        }

        this.setState({ filterList: [...array], filter: [...filterArray] });
    }

    selectFilter(index) {
        let array = [...this.state.filterList];
        let filterArray = [...this.state.filter];
        array[index].checked = true;

        filterArray[index] = this.state.filterList[index];
        this.setState(
            { filterList: [...array], filter: [...filterArray] },
            () => {
                console.log(this.state.filter);
            }
        );
    }

    render() {
        return (
            <SafeAreaView style={{ flex: 1 }}>
                <ScrollView style={styles.filterScrollView}>
                    <View style={styles.filterMaincontainer}>
                        <View style={styles.filterChipContainer}>
                            {this.state.filter.map((elem, i) => {
                                return <Text>{elem.title}</Text>;
                            })}
                        </View>
                    </View>
                    <View style={styles.filterCheckBoxContainer}>
                        <Text style={styles.filterbyHeader}>Filter by</Text>

                        <View style={{ paddingHorizontal: 10 }}>
                            {this.state.filterList.map((elem, index) => {
                                if (elem.checked) {
                                    return (
                                        <TouchableOpacity
                                            key={index}
                                            onPress={() =>
                                                this.unSelectFilter(index)
                                            }
                                            style={{
                                                flexDirection: 'row',
                                                marginVertical: 10
                                            }}
                                        >
                                            <Image
                                                source={
                                                    images.checkmark_selected
                                                }
                                                style={{ marginRight: 10 }}
                                            />
                                            <Text style={styles.filterListText}>
                                                {elem.title}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                } else {
                                    return (
                                        <TouchableOpacity
                                            key={index}
                                            onPress={() =>
                                                this.selectFilter(index)
                                            }
                                            style={{
                                                flexDirection: 'row',
                                                marginVertical: 10
                                            }}
                                        >
                                            <Image
                                                source={images.checkmark_normal}
                                                style={{ marginRight: 10 }}
                                            />
                                            <Text style={styles.filterListText}>
                                                {elem.title}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                }
                            })}
                        </View>
                    </View>
                    <View style={styles.filterButtonContainer}>
                        <TouchableOpacity
                            style={styles.buttonContainer}
                            onPress={this.applyFilters.bind(this)}
                        >
                            <Text style={styles.buttonText}>Apply filters</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.clearFilterConatiner}
                            onPress={this.clearFilters.bind(this)}
                        >
                            <Text style={styles.clearButtonText}>
                                Clear filters and show all
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </SafeAreaView>
        );
    }
}

export default ChannelsFilter;
