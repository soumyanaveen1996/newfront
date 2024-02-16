import moment from 'moment';
import { Linking } from 'react-native';
import GlobalColors from '../../../../config/styles';
import { fieldType } from '../Form2Message/config';
import { TableOptions } from './TableMessageV2';
import images from '../../../../config/images';
import NavigationAction from '../../../../navigation/NavigationAction';
const parseDate = (dateString) => (dateString ? moment(dateString) : null);

const generateRowData = (itemEntry, options) => {
    const { columnNames } = options;
    const entryId = Object.keys(itemEntry)[0];
    const item = itemEntry[entryId];
    const eventColor =
        item.fields?.find((i) => i.type === 'color_field')?.value ||
        GlobalColors.tableItemBackground;
    const alert =
        item?.fields?.find((i) => i.type === fieldType.alertFiled)?.value ||
        null;
    const content = Object.keys(columnNames)?.map((elem) => {
        const obj = {};
        obj.id = elem;
        const filedEntry = item?.fields?.find((i) => i.id === elem);
        obj.title = filedEntry?.title;
        obj.value = filedEntry?.value;
        obj.fileName = filedEntry?.fileName;
        obj.type = filedEntry?.type;
        obj.options = filedEntry?.options;
        obj.inactiveIconUrl = filedEntry?.inactiveIconUrl;
        obj.activeIconUrl = filedEntry?.activeIconUrl;
        obj.readOnly = filedEntry?.readOnly;
        return obj;
    });

    const titleFields = item.fields?.filter(
        (i) => i.primaryKey && i.hidden != true
    );
    let hasPrimaryAction = false;
    if (titleFields.length > 0) {
        hasPrimaryAction = true;
    }

    const entry = {
        titleFields,
        fields: item.fields,
        content,
        eventColor,
        alert,
        entryId,
        hasPrimaryAction,
        rowOptions: item.rowOptions
            ? { ...options.rowOptions, ...item.rowOptions }
            : options.rowOptions,
        rowMenu: item.rowOptions?.rowMenu
            ? item.rowOptions.rowMenu
            : options.rowMenu
    };
    return entry;
};

const configureTable = (data, options = null) => {
    const {
        columnNames,
        confirmAction,
        allowRefresh,
        addNewRows,
        addNewRowsLabel
    } = options;

    const tableData = [];
    if (data) {
        data?.forEach((itemEntry) => {
            tableData.push(generateRowData(itemEntry, options));
        });
    }
    const actions = new Map();
    if (confirmAction) {
        actions.set(TableOptions.confirmAction, confirmAction);
    }
    if (allowRefresh) actions.set(TableOptions.refreshAction, 'Refresh');
    if (addNewRows) actions.set(TableOptions.newRowAction, addNewRowsLabel);
    return {
        data,
        options,
        tableLoaded: true,
        actions,
        tableData,
        tableOnly: true,
        nextPage: options.pages?.next ? true : false
    };
};

const convertDataClustersToTableEntry = (dataClusters) => {
    tableEntry = [];
    Object.keys(dataClusters).forEach((date) => {
        tableEntry.push({ title: date, data: dataClusters[date] });
    });
    tableEntry.sort((a, b) => {
        if (moment(a.title).isBefore(b.title)) return -1;
        return 1;
    });
    return tableEntry;
};

/**
 * returns updated TableData
 */
const deleteTableRow = (row, tableData) => {
    return tableData.filter((tableEntry) => tableEntry.entryId !== row.entryId);
};

/**
 * returns updated TableData
 */
const deleteTableRowByIds = (ids, tableData) => {
    return tableData.filter((tableEntry) => !ids.includes(tableEntry.entryId));
};

const updateTableRow = (docId, row, tableData, options) => {
    const objIndex = tableData.findIndex((obj) => obj.entryId == docId);
    let field = {};
    field[docId] = { fields: row };
    const newData = generateRowData(field, options);
    if (objIndex > -1) {
        const oldData = tableData[objIndex];
        newData.rowOptions = oldData.rowOptions;
        newData.rowMenu = oldData.rowMenu;
        tableData[objIndex] = newData;
        return [...tableData];
    } else {
        return [...tableData, newData];
    }
};

const updateTableRowFields = (
    docId,
    fields,
    tableData,
    newOptions,
    tableOptions
) => {
    const objIndex = tableData.findIndex((obj) => obj.entryId == docId);
    if (objIndex > -1) {
        fields.forEach((f) => {
            const fieldIndex = tableData[objIndex].fields.findIndex(
                (row) => row.id == f.id
            );
            if (fieldIndex > -1) {
                tableData[objIndex].fields[fieldIndex] = f;
            }
        });
        let field = {};
        field[docId] = { fields: tableData[objIndex].fields };
        const newData = generateRowData(field, {
            ...tableOptions,
            ...newOptions
        });
        tableData[objIndex] = newData;
        return [...tableData];
    } else return tableData;
};

const getAction = (filed) => {
    switch (filed.type) {
        case 'email':
            return {
                callToAction: () => {
                    Linking.openURL(`mailto:${filed.value}`);
                },
                image: images.map_button_email
            };
        case 'phone':
            return {
                callToAction: () => {
                    NavigationAction.push(NavigationAction.SCREENS.dialler, {
                        call: true,
                        number: filed.value.replace(/ /g, ''),
                        newCallScreen: true
                    });
                },
                image: images.map_button_call
            };

        default:
            return null;
    }
};

const getCustomAction = (filed) => {
    switch (filed.type) {
        case 'email_field':
            return {
                callToAction: () => {
                    Linking.openURL(`mailto:${filed.value}`);
                },
                image: images.map_button_email
            };
        case 'phone_number':
            return {
                callToAction: () => {
                    NavigationAction.push(NavigationAction.SCREENS.dialler, {
                        call: true,
                        number: filed.value.replace(/ /g, ''),
                        newCallScreen: true
                    });
                },
                image: images.map_button_call
            };

        default:
            return null;
    }
};

export {
    generateRowData,
    configureTable,
    convertDataClustersToTableEntry,
    deleteTableRow,
    updateTableRow,
    deleteTableRowByIds,
    updateTableRowFields,
    getAction,
    getCustomAction
};
