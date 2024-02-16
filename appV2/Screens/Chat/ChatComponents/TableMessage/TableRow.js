import React from 'react';
import { Text, View, TouchableOpacity, Image } from 'react-native';
import { Button, Icon } from '@rneui/themed';

import _, { result } from 'lodash';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import moment from 'moment';
import styles from './styles';
import Icons from '../../../../config/icons';
import images from '../../../../images';
import GlobalColors from '../../../../config/styles';
import { format } from '../../../../lib/utils/TextFormatter';
import { fieldType } from '../Form2Message/config';
import { Surface } from 'react-native-paper';
import AppFonts from '../../../../config/fontConfig';
const renderVerticleFiled = (id, title, value) => (
    <View
        key={id}
        style={[styles.detailRowContainer, { flexDirection: 'column' }]}
    >
        <Text style={styles.keyText}>{title}</Text>
        <View style={{ flex: 1, marginTop: 8 }}>
            <Text
                style={{
                    color: GlobalColors.tableDeatilValue,
                    fontSize: 12,
                    flex: 1
                }}
            >
                {value}
            </Text>
        </View>
    </View>
);

const renderHorizontalField = (id, title, value, icon = null) => {
    if (typeof value === 'string' || typeof value === 'number')
        return (
            <View key={id} style={styles.detailRowContainer}>
                <Text style={styles.keyText}>{title}</Text>
                <View style={{ flex: 1 }}>
                    <Text
                        style={{
                            color: GlobalColors.tableDeatilValue,
                            textAlign: 'right',
                            fontSize: 12,
                            flex: 1
                        }}
                    >
                        {format(value)}
                    </Text>
                </View>
            </View>
        );
};

const renderField = (data, row, action, timeZone = 'UTC') => {
    if (data.type === fieldType.textArea) {
        return renderVerticleFiled(data.id, data.title, data.value);
    }
    if (data.type === fieldType.textField) {
        return renderHorizontalField(data.id, data.title, data.value);
    }

    if (data.type === fieldType.multiselection && data.value) {
        return renderVerticleFiled(data.id, data.title, data.value?.join(', '));
    }

    if (data.type === fieldType.dateTime && data.value) {
        return renderHorizontalField(
            data.id,
            data.title,
            moment.utc(data.value).tz(timeZone).format('hh:mm a, DD-MMM-YYYY')
        );
    }
    if (data.type === fieldType.date && data.value) {
        return renderHorizontalField(
            data.id,
            data.title,
            moment.utc(data.value).tz(timeZone).format('DD-MMM-YYYY')
        );
    }

    if (data.type === fieldType.time && data.value) {
        return renderHorizontalField(
            data.id,
            data.title,
            moment.utc(data.value).tz(timeZone).format('hh:mm a')
        );
    }

    if (data.type === fieldType.switch) {
        return renderHorizontalField(
            data.id,
            data.title,
            data.value ? 'Yes' : 'No'
        );
    }

    if (data.type === fieldType.buttonsField) {
        let button = null;
        if (data.inactiveIconUrl && data.activeIconUrl)
            button = (
                <TouchableOpacity
                    disabled={data.readOnly ? true : false}
                    onPress={() => {
                        action?.(data, row);
                    }}
                >
                    <Image
                        source={{
                            uri: data.readOnly
                                ? data.inactiveIconUrl
                                : data.activeIconUrl
                        }}
                        style={{ height: 24, width: 24 }}
                        resizeMode="contain"
                    />
                </TouchableOpacity>
            );
        else {
            if (data?.options && data.options.length > 0) {
                button = data.options.map((item) => (
                    <Button
                        buttonStyle={styles.actionButton}
                        title={item.label}
                        type="outline"
                        titleStyle={{
                            fontSize: 12,
                            fontWeight: AppFonts.BOLD,
                            color: GlobalColors.primaryButtonColor
                        }}
                        onPress={() => {
                            action?.(data, row, item.label);
                        }}
                    />
                ));
            } else if (data?.value?.text) {
                button = (
                    <Button
                        buttonStyle={styles.actionButton}
                        title={data?.value?.text}
                        type="outline"
                        titleStyle={{
                            fontSize: 12,
                            fontWeight: AppFonts.BOLD,
                            color: GlobalColors.primaryButtonColor
                        }}
                        onPress={() => {
                            action?.(data, row);
                        }}
                    />
                );
            }
        }

        return (
            <View key={data.id} style={styles.detailRowContainer}>
                <Text style={styles.keyText}>{data.title}</Text>
                <View style={{}}>{button}</View>
            </View>
        );
    }

    if (data.type == fieldType.checkbox) {
        return renderHorizontalField(
            data.id,
            data.title,
            data.value?.toString()
        );
    }

    if (data.type == fieldType.fileField) {
        return renderHorizontalField(
            data.id,
            data.title,
            data.fileName || data.value,
            Icons.fileIconSmall()
        );
    }
    if (data.value instanceof Array) {
        return renderHorizontalField(
            data.id,
            data.title,
            data.value?.toString()
        );
    }

    if (typeof data.value === 'object') {
        return (
            <View key={data.id} style={styles.detailRowContainer}>
                <Text style={styles.keyText}>
                    {data.title ? data.title : data.id}
                </Text>
                <View style={{}}>
                    {data.value?.text && (
                        <Button
                            buttonStyle={{
                                borderColor: GlobalColors.primaryButtonColor
                            }}
                            title={data.value?.text}
                            type="outline"
                            titleStyle={{
                                fontSize: 12,
                                fontWeight: AppFonts.BOLD,
                                color: GlobalColors.primaryButtonColor
                            }}
                            onPress={() => {
                                action?.(data, row);
                            }}
                        />
                    )}
                </View>
            </View>
        );
    }
    if (data.type == fieldType.number) {
        return renderHorizontalField(
            data.id,
            data.title,
            data.value ? '' + data.value : ''
        );
    }
    return renderHorizontalField(data.id, data.title, data.value);
};

