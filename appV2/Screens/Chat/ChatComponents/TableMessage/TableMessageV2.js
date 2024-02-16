import React from 'react';
import {
    Text,
    View,
    LayoutAnimation,
    UIManager,
    ActivityIndicator,
    Platform,
    TouchableOpacity,
    RefreshControl
} from 'react-native';
import { Card, Icon } from '@rneui/themed';
import ActionSheet from 'react-native-action-sheet';
import { Button } from 'react-native-paper';

import debounce from 'lodash/debounce';
import moment from 'moment';
import { FlatList, ScrollView } from 'react-native-gesture-handler';
import styles from './styles';
import { ControlDAO } from '../../../../lib/persistence';
import EventEmitter, {
    FormsEvents,
    TablesEvents
} from '../../../../lib/events';
import { Auth, Message, Utils } from '../../../../lib/capability';
import GlobalColors from '../../../../config/styles';
import ContainersEvents from '../../../../lib/events/Containers';
import {
    configureTable,
    deleteTableRow,
    updateTableRow,
    deleteTableRowByIds,
    updateTableRowFields
} from './TableHelper';
import TableRow from './TableRow';
import BottomSheet from '../Widgets/BottomSheet';
import FilterView from '../Widgets/FilterView';
import {
    tableActions,
    tableActions as tableEvents
} from '../Form2Message/config';
import { updateNonConvControlsList } from '../../../../redux/actions/UserActions';
import Store from '../../../../redux/store/configureStore';
import FilterList from './FilterList';
import NavigationAction from '../../../../navigation/NavigationAction';
import Icons from '../../../../config/icons';
import SearchBar from '../../../../widgets/SearchBar';
import _ from 'lodash';

export const TablesActions = {
    ON_ACTION: 'onAction',
    ON_QUICK_ACTION: 'quickAction',
    ON_SELECTION: 'onSelection',
    ON_SAVE: 'onSave',
    ON_FILTER: 'filter',
    ON_FILTER_DELETE: 'filterDelete',
    CLOSE: 'close',
    ON_MENU_ACTION: 'onMenuAction',
    ON_CONFIRM_ACTION: 'onConfirm',
    ON_FIELD_ACTION: 'onFieldAction',
    ON_REFRESH: 'onRefresh',
    ON_SEARCH: 'search',
    ON_DELETE_FILTER: 'filterDelete',
    ON_EDIT_FILTER: 'editFilter',
    ON_MOVE: 'move',
    ON_CLEAR_SEARCH: 'clearSearch',
    ON_CLEAR_FILTER: 'clearFilter',
    ON_DELETE: 'onDelete',
    ON_DISCARD: 'onDiscard',
    ON_MULTI_SELECT: 'multipleSelection',
    ON_NEXT_PAGE: 'nextPage'
};

export const TableOptions = {
    refreshAction: 'refreshAction',
    newRowAction: 'newRowAction',
    confirmAction: 'confirmAction'
};
export class TableMessage extends React.Component {
    constructor(props) {
        super(props);
        if (Platform.OS === 'android') {
            if (UIManager.setLayoutAnimationEnabledExperimental) {
                UIManager.setLayoutAnimationEnabledExperimental(true);
            }
        }

        this.state = {
            data: [],
            calendarData: [], // Used in caldener message
            options: {},
            openIndexes: [],
            selectedItems: [],
            calendarMode: null,
            markedDates: {},
            dataClusters: {},
            tableLoaded: false,
            searchQuery: '',
            showSearchBar: false,
            showFilterBar: false,
            showFilterScreen: false,
            searchApplied: false,
            openItemKeys: [], // used in calender message,
            showHeaderButtons: true, // used in map mesasge to hide deafult buttons on top, and to show buttons inside map,
            searchRequested: false,
            refreshing: false, // for pull to refresh for table messages and calender
            loadingMore: false,
            showTableRowActionSheet: false,
            multiSelectInitialized: false,
            timeZone: Auth.getUserData().tz || moment.tz.guess(),
            rowActionSheet: false
        };
        this.listerns = {};
        this.filterModal = React.createRef();
        this.parentDocId = props.parentMessageOptions
            ? props.parentMessageOptions.docId
            : null;
    }

    async componentDidMount() {
        const { localControlId } = this.props;
        const data = await ControlDAO.getContentById(localControlId);
        const options = await ControlDAO.getOptionsById(localControlId);
        this.generatetableData(data, options);
        this.eventListeners = [];
        this.eventListeners.push(
            EventEmitter.addListener(TablesEvents.updateTable, this.updateTable)
        );
        this.eventListeners.push(
            EventEmitter.addListener(
                ContainersEvents.updateTableField,
                this.updateTableContainer.bind(this)
            )
        );
        this.eventListeners.push(
            EventEmitter.addListener(TablesEvents.newInfo, this.newInfoHandle)
        );
        this.eventListeners.push(
            EventEmitter.addListener(
                TablesEvents.templateUpdate,
                this.templateUpdate
            )
        );
        this.eventListeners.push(
            EventEmitter.addListener(TablesEvents.change, this.handleChnage)
        );
    }

