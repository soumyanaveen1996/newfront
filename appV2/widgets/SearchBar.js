import React from 'react';
import { Searchbar } from 'react-native-paper';
import GlobalColors from '../config/styles';

const SearchBar = ({
    onChangeText,
    value,
    placeholder,
    onSubmitEditing,
    clearButtonMode
}) => {
    return (
        <Searchbar
            style={{
                borderRadius: 6,
                overflow: 'hidden',
                borderWidth: 1,
                borderColor: GlobalColors.itemDevider,
                fontSize: 14,
                backgroundColor: GlobalColors.appBackground
            }}
            inputStyle={{
                fontSize: 14,
                color: GlobalColors.primaryTextColor
            }}
            iconColor={GlobalColors.descriptionText}
            placeholderTextColor={GlobalColors.formPlaceholderText}
            placeholder={placeholder}
            value={value}
            onSubmitEditing={onSubmitEditing}
            onChangeText={onChangeText}
            clearButtonMode={clearButtonMode}
            selectionColor={GlobalColors.cursorColor}
            // clearIcon="close"
        />
    );
};
export default SearchBar;
