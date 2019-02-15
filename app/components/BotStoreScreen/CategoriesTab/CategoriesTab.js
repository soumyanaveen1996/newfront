import React from 'react';
import {
    View,
    Text,
    Image,
    TouchableHighlight,
    ScrollView,
    Platform
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

    onTileCilcked = (botsId, title) => {
        let selectedBots = this.props.botsData.filter(bot => {
            return botsId.indexOf(bot.botId) >= 0;
        });

        Actions.botListScreen({ data: selectedBots, title: title });
    };

    renderGridItem = (rowData, index) => {
        return (
            <TouchableHighlight
                key={index}
                style={styles.gridStyle}
                onPress={() => this.onTileCilcked(rowData.botIds, rowData.name)}
            >
                <View style={styles.tileContent}>
                    {this.renderCategoryImage(rowData)}
                    <Text style={styles.rowTitle}>{rowData.name}</Text>
                </View>
            </TouchableHighlight>
        );
    };

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
                    onBotInstallFailed={this.onBotInstallFailed}
                />
            );
        });
    };

    onBotInstallFailed = () => {
        this.refs.toast.show(
            I18n.t('Bot_install_failed'),
            DURATION.LENGTH_SHORT
        );
    };

    renderToast() {
        if (Platform.OS === 'ios') {
            return <Toast ref="toast" position="bottom" positionValue={350} />;
        } else {
            return <Toast ref="toast" position="center" />;
        }
    }

    render() {
        return (
            <ScrollView style={{ flex: 1, padding: 10 }}>
                {this.renderCategoryBots()}
                {this.renderToast()}
            </ScrollView>
        );
    }

    _onFetch(pageNo, success, failure) {}
}
