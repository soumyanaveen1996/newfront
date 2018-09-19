import React from 'react';
import { View, Text, Image, TouchableHighlight } from 'react-native';
import styles from './styles';
import images from '../../../config/images';
import { scrollViewConfig } from './config';
import { Actions } from 'react-native-router-flux';
import CachedImage from '../../CachedImage';
import GridView from 'react-native-super-grid';

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

    render() {
        return (
            <GridView
                itemDimension={scrollViewConfig.width * 0.5 - 1}
                spacing={5}
                renderItem={this.renderGridItem}
                style={styles.listViewContentContainerStyle}
                items={this.state.categoriesData}
            />
        );
    }

    _onFetch(pageNo, success, failure) {}
}
