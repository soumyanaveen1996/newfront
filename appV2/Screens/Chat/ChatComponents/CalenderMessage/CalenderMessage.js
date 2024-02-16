import React from 'react';
import { Text, View, SectionList, LayoutAnimation, Image } from 'react-native';
import { ActivityIndicator, Button } from 'react-native-paper';
import { Calendar } from 'react-native-calendars';
import { Card, Icon } from '@rneui/themed';
import XDate from 'xdate';

import moment from 'moment';
import styles from '../TableMessage/styles';
import GlobalColors from '../../../../config/styles';
import { configureTable } from './CalenderMessageHelper';
import { TableMessage } from '../TableMessage/TableMessageV2';
import { Auth } from '../../../../lib/capability';
import images from '../../../../images';
import { PrimaryButton } from '../../../../widgets/PrimaryButton';
import AppFonts from '../../../../config/fontConfig';

export class CalenderMessage extends TableMessage {
    generatetableData = (data, options) => {
        const user = Auth.getUserData();
        const tableData = configureTable(
            data,
            options,
            user.tz ? user.tz : moment.tz.guess()
        );
        if (this.state.calendarMode == null) {
            tableData.calendarMode = tableData.calendarAvailable;
        }
        // will stop loader on refresh action and pull to refresh
        if (this.state.refreshing) {
            this.setState({ refreshing: false });
        }
        const startDate = options.startDate
            ? moment.utc(options.startDate).tz(user.tz)?.format('YYYY-MM-DD')
            : undefined;
        console.log(`~~~ start date  : ${startDate}`);
        this.setState({ ...tableData, startDate }, () => {
            if (this.state.selectedDay) {
                this.selectDay(this.state.selectedDay);
            }
        });
    };

    getCurrentState = () => this.state.data;

    selectDay = (day) => {
        const { dataClusters, markedDates, selectedDay } = this.state;
        // if (selectedDay && selectedDay.dateString === day.dateString) {
        //     return;
        // }
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
            openIndexes: []
        });
    };

    onTodayPress = () => {
        const date = { dateString: moment().format('YYYY-MM-DD') };
        this.selectDay(date);
        this.sendSearchMessage(
            undefined,
            moment
                .utc(date.dateString, 'YYYY-MM-DD')
                .startOf('month')
                .valueOf(),
            0
        );
    };

    renderRnderCalendarView = () => {
        const {
            showSearchBar,
            markedDates,
            showFilterScreen,
            selectedDay,
            startDate,
            searchRequested
        } = this.state;
        if (!showSearchBar) {
            return (
                <Card
                    containerStyle={{
                        margin: 0,
                        borderRadius: 10,
                        borderWidth: 0,
                        backgroundColor: GlobalColors.tableItemBackground
                    }}
                >
                    <Calendar
                        key={selectedDay ? selectedDay.dateString : startDate}
                        ref={(view) => {
                            this.calendarView = view;
                        }}
                        current={
                            selectedDay ? selectedDay.dateString : startDate
                        }
                        selectedDate={
                            selectedDay ? selectedDay.dateString : startDate
                        }
                        onMonthChange={(date) => {
                            console.log('~~~~~~~~ month change', date);
                            this.sendSearchMessage(
                                undefined,
                                moment
                                    .utc(date.dateString, 'YYYY-MM-DD')
                                    .startOf('month')
                                    .valueOf(),
                                0
                            );
                        }}
                        markedDates={markedDates}
                        markingType="multi-dot"
                        onDayPress={this.selectDay}
                        style={styles.calendar}
                        theme={{
                            backgroundColor: GlobalColors.tableItemBackground,
                            calendarBackground:
                                GlobalColors.tableItemBackground,
                            textMonthFontWeight: AppFonts.BOLD,
                            textMonthFontSize: 20,
                            monthTextColor: GlobalColors.formText,
                            todayTextColor: GlobalColors.primaryButtonColor,
                            arrowColor: GlobalColors.primaryButtonColor,
                            dayTextColor: GlobalColors.formText,
                            textDisabledColor: GlobalColors.formTextDisabled
                        }}
                    />
                    {searchRequested && (
                        <ActivityIndicator
                            size={'large'}
                            color={GlobalColors.primaryButtonColor}
                            style={{
                                height: '100%',
                                width: '100%',
                                position: 'absolute',
                                borderRadius: 10,
                                backgroundColor: GlobalColors.translucentDark
                            }}
                        />
                    )}
                </Card>
            );
        }
    };

    renderDataList = () => {
        const {
            calendarMode,
            calendarData,
            sectionListdata,
            showSearchBar,
            searchQuery,
            searchApplied,
            openItemKeys,
            options
        } = this.state;
        let dataToRender = [];
        if (calendarMode && !showSearchBar) {
            dataToRender = calendarData;
        } else if (searchApplied) {
            dataToRender = sectionListdata;
        }

        if (dataToRender?.[0]?.data?.length > 0) {
            return (
                <SectionList
                    extraData={openItemKeys}
                    refreshControl={this.getRefreshControl()}
                    sections={dataToRender}
                    keyExtractor={(item, index) => item + index}
                    renderItem={this.renderItem}
                    ItemSeparatorComponent={() => (
                        <View style={styles.separator} />
                    )}
                    renderSectionHeader={this.renderSectionListHeader}
                />
            );
        }
        if (!showSearchBar)
            return (
                <View style={styles.noData}>
                    <Image
                        source={images.no_appointment}
                        style={{ marginTop: 60 }}
                    />
                    <Text style={styles.noDataText}>
                        {options.emptyStateMessage
                            ? options.emptyStateMessage
                            : 'No data found'}
                    </Text>
                    {options.confirmAction && (
                        <PrimaryButton
                            style={{ marginTop: 8 }}
                            text={options.confirmAction}
                            onPress={this.sendConfirmActionMessage}
                        />
                    )}
                </View>
            );
    };

    renderHeaderLeftButton = () => {
        if (!this.state.showSearchBar) {
            return (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {this.state.options.confirmAction && (
                        <Icon
                            name="plus-circle"
                            size={32}
                            type="material-community"
                            color={GlobalColors.primaryButtonColor}
                            containerStyle={{ marginRight: 8 }}
                            onPress={this.sendConfirmActionMessage}
                        />
                    )}
                    <Button
                        style={styles.leftHeaderButton}
                        uppercase={false}
                        onPress={this.onTodayPress}
                        mode="outlined"
                        labelStyle={styles.headerButtonLabel}
                        color={GlobalColors.formText}
                    >
                        Today
                    </Button>
                </View>
            );
        }
    };

    renderSectionListHeader = ({ section: { title } }) => {
        // if(moment(title).toLocaleString)
        const datestring = moment(title).calendar(null, {
            sameDay: '[Today]*DD MMM YYYY',
            nextDay: '[Tomorrow]*DD MMM YYYY',
            nextWeek: 'DD MMM YYYY',
            lastDay: '[Yesterday]*DD MMM YYYY',
            lastWeek: 'DD MMM YYYY',
            sameElse: 'DD MMM YYYY'
        });
        const vals = datestring.split('*');
        return (
            <Card containerStyle={styles.sectionListHeaderContainer}>
                <Text style={styles.seactionListHeaser}>{vals[0]}</Text>
                {vals?.[1] && (
                    <Text style={styles.sectionListSubHeader}>{vals[1]}</Text>
                )}
            </Card>
        );
    };
}
