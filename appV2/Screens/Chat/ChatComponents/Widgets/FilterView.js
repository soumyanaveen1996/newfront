import { View, Text, StyleSheet, Platform } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Button } from 'react-native-paper';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Icon } from '@rneui/themed';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { TextInput } from '../../../../widgets/TextInput';
import { fieldType } from '../Form2Message/config';
import GlobalColors from '../../../../config/styles';
import DropDown from './DropDown';
import SelectorInput from './SelectorInput';
import LookupControll from './LookupControll';
import MultiSelectControll from './MultiSelectControll';
import AppFonts from '../../../../config/fontConfig';

export default FilterView = ({
    options,
    onFilterApply,
    onCancel,
    editMode,
    onFilterDelete,
    newFiltreredColumns,
    selectedFilterName,
    getDataForLookup
}) => {
    const [filterColumns, setFilterColumns] = useState([]);
    const [defaultFilterColumns, setDefaultFilterColumns] = useState([]);
    const [filterName, setFilterName] = useState('');
    const [hasValuesChanged, setValuesChanged] = useState(false);
    const [titleOnly, setTitleOnly] = useState(false);

    useEffect(() => {
        if (options) {
            let val;
            if (newFiltreredColumns) {
                val = newFiltreredColumns;
            } else val = options.filteredColumns;
            if (editMode) {
                setFilterColumns(JSON.parse(JSON.stringify(val)));
                setDefaultFilterColumns(JSON.parse(JSON.stringify(val)));
                setFilterName(selectedFilterName);
            } else {
                defaultVal = val.map((i) => {
                    newVal = { ...i, value: undefined };
                    return newVal;
                });
                console.log('~~~~ val ', defaultVal);
                setFilterColumns(JSON.parse(JSON.stringify(defaultVal)));
                setDefaultFilterColumns(JSON.parse(JSON.stringify(defaultVal)));
            }
        }
    }, []);

    const renderField = (fieldData) => {
        let fieldView = null;
        switch (fieldData.type) {
            case fieldType.textField:
            case fieldType.number:
            case fieldType.textArea:
                fieldView = (
                    <TextInput
                        {...fieldData}
                        onChangeText={(val) => {
                            handleChange(val, fieldData.id);
                        }}
                        style={[styles.textField]}
                    />
                );
                break;
            case fieldType.dropdown:
                fieldView = (
                    <DropDown
                        selectedValue={fieldData.value}
                        list={fieldData.options}
                        onValueChange={(val) => {
                            handleChange(val, fieldData.id);
                        }}
                        fieldData={fieldData}
                    />
                );
                break;
            case fieldType.radioButton: {
                fieldView = (
                    <SelectorInput
                        fieldData={fieldData}
                        multiSelect={false}
                        handleChange={handleChange}
                    />
                );
                break;
            }
            case fieldType.multiselection:
                return (
                    <View key={fieldData.id} style={[styles.fieldContainer]}>
                        <MultiSelectControll
                            fieldData={fieldData}
                            handleChange={handleChange}
                        />
                    </View>
                );
            case fieldType.lookup:
                fieldView = (
                    <LookupControll
                        getDataForLookup={getDataForLookup}
                        fieldData={fieldData}
                        value={fieldData.value}
                        handleChange={handleChange}
                    />
                );
                break;
            case fieldType.checkbox:
            case fieldType.buttonsField:
            case fieldType.switch:
            case fieldType.slider:
            case fieldType.date:
            case fieldType.time:
            case fieldType.dateTime:
            case fieldType.passwordField:
            case fieldType.imageField:
            case fieldType.fileField:
            case fieldType.voiceCallField:
            default:
                fieldView = null;
        }
        return (
            <View key={fieldData.id} style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>{fieldData.title}</Text>
                {fieldView}
            </View>
        );
    };

    const clearChnages = () => {
        const temp = JSON.parse(JSON.stringify(defaultFilterColumns));
        console.log('~~~ resetting filters ', temp);
        setFilterColumns(temp);
        setValuesChanged(false);
    };

    const onSaveAsNewClick = () => {
        setFilterName('');
        setTitleOnly(true);
    };

    const handleChange = (val, id) => {
        const tempFilterColumns = filterColumns?.map((el) => {
            if (el.id === id) {
                setValuesChanged(true);
                console.log(
                    '%c ~~~~~ updating value for ',
                    'color:"#6611BB',
                    val,
                    el.id
                );
                switch (el.type) {
                    case 'lookup':
                    case 'uploadFile':
                        el.value = val;
                        break;
                    case 'removeUploadFile':
                        delete el.value;
                        break;
                    default:
                        el.value = val;
                        break;
                }
            }
            return el;
        });
        setFilterColumns(JSON.parse(JSON.stringify(tempFilterColumns)));
    };

    const getTitle = () => {
        if (editMode) {
            if (titleOnly) {
                return 'Clone filter';
            }
            return 'Edit Filter';
        }
        return 'Create new filter';
    };

    return (
        <View style={styles.container}>
            <KeyboardAwareScrollView
                keyboardShouldPersistTaps="never"
                enableOnAndroid={false}
                enableResetScrollToCoords={false}
                style={styles.container}
            >
                <Text style={styles.createFilterTitle}>{getTitle()}</Text>
                <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>
                        Filter name <Text style={{ color: 'red' }}>*</Text>
                    </Text>
                    <TextInput
                        disabled={titleOnly ? false : editMode}
                        value={filterName}
                        style={styles.textField}
                        title="Filter name "
                        onChangeText={(val) => {
                            setFilterName(val);
                        }}
                    />
                </View>

                {!titleOnly && (
                    <Text style={styles.parametersText}>Parameters</Text>
                )}
                {!titleOnly && filterColumns.map((item) => renderField(item))}
                <View style={{ height: 24 }} />
                {hasValuesChanged && !titleOnly && (
                    <View style={styles.changeNotificationContainer}>
                        <Text
                            style={{
                                alignSelf: 'center',
                                marginBottom: 12,
                                color: '#645622',
                                fontSize: 14
                            }}
                        >
                            Some parameters have changed.
                        </Text>
                        <Button
                            uppercase={false}
                            style={{
                                backgroundColor: GlobalColors.white,
                                marginTop: 8
                            }}
                            mode="text"
                            icon="history"
                            color={GlobalColors.menuSubLable}
                            onPress={clearChnages}
                        >
                            Reset
                        </Button>
                        {editMode && (
                            <Button
                                uppercase={false}
                                style={{
                                    backgroundColor: GlobalColors.white,
                                    marginTop: 8
                                }}
                                mode="text"
                                icon="check"
                                labelStyle={{
                                    fontWeight: AppFonts.NORMAL,
                                    fontSize: 14
                                }}
                                color={GlobalColors.menuSubLable}
                                onPress={onSaveAsNewClick}
                            >
                                Save as new filter
                            </Button>
                        )}
                    </View>
                )}
                {!titleOnly && editMode && (
                    <TouchableOpacity
                        style={styles.deleteFilterButton}
                        onPress={() => {
                            onFilterDelete(selectedFilterName);
                        }}
                    >
                        <Icon
                            color={GlobalColors.formDelete}
                            name="delete"
                            size={20}
                        />
                        <Text style={styles.deleteText}>Delete Filter</Text>
                    </TouchableOpacity>
                )}
            </KeyboardAwareScrollView>
            <View style={styles.bottomButtons}>
                <Button
                    uppercase={false}
                    style={styles.buttonCancel}
                    mode="text"
                    color={GlobalColors.secondaryButtonColor}
                    onPress={onCancel}
                >
                    Cancel
                </Button>
                <Button
                    uppercase={false}
                    disabled={filterName?.length == 0}
                    style={
                        filterName?.length == 0
                            ? styles.buttonDisabled
                            : styles.button
                    }
                    mode="contained"
                    icon="check"
                    labelStyle={{
                        color:
                            filterName?.length == 0
                                ? GlobalColors.primaryButtonTextDisabled
                                : GlobalColors.primaryButtonText
                    }}
                    onPress={() => {
                        onFilterApply?.(filterColumns, options, filterName);
                    }}
                >
                    {filterName?.length > 0 ? 'Save and apply filter' : 'Apply'}
                </Button>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    deleteText: {
        fontSize: 20,
        color: GlobalColors.formDelete,
        marginLeft: 10
    },
    deleteFilterButton: {
        height: 40,
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignContent: 'center',
        marginVertical: 30
    },
    parametersText: {
        fontSize: 14,
        marginTop: 22,
        marginBottom: 12,
        fontWeight: AppFonts.BOLD,
        letterSpacing: -0.36,
        color: GlobalColors.formText
    },
    createFilterTitle: {
        fontSize: 20,
        fontWeight: AppFonts.BOLD,
        marginTop: 20,
        marginBottom: 30,
        color: GlobalColors.formText
    },
    container: {
        flex: 1,
        flexDirection: 'column',
        alignContent: 'flex-start',
        borderRadius: 6,
        backgroundColor: GlobalColors.appBackground
    },
    textArea: {
        flex: 1,
        height: 120,
        paddingHorizontal: 12,
        borderRadius: 5,
        fontSize: 18
    },
    textField: {
        height: 45,
        paddingHorizontal: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: GlobalColors.textField,
        borderRadius: 6,
        fontSize: 18,
        color: GlobalColors.formText
    },
    checkbox: {
        marginTop: 8,
        borderWidth: 0,
        margin: 0
    },
    bottomButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        backgroundColor: GlobalColors.contentBackgroundColor,
        paddingHorizontal: 12,
        paddingVertical: 15,
        marginHorizontal: -15,
        marginBottom: -15,
        shadowRadius: 2,
        shadowOffset: {
            width: 0,
            height: -2
        },
        shadowColor: '#000000',
        ...Platform.select({
            ios: {},
            android: { elevation: 4 }
        }),
        shadowOpacity: 0.5
    },
    button: {
        marginHorizontal: 12,
        backgroundColor: GlobalColors.primaryButtonColor
    },
    buttonDisabled: {
        marginHorizontal: 12,
        backgroundColor: GlobalColors.primaryButtonColorDisabled
    },
    buttonCancel: {
        marginHorizontal: 12
    },
    fieldContainer: {
        marginTop: 10,
        borderRadius: 10,
        paddingVertical: 20,
        paddingHorizontal: 15
    },
    fieldLabel: {
        marginBottom: 4,
        fontSize: 14,
        letterSpacing: -0.36,
        color: GlobalColors.formLable
    },
    changeNotificationContainer: {
        marginTop: 10,
        backgroundColor: '#fff2ce',
        borderRadius: 6,
        paddingHorizontal: 10,
        paddingVertical: 15,
        marginBottom: 12
    }
});
