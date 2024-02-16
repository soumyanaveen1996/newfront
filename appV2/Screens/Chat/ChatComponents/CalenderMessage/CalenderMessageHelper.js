import moment from 'moment';
import GlobalColors from '../../../../config/styles';
import { generateRowData } from '../TableMessage/TableHelper';

const parseDate = (dateString) => {
    if (dateString) {
        return moment.utc(dateString);
    }
    return null;
};

const configureTable = (data, options, timeZone = 'UTC') => {
    const { calendarEntry, confirmAction, allowRefresh } = options;
    const markedDates = {};
    const dataClusters = {};
    const dataClustersForFlatlist = {};
    const tableData = [];
    if (calendarEntry && data) {
        data.forEach((itemEntry) => {
            const entryId = Object.keys(itemEntry)[0];
            const item = itemEntry[entryId];
            const id = item.fields?.find((i) => i.id === calendarEntry.id)
                ?.value;
            const title = item.fields?.find((i) => i.id === calendarEntry.title)
                ?.value;
            const start = item.fields?.find(
                (i) => i.id === calendarEntry.start
            );
            const end = item.fields.find((i) => i.id === calendarEntry.end);
            const startDate = parseDate(start.value).tz(timeZone);
            const endDate = parseDate(end.value).tz(timeZone);
            let newEntry = true;
            const tempTableRowData = generateRowData(itemEntry, options);
            const tableRowData = { ...tempTableRowData, title, start, end, id };
            if (startDate.isSame(endDate, 'day')) {
                tableRowData.subTitle =
                    startDate.format('dddd, MMM DD, YYYY h:mm a') +
                    ' - ' +
                    endDate.format('h:mm a');
            } else {
                tableRowData.subTitle =
                    startDate.format('dddd, MMM DD, YYYY h:mm a') +
                    ' - ' +
                    endDate.format('dddd, MMM DD, YYYY h:mm a');
            }

            if (startDate && endDate) {
                let date = startDate.clone();
                do {
                    const dateKey = date.format('YYYY-MM-DD');
                    if (!markedDates[dateKey]) {
                        markedDates[dateKey] = {
                            dots: [],
                            selectedColor: GlobalColors.primaryButtonColor
                        };
                    }
                    if (markedDates[dateKey].dots.length < 4) {
                        markedDates[dateKey].dots.push({
                            key: item.fields[calendarEntry.id],
                            color: GlobalColors.primaryButtonColor,
                            selectedDotColor: tempTableRowData?.eventColor
                        });
                    }
                    tableData.push(tableRowData);
                    if (dataClusters[dateKey]) {
                        dataClusters[dateKey].push(tableRowData);
                    } else {
                        dataClusters[dateKey] = [tableRowData];
                    }

                    if (newEntry) {
                        if (dataClustersForFlatlist[dateKey]) {
                            dataClustersForFlatlist[dateKey].push(tableRowData);
                        } else {
                            dataClustersForFlatlist[dateKey] = [tableRowData];
                        }
                    }
                    newEntry = false;
                    date = date.add(1, 'day');
                } while (date.isSameOrBefore(endDate, 'day'));
            }
        });
    }
    const actions = new Map();
    if (confirmAction) {
        actions.set('confirmAction', confirmAction);
    }
    if (allowRefresh) actions.set('refreshAction', 'Refresh');

    sectionListdata = convertDataClustersToTableEntry(dataClustersForFlatlist);
    return {
        data,
        options,
        renderCalendarSwitch: !!calendarEntry,
        calendarAvailable: !!calendarEntry,
        markedDates,
        dataClusters,
        tableLoaded: true,
        actions,
        tableData,
        sectionListdata
    };
};

const convertDataClustersToTableEntry = (dataClusters) => {
    let tableEntry = [];
    Object.keys(dataClusters).forEach((date) => {
        tableEntry.push({ title: date, data: dataClusters[date] });
    });
    tableEntry.sort((a, b) => {
        if (moment(a.title).isBefore(b.title)) return -1;
        return 1;
    });
    return tableEntry;
};

export { configureTable, convertDataClustersToTableEntry };
