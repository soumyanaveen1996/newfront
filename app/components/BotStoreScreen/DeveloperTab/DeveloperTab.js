import React from 'react';
import {
    View,
    Text,
    Image,
    TouchableHighlight,
    TouchableOpacity,
    ScrollView
} from 'react-native';
import styles from './styles';
import images from '../../../config/images';
import I18n from '../../../config/i18n/i18n';
import { Actions } from 'react-native-router-flux';
import CachedImage from '../../CachedImage';
import _ from 'lodash';
import { SYSTEM_BOT_MANIFEST } from '../../../lib/bot/SystemBot';
import { scrollViewConfig } from './config';
import BotContainer from '../../BotContainer';

export default class DeveloperTab extends React.Component {
    constructor(props) {
        super(props);
        this.getDomainMgmtBotData();
        this.state = {
            // Hide + for now until we have more auth sources
            // developerData : [...this.props.developerData , {name :I18n.t('Authenticate')}]
            developerData: [
                ...this.props.developerData,
                this.domainMgmtBotData
            ],
            collapse: false
        };
    }

    renderBotImage = botData => {
        var botImage;
        if (botData.botId === SYSTEM_BOT_MANIFEST['domMgmt-bot'].botId) {
            botImage = (
                <View style={styles.authenticateButton}>
                    <Text allowFontScaling={false} style={styles.plusText}>
                        +
                    </Text>
                </View>
            );
        } else {
            if (botData.logoSlug != null) {
                botImage = (
                    <Image
                        source={images[botData.logoSlug]}
                        style={styles.iconStyle}
                    />
                );
            } else {
                botImage = (
                    <CachedImage
                        imageTag="botLogo"
                        source={{ uri: botData.logoUrl }}
                        style={styles.iconStyle}
                    />
                );
            }
        }
        return botImage;
    };

    onTileCilcked = (botsId, title) => {
        if (botsId == null) {
            return;
        }

        let selectedBots = this.props.botsData.filter(bot => {
            return botsId.indexOf(bot.botId) >= 0;
        });
        Actions.botList({ data: selectedBots, title: title });
    };

    onDomainMgmtTileClicked() {
        Actions.botChat({
            bot: this.domainMgmtChatBot,
            onBack: this.props.onBack
        });
    }

    getDomainMgmtBotData() {
        const domainMgmtBotData = _.filter(this.props.botsData, bot => {
            return (
                bot.botId.indexOf(SYSTEM_BOT_MANIFEST['domMgmt-bot'].botId) !==
                -1
            );
        });

        let managmentBots = [];

        domainMgmtBotData.map(data => {
            managmentBots.push(data.botId);
        });

        this.domainMgmtBotData = {
            name: domainMgmtBotData[0].botName,
            logoUrl: domainMgmtBotData[0].logoUrl,
            botIds: [...managmentBots]
        };
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
                onPress={() =>
                    domainMgmtBot
                        ? this.onDomainMgmtTileClicked()
                        : this.onTileCilcked(rowData.botIds, botName)
                }
            >
                <View style={styles.tileContent}>
                    {this.renderBotImage(rowData)}
                    <Text style={styles.rowTitle}>{botName}</Text>
                </View>
            </TouchableHighlight>
        );
    };

    renderCategoryBots = () => {
        this.getDomainMgmtBotData();
        let developerDataMain = [
            ...this.props.developerData,
            this.domainMgmtBotData
        ];
        return developerDataMain.map((data, index) => {
            if (data.botIds) {
                let developerData = this.props.botsData.filter(bot => {
                    return (
                        data.botIds.indexOf(bot.botId) >= 0 && !bot.systemBot
                    );
                });

                return (
                    <BotContainer
                        style={{ flex: 1 }}
                        key={index}
                        allBots={this.props.botsData}
                        botsData={developerData}
                        name={data.name}
                        botIds={data.botIds}
                        currentIndex={index}
                        imageForHeader={data.logoUrl}
                        tabStatus="provider"
                    />
                );
            }
        });
    };

    newProvider = () => {
        this.props.onChange(true);
    };

    render() {
        return (
            <ScrollView style={{ flex: 1 }}>
                <View
                    style={{
                        width: '100%',
                        height: 80,
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <TouchableOpacity
                        style={styles.newProvider}
                        onPress={this.newProvider}
                    >
                        <Text style={styles.newProviderText}>
                            + Sign in to a new Provider
                        </Text>
                    </TouchableOpacity>
                </View>
                {this.renderCategoryBots()}
            </ScrollView>
        );
    }
}