    handleChnage = (message) => {
        if (
            message.getMessageOptions().tableId === this.state.options.tableId
        ) {
            if (message.getMessageOptions().docId) {
                if (
                    message.getMessageOptions().action === tableActions.CHANGE
                ) {
                    const messageData = message.getMessage();
                    if (messageData.fields) {
                        console.log('~~~ ******* about to updateTableRow ');
                        const newtableData = updateTableRowFields(
                            message.getMessageOptions().docId,
                            messageData.fields,
                            this.state.tableData,
                            message.getMessageOptions(),
                            this.state.options
                        );
                        this.setState({
                            tableData: newtableData
                        });
                        EventEmitter.emit(FormsEvents.change, message);
                    } else if (messageData.deleteRow) {
                        const updatedEntries = deleteTableRowByIds(
                            messageData.deleteRow,
                            this.state.tableData
                        );
                        this.setState({
                            tableData: updatedEntries
                        });
                    } else {
                        console.log(
                            '~~~ ******* updateTableRow  not present, emitting form change'
                        );
                        EventEmitter.emit(FormsEvents.change, message);
                    }
                }
            } else if (
                message.getMessageOptions().action === tableActions.CHANGE
            ) {
                const messageData = message.getMessage();
                const options = message.getMessageOptions();
                if (messageData.append) {
                    console.log(`~~~~ calling generatetableData 2 for append`);
                    this.generatetableData(messageData.append, options, true);
                }
            } else {
                //TDOD
                console.log(
                    '~~~~~ TablesEvents.handleChnage handleChnage toable to be updated ??TODO'
                );
            }
        }
    };

    templateUpdate = (message) => {
        if (
            message.getMessageOptions().tableId === this.state.options.tableId
        ) {
            this.state.options.columnTemplate =
                message.getMessageOptions().columnTemplate;
            this.setState({ options: this.state.options });
        }
    };

    newInfoHandle = (message) => {
        if (this.state.waitingForeNewFilterInfo) {
            if (
                message.getMessageOptions().action === tableEvents.RESULT_FILTER
            ) {
                this.setState({ waitingForeNewFilterInfo: false });
                resultList =
                    message.getMessageOptions()?.filteredColumns?.results;
                field = message.getMessageOptions()?.filteredColumns?.field;
                if (this.listerns[field]) {
                    this.listerns[field](resultList);
                }
            } else if (
                message.getMessageOptions().action === tableEvents.CHANGE_FILTER
            ) {
                this.setState({
                    showFilterScreen: true,
                    showSearchBar: false,
                    showFilterBar: false,
                    showAvailableFilterList: false,
                    waitingForeNewFilterInfo: false,
                    newFiltreredColumns:
                        message.getMessageOptions()?.filteredColumns,
                    editMode: true
                });
            }
        }
    };

    componentWillUnmount() {
        if (this.eventListeners) {
            this.eventListeners.forEach((listener) => {
                listener.remove();
            });
        }
    }

    toggleCalendarMode = () => {
        if (Platform.OS === 'ios')
            LayoutAnimation.configureNext(
                LayoutAnimation.Presets.easeInEaseOut
            );
        this.setState((prevState) => ({
            calendarMode: !prevState.calendarMode
        }));
    };

    toggleSearchVisibility = () => {
        if (Platform.OS === 'ios')
            LayoutAnimation.configureNext(
                LayoutAnimation.Presets.easeInEaseOut
            );
        if (this.state.showSearchBar && this.state.searchApplied) {
            this.sendSimpleActionMessage(TablesActions.ON_CLEAR_SEARCH);
        }
        this.setState((prevState) => ({
            showSearchBar: !prevState.showSearchBar,
            showFilterBar: false,
            showFilterScreen: false,
            openIndexes: [],
            openItemKeys: []
        }));
    };

    toggleFilterVisibility = () => {
        const { options } = this.state;
        if (Platform.OS === 'ios')
            LayoutAnimation.configureNext(
                LayoutAnimation.Presets.easeInEaseOut
            );
        if (options?.availableFilters?.length > 0) {
            if (options?.activeFilterName) {
                this.setState((prevState) => ({
                    showFilterBar: !prevState.showFilterBar,
                    showSearchBar: false
                }));
                return;
            }
            this.setState((prevState) => ({
                showAvailableFilterList: true,
                selectedFilterName: options?.activeFilterName,
                selectedFilterItem: options?.availableFilters?.find(
                    (item) => item.name === options?.activeFilterName
                )
            }));
        } else {
            this.setState((prevState) => ({
                showFilterScreen: !prevState.showFilterScreen,
                showSearchBar: false
            }));
        }
    };

    updateTable = async (message) => {
        console.log(`~~~~ calling update table 2 `, message);
        //changing from .tableId to .tabId
        if (message.getMessageOptions()?.tabId === this.state.options.tabId) {
            if (
                message.getMessageOptions()?.controlId ===
                this.state.options.controlId
            ) {
                const data = message.getMessage();
                const options = message.getMessageOptions();
                console.log(`~~~~ calling generatetableData 2`);
                this.generatetableData(data, options);
                if (options.activeQueryString) {
                    console.log(
                        `~~~ querry actve: ${options.activeQueryString}`
                    );
                    this.setState({
                        searchApplied: true,
                        searchRequested: false
                    });
                } else {
                    this.setState({ searchRequested: false });
                }
            } else {
                //TODO
            }
        }
    };

