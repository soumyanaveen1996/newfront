import React from 'react';
import { View, Text, Image, TouchableHighlight } from 'react-native';
import styles from './styles';
import images from '../../../config/images';
import { scrollViewConfig } from './config';
import { Actions } from 'react-native-router-flux';
import CachedImage from '../../CachedImage';
import GridView from 'react-native-super-grid';
import BotContainer from '../../BotContainer';

export default class CategoriesTab extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            categoriesData: this.props.categoriesData
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

        Actions.botList({ data: selectedBots, title: title });
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

    renderCategoryBots = () => {
        return this.state.categoriesData.map((data, index) => {
            let categoryData = this.props.botsData.filter(bot => {
                return data.botIds.indexOf(bot.botId) >= 0;
            });

            return (
                <BotContainer
                    style={{ flex: 1 }}
                    key={index}
                    allBots={this.props.botsData}
                    botsData={categoryData}
                    name={data.name}
                    botIds={data.botIds}
                    currentIndex={index}
                />
            );
        });
    };

    render() {
        return (
            <View style={{ flex: 1, padding: 10 }}>
                {this.renderCategoryBots()}
            </View>
        );
    }

    _onFetch(pageNo, success, failure) {}
}
