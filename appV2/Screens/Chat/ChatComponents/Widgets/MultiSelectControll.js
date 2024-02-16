import {
    StyleSheet,
    View,
    TouchableOpacity,
    Text,
    ScrollView
} from 'react-native';
import React from 'react';
import { Button } from 'react-native-paper';
import GlobalColors from '../../../../config/styles';
import Icons from '../../../../config/icons';
import NavigationAction from '../../../../navigation/NavigationAction';
import AppFonts from '../../../../config/fontConfig';

export default LookUpControll = (props) => {
    const {
        fieldData,
        handleChange,
        fieldKey,
        titleStyle = null,
        hideSelectionList = false,
        title,
        selectedItems,
        disabled = false
    } = props;

    const removeItem = (item) => {
        const resultList = selectedItems.filter((e) => e !== item);
        handleChange(resultList, fieldData.id);
    };

    const renderSelectedList = () => {
        if (selectedItems?.length > 0 && !hideSelectionList) {
            return (
                <ScrollView style={{ maxHeight: 240 }}>
                    {selectedItems.map((item) => (
                        <View
                            style={{
                                backgroundColor: GlobalColors.chatBackground,
                                marginVertical: 4,
                                borderRadius: 4,
                                alignItems: 'center',
                                padding: 3,
                                paddingLeft: 10,
                                flexDirection: 'row',
                                justifyContent: 'space-between'
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: 12,
                                    flex: 1,
                                    color: GlobalColors.formText
                                }}
                            >
                                {item}
                            </Text>

                            <Button
                                onPress={() => {
                                    removeItem(item);
                                }}
                                contentStyle={{
                                    padding: 0,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    height: 24,
                                    width: 24,
                                    alignSelf: 'flex-end'
                                }}
                                mode="text"
                                icon="close"
                                color={GlobalColors.actionButtons}
                            />
                        </View>
                    ))}
                </ScrollView>
            );
        }
        if (fieldData.value?.length > 0 && !hideSelectionList) {
            return (
                <ScrollView style={{ maxHeight: 240 }}>
                    {fieldData.value.map((item) => (
                        <View
                            style={{
                                backgroundColor: GlobalColors.chatBackground,
                                marginVertical: 4,
                                borderRadius: 2,
                                borderWidth: 1,
                                alignItems: 'center',
                                padding: 3,
                                flexDirection: 'row',
                                justifyContent: 'space-between'
                            }}
                        >
                            <Text style={{ fontSize: 12, flex: 1 }}>
                                {item}
                            </Text>

                            <Button
                                onPress={() => {
                                    removeItem(item);
                                }}
                                contentStyle={{
                                    padding: 0,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    height: 24,
                                    width: 24,
                                    alignSelf: 'flex-end'
                                }}
                                mode="text"
                                icon="close"
                                color={GlobalColors.actionButtons}
                            />
                        </View>
                    ))}
                </ScrollView>
            );
        }
    };

    return (
        <View>
            <TouchableOpacity
                disabled={disabled}
                style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}
                onPress={() => {
                    NavigationAction.push(
                        NavigationAction.SCREENS.searchAndSelect,
                        {
                            list: fieldData?.options,
                            title: fieldData?.title,
                            selectedItems: selectedItems || fieldData.value,
                            id: fieldKey || fieldData.id,
                            fieldType: fieldData.type,
                            onConfirm: handleChange
                        }
                    );
                }}
            >
                <Text style={titleStyle || styles.fieldLabel}>
                    {title || fieldData?.title}
                </Text>
                {Icons.keyboardArrowRight({
                    color: GlobalColors.secondaryButtonColor
                })}
            </TouchableOpacity>
            {renderSelectedList()}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        alignContent: 'flex-start',
        paddingTop: 8,
        borderRadius: 6
    },

    fieldLabel: {
        fontSize: 18,
        marginBottom: 4,
        fontWeight: AppFonts.BOLD,
        color: GlobalColors.textBlack
    }
});