    generatetableData = (data, options, isApend = false) => {
        const tableData = configureTable(data, options);
        console.log('~~~~~~ table data generated', tableData);
        if (this.state.calendarMode == null) {
            tableData.calendarMode = tableData.calendarAvailable;
        }
        if (isApend) {
            this.setState((prevstate) => {
                return {
                    data: [...prevstate.data, ...tableData.data],
                    tableData: [...prevstate.tableData, ...tableData.tableData],
                    nextPage: tableData.nextPage,
                    loadingMore: false
                };
            });
        } else {
            this.setState({ ...tableData }, () => {
                if (this.state.selectedDay) {
                    this.selectDay(this.state.selectedDay);
                }
            });
            if (this.state.refreshing) {
                this.setState({ refreshing: false });
            }
        }
    };

    updateTableContainer(message) {
        console.log(`~~~~ calling update table contaioner `);
        if (message.options.tableId === this.state.options.tableId) {
            const data = message.rows;
            const { options } = message;
            this.generatetableData(data, options);
        }
    }

    getCurrentState = () => {
        const rows = this.state.tableData.map((row) => {
            const col = {};
            row.fields.map((entry) => {
                col[entry.id] = entry.value;
            });
            return col;
        });
        console.log('~~~ table getCurrentState ', rows);
        return { responseData: { fields: rows } };
    };

    selectDay = (day) => {
        const { dataClusters, markedDates, selectedDay } = this.state;
        if (selectedDay && selectedDay.dateString === day.dateString) {
            return;
        }
        const selectedDate = day.dateString;
        const updatedMarkedDates = {};
        Object.keys(markedDates).forEach((dateKey) => {
            updatedMarkedDates[dateKey] = { ...markedDates[dateKey] };
            updatedMarkedDates[dateKey].selected = false;
        });
        if (!updatedMarkedDates[selectedDate]) {
            updatedMarkedDates[selectedDate] = {
                selectedColor: GlobalColors.primaryButtonColor
            };
        }
        updatedMarkedDates[selectedDate].selected = true;
        this.setState({
            markedDates: updatedMarkedDates,
            calendarData: [
                { title: day.dateString, data: dataClusters[selectedDate] }
            ],
            selectedDay: day,
            openIndexes: [],
            openItemKeys: []
        });
    };

    setOpenIndex = (index) => {
        if (Platform.OS === 'ios') {
            LayoutAnimation.configureNext(
                LayoutAnimation.Presets.easeInEaseOut
            );
        }
        this.state.openIndexes[index] = !this.state.openIndexes[index];
        this.setState({ openIndexes: this.state.openIndexes });
    };

    generateResponseContent = (item, action) => {
        console.log('** generating response content:', item, action);
        const { options } = this.state;
        const content = {};
        item.fields.forEach((filed) => {
            content[filed.id] = filed.value;
        });
        const msg = {
            tabId: options.tabId,
            docId: item.entryId,
            parentDocId: this.parentDocId ? this.parentDocId : null,
            controlId: options.controlId,
            action: action,
            content
        };
        return msg;
    };

    /**
     * Genertes response content realted toa particular row
     */
    generateInLineRowResponseContent = (msg, docId, newRow = false) => {
        const { options } = this.state;

        if (msg.action === TablesActions.ON_SAVE) {
            const newtableData = updateTableRow(
                docId,
                msg.fields,
                this.state.tableData,
                this.state.options
            );
            this.setState({
                tableData: newtableData
            });
        }
        if (msg.action === TablesActions.ON_DISCARD) {
            const content = {};
            content[docId] = { fields: msg.fields };
            msg.content = content;
        }
        return {
            action: msg.action,
            content: msg.content ? msg.content : msg.fields,
            currentField: msg.currentField,
            controlId: options.controlId,
            tabId: options.tabId,
            parentDocId: this.parentDocId,
            newRow: newRow,
            docId: docId
        };
    };

    sendActionMessage = (item) => {
        console.log('~~~~ sendActionMessage tablemessage', item);
        const { nonConvOnAction, conversational } = this.props;
        this.sendMessage(
            this.generateResponseContent(item, TablesActions.ON_ACTION)
        );
        if (conversational === false) {
            nonConvOnAction?.();
        }
    };

    onQuickAction = (item) => {
        const { nonConvOnAction, conversational } = this.props;
        this.sendMessage(
            this.generateResponseContent(item, TablesActions.ON_QUICK_ACTION)
        );
        if (conversational === false) {
            nonConvOnAction?.();
        }
    };

    sendDeleteResponse = (item) => {
        //TODO
    };

    sendFilterAction = (filters, options, filterName) => {
        const msg = {
            action: TablesActions.ON_FILTER,
            tabId: options.tabId,
            controlId: options.controlId,
            content: {
                field: filters,
                activeFilterName: filterName || []
            }
        };
        this.sendMessage(msg);
        this.setState({ showFilterScreen: false, newFiltreredColumns: null });
    };

    sendFilterDelete = (filterName) => {
        const { options } = this.state;

        const msg = {
            action: TablesActions.ON_DELETE_FILTER,
            tabId: options.tabId,
            controlId: options.controlId,
            content: {
                activeFilterName: filterName
            }
        };
        this.sendMessage(msg);
        this.setState({ showFilterScreen: false, newFiltreredColumns: null });
    };

    sendEditFilter = (filterName) => {
        const { options } = this.state;
        const msg = {
            action: TablesActions.ON_EDIT_FILTER,
            tableId: options.tableId,
            tabId: options.tabId,
            controlId: options.controlId,
            content: {
                activeFilterName: filterName
            }
        };
        this.sendMessage(msg);
        this.setState({
            showFilterScreen: false,
            showAvailableFilterList: false,
            showSearchBar: false,
            showFilterBar: false,
            newFiltreredColumns: null,
            waitingForeNewFilterInfo: true
        });
    };

