import React from 'react';
import { ActivityIndicator, TouchableOpacity, View, Text, Image } from 'react-native';
import styles from './styles';
import Bot from '../../lib/bot/index';
import dce from '../../lib/dce';
import I18n from '../../config/i18n/i18n';
import LogoImage from '../LogoImage';

const subtitleNumberOfLines = 2;

const BotInstallListItemStates = {
    INSTALLING: 'installing',
    INSTALLED: 'installed',
    NOT_INSTALLED: 'not_installed',
    UPDATE: 'update'
};

export default class BotInstallListItem extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            status: props.installed ? (props.update ? BotInstallListItemStates.UPDATE : BotInstallListItemStates.INSTALLED) : BotInstallListItemStates.NOT_INSTALLED
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            status: nextProps.installed ? (nextProps.update ? BotInstallListItemStates.UPDATE : BotInstallListItemStates.INSTALLED) : BotInstallListItemStates.NOT_INSTALLED
        });
    }

    async installBot() {
        if (this.props.installed && !this.props.update) {
            return;
        }
        const isUpdate = this.props.update;

        this.setState({ status: BotInstallListItemStates.INSTALLING });
        const bot = this.props.bot;
        try {
            const dceBot = dce.bot(bot);
            if (isUpdate) {
                await Bot.update(dceBot);
            } else {
                await Bot.install(dceBot);
            }

            if (this.props.onBotInstalled) {
                this.props.onBotInstalled();
            }
            this.setState({ status: BotInstallListItemStates.INSTALLED });
        } catch (e) {
            this.setState({ status: BotInstallListItemStates.NOT_INSTALLED });
            if (this.props.onBotInstallFailed) {
                this.props.onBotInstallFailed();
            }
        }
    }

    renderRightArea() {
        if (this.state.status === BotInstallListItemStates.NOT_INSTALLED || this.state.status === BotInstallListItemStates.UPDATE) {
            const status = this.state.status === BotInstallListItemStates.NOT_INSTALLED ? I18n.t('Install') : I18n.t('Update_Bot');

            return (
                <View style={styles.rightContainer}>
                    <TouchableOpacity style={styles.installButton} onPress={this.installBot.bind(this)}>
                        <Text style={styles.installButtonText}>{status}</Text>
                    </TouchableOpacity>
                </View>
            );
        } else if (this.state.status === BotInstallListItemStates.INSTALLING) {
            return (
                <View style={styles.rightContainer}>
                    <ActivityIndicator size="small" />
                </View>
            );
        } else {
            return (
                <View style={styles.rightContainer}>
                    <TouchableOpacity style={styles.installButton} onPress={this.props.onBotClick.bind(this, this.props.bot)}>
                        <Text style={styles.installButtonText}>{I18n.t('OPEN')}</Text>
                    </TouchableOpacity>
                </View>
            );
        }
    }

    render() {
        const bot = this.props.bot;
        return (
            <View style={styles.container}>
                <LogoImage source={{uri: bot.logoUrl}} imageStyle={ styles.image }/>
                <View style={styles.textContainer}>
                    <Text style={ styles.title } >{ bot.name }</Text>
                    <Text numberOfLines={subtitleNumberOfLines} style={ styles.subTitle }>{bot.description}</Text>
                </View>
                { this.renderRightArea() }
            </View>
        );
    }
}
