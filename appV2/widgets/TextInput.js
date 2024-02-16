import React from 'react';
import { useState } from 'react';
import { TextInput as Input, StyleSheet } from 'react-native';
import GlobalColors from '../config/styles';

export const TextInput = (props) => {
    const [isFocused, setIsFocused] = useState(false);
    return (
        <Input
            {...props}
            selectionColor={GlobalColors.cursorColor}
            style={[
                props.multiline ? style.multiLinetext : style.text,
                props.style,
                isFocused && {
                    borderWidth: 1,
                    borderColor: GlobalColors.primaryButtonColor
                },
                props.editable === false && {
                    backgroundColor:
                        GlobalColors.formItemBackgroundColorDisabled
                }
            ]}
            onBlur={() => {
                setIsFocused(false);
                props.onBlur?.();
            }}
            onFocus={() => setIsFocused(true)}
        />
    );
};

const style = StyleSheet.create({
    text: {
        height: 45,
        paddingHorizontal: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: GlobalColors.formItemBackgroundColor,
        borderRadius: 6,
        fontSize: 18,
        color: GlobalColors.formText
    },
    multiLinetext: {
        paddingHorizontal: 12,
        paddingBottom: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: GlobalColors.formItemBackgroundColor,
        borderRadius: 6,
        fontSize: 18,
        color: GlobalColors.formText
    }
});
