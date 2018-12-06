import React from 'react';
import { View, ScrollView, Text, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-navigation';
import { Actions } from 'react-native-router-flux';
import { HeaderBack } from '../Header';
import styles from './styles';
import I18n from '../../config/i18n/i18n';
import ROUTER_SCENE_KEYS from '../../../app/routes/RouterSceneKeyConstants';
import {
    setChannelFilter,
    clearChannelFilter
} from '../../redux/actions/ChannelActions';
import { setCurrentScene } from '../../redux/actions/UserActions';
import { connect } from 'react-redux';
import { RNChipView } from 'react-native-chip-view';
import images from '../../images';

class ChannelsFilter extends React.Component {
    static navigationOptions({ navigation, screenProps }) {
        const { state } = navigation;

        return {
            headerTitle: state.params.title,
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

    componentDidMount() {
        const filterList = this.props.channel.filters;
        if (filterList && filterList.length > 0) {
            this.setState({ filterList: filterList });
        }
    }

    applyFilters() {
        this.props.setFilter(this.state.filterList);
        Actions.pop();
    }
    clearFilters() {
        this.setState({
            filterList: this.state.filterList.map(filter => ({
                ...filter,
                checked: false
            }))
        });
        this.props.clearFilter();
        Actions.pop();
    }

    toggleFilter(index) {
        let array = [...this.state.filterList];
        // let filterArray = [...this.state.filter]
        array[index].checked = !array[index].checked;

        // filterArray[index] = this.state.filterList[index]
        this.setState({
            filterList: array
        });
    }

    render() {
        console.log(this.state);
        return (
            <SafeAreaView style={{ flex: 1 }}>
                <ScrollView style={styles.filterScrollView}>
                    <View style={styles.filterChipContainer}>
                        {this.state.filterList.map(elem => {
                            return elem && elem.checked ? (
                                <View style={styles.filterSelected}>
                                    <RNChipView
                                        title={elem.title}
                                        titleStyle={styles.selectedFilterTitle}
                                        avatar={false}
                                        backgroundColor="#424B5A"
                                        borderRadius={6}
                                        height={20}
                                    />
                                </View>
                            ) : null;
                        })}
                    </View>
                    <View style={styles.filterCheckBoxContainer}>
                        <Text style={styles.filterbyHeader}>Filter by</Text>

                        <View style={{ paddingHorizontal: 10 }}>
                            {this.state.filterList.map((elem, index) => {
                                return (
                                    <TouchableOpacity
                                        key={index}
                                        onPress={() => this.toggleFilter(index)}
                                        style={{
                                            flexDirection: 'row',
                                            marginVertical: 10
                                        }}
                                    >
                                        <Image
                                            source={
                                                elem.checked
                                                    ? images.checkmark_selected
                                                    : images.checkmark_normal
                                            }
                                            style={{ marginRight: 10 }}
                                        />
                                        <Text style={styles.filterListText}>
                                            {elem.title}
                                        </Text>
                                    </TouchableOpacity>
                                );
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
const mapStateToProps = state => ({
    channel: state.channel,
    user: state.user
});

const mapDispatchToProps = dispatch => {
    return {
        setFilter: filter => dispatch(setChannelFilter(filter)),
        clearFilter: () => dispatch(clearChannelFilter()),
        setCurrentScene: scene => dispatch(setCurrentScene(scene))
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ChannelsFilter);

// export default ChannelsFilter
