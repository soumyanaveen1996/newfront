import React from 'react';
import {
    View,
    Text,
    Image,
    TouchableHighlight,
    ScrollView,
    Platform,
    RefreshControl
} from 'react-native';
import styles from './styles';
import images from '../../../config/images';
import { scrollViewConfig } from './config';
import { Actions } from 'react-native-router-flux';
import CachedImage from '../../CachedImage';
import GridView from 'react-native-super-grid';
import BotContainer from '../../BotContainer';
import Toast, { DURATION } from 'react-native-easy-toast';
import I18n from '../../../config/i18n/i18n';
import Store from '../../../redux/store/configureStore';

export default class CategoriesTab extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            categoriesData: this.props.categoriesData,
            collapseIndex: 0
        };
    }

    renderCategoryImage = categorysData => {
        var categoryImage;
        if (categorysData.logoSlug != null) {
            categoryImage = (
                <Image
                    source={images[categorysData.logoSlug]}
                    style={styles.iconStyle}
                />
            );
        } else {
            categoryImage = (
                <CachedImage
                    imageTag="categoryLogo"
                    source={{ uri: categorysData.logoUrl }}
                    style={styles.iconStyle}
                />
            );
        }
        return categoryImage;
    };

    onPullToRefresh() {
        this.setState({ refreshing: true }, async () => {
            try {
                await this.props.refresh();
                this.setState({
                    refreshing: false
                });
            } catch (e) {
                this.setState({
                    refreshing: false
                });
            }
        });
    }

    onCollapse = i => {
        this.setState({ collapseIndex: i });
    };
    renderCategoryBots = () => {
        return this.props.categoriesData.map((data, index) => {
            let categoryData = this.props.botsData.filter(bot => {
                return data.botIds.indexOf(bot.botId) >= 0;
            });

            let newCategoryData = [];
            let indexBot = 0;
            if (categoryData.length === 1) {
                newCategoryData.push(categoryData[0]);
            } else if (categoryData.length > 1) {
                while (indexBot < 2) {
                    newCategoryData.push(categoryData[indexBot]);
                    indexBot++;
                }
            }

            return (
                <BotContainer
                    style={{ flex: 1 }}
                    key={index}
                    allBots={this.props.botsData}
                    botsData={newCategoryData}
                    name={data.name}
                    botIds={data.botIds}
                    currentIndex={index}
                    clickedIndex={this.state.collapseIndex}
                    handleCollapse={this.onCollapse}
                    refresh={this.props.refresh.bind(this)}
                    installedBots={this.props.installedBots}
                    onBotInstalled={this.props.onBotInstalled}
                    onBotInstallFailed={this.props.onBotInstallFailed}
                />
            );
        });
    };

    render() {
        return (
            <ScrollView
                style={{ flex: 1, padding: 10 }}
                refreshControl={
                    Store.getState().user.network === 'full' ? (
                        <RefreshControl
                            onRefresh={this.onPullToRefresh.bind(this)}
                            refreshing={this.state.refreshing}
                        />
                    ) : null
                }
            >
                {this.renderCategoryBots()}
            </ScrollView>
        );
    }

    _onFetch(pageNo, success, failure) {}
}