    applySelectedFilter = () => {
        const { options, selectedFilterName } = this.state;
        const msg = {
            action: TablesActions.ON_FILTER,
            tableId: options.tableId,

            tabId: options.tabId,
            controlId: options.controlId,
            content: {
                activeFilterName: selectedFilterName
            }
        };
        this.sendMessage(msg);
        this.setState({
            showAvailableFilterList: false,
            selectedFilterName: null,
            selectedFilterItem: null
        });
    };

    clearFilter = () => {
        this.sendSimpleActionMessage(TablesActions.ON_CLEAR_FILTER);
        this.setState({ showAvailableFilterList: false });
    };

    sendRefreshMessage = () => {
        if (!this.state.refreshing) {
            // will show loader on refreh action
            this.setState({ refreshing: true });
        }
        const {
            options: { tabId, controlId }
        } = this.state;

        const msg = {
            tabId,
            controlId,
            action: TablesActions.ON_REFRESH
        };
        this.sendMessage(msg);
        this.setState({ searchApplied: false });
    };

    sendSimpleActionMessage = (action) => {
        const {
            options: { tabId, controlId }
        } = this.state;

        const msg = {
            tabId,
            controlId,
            action
        };
        this.sendMessage(msg);
    };

    sendSearchMessage(queryString, date, timeScaleView) {
        const {
            options: { tableId, controlId, tabId }
        } = this.state;

        const msg = {
            tableId,
            tabId,
            controlId,
            action: TablesActions.ON_SEARCH,
            queryString,
            date,
            timeScaleView
        };
        this.sendMessage(msg);
        this.setState({
            queryString,
            sectionListdata: [],
            searchRequested: true
        });
    }

    onRowMenuOptionSelected(item, selectedOption) {
        this.sendMenuActionMessage(item, selectedOption);
        this.setState({ rowActionSheet: false });
    }

    sendMenuActionMessage(item, option) {
        const { nonConvOnAction, conversational } = this.props;
        const tempRow = {};
        item?.fields?.forEach((element) => {
            tempRow[element.id] = element.value;
        });
        const msg = {
            tabId: this.state.options.tabId,
            controlId: this.state.options.controlId,
            action: TablesActions.ON_MENU_ACTION,
            content: {
                row: tempRow,
                option
            }
        };
        this.sendMessage(msg);
        if (conversational === false) {
            nonConvOnAction?.();
        }
    }

    sendConfirmActionMessage = () => {
        const { tabId, controlId } = this.state.options;
        const msg = {
            tabId: tabId,
            controlId,
            action: TablesActions.ON_CONFIRM_ACTION
        };
        this.sendMessage(msg);
    };

    onFieldAction = (rowData, fileds, lable) => {
        const {
            options: { tableId, controlId, keys, tabId }
        } = this.state;

        const tempRow = {};
        fileds?.forEach((element) => {
            tempRow[element.id] = element.value;
        });

        const message = {
            tableId,
            controlId,
            tabId,
            action: TablesActions.ON_FIELD_ACTION,
            content: { row: tempRow, column: rowData }
        };
        this.sendMessage(message);
    };

    sendSelectionMessage = (action) => {
        this.toggleTableRowActionSheet();
        const { selectedItems, options, tableData, data } = this.state;
        const content = [];
        selectedItems.forEach((row, index) => {
            if (row) {
                content.push(data[index]);
                console.log(index, data[index]);
            }
        });
        const msg = {
            tabId: options.tabId,
            controlId: options.controlId,
            action: TablesActions.ON_MULTI_SELECT,
            selectedAction: action,
            content
        };
        this.sendMessage(msg);
    };

    handleSelection = (item, index) => {
        const { selectedItems, options } = this.state;
        selectedItems[index] = !selectedItems[index];
        this.setState({ selectedItems, multiSelectInitialized: true });
    };

    getDataForLookup = (fieldId, fieldValue, string, callBack) => {
        const { options } = this.state;
        const response = {
            controlId: options.controlId,
            content: { currentFieldValue: string },
            tabId: options.tabId,
            action: TablesActions.ON_SEARCH,
            currentField: fieldId
        };
        this.sendMessage(response);
        this.listerns[fieldId] = callBack;
        this.setState({
            waitingForeNewFilterInfo: true
        });
    };

    closeTable = () => {
        const { options } = this.state;

        const msg = {
            tableId: options.tableId,
            tabId: options.tabId,
            controlId: options.controlId,
            action: TablesActions.CLOSE
        };
        this.sendMessage(msg);
    };

    confirmTable() {
        const { options, data } = this.state;
        const msg = {
            tableId: options.tableId,
            tabId: options.tabId,
            controlId: options.controlId,
            rows: data
        };
        this.sendMessage(msg);
    }

    getResponseMessage = (msg, options) => {
        const message = new Message();
        message.messageByBot(false);
        message.tableResponseMessage(msg, options);
        return message;
    };

    sendMessage = (msg, options) => {
        msg.tz = this.state.timeZone;
        const message = this.getResponseMessage(msg, options);
        message.setCreatedBy(this.props.userId);
        this.props.sendMessage(message);
    };

    sendMessageWrapperForInlineAction = (msg, docId, newRow) => {
        const { options, data } = this.state;
        const message = this.generateInLineRowResponseContent(
            msg,
            docId,
            newRow
        );
        this.sendMessage(message, options);
    };

