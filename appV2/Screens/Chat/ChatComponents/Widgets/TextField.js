import React from 'react';
import { StyleSheet } from 'react-native';
import { TextInput } from 'react-native-paper';

import GlobalColors from '../../../../config/styles';

export default TextField = (props) => {
    const {
        editable = true,
        onChangeText,
        maxLength,
        onSubmitEditing,
        label,
        onBlur,
        value
    } = props;
    return (
        <TextInput
            editable={editable}
            onChangeText={onChangeText}
            maxLength={maxLength}
            placeholderTextColor={GlobalColors.disabledGray}
            onSubmitEditing={onSubmitEditing}
            label={label}
            value={value}
            mode="outlined"
            outlineColor={'red'}
            style={{
                backgroundColor: GlobalColors.appBackground
            }}
            theme={{
                colors: {
                    primary: GlobalColors.primaryButtonColor,
                    underlineColor: 'transparent',
                    placeholder: '#9c9ea7'
                }
            }}
            onBlur={onBlur}
        />
    );
};

const styles = StyleSheet.create({
    textArea: {
        height: 120,
        borderRadius: 5,
        fontSize: 18
    },
    textField: {
        height: 48,
        borderRadius: 5,
        fontSize: 18
    }
});
