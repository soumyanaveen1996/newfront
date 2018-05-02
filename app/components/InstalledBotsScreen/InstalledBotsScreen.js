import React from 'react';
import { View , Text , FlatList, TextInput, TouchableHighlight, ActivityIndicator, Alert } from 'react-native';
import styles from './styles'
import { ListItem } from 'react-native-elements'
import {GlobalColors} from '../../config/styles'
import {headerConfig  , searchBarConfig , rightIconConfig} from './config'
const subtitleNumberOfLines = 2;
import images from '../../config/images';
import { Actions } from 'react-native-router-flux';
import Bot from '../../lib/bot/index';
import { HeaderRightIcon, HeaderBack } from '../Header';
import _ from 'lodash';
import Toast, { DURATION } from 'react-native-easy-toast';
import I18n from '../../config/i18n/i18n';
import dce from '../../lib/dce';
import SystemBot from '../../lib/bot/SystemBot';
import { MessageHandler } from '../../lib/message';
import CachedImage from '../CachedImage'

export default class InstalledBotsScreen extends React.Component {
    static navigationOptions({ navigation, screenProps }) {
        const { state } = navigation;
        return {
            headerRight: <HeaderRightIcon config={rightIconConfig} onPress={state.params.fireBotSore} />,
            headerLeft: <HeaderBack onPress={state.params.onBack ? () => { Actions.pop(); state.params.onBack() } : Actions.pop } refresh={true}/>,
        }
    }

    constructor(props){
        super(props);
        this.state = {
            loaded: false,
            firstTimeLoad: true
        }
    }

    async componentDidMount() {
        this.props.navigation.setParams({ fireBotSore: this.onAddClicked.bind(this) });
        this.refreshData();
    }

    async refreshData() {
        const bots = await Bot.getInstalledBots();
        const defaultBots = await Promise.resolve(SystemBot.getDefaultBots());

        this.bots = _.reject(bots, (bot) => _.find(defaultBots, { botId: bot.botId }));
        if (this.queryText && this.queryText.length > 0) {
            this.onSearchQueryChange(this.queryText);
            this.setstate({loaded: true});
        } else {
            this.setState({bots: this.bots, loaded: true});
        }
        // alert(JSON.stringify(bots))
        if (this.bots.length == 0 && this.state.firstTimeLoad) {
            Actions.botStore({ onBack: this.refreshData.bind(this) });
            this.setState({firstTimeLoad: false})
        }
    }

    onAddClicked = ()=>{
        Actions.botStore({ onBack: this.refreshData.bind(this) });
    }

    onDeletePress = async (bot) => {
        Alert.alert(
            null,
            I18n.t('Bot_uninstall_confirmation'),
            [
                { text: I18n.t('Yes'), onPress: () => this.deleteBot(bot) },
                { text: I18n.t('Cancel'), style: 'cancel'},
            ],
            { cancelable: false }
        );
    }

    deleteBot = async (bot) => {
        try {
            await MessageHandler.deleteBotMessages(bot.botId);
            const dceBot = dce.bot(bot);
            await Bot.delete(dceBot);
            this.refreshData();
            this.refs.toast.show(I18n.t('Bot_uninstalled'), DURATION.LENGTH_SHORT);
        } catch (e) {
            this.refs.toast.show(I18n.t('Bot_uninstall_failed'), DURATION.LENGTH_SHORT);
            throw e;
        }
    }

    onBotPress = async (bot) => {
        Actions.botChat({ bot: bot });
    }

    headerTitle = () => (
        <Text style = {styles.headerTitleStyle} >{headerConfig.headerTitle}</Text>
    )

    renderRow = (botData)=>{
        return (
            <View>
                <ListItem
                    avatarContainerStyle={styles.avatarContainerStyle}
                    avatarStyle={styles.avatarStyle}
                    containerStyle={styles.containerStyle}
                    title={botData.botName}
                    titleStyle={styles.titleStyle}
                    titleContainerStyle={styles.titleContainerStyle}
                    subtitle={botData.description}
                    subtitleStyle={styles.subtitleStyle}
                    avatar={this.renderBotImage(botData)}
                    avatarOverlayContainerStyle={styles.avatarOverlayContainerStyle}
                    subtitleNumberOfLines={subtitleNumberOfLines}
                    subtitleContainerStyle={styles.subtitleContainerStyle}
                    onPress={()=>{ this.onBotPress(botData) }}
                    rightIcon ={{style:{alignSelf:'center'} , name : 'delete'}}
                    onPressRightIcon = { () => { this.onDeletePress(botData) } }
                />
            </View>
        )
    }

    renderGridItem = ({item}) => {
        return (
            <View key={item.botId} style={styles.rowContainer}>
                <TouchableHighlight style={styles.gridStyle}>
                    <View style={styles.rowContent}>
                        {this.renderRow(item)}
                    </View>
                </TouchableHighlight>
            </View>
        )
    }

    renderBotImage = (botData) => {
        var botImage;
        if (botData.logoSlug != null) {
            return botImage = images[botData.logoSlug];
        }
        else {
            return botImage = <CachedImage source={{uri : botData.logoUrl}} style={styles.image}/>
        }
    }

    onSearchQueryChange(text) {
        text = _.trim(text);
        this.queryText = text;
        if (text === '') {
            this.setState({bots: this.bots});
        } else {
            let filteredBots = this.getFilteredData(text).bots;
            this.setState({bots: filteredBots});
        }
    }

    getFilteredData(text) {
        if (this.state.bots.length === 0) {
            return [];
        }
        text = text.toLowerCase();
        let filterFunc = (bot) => bot.botName.toLowerCase().indexOf(text) !== -1;
        return this.createBotDict(filterFunc);
    }

    createBotDict(filterFunc) {
        return _.reduce(this.state.bots, (result, bot) => {
            if (filterFunc === undefined || filterFunc(bot)) {
                let firstChar = 'bots';
                (result[firstChar] || (result[firstChar] = [])).push(bot);
            }
            return result;
        }, {});
    }


    renderSearchBar() {
        return (
            <View style={styles.searchBar}>
                <TextInput
                    style={styles.searchTextInput}
                    underlineColorAndroid="transparent"
                    placeholder="Search"
                    selectionColor={GlobalColors.white}
                    placeholderTextColor={searchBarConfig.placeholderTextColor}
                    onChangeText={this.onSearchQueryChange.bind(this)}
                />
            </View>
        );
    }


    render(){
        const { loaded } = this.state;
        if (!loaded) {
            return (
                <View style={styles.loading}>
                    <ActivityIndicator size="small" />
                </View>
            );
        } else {
            return (
                <View >
                    <FlatList
                        style = {styles.flatList}
                        keyExtractor = {(item, index) => item.botId}
                        data={this.state.bots}
                        renderItem={this.renderGridItem.bind(this)}
                        extraData={this.state}
                    />
                    <Toast ref="toast"/>
                </View>
            )
        }
    }
}
