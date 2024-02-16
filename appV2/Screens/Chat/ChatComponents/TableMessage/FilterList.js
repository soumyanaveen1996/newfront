import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { Button } from 'react-native-paper';

import { ScrollView } from 'react-native-gesture-handler';
import styles from './styles';
import GlobalColors from '../../../../config/styles';
import BottomSheet from '../Widgets/BottomSheet';

export default FilterList = (props) => {
    const {
        showAvailableFilterList = false,
        selectedFilterName,
        selectedFilterItem,
        options,
        hideFliterListBottomSheet,
        onCreateFilterClick,
        applySelectedFilter,
        onEditPress,
        disableEdit,
        onFilterClick
    } = props;
    if (!showAvailableFilterList) return null;
    return (
        <BottomSheet
            visible={showAvailableFilterList}
            transparent
            onPressOutside={hideFliterListBottomSheet}
            onDismiss={hideFliterListBottomSheet}
        >
            <View style={{ flexGrow: 1 }}>
                <View style={styles.filterModalHeader}>
                    <Text style={styles.filterModalTitle}>Filter</Text>
                    <Button
                        mode="text"
                        onPress={onCreateFilterClick}
                        icon="plus"
                        color={GlobalColors.primaryButtonColor}
                    >
                        <Text style={styles.filterModalCreateButtonText}>
                            Create new filter
                        </Text>
                    </Button>
                </View>
                <Text style={styles.savedfiltersLable}>SAVED FILTERS</Text>
                <ScrollView style={{ height: '60%' }}>
                    {options?.availableFilters?.map((item) => {
                        if (typeof item.name === 'object') {
                            return null;
                        }
                        return (
                            <TouchableOpacity
                                style={{
                                    backgroundColor:
                                        selectedFilterName === item.name
                                            ? GlobalColors.secondaryBackground
                                            : GlobalColors.white
                                }}
                                onPress={() => {
                                    //TODO
                                    onFilterClick(item);
                                }}
                            >
                                <>
                                    <Text style={styles.filterModalItem}>
                                        {item.name}
                                    </Text>
                                    <View style={styles.filterModalDivider} />
                                </>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
                <View style={styles.bottomButtons}>
                    <Button
                        disabled={!selectedFilterName}
                        style={styles.button}
                        color={GlobalColors.white}
                        onPress={applySelectedFilter}
                        icon="check"
                    >
                        Apply
                    </Button>
                    <Button
                        disabled={disableEdit}
                        style={[
                            styles.button,
                            {
                                backgroundColor:
                                    GlobalColors.secondaryBackground
                            }
                        ]}
                        color={GlobalColors.primaryButtonColor}
                        onPress={() => {
                            onEditPress(selectedFilterName);
                        }}
                        icon="pencil-outline"
                    >
                        Edit
                    </Button>
                </View>
            </View>
        </BottomSheet>
    );
};