    onDelete = (item) => {
        const { options } = this.state;
        let content = {};
        content[item.entryId] = item;
        const msg = {
            parentDocId: this.parentDocId,
            docId: item.entryId,
            tableId: options.tableId,
            content,
            tabId: options.tabId,
            action: TablesActions.ON_DELETE,
            controlId: options.controlId
        };
        const message = new Message();
        message.tableResponseMessage(msg, options);
        message.setCreatedBy(this.props.userId);
        this.props.sendMessage(message);
        this.setState({
            tableData: deleteTableRow(item, this.state.tableData)
        });
    };

    onEdit = (item) => {
        const { options } = this.state;
        const message = new Message();

        message.form2Message(item.fields, {
            ...options,
            docId: item.entryId,
            newRow: false,
            minimizeOnConfirm: true
        });
        const incomingMessage = message.toBotDisplay();
        const controlsList =
            Store.getState().bots.nonConvControlsList[this.props.botId];
        Store.dispatch(
            updateNonConvControlsList({
                list: [...controlsList, incomingMessage],
                id: this.props.botId,
                src: 'Tablemessage on edit'
            })
        );
        NavigationAction.pushNew(NavigationAction.SCREENS.fullScreenMessage, {
            origin: 'action_push',
            message,
            conversationId: this.props.conversationId,
            conversationContext: null,
            userId: this.props.userId,
            sendMessage: this.sendMessageWrapperForInlineAction,
            formData: message.getMessage(),
            formMessage: message.getMessageOptions(),
            title: 'test',
            messageIndex: 2,
            botDone: () => {},
            clearCurrentMap: () => {
                this.currentMapId = null;
            },
            // bot: this.bot,
            isWaiting: this.state.isWaiting,
            inlineActions: true,
            bot: { botId: this.props.botId },
            hideLogo: this.props.hideLogo
        });
    };

    handleTableOptionSheetSelect = (k, v) => {
        this.setState({ showTableActionSheet: false });
        switch (k) {
            case TableOptions.confirmAction:
                this.sendConfirmActionMessage();
                break;
            case TableOptions.refreshAction:
                this.sendRefreshMessage();
                break;
            case TableOptions.newRowAction:
                {
                    const { options } = this.state;
                    const message = new Message();
                    message.form2Message(options.columnTemplate, {
                        ...options,
                        docId: Utils.UUID(),
                        newRow: true,
                        minimizeOnConfirm: true
                    });
                    const incomingMessage = message.toBotDisplay();
                    const controlsList =
                        Store.getState().bots.nonConvControlsList[
                            this.props.botId
                        ];
                    Store.dispatch(
                        updateNonConvControlsList({
                            list: [...controlsList, incomingMessage],
                            id: this.props.botId,
                            src: 'Tablemessage on newRowAction'
                        })
                    );
                    NavigationAction.pushNew(
                        NavigationAction.SCREENS.fullScreenMessage,
                        {
                            origin: 'action_push',
                            message,
                            conversationId: this.props.conversationId,
                            conversationContext: null,
                            userId: this.props.userId,
                            sendMessage: this.sendMessageWrapperForInlineAction,
                            title: 'test',
                            formData: message.getMessage(),
                            formMessage: message.getMessageOptions(),
                            messageIndex: 2,
                            botDone: () => {},
                            clearCurrentMap: () => {
                                this.currentMapId = null;
                            },
                            // bot: this.bot,
                            isWaiting: this.state.isWaiting,
                            inlineActions: true,
                            bot: { botId: this.props.botId },
                            hideLogo: this.props.hideLogo
                        }
                    );
                }
                break;
            default:
                break;
        }
    };

    goToMeetingRoom = (value) => {
        NavigationAction.push(NavigationAction.SCREENS.meetingRoom, {
            data: value,
            sendMessage: this.props.sendMessage,
            userId: this.props.userId
        });
    };

    showRowActionSheet = (item) => {
        this.setState({ rowActionSheet: true, rowItem: item });
    };

    showTableActionSheet = () => {
        this.setState({ showTableActionSheet: true, showSelectedItem: false });
    };

    hideFliterListBottomSheet = () => {
        this.setState({ showAvailableFilterList: false });
    };

    onTodayPress = () => {
        this.selectDay({ dateString: moment().format('YYYY-MM-DD') });
    };

    isItemOpen = (index, itemId) => this.state.openIndexes[index];

    loadMore = () => {
        if (!this.state.loadingMore && this.state.nextPage) {
            // will show loader on refreh action
            this.setState({ loadingMore: true }, () => {
                const {
                    options: { tabId, controlId }
                } = this.state;
                const msg = {
                    tabId,
                    controlId,
                    action: TablesActions.ON_NEXT_PAGE
                };
                this.sendMessage(msg);
            });
        }
    };

    renderItem = ({ item, index }) => {
        const { options, selectedItems, timeZone } = this.state;
        return (
            <TableRow
                item={item}
                index={index}
                options={options}
                isOpen={this.isItemOpen(index, item.entryId)}
                isSelected={selectedItems[index]}
                onPressFieldAction={this.onFieldAction}
                onRowSelected={this.setOpenIndex}
                handleSelection={this.handleSelection}
                onPressRowMenu={this.showRowActionSheet}
                onPressRowAction={this.sendActionMessage}
                onQuickAction={this.onQuickAction}
                onDelete={this.onDelete}
                onEdit={this.onEdit}
                timeZone={timeZone}
            />
        );
    };

