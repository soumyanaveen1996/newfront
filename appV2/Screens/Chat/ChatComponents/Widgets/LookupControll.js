import {
    StyleSheet,
    View,
    ActivityIndicator,
    Keyboard,
    TextInput
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { Icon } from '@rneui/themed';
import GlobalColors from '../../../../config/styles';
import NavigationAction from '../../../../navigation/NavigationAction';
import withPreventDoubleClick from '../../../../widgets/WithPreventDoubleClick';
import AlertDialog from '../../../../lib/utils/AlertDialog';
import AppFonts from '../../../../config/fontConfig';
const PreventDoubleClick = withPreventDoubleClick(Icon);
export default LookUpControll = (props) => {
    const [searchText, setSearchText] = useState(null);
    const [searching, setSearching] = useState(false);
    useEffect(() => {
        setSearchText(props.value);
    }, [props.value]);

    const {
        fieldData,
        handleChange,
        getDataForLookup,
        value,
        accentColor,
        minCharacterReq = false,
        validationMsg = false
    } = props;

    const showPopUp = (msg) => {
        AlertDialog.show(undefined, `${msg}`, [{ text: 'OK' }]);
    };

    const onSearchPress = (text) => {
        if (minCharacterReq) {
            if (text && text.length < minCharacterReq) {
                showPopUp(`${validationMsg}`);
                return;
            }
        }
        Keyboard.dismiss();
        setSearching(true);
        getDataForLookup(
            fieldData.id,
            fieldData.value,
            text,
            (newFieldData) => {
                setSearching(false);
                NavigationAction.pushNew(
                    NavigationAction.SCREENS.searchAndSelectForLookup,
                    {
                        list: newFieldData,
                        singleSelect: true,
                        title: fieldData?.title,
                        selectedItems: fieldData.value,
                        fieldType: fieldData.type,
                        id: fieldData.id,
                        onConfirm: handleChange
                    }
                );
            }
        );
    };

    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor: fieldData.readOnly
                        ? GlobalColors.formTextDisabledBG
                        : GlobalColors.formItemBackgroundColor
                },
                accentColor && { borderColor: accentColor }
            ]}
        >
            <TextInput
                returnKeyType="search"
                placeholder={props.lable || 'Search'}
                disabled={fieldData.readOnly || value}
                editable={!(fieldData.readOnly || value)}
                placeholderTextColor={GlobalColors.formPlaceholderText}
                underlineColor="transperent"
                underlineColorAndroid="transparent"
                style={[styles.text]}
                onChangeText={(text) => setSearchText(text)}
                value={
                    searchText ||
                    (value && typeof value == 'object' ? value.text : value) // searchText remain in child where clear called so removed
                }
                onSubmitEditing={() => onSearchPress(searchText)}
                theme={{
                    colors: {
                        primary: GlobalColors.formText,
                        placeholder: GlobalColors.formText
                    },
                    roundness: 6
                }}
            />
            {searching ? (
                <ActivityIndicator style={{ marginRight: 6 }} />
            ) : (
                <PreventDoubleClick
                    containerStyle={styles.iconContainer}
                    disabledStyle={{
                        backgroundColor: GlobalColors.transparent
                    }}
                    size={20}
                    disabled={fieldData.readOnly}
                    color={GlobalColors.primaryButtonColor}
                    onPress={() => {
                        if (value) {
                            setSearchText('');
                            handleChange(undefined, fieldData.id);
                        } else {
                            onSearchPress(searchText);
                        }
                    }}
                    name={value ? 'close' : 'search'}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        // borderColor: GlobalColors.darkGray,
        borderRadius: 6,
        // borderWidth: 1,
        alignItems: 'center'
    },
    text: {
        height: 45,
        borderRadius: 5,
        fontSize: 18,
        flex: 1,
        color: GlobalColors.formText,
        paddingLeft: 12
    },
    iconContainer: { padding: 2, marginRight: 4 },
    fieldLabel: {
        fontSize: 18,
        marginBottom: 4,
        fontWeight: AppFonts.BOLD,
        color: GlobalColors.textBlack
    }
});
