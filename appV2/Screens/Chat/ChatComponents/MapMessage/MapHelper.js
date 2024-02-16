import moment from 'moment';
import { TableOptions } from '../TableMessage/TableMessageV2';
const parseDate = (dateString) => (dateString ? moment(dateString) : null);
import { generateRowData } from '../TableMessage/TableHelper';
import _ from 'lodash';

const generateMarkerData = (itemEntry) => {
    const entryId = Object.keys(itemEntry)[0];
    const item = itemEntry[entryId];
    if (item.fields?.find((i) => i.title === 'pointType')?.value == 'marker') {
        const locationItem = item.fields?.find(
            (i) => i.type === 'geo_point_field'
        );
        // if (locationItem.hidden === true) return null; //Check if this required
        if (locationItem?.value) {
            let marker = { coordinate: {} };
            marker.iconType = item.fields?.find(
                (i) => i.type === 'vehicleMarkerIconType'
            )?.value;
            marker.color = item.fields?.find((i) => i.title === 'color')?.value;
            marker.coordinate.latitude = parseFloat(
                locationItem.value.latitude
            );
            marker.coordinate.longitude = parseFloat(
                locationItem.value.longitude
            );
            marker.id = entryId;
            marker.title = item.fields?.find((i) => i.title === 'title')?.value;
            marker.description = item.fields?.find(
                (i) => i.title === 'description'
            )?.value;
            let temItems = Array.from(item.fields);
            const imageField = _.remove(
                temItems,
                (i) => i.type === 'image_field'
            )?.[0];
            const title = _.remove(
                temItems,
                (i) => i.title?.toLowerCase() === 'title'
            )?.[0];
            marker.card = {};
            marker.card.title = title?.value;
            marker.card.imageUrl = imageField?.value;
            marker.card.info = temItems?.filter((i) => i.quickView);
            return marker;
        }
    }
    return null;
};

const generateAreaData = (itemEntry) => {
    const entryId = Object.keys(itemEntry)[0];
    const item = itemEntry[entryId];
    const areaItem = item.fields?.find((i) => i.type === 'geo_area_field');

    if (areaItem?.value) {
        let polylines = {};
        polylines.coordinates = areaItem.value;
        polylines.id = item.fields?.find((i) => i.id === 'areaId')?.value;
        polylines.title = item.fields?.find((i) => i.id === 'areaName')?.value;
        return polylines;
    } else return null;
};

const generateRoutePoints = (itemEntry) => {
    const entryId = Object.keys(itemEntry)[0];
    const item = itemEntry[entryId];
    const PointTypeFiled = item.fields?.find((i) => i.title === 'routeId');
    if (PointTypeFiled) {
        return item;
    }
    return null;
};

const configureMap = (data, options = null) => {
    const {
        columnNames,
        confirmAction,
        allowRefresh,
        addNewRows,
        addNewRowsLabel
    } = options;
    // console.log('MAP: configureMap : options ', options);
    const tableData = [];
    let mapData = {};
    mapData.region = options.mapOptions?.region;
    mapData.markers = [];
    mapData.routes = [];
    mapData.polylines = [];
    const allRoutePoints = [];
    if (data) {
        data?.forEach((itemEntry) => {
            const tableRow = generateRowData(itemEntry, options);
            if (tableRow) {
                tableData.push(tableRow);
            }

            const marker = generateMarkerData(itemEntry, options);
            if (marker) {
                mapData.markers.push(marker);
            }
            const routePoint = generateRoutePoints(itemEntry, options);
            if (routePoint) allRoutePoints.push(routePoint);
            const polyLine = generateAreaData(itemEntry, options);
            if (polyLine) {
                mapData.polylines.push(polyLine);
            }
        });
    }

    if (options.mapOptions?.routeFields && allRoutePoints.length > 0) {
        options.mapOptions.routeFields.forEach((field) => {
            const routePoints = allRoutePoints?.filter((itemEntry) => {
                const idFiled = itemEntry?.fields?.find(
                    (i) => i.title === 'routeId'
                );
                return idFiled?.value === field.routeId;
            });
            const value = routePoints?.map(
                (pt) =>
                    pt.fields.find((i) => i.type === 'geo_point_field')?.value
            );
            mapData.routes.push({
                coordinates: value,
                id: field.routeId,
                routeColour: field.routeColour,
                routeType: field.routeType,
                routeWidth: field.routeWidth
            });
        });
    }
    // console.log('MAP: configureMap : mapData.routes ', mapData.routes);
    const actions = new Map();
    const mapActions = { confirmAction: null, refresh: false };
    if (confirmAction) {
        actions.set(TableOptions.confirmAction, confirmAction);
        mapActions.confirmAction = confirmAction;
    }
    if (allowRefresh) {
        actions.set(TableOptions.refreshAction, 'Refresh');
        mapActions.refresh = true;
    }
    if (addNewRows) actions.set(TableOptions.newRowAction, addNewRowsLabel);
    console.log('MAP: configureMap : mapData ', mapData);
    return {
        data,
        options,
        mapOptions: options.mapOptions,
        tableLoaded: true,
        actions,
        mapActions,
        tableData,
        mapData, //TODO
        tableOnly: true
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

export {
    configureMap,
    convertDataClustersToTableEntry,
    deleteTableRow,
    updateTableRow,
    deleteTableRowByIds,
    updateTableRowFields
};
