import React from 'react';
import {
    View,
    ActivityIndicator,
    Animated,
    Text,
    ScrollView,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Keyboard,
    TextInput,
    Image
} from 'react-native';
import { Actions } from 'react-native-router-flux';
import Styles from './styles';
import Config from './config';
import I18n from '../../config/i18n/i18n';
import Bot from '../../lib/bot';
import images from '../../config/images';
import _ from 'lodash';

export default class BotFilter extends React.Component {
    constructor(props) {
        super(props);
        this.onClose = this.onClose.bind(this);
        this.state = {
            loaded: false
        };
    }

    componentWillMount() {
        this.keyboardDidShowListener = Keyboard.addListener(
            'keyboardWillShow',
            this.keyboardWillShow.bind(this)
        );
        this.keyboardDidHideListener = Keyboard.addListener(
            'keyboardWillHide',
            this.keyboardWillHide.bind(this)
        );
    }

    componentWillUnmount() {
        this.keyboardDidShowListener.remove();
        this.keyboardDidHideListener.remove();
    }

    keyboardWillShow() {
        Animated.timing(this.state.slideAnim, {
            toValue: Config.BotFilter.deltaHeightWithKeyboard,
            duration: Config.BotFilter.animationDuration
        }).start();
    }

    keyboardWillHide() {
        Animated.timing(this.state.slideAnim, {
            toValue: 0,
            duration: Config.BotFilter.animationDuration
        }).start();
    }

    async componentDidMount() {
        this.bots = await Bot.getTimeLineBots();
        this.setState({
            slideAnim: new Animated.Value(-1 * Config.BotFilter.height)
        });

        Animated.timing(this.state.slideAnim, {
            toValue: 0,
            duration: Config.BotFilter.animationDuration
        }).start(() => {
            this.setState({
                loaded: true,
                displayedBots: this.bots
            });
        });
    }

    close() {
        Animated.timing(this.state.slideAnim, {
            toValue: -1 * Config.BotFilter.height,
            duration: Config.BotFilter.animationDuration
        }).start(Actions.pop);
    }

    onClose() {
        this.close();
    }

    onSearchQueryChange(text) {
        if (!text || text === '') {
            this.setState({ displayedBots: this.bots });
        } else {
            const selectedBots = _.filter(this.bots, bot => {
                return (
                    bot.name.toLowerCase().indexOf(text.toLowerCase()) !== -1
                );
            });
            this.setState({ displayedBots: selectedBots });
        }
    }

    onBotSelected(bot) {
        Actions.pop();
        Actions.botChat({ bot: bot });
    }

    renderBots() {
        if (!this.state.displayedBots) {
            return (
                <View style={Styles.loading}>
                    <ActivityIndicator size="small" />
                </View>
            );
        }
        return this.state.displayedBots.map(bot => {
            const imageSource =
                bot.logoSlug && images[bot.logoSlug]
                    ? images[bot.logoSlug]
                    : { uri: bot.logoUrl };
            return (
                <TouchableOpacity
                    style={Styles.bot}
                    key={bot.botId}
                    onPress={() => this.onBotSelected.bind(this)(bot)}
                >
                    <Image
                        style={Styles.botImage}
                        source={imageSource}
                        resizeMode="contain"
                        defaultSource={images.front_bot_logo}
                    />
                    <Text style={Styles.botTitle} numberOfLines={1}>
                        {bot.name}
                    </Text>
                </TouchableOpacity>
            );
        });
    }

    render() {
        const animStyle = { bottom: this.state.slideAnim };
        return (
            <TouchableOpacity
                activeOpacity={0.9}
                style={Styles.container}
                onPress={this.close.bind(this)}
            >
                <TouchableWithoutFeedback style={[Styles.botfilterContainer]}>
                    <Animated.View
                        style={[Styles.botfilterContainer, animStyle]}
                    >
                        <View style={Styles.header}>
                            <Text style={Styles.headerText}>
                                {I18n.t('Filters').toLocaleUpperCase()}
                            </Text>
                        </View>
                        <TextInput
                            style={Styles.searchTextInput}
                            underlineColorAndroid={
                                Config.SearchInput.underlineColor
                            }
                            placeholder={I18n.t('Search')}
                            selectionColor={Config.SearchInput.textColor}
                            placeholderTextColor={
                                Config.SearchInput.placeHolderTextColor
                            }
                            onChangeText={this.onSearchQueryChange.bind(this)}
                        />
                        <ScrollView
                            style={Styles.botScrollView}
                            contentContainerStyle={Styles.botsContainer}
                            pointerEvents="auto"
                        >
                            {this.renderBots()}
                        </ScrollView>
                    </Animated.View>
                </TouchableWithoutFeedback>
            </TouchableOpacity>
        );
    }
}
