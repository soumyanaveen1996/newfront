import React from 'react';
import { View, Text, Image, TouchableHighlight } from 'react-native';
import GridView from 'react-native-super-grid';
import styles from './styles'
import images from '../../../config/images'
import I18n from '../../../config/i18n/i18n';
import { Actions } from 'react-native-router-flux';
import CachedImage from '../../CachedImage';
import _ from 'lodash';
import { SYSTEM_BOT_MANIFEST } from '../../../lib/bot/SystemBot';
import { scrollViewConfig } from './config';

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
        if (botData.botId === SYSTEM_BOT_MANIFEST['domMgmt-bot'].botId) {
            botImage = (
                <View style = {styles.authenticateButton}>
                    <Text allowFontScaling={false} style ={styles.plusText}>+</Text>
                </View>
            );
        } else {
            if (botData.logoSlug != null) {
                botImage = <Image source={images[botData.logoSlug]} style={styles.iconStyle}/>
            } else {
                botImage = <CachedImage imageTag = "botLogo" source={{uri : botData.logoUrl}} style={styles.iconStyle}/>
            }
        }
        return botImage;
    }

    onTileCilcked = (botsId, title)=>{
        if (botsId == null) {
            return;
        }

        let selectedBots =  (this.props.botsData.filter((bot)=>{return botsId.indexOf(bot.botId) >= 0}))
        Actions.botList({data : selectedBots, title: title});
    }

    onDomainMgmtTileClicked() {
        Actions.botChat({ bot: this.domainMgmtChatBot, onBack: this.props.onBack });
    }

    getDomainMgmtBotData() {
        const domainMgmtBotData = _.filter(this.props.botsData, (bot) => {
            return bot.botId.indexOf(SYSTEM_BOT_MANIFEST['domMgmt-bot'].botId) !== -1
        });
        this.domainMgmtBotData = {
            name: domainMgmtBotData[0].botName,
            logoUrl: domainMgmtBotData[0].logoUrl,
            botId: domainMgmtBotData[0].botId
        }
        this.domainMgmtChatBot = domainMgmtBotData[0];
    }


    renderGridItem = (rowData, index) => {
        let domainMgmtBot = false;
        let botName = rowData.name;
        if (rowData.botId === SYSTEM_BOT_MANIFEST['domMgmt-bot'].botId) {
            botName = I18n.t('Activate_Enterprise_Bots');
            domainMgmtBot = true;
        }
        return (
            <TouchableHighlight
                key={index}
                style={styles.gridStyle}
                onPress= {() => domainMgmtBot ? this.onDomainMgmtTileClicked() : this.onTileCilcked(rowData.botIds, botName)}>
                <View style={styles.tileContent}>
                    {this.renderBotImage(rowData)}
                    <Text style={styles.rowTitle}>
                        {botName}
                    </Text>
                </View>
            </TouchableHighlight>
        )
    }

    render() {
        return (
            <GridView
                itemDimension={scrollViewConfig.width * 0.5 - 1}
                spacing={5}
                renderItem={this.renderGridItem}
                style={styles.listViewContentContainerStyle}
                items = {this.state.developerData}
            />
        )
    }
}


