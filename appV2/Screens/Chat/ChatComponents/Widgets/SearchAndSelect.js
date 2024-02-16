import {
    View,
    TouchableOpacity,
    Text,
    SafeAreaView,
    FlatList,
    StyleSheet
} from 'react-native';
import React from 'react';
import { Icon } from '@rneui/themed';
import { Searchbar } from 'react-native-paper';
import GlobalColors from '../../../../config/styles';
import { HeaderBack, HeaderTitle } from '../../../../widgets/Header';
import { fieldType } from '../Form2Message/config';
import NavigationAction from '../../../../navigation/NavigationAction';
import SearchBar from '../../../../widgets/SearchBar';

export default class SearchAndSelect extends React.Component {
    constructor(props) {
        props.navigation.setOptions({
            headerTitle: props.route.params.title || 'Select'
        });
        super(props);
        this.itemList = [];
        const selectedItemList = props.route.params.selectedItems || [];
        try {
            if (
                props.route.params.fieldType ===
                    fieldType.object_multiselection ||
                props.route.params.fieldType === fieldType.object_lookup
            ) {
                this.itemList = props.route.params.list?.map((item) => ({
                    title: item.displayField,
                    value: item.value,
                    originalItem: item,
                    isSelected: selectedItemList.includes(item.value)
                }));
            } else {
                this.itemList = props.route.params.list?.map((item) => {
                    if (item != null) {
                        if (item instanceof Object) {
                            return {
                                title: item.text ? item.text : item.info,
                                value: item.text ? item.text : item.info,
                                description: item.text ? item.info : undefined,
                                originalItem: item,
                                isSelected: selectedItemList.includes(item)
                            };
                        }
                        return {
                            title: item,
                            value: item,
                            description: item.info,
                            originalItem: item,
                            isSelected: selectedItemList.includes(item)
                        };
                    } else
                        return {
                            title: '-',
                            value: null,
                            description: '',
                            originalItem: item,
                            isSelected: false
                        };
                });
            }
        } catch (err) {}

        if (
            this.props.route.params.singleSelect ||
            props.route.params.fieldType === fieldType.lookup
        )
            this.singleSelect = true;
        else this.singleSelect = false;
        let selectedItem = null;
        if (this.singleSelect) {
            selectedItem = this.itemList.find((i) => i.isSelected);
        }
        this.state = {
            singleSelectItem: selectedItem,
            slectedItem: null // This is mainy to force renrender. this is satate value is not used anywher to display
        };
    }

    componentWillUnmount() {
        this.finalizeSelection();
    }

    finalizeSelection = () => {
        if (this.singleSelect) {
            this.props.route.params.onConfirm?.(
                this.state.singleSelectItem?.value,
                this.props.route.params.id,
                this.state.singleSelectItem?.originalItem,
                this.props.route.params.itemKey
            );
            return;
        }
        const selectedList = [];
        this.itemList?.forEach((item) => {
            if (item.isSelected) {
                selectedList.push(item.value);
            }
        });
        this.props.route.params.onConfirm?.(
            selectedList,
            this.props.route.params.id,
            null,
            this.props.route.params.itemKey
        );
    };

    isItemSelected = (item) => {
        if (this.singleSelect) {
            return this.state.singleSelectItem?.value === item.value;
        } else return item.isSelected;
    };

    renderItem = ({ item }) => {
        const { singleSelectItem } = this.state;
        if (item.hidden) return null;
        const isItemSelectd = this.isItemSelected(item);
        return (
            <TouchableOpacity
                disabled={this.props.route.params.readOnly}
                style={[
                    styles.itemContainer,
                    {
                        backgroundColor: isItemSelectd
                            ? GlobalColors.chatBackground
                            : GlobalColors.appBackground
                    }
                ]}
                onPress={() => {
                    if (this.singleSelect) {
                        if (singleSelectItem?.title === item.title) {
                            this.setState(
                                {
                                    slectedItem: `true`,
                                    singleSelectItem: null
                                },
                                () => {
                                    NavigationAction.pop();
                                }
                            );
                        } else {
                            this.setState(
                                {
                                    slectedItem: `${item.title}true`,
                                    singleSelectItem: item
                                },
                                () => {
                                    NavigationAction.pop();
                                }
                            );
                        }
                    } else {
                        item.isSelected = !isItemSelectd;
                        this.setState({
                            slectedItem: item.title + item.isSelected
                        });
                    }
                }}
            >
                <View style={styles.itemContainer2}>
                    <View>
                        <Text style={styles.itemName}>{item?.title}</Text>
                        {item?.description?.length > 0 && (
                            <Text style={styles.itemDescription}>
                                {item.description}
                            </Text>
                        )}
                    </View>

                    {isItemSelectd && (
                        <Icon
                            style={{}}
                            size={20}
                            color={GlobalColors.primaryButtonColor}
                            name="check"
                        />
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    renderOnSearchTextChange = (text) => {
        this.itemList.forEach((e) => {
            if (
                e.title?.toLowerCase()?.includes(text?.toLowerCase()) ||
                text === ''
            ) {
                e.hidden = false;
            } else {
                e.hidden = true;
            }
        });
        this.setState({ searchQuery: text, slectedItem: '' });
    };

    render() {
        return (
            <SafeAreaView
                style={{ flex: 1, backgroundColor: GlobalColors.appBackground }}
            >
                <View style={styles.searchBarContainer}>
                    {/* <Searchbar
                        style={{ borderRadius: 10, margin: 12 }}
                        placeholder="Search"
                        clearIcon="close"
                        onChangeText={this.renderOnSearchTextChange}
                        value={this.state.searchQuery}
                        inputStyle={{ fontSize: 14, color: '#2a2d3c' }}
                    /> */}
                    <SearchBar
                        placeholder="Search"
                        onChangeText={this.renderOnSearchTextChange}
                        value={this.state.searchQuery}
                    />
                </View>

                <FlatList
                    style={{ backgroundColor: GlobalColors.appBackground }}
                    data={this.itemList}
                    extraData={this.state}
                    renderItem={this.renderItem}
                    keyExtractor={(item, index) => index + item.title}
                />
            </SafeAreaView>
        );
    }
}

const styles = StyleSheet.create({
    itemName: {
        fontSize: 16,
        color: GlobalColors.formText
    },
    itemDescription: {
        fontSize: 14,
        opacity: 0.5,
        marginTop: 4,
        color: GlobalColors.formText
    },
    itemContainer2: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    itemContainer: {
        flex: 1,
        paddingVertical: 14,
        paddingHorizontal: 34
    },
    searchBarContainer: {
        borderRadius: 10,
        margin: 12
    }
});
