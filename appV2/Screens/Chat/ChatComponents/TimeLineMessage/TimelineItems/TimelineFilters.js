import React, { useState } from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import GlobalColors from '../../../../../config/styles';
import styles from '../styles';
import withPreventDoubleClick from '../../../../../widgets/WithPreventDoubleClick';
import LinearGradient from 'react-native-linear-gradient';
import { Card } from '@rneui/themed';
const PreventDoubleClick = withPreventDoubleClick(TouchableOpacity);

const headerItem = (i, onPress, selectedItems) => {
    const selected = selectedItems.includes(i);
    return (
        <TouchableOpacity
            style={selected ? styles.filterItemSelected : styles.filterItem}
            onPress={() => onPress(i, !selected)}
        >
            <Text
                style={
                    selected
                        ? styles.filterItemTextSelected
                        : styles.filterItemText
                }
            >
                {i}
            </Text>
        </TouchableOpacity>
    );
};

export default TimelineFilters = ({ items, selectedItems, onPress }) => {
    const [showAllFilters, setShowAllFilters] = useState(false);
    const itemList = selectedItems.concat(
        items.filter((i) => !selectedItems.includes(i))
    );
    const views = Array.from(itemList).map((i) =>
        headerItem(i, onPress, selectedItems)
    );

    const toggleFilter = () => {
        debounce(setShowAllFilters(!showAllFilters), 500);
    };

    return (
        <View>
            <View
                style={[
                    styles.filterContainer,
                    !showAllFilters && {
                        height: 58,
                        overflow: 'hidden'
                    }
                ]}
            >
                {views}
            </View>

            {!showAllFilters && (
                <View
                    style={{
                        alignSelf: 'flex-end',
                        height: 58,
                        alignContent: 'center',
                        alignItems: 'flex-end',
                        position: 'absolute',
                        flexDirection: 'row',
                        paddingLeft: 8
                    }}
                >
                    <LinearGradient
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        colors={[
                            GlobalColors.timelineMessageBackground + '00', //ading 00 as alpha value
                            GlobalColors.timelineMessageBackground
                        ]}
                        style={{
                            width: 60,
                            height: '100%'
                        }}
                    />
                    <PreventDoubleClick
                        onPress={toggleFilter}
                        style={{
                            alignSelf: 'center',
                            height: '100%',
                            justifyContent: 'center',
                            backgroundColor:
                                GlobalColors.timelineMessageBackground
                        }}
                    >
                        <Text
                            style={{
                                color: GlobalColors.primaryButtonColor,
                                fontSize: 14,
                                paddingRight: 8
                            }}
                        >
                            {'Show more'}
                        </Text>
                    </PreventDoubleClick>
                </View>
            )}
            {showAllFilters && (
                <PreventDoubleClick
                    onPress={toggleFilter}
                    style={{
                        alignSelf: 'flex-end',
                        height: 38,
                        justifyContent: 'center'
                    }}
                >
                    <Text
                        style={{
                            color: GlobalColors.primaryButtonColor,
                            fontSize: 14,
                            paddingRight: 8
                        }}
                    >
                        {'Show less'}
                    </Text>
                </PreventDoubleClick>
            )}
        </View>
    );
};