    onCreateFilterClick = () => {
        this.setState({
            showFilterScreen: true,
            showSearchBar: false,
            showFilterBar: false,
            showAvailableFilterList: false,
            editMode: false
        });
    };

    onFilterClick = (item) => {
        this.setState({
            selectedFilterName: item.name,
            selectedFilterItem: item
        });
    };

    renderFilterListBottomSheet = () => {
        const {
            showAvailableFilterList,
            selectedFilterName,
            selectedFilterItem,
            options
        } = this.state;
        const disableEdit = selectedFilterItem
            ? selectedFilterItem.readOnly
            : true;
        return (
            <FilterList
                showAvailableFilterList={showAvailableFilterList}
                selectedFilterName={selectedFilterName}
                selectedFilterItem={selectedFilterItem}
                options={options}
                hideFliterListBottomSheet={this.hideFliterListBottomSheet}
                onCreateFilterClick={this.onCreateFilterClick}
                onFilterClick={this.onFilterClick}
                applySelectedFilter={this.applySelectedFilter}
                onEditPress={this.onEditPress}
                disableEdit={disableEdit}
            />
        );
    };

    onEditPress = (selectedFilterName) => {
        if (selectedFilterName === this.state.options.activeFilterName) {
            this.setState({
                showFilterScreen: true,
                showSearchBar: false,
                showFilterBar: false,
                showAvailableFilterList: false,
                editMode: true
            });
        } else {
            this.sendEditFilter(selectedFilterName);
        }
    };

    renderTableOptionSheet = () => {
        const { showTableActionSheet, actions } = this.state;
        const keys = Array.from(actions.keys());
        const items = keys.map((k) => (
            <TouchableOpacity
                key={k}
                style={styles.actionSheetItem}
                onPress={() => this.handleTableOptionSheetSelect(k)}
            >
                <Text
                    style={{
                        color: GlobalColors.primaryTextColor,
                        fontSize: 16,
                        justifyContent: 'center'
                    }}
                >
                    {actions.get(k)}
                </Text>
            </TouchableOpacity>
        ));
        if (showTableActionSheet) {
            return (
                <BottomSheet
                    visible={showTableActionSheet}
                    transparent
                    onPressOutside={() => {
                        this.setState({ showTableActionSheet: false });
                    }}
                    onDismiss={() => {}}
                >
                    <View
                        style={{
                            flexGrow: 1,
                            paddingHorizontal: 25
                        }}
                    >
                        {items}
                        <TouchableOpacity
                            style={{ height: 50, justifyContent: 'center' }}
                            disabled={!showTableActionSheet}
                            onPress={() =>
                                this.handleTableOptionSheetSelect('cancel')
                            }
                        >
                            <Text style={styles.actionSheetCancel}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </BottomSheet>
            );
        }
    };

    renderTableRowsOptionButton = () => {
        const { selectionAction } = this.state.options;
        const selectedRows = this.state.selectedItems.filter((i) => i);
        if (selectedRows.length > 0 && selectionAction) {
            if (typeof selectionAction == 'string') {
                return (
                    <Card containerStyle={styles.bootomButtonContainer}>
                        <TouchableOpacity
                            style={styles.multiSelectOptionButton}
                            onPress={() =>
                                this.sendSelectionMessage(selectionAction)
                            }
                        >
                            <Text style={styles.multiSelectOptionButtonText}>
                                {selectionAction}
                            </Text>
                        </TouchableOpacity>
                    </Card>
                );
            } else {
                return (
                    <Card containerStyle={styles.bootomButtonContainer}>
                        <TouchableOpacity
                            style={styles.multiSelectOptionButton}
                            onPress={this.toggleTableRowActionSheet}
                        >
                            <Text style={styles.multiSelectOptionButtonText}>
                                Choose action
                            </Text>
                        </TouchableOpacity>
                    </Card>
                );
            }
        }
    };

    toggleTableRowActionSheet = _.debounce(() => {
        console.log('toggleTableRowActionSheet');
        this.setState({
            showTableRowActionSheet: !this.state.showTableRowActionSheet
        });
    }, 400);

    renderTableRowsOptionSheet = () => {
        const { showTableRowActionSheet, options } = this.state;
        if (showTableRowActionSheet) {
            const items = options.selectionAction.map((k) => (
                <TouchableOpacity
                    key={k}
                    style={styles.actionSheetItem}
                    onPress={() => this.sendSelectionMessage(k)}
                >
                    <Text
                        style={{
                            color: GlobalColors.primaryTextColor,
                            fontSize: 16,
                            justifyContent: 'center'
                        }}
                    >
                        {k}
                    </Text>
                </TouchableOpacity>
            ));

            return (
                <BottomSheet
                    visible={showTableRowActionSheet}
                    transparent
                    onPressOutside={() => {
                        this.setState({ showTableRowActionSheet: false });
                    }}
                    onDismiss={() => {}}
                >
                    <View
                        style={{
                            flexGrow: 1,
                            paddingHorizontal: 25
                        }}
                    >
                        {items}
                        <TouchableOpacity
                            style={{ height: 50, justifyContent: 'center' }}
                            onPress={this.toggleTableRowActionSheet}
                        >
                            <Text style={styles.actionSheetCancel}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </BottomSheet>
            );
        }
    };

