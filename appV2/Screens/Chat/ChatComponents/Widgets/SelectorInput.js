import { StyleSheet, Button } from 'react-native';
import React from 'react';
import { CheckBox } from '@rneui/themed';
import GlobalColors from '../../../../config/styles';
import NavigationAction from '../../../../navigation/NavigationAction';
import AppFonts from '../../../../config/fontConfig';

export default SelectorInput = (props) => {
    const { fieldData, handleChange, multiSelect = false, lable } = props;

    onMultselectConfirm = (itemlist) => {
        handleChange(itemlist, fieldData.id);
    };

    if (multiSelect) {
        return (
            <Button
                onPress={() => {
                    NavigationAction.push(
                        NavigationAction.SCREENS.searchAndSelect,
                        {
                            list: fieldData?.options,
                            title: fieldData?.title,
                            onConfirm: onMultselectConfirm
                        }
                    );
                }}
                title="GOGOGO"
            />
        );
    }
    const avaiableOptions = fieldData?.options?.map((option, index) => (
        <CheckBox
            key={option}
            title={option}
            onPress={() => {
                handleChange?.(option, fieldData.id);
            }}
            checked={fieldData?.value === option}
            textStyle={styles.optionText}
            containerStyle={styles.checkbox}
            wrapperStyle={{ margin: 0, paadding: 0 }}
            size={20}
            iconType="ionicon"
            checkedIcon="ios-radio-button-on"
            uncheckedIcon="ios-radio-button-off"
            checkedColor={GlobalColors.primaryButtonColor}
            uncheckedColor={GlobalColors.grey}
            activeOpacity={1}
        />
    ));
    return avaiableOptions;
};

const styles = StyleSheet.create({
    checkbox: {
        marginBottom: 8,
        marginLeft: 0,
        marginRight: 0,
        borderWidth: 0,
        borderRadius: 6
    },
    optionText: {
        color: GlobalColors.formText,
        fontSize: 14,
        fontWeight: AppFonts.NORMAL
    }
});
