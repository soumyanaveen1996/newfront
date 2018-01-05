import React from 'react';
import {View , Text ,Image, TouchableHighlight } from 'react-native';
import EasyListView from 'react-native-easy-listview-gridview'
import styles from './styles'
import images from '../../../config/images'
import {scrollViewConfig } from './config'
import { Actions } from 'react-native-router-flux'

export default class CategoriesTab extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            categoriesData : this.props.categoriesData
        }
    }

    renderCategoryImage = (categorysData) => {
        var categoryImage;
        if (categorysData.logoSlug != null) {
            categoryImage = <Image source={images[categorysData.logoSlug]} style={styles.iconStyle}/>
        } else {
            categoryImage = <Image source={{url : categorysData.logoUrl}} style={styles.iconStyle}/>
        }
        return categoryImage;
    }

    onTileCilcked = (botsId) => {
        let selectedBots =  (this.props.botsData.filter((bot)=>{return botsId.indexOf(bot.id) >= 0}))
        Actions.botList({data : selectedBots});
    }

    renderGridItem = (index, rowData, sectionID, rowID, highlightRow) => {
        return (
            <View
                key={index}
                style={styles.tileContainer}>
                <TouchableHighlight
                    style={styles.gridStyle}
                    onPress= {() => this.onTileCilcked(rowData.botIds)}>
                    <View style={styles.tileContent}>
                        {this.renderCategoryImage(rowData)}
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
                    ref={component => this.gridview = component}
                    column={scrollViewConfig.numberofColumn}
                    renderItem={this.renderGridItem}
                    contentContainerStyle = {styles.listViewContentContainerStyle}
                    refreshHandler={this.onFetch}
                    loadMoreHandler={this.onFetch}
                    isDataFixed = {true}
                    fixedData = {this.state.categoriesData}
                />

            </View>
        )
    }

    _onFetch(pageNo, success, failure) {

    }
}