    renderRowActionSheet = () => {
        const { rowActionSheet, rowItem } = this.state;
        if (rowActionSheet) {
            let rowMenuOptions = [];
            if (rowItem.rowMenu instanceof Array) {
                rowMenuOptions = rowItem.rowMenu?.map((option) => option.name);
            }

            const items = rowMenuOptions.map((item) => (
                <TouchableOpacity
                    key={item}
                    style={styles.actionSheetItem}
                    onPress={() => this.onRowMenuOptionSelected(rowItem, item)}
                >
                    <Text
                        style={{
                            color: GlobalColors.primaryTextColor,
                            fontSize: 16,
                            justifyContent: 'center'
                        }}
                    >
                        {item}
                    </Text>
                </TouchableOpacity>
            ));

            return (
                <BottomSheet
                    visible={rowActionSheet}
                    transparent
                    onPressOutside={() => {
                        this.setState({ rowActionSheet: false });
                    }}
                    onDismiss={() => {}}
                >
                    <View
                        style={{
                            flexGrow: 1,
                            paddingHorizontal: 25
                        }}
                    >
                        {items}
                        <TouchableOpacity
                            style={{ height: 50, justifyContent: 'center' }}
                            onPress={() => {
                                this.setState({ rowActionSheet: false });
                            }}
                        >
                            <Text style={styles.actionSheetCancel}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </BottomSheet>
            );
        }
    };

    renderFilterScreen = () => {
        const {
            showFilterScreen,
            selectedFilterName,
            newFiltreredColumns,
            editMode,
            options
        } = this.state;
        if (showFilterScreen) {
            return (
                <View style={styles.filterContainer}>
                    <FilterView
                        getDataForLookup={this.getDataForLookup}
                        selectedFilterName={selectedFilterName}
                        options={options}
                        editMode={editMode}
                        newFiltreredColumns={newFiltreredColumns}
                        onCancel={() => {
                            this.setState({
                                showFilterScreen: false,
                                newFiltreredColumns: null
                            });
                        }}
                        onFilterDelete={this.sendFilterDelete}
                        onFilterApply={this.sendFilterAction}
                    />
                </View>
            );
        }
    };

    renderDataList = () => {
        const { showFilterScreen, tableData, openIndexes, options } =
            this.state;
        let dataToRender = [];
        dataToRender = tableData;
        if (!showFilterScreen) {
            if (dataToRender.length > 0) {
                return (
                    <FlatList
                        refreshControl={this.getRefreshControl()}
                        extraData={openIndexes}
                        data={dataToRender}
                        keyExtractor={(item, index) => item.entryId}
                        renderItem={this.renderItem}
                        ItemSeparatorComponent={() => (
                            <View style={styles.separator} />
                        )}
                        ListFooterComponent={() => {
                            if (this.state.loadingMore)
                                return (
                                    <ActivityIndicator
                                        color={GlobalColors.primaryTextColor}
                                        style={{
                                            padding: 4
                                        }}
                                        size={'small'}
                                    />
                                );
                            else return null;
                        }}
                        onEndReached={({ distanceFromEnd }) => {
                            // if (distanceFromEnd < 0) return;
                            console.log('~~~~ end reached');
                            this.loadMore();
                        }}
                    />
                );
            }
            return (
                <View style={styles.noData}>
                    <Text style={styles.noDataText}>
                        {options.emptyStateMessage
                            ? options.emptyStateMessage
                            : 'No data.'}
                    </Text>
                </View>
            );
        }
    };

    renderSearchBar = () => {
        const { searchQuery, options, showSearchBar } = this.state;
        if (options?.allowSearch && showSearchBar) {
            return (
                <View style={styles.searchBar}>
                    <SearchBar
                        style={{ borderRadius: 10 }}
                        placeholder="Search"
                        clearIcon="close"
                        onSubmitEditing={({ nativeEvent: { text } }) => {
                            this.sendSearchMessage(text);
                        }}
                        onChangeText={(query) => {
                            this.setState({ searchQuery: query });
                        }}
                        value={searchQuery}
                        inputStyle={{ fontSize: 14, color: '#2a2d3c' }}
                    />
                </View>
            );
        }
    };

    renderFilterBar = () => {
        const { options, showFilterBar } = this.state;
        if (showFilterBar) {
            return (
                <Card containerStyle={styles.filterBarContainerStyle}>
                    <TouchableOpacity
                        style={styles.filterBarButton}
                        onPress={() => {
                            this.setState({
                                showAvailableFilterList: true,
                                selectedFilterName: options?.activeFilterName,
                                selectedFilterItem:
                                    options?.availableFilters?.find(
                                        (item) =>
                                            item.name ===
                                            options?.activeFilterName
                                    )
                            });
                        }}
                    >
                        <View style={styles.filterBarInnerContainer}>
                            <Icon
                                name="filter-variant"
                                type="material-community"
                                color={GlobalColors.actionButtons}
                            />
                            <Text style={styles.activeFilerName}>
                                {options?.activeFilterName?.toString()}
                            </Text>
                            <Icon
                                style={styles.filterBarIcon}
                                name="close"
                                type="material"
                                color={GlobalColors.actionButtons}
                                onPress={this.clearFilter}
                            />
                            <Icon
                                style={styles.filterBarDropDownIcon}
                                name="arrow-drop-down"
                                type="material"
                                color={GlobalColors.actionButtons}
                                onPress={() => {
                                    this.setState({
                                        showAvailableFilterList: true,
                                        selectedFilterName:
                                            options?.activeFilterName,
                                        selectedFilterItem:
                                            options?.availableFilters?.find(
                                                (item) =>
                                                    item.name ===
                                                    options?.activeFilterName
                                            )
                                    });
                                }}
                            />
                        </View>
                    </TouchableOpacity>
                </Card>
            );
        }
    };

