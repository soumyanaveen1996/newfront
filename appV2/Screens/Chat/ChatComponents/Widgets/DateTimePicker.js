import React, { useState, useEffect } from 'react';
import {
    Text,
    View,
    TouchableOpacity,
    TextInput,
    Switch,
    Platform,
    Image,
    Linking,
    Modal,
    Dimensions
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { fieldType } from '../Form2Message/config';
import Icons from '../../../../config/icons';
import GlobalColors from '../../../../config/styles';
import styles from '../Form2Message/styles';
import moment from 'moment';
import AppFonts from '../../../../config/fontConfig';
const height = Dimensions.get('screen').height;
export default function renderDateTimePicker(props) {
    const { value, type, confirmDateTimeSelection, disabled } = props;
    const [currentState, setCurrentState] = useState({});

    useEffect(() => {
        setCurrentState({
            showDateTimePicker: false,
            dateModalValue: value,
            keepPickerOpen: false,
            dateModalMode: fieldType.date,
            selectedDateFoIOS: null
        });
    }, []);

    function renderDateTimePickerView() {
        return (
            <DateTimePicker
                testID="dateTimePicker"
                value={
                    currentState.dateModalValue
                        ? new Date(currentState.dateModalValue)
                        : new Date()
                }
                mode={
                    currentState.keepPickerOpen
                        ? fieldType.date
                        : currentState.dateModalMode
                }
                is24Hour
                display={Platform.OS === 'ios' ? 'inline' : 'default'}
                style={{
                    backgroundColor:
                        GlobalColors.contentBackgroundColorSecondary,
                    width: '100%',
                    // flex: 1,
                    minHeight: height * 0.65,
                    maxHeight: height * 0.7
                }}
                textColor={GlobalColors.primaryTextColor}
                onChange={(event, date) => {
                    console.log(event, date);
                    if (date) {
                        if (currentState.keepPickerOpen) {
                            // Android: select time after date
                            setCurrentState((prev) => {
                                return {
                                    ...prev,
                                    ...{
                                        dateModalValue: moment(date),
                                        keepPickerOpen: false,
                                        dateModalMode: fieldType.time
                                    }
                                };
                            });
                            return;
                        }
                        // confirm pick for android, for ios do in on confirm button click
                        if (Platform.OS === 'android') {
                            setCurrentState((prev) => {
                                return {
                                    ...prev,
                                    showDateTimePicker: false
                                };
                            });
                            confirmDateTimeSelection(moment(date));
                        } else {
                            setCurrentState((prev) => {
                                return {
                                    ...prev,
                                    ...{
                                        dateModalValue: moment(date),
                                        selectedDateFoIOS: moment(date)
                                    }
                                };
                            });
                        }
                    } else {
                        if (event.type === 'dismissed')
                            setCurrentState((prev) => {
                                return {
                                    ...prev,
                                    showDateTimePicker: false
                                };
                            });
                    }
                }}
            />
        );
    }

    function renderDateTimePickerIOS() {
        if (currentState?.showDateTimePicker != true) return;
        return (
            <Modal
                animationType="slide"
                visible={currentState.showDateTimePicker}
                transparent
            >
                <View style={{ flex: 1 }}>
                    <TouchableOpacity
                        style={{ flex: 1 }}
                        onPress={() => {
                            setCurrentState(() => {
                                return {
                                    ...currentState,
                                    showDateTimePicker: false
                                };
                            });
                        }}
                    />
                    <TouchableOpacity
                        style={{
                            paddingHorizontal: 10,
                            paddingVertical: 15,
                            alignItems: 'flex-end',
                            width: '100%',
                            backgroundColor: GlobalColors.contentBackgroundColor
                        }}
                        onPress={() => {
                            setCurrentState((prev) => {
                                return {
                                    ...prev,
                                    showDateTimePicker: false
                                };
                            });
                            confirmDateTimeSelection(
                                currentState.selectedDateFoIOS
                                    ? currentState.selectedDateFoIOS
                                    : moment()
                            );
                        }}
                    >
                        <Text
                            style={{
                                color: GlobalColors.frontmLightBlue,
                                fontWeight: AppFonts.SEMIBOLD,
                                fontSize: 18
                            }}
                        >
                            Confirm
                        </Text>
                    </TouchableOpacity>
                    {renderDateTimePickerView()}
                </View>
            </Modal>
        );
    }

    function renderDateTimePickerAndroid() {
        if (currentState.showDateTimePicker) return renderDateTimePickerView();
    }

    return (
        <TouchableOpacity
            disabled={disabled}
            onPress={async () => {
                setCurrentState((prev) => {
                    return {
                        ...prev,
                        showDateTimePicker: true,
                        dateModalMode: type,
                        keepPickerOpen: !!(
                            Platform.OS === 'android' &&
                            type === fieldType.dateTime
                        )
                    };
                });
            }}
            style={[styles.dateField, disabled && styles.disableField]}
        >
            {
                <Text
                    style={{
                        alignItems: 'center',
                        color: disabled
                            ? GlobalColors.formTextDisabled
                            : GlobalColors.formText
                    }}
                >
                    {value &&
                        type === fieldType.dateTime &&
                        value.format('DD/MM/YYYY HH:mm')}
                    {value &&
                        type === fieldType.date &&
                        value.format('DD/MM/YYYY')}
                    {value && type === fieldType.time && value.format('HH:mm')}
                </Text>
            }
            {type === fieldType.time ? Icons.time() : Icons.formCalendar()}
            {Platform.OS === 'ios'
                ? renderDateTimePickerIOS()
                : renderDateTimePickerAndroid()}
        </TouchableOpacity>
    );
}