/**
 * @param onPressFieldAction onPress action if the fields(rows) are clickable
 * @param onRowSelected onclick for each item
 * @param sendSelectionMessage onclick for select/deselect in the rows have chekbox(selectabale)
 * @param onPressRowMenu onclick action for when the menu options clicked for a particular row
 * @param onPressRowAction onclick action for when the action triggred for a row.
 */
export default TableRow = (props) => {
    const { item, index, options, isOpen, isSelected, timeZone } = props;
    const dataList = [];
    if (isOpen) {
        item.content.forEach((dataItem) => {
            dataList.push(
                renderField(
                    dataItem,
                    item.fields,
                    props.onPressFieldAction,
                    timeZone
                )
            );
        });
    }
    // let entryTitleItems;
    let notificationIcon = null;
    switch (item.alert) {
        case 0:
            notificationIcon = images.table_notify_green;
            break;
        case 1:
            notificationIcon = images.table_notify_orange;
            break;
        case 2:
            notificationIcon = images.table_notify_red;
            break;
        default:
            notificationIcon = null;
    }

    const rowSwipeActions = () => {
        const rowOption = item.rowOptions
            ? { ...options, ...item.rowOptions }
            : options;
        const rowMenu = item.rowMenu ? item.rowMenu : options.rowMenu;
        return (
            <View
                style={{
                    flexDirection: 'row-reverse',
                    justifyContent: 'center',
                    alignItems: 'flex-start',
                    marginTop: 8
                }}
            >
                {item.hasPrimaryAction &&
                    (rowOption?.actionableRows != false ||
                        rowOption?.allowQuickAction != false) && (
                        <TouchableOpacity
                            onPress={() => {
                                if (rowOption?.actionableRows)
                                    props.onPressRowAction?.(item);
                                else props.onQuickAction?.(item);
                            }}
                            style={{
                                marginLeft: 4,
                                height: 40,
                                width: 40
                            }}
                        >
                            <Surface style={styles.swipeActionButton}>
                                <Icon
                                    name="open-in-new"
                                    size={12}
                                    type="material"
                                    color={GlobalColors.primaryTextColor}
                                />
                                <Text
                                    ellipsizeMode="tail"
                                    style={[styles.quicActionButtonText]}
                                >
                                    Open
                                </Text>
                            </Surface>
                        </TouchableOpacity>
                    )}
                {rowOption.allowEdit && (
                    <TouchableOpacity
                        onPress={() => {
                            props.onEdit?.(item);
                        }}
                        style={{ marginLeft: 4 }}
                    >
                        <Surface style={styles.swipeActionButton}>
                            <Icon
                                name="edit"
                                size={14}
                                type="material"
                                color={GlobalColors.primaryTextColor}
                            />
                            <Text style={styles.quicActionButtonText}>
                                Edit
                            </Text>
                        </Surface>
                    </TouchableOpacity>
                )}
                {rowOption.allowDelete && (
                    <TouchableOpacity
                        onPress={() => {
                            props.onDelete?.(item);
                        }}
                        style={{ marginLeft: 4 }}
                    >
                        <Surface
                            style={[
                                styles.swipeActionButton,
                                { aspectRatio: undefined }
                            ]}
                        >
                            <Icon
                                name="delete"
                                size={14}
                                type="material"
                                color={GlobalColors.primaryTextColor}
                            />
                            <Text style={styles.quicActionButtonText}>
                                Delete
                            </Text>
                        </Surface>
                    </TouchableOpacity>
                )}
                {rowMenu && (
                    <TouchableOpacity
                        onPress={() => {
                            props.onPressRowMenu?.(item, options, rowMenu);
                        }}
                        style={{ marginLeft: 4 }}
                    >
                        <Surface style={styles.swipeActionButton}>
                            <Icon
                                name="dots-vertical"
                                size={14}
                                type="material-community"
                                color={GlobalColors.primaryTextColor}
                            />
                            <Text style={styles.quicActionButtonText}>
                                More
                            </Text>
                        </Surface>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    const renderTitleSection = (entry) => {
        if (entry.title)
            return (
                <View>
                    <Text style={styles.mainKeyValueText}>{entry.title}</Text>
                    {entry.subTitle && (
                        <Text style={styles.mainKeyValueSubText}>
                            {entry.subTitle}
                        </Text>
                    )}
                </View>
            );
        return entry.titleFields?.map((i, idx) => {
            if (i.value !== undefined) {
                if (idx === 0) {
                    let displayval = i.fileName ? i.fileName : i.value;
                    if (typeof displayval === 'object') return null;
                    else
                        return (
                            <Text style={styles.mainKeyValueText}>
                                {displayval}
                            </Text>
                        );
                }
                return (
                    <Text style={styles.mainKeyValueSubText}>
                        {i.fileName ? i.fileName : i.value}
                    </Text>
                );
            }
            return null;
        });
    };

    return (
        <GestureHandlerRootView>
            <Swipeable
                renderRightActions={() => rowSwipeActions(item, options)}
            >
                <Surface
                    key={item.id + item.start ? item.start?.value : index}
                    style={[
                        styles.tableRowTitleCard,
                        isSelected && {
                            borderColor: GlobalColors.tableChekBox,
                            borderWidth: 0.5
                        }
                    ]}
                >
                    <TouchableOpacity
                        style={styles.rowsContainerOpen}
                        onPress={() => {
                            props.onRowSelected?.(index, item.id);
                        }}
                    >
                        <Surface
                            elevation={4}
                            style={styles.tableRowDetailCard}
                        >
                            <View
                                style={[
                                    styles.titleRowContainer,
                                    { backgroundColor: item.eventColor }
                                ]}
                            >
                                {options.selectableRows && (
                                    <View style={styles.iconContainer}>
                                        {isSelected
                                            ? Icons.checkboxFilled({
                                                  size: 18,
                                                  color: GlobalColors.tableCheckboxSelected,
                                                  onPress: () => {
                                                      props.handleSelection?.(
                                                          item.fields,
                                                          index
                                                      );
                                                  }
                                              })
                                            : Icons.squareOutline({
                                                  size: 18,
                                                  color: GlobalColors.tableChekBox,
                                                  onPress: () => {
                                                      props.handleSelection?.(
                                                          item,
                                                          index
                                                      );
                                                  }
                                              })}
                                    </View>
                                )}
                                <View style={styles.entryTitleContainer}>
                                    {renderTitleSection(item)}
                                </View>
                                {item.errorMessage && (
                                    <View style={styles.errorContainer}>
                                        <Icon
                                            containerStyle={styles.errorImage}
                                            accessibilityLabel="icon-error"
                                            testID="icon-error"
                                            name="exclamation"
                                            size={20}
                                            type="evilicon"
                                            color="orange"
                                        />
                                        <Text style={styles.errorText}>
                                            {item.errorMessage}
                                        </Text>
                                    </View>
                                )}
                            </View>
                            {notificationIcon && (
                                <View style={styles.notificationIconContainer}>
                                    <Image
                                        style={styles.notificationIcon}
                                        source={notificationIcon}
                                    />
                                </View>
                            )}
                        </Surface>
                        {dataList}
                    </TouchableOpacity>
                </Surface>
            </Swipeable>
        </GestureHandlerRootView>
    );
};
