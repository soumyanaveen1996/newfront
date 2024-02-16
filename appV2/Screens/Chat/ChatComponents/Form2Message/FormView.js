import React, { useState } from 'react';
import {
    Text,
    View,
    TouchableOpacity,
    Platform,
    Image,
    Linking
} from 'react-native';
import _, { set, truncate } from 'lodash';
import { fieldType } from './config';
import styles from './styles';
import Tooltip from 'react-native-walkthrough-tooltip';
import { CheckBox } from '@rneui/themed';
import GlobalColors from '../../../../config/styles';
import DropDown from '../Widgets/DropDown';
import Slider from '@react-native-community/slider';
import MultiSelectControll from '../../ChatComponents/Widgets/MultiSelectControll';
import LookupControll from '../../ChatComponents/Widgets/LookupControll';
import ImagePicker from '../Widgets/ImagePicker';
import NavigationAction from '../../../../navigation/NavigationAction';
import images from '../../../../config/images';
import config from '../../../../config/config';
import Icons from '../../../../config/icons';
import DateTimePicker from '../../ChatComponents/Widgets/DateTimePicker';
import Attachment from '../../ChatComponents/Widgets/Attachment';
import moment from 'moment';
import { TextInput } from '../../../../widgets/TextInput';
import { SwitchControll } from '../../../../widgets/Switch';
import { Toast } from 'react-native-toast-message/lib/src/Toast';
function isBlank(str) {
    return !str || /^\s*$/.test(str);
}
export default FormView = ({
    formData,
    disabled,
    onFieldUpdate,
    onMoveAction,
    currentAnswers,
    conversationId,
    getDataForLookup,
    onClickAction,
    onFileSelected,
    fileDB,
    processFileSelection
}) => {
    var currentDateModalKey = null;
    const [showInfo, setSowInfo] = useState(false);

    const renderField = (fieldData, key) => {
        let field;
        let showTitle = true;
        switch (fieldData.type) {
            case fieldType.textField:
                field = renderTextField(fieldData, key);
                break;
            case fieldType.number:
                field = renderNumberField(fieldData, key);
                break;
            case fieldType.textArea:
                field = renderTextArea(fieldData, key);
                break;
            case fieldType.checkbox:
                let checkForTitle = isBlank(fieldData.title);
                showTitle = !checkForTitle;
                field = renderCheckbox(fieldData, key);
                break;
            case fieldType.radioButton:
                field = renderRadioButton(fieldData, key);
                break;
            case fieldType.dropdown:
                field = renderDropdown(fieldData, key);
                break;
            case fieldType.buttonsField:
                field = renderButtonsField(fieldData, key);
                break;
            case fieldType.switch:
                field = renderSwitch(fieldData, key);
                break;
            case fieldType.slider:
                field = renderSlider(fieldData, key);
                break;
            case fieldType.date:
                field = renderDate(fieldData, key);
                break;
            case fieldType.time:
                field = renderDate(fieldData, key);
                break;
            case fieldType.dateTime:
                field = renderDate(fieldData, key);
                break;
            case fieldType.multiselection:
                showTitle = false;
                field = renderMultiselection(fieldData, key);
                break;
            case fieldType.passwordField:
                field = renderPasswordField(fieldData, key);
                break;
            case fieldType.lookup:
                field = renderLookupField(fieldData, key);
                break;
            case fieldType.imageField:
                field = renderImagePicker(fieldData, key);
                break;
            case fieldType.voiceCallField:
                field = renderVoiceCallField(fieldData, key);
            case fieldType.fileField:
                field = renderFilePicker(fieldData, key);
                break;
            case fieldType.phoneNumber:
                field = renderPhoneNumberField(fieldData, key);
                break;
            case fieldType.email:
                field = renderEmailField(fieldData, key);
                break;
            default:
        }
        return (
            <View style={styles.f2FieldContainer} key={key}>
                {showTitle && (
                    <>
                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                marginBottom: 12
                            }}
                        >
                            <Text style={styles.f2LabelTitle}>
                                {renderMandatorySign(fieldData)}
                                {fieldData.title || ''}
                            </Text>

                            {fieldData.info ? (
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: GlobalColors.textBlack
                                    }}
                                    isVisible={showInfo === key}
                                    backgroundColor={'rgba(0,0,0,0.3)'}
                                    content={
                                        <View>
                                            <Text
                                                style={{
                                                    color: GlobalColors.white
                                                }}
                                            >
                                                {' '}
                                                {fieldData.info}{' '}
                                            </Text>
                                        </View>
                                    }
                                    placement="top"
                                    onClose={() => setSowInfo(false)}
                                    useInteractionManager={true} // need this prop to wait for react navigation
                                    // below is for the status bar of react navigation bar
                                    topAdjustment={
                                        Platform.OS === 'android' ? 0 : 0
                                    }
                                >
                                    {Icons.info({
                                        size: 18,
                                        onPress: () => {
                                            setSowInfo(key);
                                        }
                                    })}
                                </Tooltip>
                            ) : null}
                        </View>
                    </>
                )}
                {field}
                {(fieldData.validation ||
                    fieldData.type === fieldType.imageField ||
                    fieldData.type === fieldType.fileField) &&
                currentAnswers[key].valid === false
                    ? renderValidationMessage(
                          currentAnswers[key].validationMessage ||
                              'Validation error'
                      )
                    : null}
            </View>
        );
    };

    return (
        <View style={{ flex: 1 }}>
            {_.map(formData, (fieldData, index) => {
                if (!fieldData.hidden) return renderField(fieldData, index);
            })}
        </View>
    );

    function renderTextField(content, key) {
        return (
            <TextInput
                editable={!(disabled || content.readOnly)}
                style={[(disabled || content.readOnly) && styles.disableField]}
                onChangeText={(text) => {
                    onFieldUpdate(key, text);
                }}
                maxLength={content.maxLength}
                placeholderTextColor={GlobalColors.formPlaceholderText}
                value={currentAnswers[key].value.toString()}
                onSubmitEditing={(e) => {
                    onMoveAction(key);
                }}
                onBlur={() => {
                    onMoveAction(key);
                }}
            />
        );
    }
    function renderNumberField(content, key) {
        return (
            <TextInput
                editable={!(disabled || content.readOnly)}
                style={[(disabled || content.readOnly) && styles.disableField]}
                onChangeText={(text) => {
                    onFieldUpdate(key, text);
                }}
                placeholderTextColor={GlobalColors.formPlaceholderText}
                keyboardType={'numeric'}
                maxLength={content.maxLength}
                value={currentAnswers[key].value?.toString()}
                onSubmitEditing={(e) => {
                    onMoveAction(key);
                }}
                onBlur={() => {
                    onMoveAction(key);
                }}
            />
        );
    }
    function renderTextArea(content, key) {
        return (
            <TextInput
                multiline
                editable={!(disabled || content.readOnly)}
                style={[(disabled || content.readOnly) && styles.disableField]}
                onChangeText={(text) => {
                    onFieldUpdate(key, text);
                }}
                maxLength={content.maxLength}
                placeholderTextColor={GlobalColors.formPlaceholderText}
                value={currentAnswers[key].value}
                onSubmitEditing={(e) => {
                    onMoveAction(key);
                }}
                onBlur={() => {
                    onMoveAction(key);
                }}
            />
        );
    }
    function renderCheckbox(content, key) {
        const options = _.map(content.options, (option, index) => (
            <CheckBox
                key={index}
                title={option}
                onPress={() => {
                    if (!(disabled || content.readOnly)) {
                        onFieldUpdate(key, index);
                    }
                }}
                checked={currentAnswers[key].value[index]}
                textStyle={styles.optionText}
                containerStyle={styles.checkbox}
                size={20}
                iconType="ionicon"
                checkedIcon="ios-checkbox-outline"
                uncheckedIcon="ios-square-outline"
                checkedColor={GlobalColors.primaryButtonColor}
                activeOpacity={1}
                disabled={disabled || content.readOnly}
            />
        ));
        return options;
    }
    function renderRadioButton(content, key) {
        if (!content.options) content.options = [];
        const options = _.map(content.options, (option, index) => (
            <CheckBox
                key={index}
                title={option}
                onPress={() => {
                    if (!(disabled || content.readOnly)) {
                        onFieldUpdate(key, index);
                        onMoveAction(key);
                    }
                }}
                checked={currentAnswers[key].value === index}
                textStyle={styles.optionText}
                containerStyle={styles.checkbox}
                size={20}
                iconType="ionicon"
                checkedIcon="ios-radio-button-on"
                uncheckedIcon="ios-radio-button-off"
                checkedColor={GlobalColors.primaryButtonColor}
                activeOpacity={1}
                disabled={disabled || content.readOnly}
            />
        ));
        return options;
    }
    function renderDropdown(content, key) {
        return (
            <DropDown
                selectedValue={currentAnswers[key].value}
                list={content.options}
                onValueChange={(val) => {
                    onFieldUpdate(key, val);
                }}
                disabled={disabled || content.readOnly}
                fieldData={content}
            />
        );
    }
    function renderButtonsField(fieldData, key) {
        return (
            <View style={styles.fieldButtonsContainer}>
                {fieldData.options.map((option) => (
                    <TouchableOpacity
                        style={[
                            disabled || fieldData.readOnly
                                ? styles.fieldButtonDisabled
                                : styles.fieldButton,
                            { marginBottom: 8 }
                        ]}
                        disabled={disabled || fieldData.readOnly}
                        onPress={() => {
                            onClickAction(key, fieldData.id, option.label);
                        }}
                    >
                        <Text style={styles.fieldButtonText}>
                            {option.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        );
    }
    function renderSwitch(content, key) {
        return (
            <SwitchControll
                disabled={disabled || content.readOnly}
                onValueChange={(value) => {
                    onFieldUpdate(key, value);
                    onMoveAction(key);
                }}
                value={currentAnswers[key].value}
            />
        );
    }
    function renderSlider(content, key) {
        return (
            <Slider
                disabled={disabled || content.readOnly}
                maximumValue={100}
                minimumValue={0}
                onValueChange={(value) => {
                    onFieldUpdate(key, value);
                    onMoveAction(key);
                }}
                value={currentAnswers[key].value}
                minimumTrackTintColor={GlobalColors.primaryButtonColor}
                maximumTrackTintColor={GlobalColors.primaryButtonColor}
                thumbTintColor={GlobalColors.primaryButtonColor}
            />
        );
    }
    function renderMultiselection(content, key) {
        return (
            <MultiSelectControll
                fieldData={content}
                disabled={disabled || content.readOnly}
                title={content.title}
                handleChange={(val, lable) => onFieldUpdate(key, val)}
                selectedItems={currentAnswers[key].value}
                titleStyle={[styles.f2LabelTitle]}
            />
        );
    }
    function renderPasswordField(content, key) {
        return (
            <TextInput
                editable={!(disabled || content.readOnly)}
                onChangeText={(text) => {
                    // if (this.textTimer) {
                    //     clearTimeout(this.textTimer);
                    // }
                    //TODO: do the validation in caller
                    onFieldUpdate(key, text);
                }}
                secureTextEntry
                textContentType="password"
                style={[(disabled || content.readOnly) && styles.disableField]}
                value={currentAnswers[key].value}
                onSubmitEditing={(e) => {
                    onMoveAction(key);
                }}
                onBlur={() => {
                    onMoveAction(key);
                }}
            />
        );
    }

    function renderLookupField(content, key) {
        return (
            <LookupControll
                getDataForLookup={(id, value, text, callBack) => {
                    getDataForLookup(key, id, text, callBack);
                }}
                value={currentAnswers[key].value}
                fieldData={content}
                handleChange={(val) => {
                    onFieldUpdate(key, typeof val == 'object' ? val.text : val);
                    onMoveAction(key, val);
                }}
            />
        );
    }
    function renderImagePicker(content, key) {
        console.log('Render image picker', fileDB[currentAnswers[key]?.value]);
        return (
            <ImagePicker
                uri={fileDB[currentAnswers[key]?.value]?.file?.uri}
                name={fileDB[currentAnswers[key]?.value]?.file?.name}
                conversationId={conversationId}
                formId={content.id}
                disabled={disabled || content.readOnly}
                onRemoveImage={() => {}}
                onSelectImage={(result) => {
                    console.log(result);
                    processFileSelection(content, result, key);
                }}
            />
        );
    }
    function renderVoiceCallField(content, key) {
        const { number, userId, title } = content;

        if ((!number && !userId) || (number && userId)) {
            return (
                <Text style={{ color: 'red' }}>
                    Error in voice call destination. Only one of the destination
                    fields in mandatory
                </Text>
            );
        }

        return (
            <TouchableOpacity
                style={styles.callButton}
                disabled={disabled || content.readOnly}
                onPress={() => {
                    if (number) {
                        NavigationAction.push(
                            NavigationAction.SCREENS.dialler,
                            {
                                call: true,
                                number,
                                newCallScreen: true
                            }
                        );
                    } else if (userId) {
                        NavigationAction.push(
                            NavigationAction.SCREENS.meetingRoom,
                            {
                                voipCallData: {
                                    otherUserId: userId,
                                    otherUserName: title
                                },
                                userId,
                                title
                            }
                        );
                    }
                }}
            >
                {Icons.call({ size: 28, color: GlobalColors.white })}
            </TouchableOpacity>
        );
    }
    function renderMandatorySign(fieldData) {
        if (fieldData.mandatory) {
            return <Text style={{ color: GlobalColors.red }}>* </Text>;
        }
    }
    function renderInfoBubble(info) {
        return (
            <View
                style={{
                    flexDirection: 'row',
                    position: 'absolute',
                    bottom: 0
                }}
            >
                <View style={styles.infoTip} />
                <View style={styles.infoBubble}>
                    <Text style={styles.infoText}>{info}</Text>
                </View>
            </View>
        );
    }
    function renderValidationMessage(message) {
        return (
            <View style={styles.validationMessage}>
                <Text style={styles.validationMessageText}>{message}</Text>
            </View>
        );
    }
    function renderFilePicker(content, key) {
        console.log(fileDB, currentAnswers[key]);
        return (
            <Attachment
                selectedFileInfo={fileDB[currentAnswers[key]?.value]}
                currentSelection={currentAnswers[key].value}
                fieldData={content}
                id={key}
                disabled={disabled || content.readOnly}
                processFileSelection={(fieldData, file, key) => {
                    processFileSelection(fieldData, file, key);
                }}
            />
        );
    }
    function renderPhoneNumberField(content, key) {
        return (
            <>
                <TextInput
                    editable={!(disabled || content.readOnly)}
                    style={[
                        (disabled || content.readOnly) && styles.disableField
                    ]}
                    onChangeText={(text) => {
                        onFieldUpdate(key, text);
                    }}
                    placeholderTextColor={GlobalColors.formPlaceholderText}
                    keyboardType={
                        Platform.OS === 'ios'
                            ? 'numbers-and-punctuation'
                            : 'numeric'
                    }
                    maxLength={content.maxLength}
                    value={currentAnswers[key].value}
                    onSubmitEditing={(e) => {
                        onMoveAction(key);
                    }}
                    onBlur={() => {
                        onMoveAction(key);
                    }}
                />
                {config.showPSTNCalls && (
                    <TouchableOpacity
                        style={styles.callBtnContainer}
                        onPress={() => this.makePhoneCall('+91 7600592654')}
                    >
                        <Image
                            source={images.contactsCallbtn}
                            style={styles.callBtn}
                        />
                    </TouchableOpacity>
                )}
            </>
        );
    }
    function renderEmailField(content, key) {
        return (
            <>
                <TextInput
                    editable={!(disabled || content.readOnly)}
                    style={[
                        (disabled || content.readOnly) && styles.disableField
                    ]}
                    onChangeText={(text) => {
                        onFieldUpdate(key, text);
                    }}
                    placeholderTextColor={GlobalColors.formPlaceholderText}
                    value={'' + this.state.answers[key].value}
                    onSubmitEditing={(e) => {
                        onMoveAction(key);
                    }}
                    onBlur={() => {
                        onMoveAction(key);
                    }}
                />
                <TouchableOpacity
                    style={styles.callBtnContainer}
                    onPress={() => openMail(this.state.answers[key].value)}
                >
                    <Image
                        source={images.map_button_email}
                        style={styles.callBtn}
                    />
                </TouchableOpacity>
            </>
        );
    }

    function openMail(url) {
        if (url && url !== '') {
            const link = `mailto:${url}`;
            Linking.canOpenURL(link)
                .then((supported) => {
                    if (supported) {
                        Linking.openURL(link);
                    }
                })
                .catch((err) => console.error('An error occurred', err));
        } else {
            Toast.show({ text1: 'Please enter email address' });
        }
    }

    function renderDate(content, key) {
        return (
            <DateTimePicker
                disabled={disabled || content.readOnly}
                value={currentAnswers[key].value}
                type={content.type}
                confirmDateTimeSelection={(selectedDate) => {
                    onFieldUpdate(key, selectedDate);
                }}
            />
        );
    }
};
