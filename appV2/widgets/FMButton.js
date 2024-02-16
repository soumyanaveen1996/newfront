import React from 'react';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import GlobalColors from '../config/styles';
import AppFonts from '../config/fontConfig';

export const FMButton = (props) => {
    return (
        <TouchableOpacity
            {...props}
            style={[
                {
                    maxHeight: 38,
                    minHeight: 38,
                    flex: 1,
                    flexGrow: 1,
                    marginHorizontal: 8,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: props.disabled
                        ? props.colorDisabled
                        : props.color,
                    borderRadius: 20,
                    paddingHorizontal: 12
                },
                props.style && props.style
            ]}
        >
            <Text
                style={{
                    fontSize: 14,
                    letterSpacing: 0.51,
                    fontWeight: AppFonts.BOLD,
                    color: props.disabled
                        ? props.textColorDisabled
                        : props.textColor
                }}
            >
                {props.text}
            </Text>
        </TouchableOpacity>
    );
};
