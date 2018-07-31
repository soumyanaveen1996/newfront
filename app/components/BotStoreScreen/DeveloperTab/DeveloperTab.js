import React from 'react';
import { View, Text, Image, TouchableHighlight } from 'react-native';
import EasyListView from 'react-native-easy-listview-gridview'
import styles from './styles'
import images from '../../../config/images'
import I18n from '../../../config/i18n/i18n';
import { Actions } from 'react-native-router-flux';
import CachedImage from '../../CachedImage';
import _ from 'lodash';
import { SYSTEM_BOT_MANIFEST } from '../../../lib/bot/SystemBot';
const NUMBER_COLUMNS = 2

export default class DeveloperTab extends React.Component {
    constructor(props){
        super(props);
        this.getDomainMgmtBotData();
        this.state = {
            // Hide + for now until we have more auth sources
            // developerData : [...this.props.developerData , {name :I18n.t('Authenticate')}]
            developerData: [ ...this.props.developerData, this.domainMgmtBotData ]
        }
    }

    renderBotImage = (botData)=>{
        var botImage;
        if (botData.name === I18n.t('Authenticate') || botData.name === SYSTEM_BOT_MANIFEST['domMgmt-bot'].botName) {
            botImage = <View style = {styles.authenticateButton}><Text style ={styles.plusText}>+</Text></View>
        } else {
            if (botData.logoSlug != null) {botImage = <Image source={images[botData.logoSlug]} style={styles.iconStyle}/>}
            else {botImage = <CachedImage source={{uri : botData.logoUrl}} style={styles.iconStyle}/>}
        }
        return (
            botImage
        )
    }

    onTileCilcked = (botsId)=>{
        if (botsId == null) {
            return;
        }

        let selectedBots =  (this.props.botsData.filter((bot)=>{return botsId.indexOf(bot.botId) >= 0}))
        Actions.botList({data : selectedBots});
    }

    onDomainMgmtTileClicked() {
        Actions.botChat({ bot: this.domainMgmtChatBot, onBack: this.props.onBack });
    }

    getDomainMgmtBotData() {
        const domainMgmtBotData = _.filter(this.props.botsData, (bot) => {
            return bot.botName.toLowerCase().indexOf(SYSTEM_BOT_MANIFEST['domMgmt-bot'].botName.toLowerCase()) !== -1
        });
        this.domainMgmtBotData = {
            name: domainMgmtBotData[0].botName,
            logoUrl: domainMgmtBotData[0].logoUrl,
            botIds: [domainMgmtBotData[0].botId]
        }
        this.domainMgmtChatBot = domainMgmtBotData[0];
    }


    renderGridItem = (index, rowData, sectionID, rowID, highlightRow) => {
        let domainMgmtBot = false;
        if (rowData.name === SYSTEM_BOT_MANIFEST['domMgmt-bot'].botName) {
            domainMgmtBot = true;
        }
        return (
            <View
                key={index}
                style={styles.tileContainer}>
                <TouchableHighlight
                    style={styles.gridStyle}
                    onPress= {() => domainMgmtBot ? this.onDomainMgmtTileClicked() : this.onTileCilcked(rowData.botIds)}>
                    <View style={styles.tileContent}>
                        {this.renderBotImage(rowData)}
                        <Text style={styles.rowTitle}>
                            {rowData.name}
                        </Text>
                    </View>
                </TouchableHighlight>
            </View>
        )
    }

    render() {
        return (
            <View >
                <EasyListView
                    ref={component => {this.gridview = component} }
                    column={NUMBER_COLUMNS}
                    renderItem={this.renderGridItem}
                    contentContainerStyle = {styles.listViewContentContainerStyle}
                    refreshHandler={this.onFetch}
                    loadMoreHandler={this.onFetch}
                    isDataFixed = {true}
                    fixedData = {this.state.developerData}
                >
                    <View style = {styles.authenticateButton}><Text style ={styles.plusText}>+</Text></View>}
                </EasyListView>
            </View>
        )
    }

    _onFetch(pageNo, success, failure) {

    }
}


