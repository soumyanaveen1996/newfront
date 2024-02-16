import React, { useEffect, useState, useRef } from 'react';
import { ActivityIndicator, RefreshControl, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { Searchbar } from 'react-native-paper';
import { Message } from '../../../../lib/capability';
import EventEmitter, { TablesEvents } from '../../../../lib/events';
import { ControlDAO } from '../../../../lib/persistence';
import styles from './styles';
import SocialPost from './TimelineItems/SocialPost';
import TimelineFilters from './TimelineItems/TimelineFilters';
import { useNavigation } from '@react-navigation/native';
import Icons from '../../../../config/icons';
import { Icon } from '@rneui/themed';
import GlobalColors from '../../../../config/styles';
import { SocialTimelineEvents } from '../../../../lib/events/Tables';
import SimpleLoader from '../../../../widgets/SimpleLoader';

const TIMELINE_ACTION = {
    BOOKMARK: 'bookmark',
    VIEW: 'view',
    LOAD_MORE: 'loadMore',
    REFRESH: 'refresh',
    SURVEY: 'survey'
};
class TimeLineMessage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            options: {},
            selectedTags: [],
            moreItemsExist: true,
            tags: [],
            showSearch: false,
            showBookmarkedOnly: false,
            surveyStatusMap: {},
            refreshing: false,
            hardFereshing: false,
            alowFilter: true,
            showAuthor: true, // default,
            noMoreData: false
        };

        this.refreshNavigationButtons();
    }

    refreshNavigationButtons = () => {
        this.props.navigation?.setOptions({
            headerRight: () => (
                <View
                    style={{
                        flexDirection: 'row'
                    }}
                >
                    {/* <Icon
                        containerStyle={styles.tabIconStyle}
                        size={24}
                        name={this.state.showSearch ? 'close' : 'search'}
                        color={
                            this.state.showSearch
                                ? '#638dff80'
                                : GlobalColors.primaryButtonColor
                        }
                        onPress={this.onSearchPress}
                    /> */}
                    <Icon
                        size={24}
                        containerStyle={styles.tabIconStyle}
                        name={
                            this.state.showBookmarkedOnly
                                ? 'bookmark'
                                : 'bookmark-outline'
                        }
                        type={'material'}
                        onPress={this.onBookmarkPress}
                        color={GlobalColors.white}
                    />
                </View>
            )
        });
    };

    componentDidMount() {
        ControlDAO.getOptionsById(this.props.localControlId).then((o) => {
            ControlDAO.getContentById(this.props.localControlId).then(
                (data) => {
                    this.setState({
                        data: data.rows,
                        options: o,
                        tags: data.tags,
                        selectedTags: data.selectedTags,
                        nextSkip: data.nextSkip,
                        showAuthor:
                            data.options &&
                            data.options.hasOwnProperty('showAuthor')
                                ? data.options.showAuthor
                                : true
                    });
                }
            );
        });
        this.listener = EventEmitter.addListener(
            TablesEvents.updateTable,
            this.timelineUpdate
        );
        this.surveyListener = EventEmitter.addListener(
            SocialTimelineEvents.sutveyStatus,
            this.onSurveyUpdate
        );
    }

    onSurveyUpdate = (surveyInfo) => {
        const newSurveyStatus = this.state.surveyStatusMap;
        newSurveyStatus[surveyInfo.id] = surveyInfo.status;
        this.setState({ surveyStatusMap: newSurveyStatus });
    };

    componentWillUnmount() {
        this.listener?.remove();
        this.surveyListener?.remove();
    }

    onSearchPress = () => {
        this.setState({ showSearch: !this.state.showSearch }, () => {
            this.refreshNavigationButtons();
        });
    };

    onBookmarkPress = () => {
        this.setState(
            { showBookmarkedOnly: !this.state.showBookmarkedOnly, data: [] },
            () => {
                this.refreshNavigationButtons();
                if (this.state.showBookmarkedOnly) {
                    const msg = {
                        action: TIMELINE_ACTION.REFRESH,
                        content: {
                            showBookmarked: true,
                            tags: []
                        },
                        controlId: this.state.options.controlId,
                        tabId: this.state.options.tabId
                    };
                    this.sendMessageToBot(msg);
                } else {
                    const msg = {
                        action: TIMELINE_ACTION.REFRESH,
                        content: {
                            showBookmarked: false,
                            tags: []
                        },
                        controlId: this.state.options.controlId,
                        tabId: this.state.options.tabId
                    };
                    this.sendMessageToBot(msg);
                }
            }
        );
    };

    onSearchTextChange = (text) => {};

    timelineUpdate = (message) => {
        // console.log('the DAMMMMM DATA', message.getMessage());
        if (message.getMessage() === 'No posts found.') {
            this.setState({ noMoreData: true });
            return;
        }

        if (
            this.state.options.tabId &&
            message.getMessageOptions()?.tabId === this.state.options.tabId
        ) {
            if (
                this.state.options.controlId &&
                message.getMessageOptions()?.controlId ===
                    this.state.options.controlId
            ) {
                const newData = message.getMessage();
                const newOptions = message.getMessageOptions();
                console.log(`~~~~ timelineMessageUpdate`, newData, newOptions);

                this.setState({
                    data:
                        newOptions.action === 'loadMore'
                            ? [...this.state.data, ...newData.rows]
                            : newData?.rows,
                    options: newOptions,
                    tags: newData?.tags,
                    selectedTags: newData.selectedTags,
                    loadMore:
                        newOptions.action === 'loadMore'
                            ? false
                            : this.state.loadMore,
                    moreItemsExist: newData.rows.length > 0 ? true : false,
                    nextSkip: newData.nextSkip,
                    hardFereshing: false,
                    alowFilter: true
                });
                if (newOptions.action === 'loadMore')
                    this.setState({ refreshing: false });
            } else {
                //TODO
            }
        }
    };
    handleItemViewCHanges = (viewableItems) => {
        viewableItems.changed.forEach((viewableItem) => {
            if (viewableItem.isViewable) {
                const msg = {
                    action: TIMELINE_ACTION.VIEW,
                    content: {
                        contentId: viewableItem.item.contentId
                    },
                    controlId: this.state.options.controlId,
                    tabId: this.state.options.tabId
                };
                this.sendMessageToBot(msg);
            }
        });
    };

    getResponseMessage = (msg, options) => {
        const message = new Message();
        message.messageByBot(false);
        message.timeLineResponseMessage(msg, options);
        return message;
    };

    sendMessageToBot = (msg, options) => {
        // console.log('i m kkkkkkkkkkkkkkkkkkk');
        const message = this.getResponseMessage(msg, options);
        message.setCreatedBy(this.props.userId);
        this.props.sendMessage(message);
    };

    onFilterPress = (tag, selectionStatus) => {
        if (this.state.alowFilter)
            this.setState({ data: [], alowFilter: false }, () => {
                const newTags = selectionStatus
                    ? [...this.state.selectedTags, tag]
                    : this.state.selectedTags.filter((t) => t != tag);
                const msg = {
                    action: TIMELINE_ACTION.REFRESH,
                    content: {
                        tags: newTags
                    },
                    noMoreData: false,
                    controlId: this.state.options.controlId,
                    tabId: this.state.options.tabId
                };
                this.sendMessageToBot(msg);
                this.setState({ selectedTags: newTags });
            });
    };

    toggleBookmark = (item) => {
        let tempItem = this.state.data.find(
            (i) => i.contentId === item.contentId
        );
        tempItem.isBookmarked = !item.isBookmarked;
        const msg = {
            action: TIMELINE_ACTION.BOOKMARK,
            content: {
                contentId: item.contentId,
                unbookmark: !tempItem.isBookmarked
            },
            controlId: this.state.options.controlId,
            tabId: this.state.options.tabId
        };
        this.sendMessageToBot(msg);

        this.setState({ data: [...this.state.data] });
    };

    loadMore = () => {
        console.log('i m here 123');
        if (this.state.hardFereshing) {
            if (this.state.refreshing) {
                this.setState({ refreshing: false });
            }
            return;
        } else if (this.state.refreshing || !this.state.moreItemsExist) {
            return;
        }
        // console.log('i m here 123');

        this.setState({ refreshing: true }, () => {
            const msg = {
                action: TIMELINE_ACTION.LOAD_MORE,

                content: {
                    tags: this.state.selectedTags,
                    skip: this.state.nextSkip,
                    showBookmarked: this.state.showBookmarkedOnly
                },
                controlId: this.state.options.controlId,
                tabId: this.state.options.tabId
            };
            this.sendMessageToBot(msg);
        });
    };

    startSurvey = (id) => {
        this.setState({ refreshing: true }, () => {
            const msg = {
                action: TIMELINE_ACTION.SURVEY,
                content: {
                    surveyId: id
                },
                controlId: this.state.options.controlId,
                tabId: this.state.options.tabId
            };
            this.sendMessageToBot(msg);
        });
    };

    renderItem = ({ item }) => {
        return (
            <SocialPost
                item={item}
                toggleBookmark={this.toggleBookmark}
                startSurvey={this.startSurvey}
                surveyStatusMap={this.state.surveyStatusMap}
                showAuthor={this.state.showAuthor}
            />
        );
    };

    sendRefreshMessage = () => {
        // will show loader on refreh action
        this.setState({ hardFereshing: true });
        const {
            options: { tabId, controlId }
        } = this.state;

        const msg = {
            tabId,
            controlId,
            action: TIMELINE_ACTION.REFRESH,
            content: {
                showBookmarked: false,
                tags: []
            }
        };
        this.sendMessageToBot(msg);
    };

    getRefreshControl = () => {
        return (
            <RefreshControl
                tintColor={GlobalColors.primaryButtonColor}
                onRefresh={async () => {
                    this.sendRefreshMessage();
                }}
                refreshing={this.state.hardFereshing}
            />
        );
    };

    render() {
        const { data, tags, selectedTags } = this.state;
        return (
            <View style={styles.container}>
                {this.state.showSearch && (
                    <Searchbar
                        style={{ borderRadius: 10, margin: 12 }}
                        placeholder="Search"
                        clearIcon="close"
                        onChangeText={this.onSearchTextChange}
                        value={this.state.searchQuery}
                        inputStyle={{ fontSize: 14, color: '#2a2d3c' }}
                    />
                )}

                <TimelineFilters
                    items={tags}
                    selectedItems={selectedTags}
                    onPress={this.onFilterPress}
                />

                <FlatList
                    refreshControl={this.getRefreshControl()}
                    data={data}
                    // style={{ flex: 1 }}
                    renderItem={this.renderItem}
                    keyExtractor={(item) => item.contentId}
                    onViewableItemsChanged={this.handleItemViewCHanges}
                    ListFooterComponent={() => {
                        if (this.state.refreshing && !this.state.noMoreData) {
                            return (
                                <SimpleLoader
                                    style={{ padding: 4 }}
                                    size={'small'}
                                />
                            );
                        } else return null;
                    }}
                    ItemSeparatorComponent={() => {
                        return (
                            <View
                                style={{
                                    height: 12
                                }}
                            />
                        );
                    }}
                    onEndReached={({ distanceFromEnd }) => {
                        // if (distanceFromEnd < 0) return;
                        console.log('~~~~ end reached');
                        if (!this.state.noMoreData) {
                            if (!this.state.refreshing) this.loadMore();
                        } else {
                            this.setState({ refreshing: false });
                        }
                    }}
                />
            </View>
        );
    }
}
export default TimeLineMessage;
