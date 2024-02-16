import {
    View,
    TouchableOpacity,
    Text,
    StyleSheet,
    Platform
} from 'react-native';
import React from 'react';
import { Icon } from '@rneui/themed';
import GlobalColors from '../../../../config/styles';
import NavigationAction from '../../../../navigation/NavigationAction';

export default DropDown = (props) => {
    const {
        list,
        selectedValue,
        fieldData,
        onValueChange,
        itemKey,
        disabled,
        accentColor
    } = props;
    const onClick = () => {
        if (list)
            NavigationAction.push(NavigationAction.SCREENS.searchAndSelect, {
                list,
                title: fieldData?.title,
                selectedItems: selectedValue,
                id: fieldData.id,
                itemKey: itemKey,
                fieldType: fieldData.type,
                singleSelect: true,
                onConfirm: onValueChange
            });
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={[
                    styles.input,
                    accentColor && {
                        borderColor: accentColor,
                        backgroundColor: GlobalColors.white
                    }
                ]}
                onPress={onClick}
                disabled={disabled}
            >
                <Text
                    style={{
                        flex: 1,
                        color: GlobalColors.formText,
                        fontSize: 18
                    }}
                >
                    {selectedValue}
                </Text>
                <Icon
                    name="arrow-drop-down"
                    type="material"
                    color={GlobalColors.primaryButtonColor}
                />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: 6,
        color: GlobalColors.textDarkGrey,
        fontSize: 18,
        backgroundColor: GlobalColors.formItemBackgroundColor
    },

    input: {
        width: '100%',
        padding: 10,
        color: GlobalColors.formText,
        fontSize: 16,
        flexDirection: 'row',
        textAlign: 'center',
        justifyContent: 'center',
        borderRadius: 6
    },
    dateModalIOS: {
        alignSelf: 'flex-end'
    }
});