    toggleItemSelection = () => {
        const { selectedItems, tableData } = this.state;
        const selectedRows = selectedItems.filter((i) => i);
        if (selectedRows.length === tableData.length) {
            this.setState({ selectedItems: [] });
        } else {
            this.setState({
                selectedItems: new Array(tableData.length).fill(true)
            });
        }
    };

    getchecklistIcon = () => {
        const { selectedItems, tableData } = this.state;
        const selectedRows = selectedItems.filter((i) => i);
        switch (selectedRows.length) {
            case tableData.length:
                return Icons.checkboxFilled({
                    color: GlobalColors.tableCheckboxSelected,
                    onPress: this.toggleItemSelection
                });
            case 0:
                return Icons.squareOutline({
                    color: GlobalColors.tableCheckboxSelected,
                    onPress: this.toggleItemSelection
                });
            default:
                return Icons.checkboxStatus({
                    color: GlobalColors.tableCheckboxSelected,
                    onPress: this.toggleItemSelection
                });
        }
    };

    renderHeaderLeftButton = () => {
        const { multiSelectInitialized, selectedItems, tableData } = this.state;
        const selectedRows = selectedItems.filter((i) => i);
        if (multiSelectInitialized)
            return (
                <View style={{ flexDirection: 'row', padding: 8 }}>
                    {this.getchecklistIcon()}
                    <Text style={{ marginLeft: 8 }}>
                        {selectedRows.length + ' selected'}
                    </Text>
                </View>
            );
    };

    renderHeaderRightButtons = (
        actionList,
        extraHiddenActions,
        buttonMode = null,
        buttonStyle = {}
    ) => {
        const { options } = this.state;
        return (
            <View style={styles.headerButtonContainer}>
                {actionList?.refresh && (
                    <Button
                        color={
                            options.activeQueryString
                                ? GlobalColors.primaryButtonColor
                                : GlobalColors.actionButtons
                        }
                        compact
                        mode={buttonMode}
                        style={buttonStyle}
                        icon="refresh"
                        onPress={this.sendRefreshMessage}
                    />
                )}
                {options?.allowSearch && (
                    <Button
                        color={
                            options.activeQueryString
                                ? GlobalColors.primaryButtonColor
                                : GlobalColors.actionButtons
                        }
                        compact
                        mode={buttonMode}
                        style={buttonStyle}
                        icon="magnify"
                        onPress={this.toggleSearchVisibility}
                    />
                )}
                {options?.filterActive && (
                    <Button
                        color={
                            options.activeFilterName?.length > 0
                                ? GlobalColors.primaryButtonColor
                                : GlobalColors.actionButtons
                        }
                        style={buttonStyle}
                        compact
                        mode={buttonMode}
                        icon="filter-variant"
                        onPress={this.toggleFilterVisibility}
                    />
                )}

                {extraHiddenActions && extraHiddenActions.size > 0 && (
                    <Button
                        compact
                        mode={buttonMode}
                        style={buttonStyle}
                        color={GlobalColors.actionButtons}
                        icon="dots-vertical"
                        onPress={this.showTableActionSheet}
                    />
                )}
            </View>
        );
    };

    getRefreshControl = () => {
        if (this.state.options.allowRefresh)
            return (
                <RefreshControl
                    onRefresh={async () => {
                        await this.setState({ refreshing: true });
                        this.sendRefreshMessage();
                    }}
                    refreshing={this.state.refreshing}
                />
            );
    };

    renderContent = () => {
        const { showFilterScreen, tableData } = this.state;
        if (!showFilterScreen) {
            return (
                <View style={{ flex: 1 }}>
                    {this.renderRnderCalendarView()}
                    {this.renderDataList()}
                </View>
            );
        }
    };

    renderRnderCalendarView = () =>
        /**
         * no calnder i=for table message, override in clandermessage
         */
        null;

    renderHeaderButtons = () => {
        const { actions, mapView } = this.state;
        if (mapView) return null;
        return (
            <View style={styles.buttonsContainer}>
                <View style={styles.switchContainer}>
                    {this.renderHeaderLeftButton()}
                </View>
                {this.renderHeaderRightButtons(null, actions)}
            </View>
        );
    };
    render() {
        const { tableLoaded, showFilterScreen } = this.state;
        if (!tableLoaded) {
            return (
                <View style={[styles.container, { justifyContent: 'center' }]}>
                    <ActivityIndicator />
                </View>
            );
        }

        return (
            <View style={styles.container}>
                <View style={{ flex: 1 }}>
                    {!showFilterScreen && this.renderHeaderButtons()}
                    {this.renderFilterBar()}
                    {this.renderSearchBar()}
                    {this.renderContent()}
                    {this.renderFilterScreen()}
                    {this.renderFilterListBottomSheet()}
                    {this.renderTableOptionSheet()}
                    {this.renderTableRowsOptionSheet()}
                    {this.renderRowActionSheet()}
                </View>
                {this.renderTableRowsOptionButton()}
            </View>
        );
    }
}
