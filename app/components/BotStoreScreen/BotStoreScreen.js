import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { Actions } from 'react-native-router-flux';
import { Header, Icon } from 'react-native-elements';
import { GlobalColors } from '../../config/styles';
import { rightIconConfig ,headerConfig ,tabConfig } from './config';
import styles from './styles';
import DeveloperTab from  './DeveloperTab/DeveloperTab';
import SegmentedControlTab from 'react-native-segmented-control-tab';
import Bot from '../../lib/bot/index';
import CategoriesTab from './CategoriesTab/CategoriesTab';
import FeaturedTab from './FeaturedTab/FeaturedTab';
import { HeaderBack } from '../Header';
import { ErrorMessage } from '../Error';
import { NetworkError } from '../../lib/network';

export default class BotStoreScreen extends React.Component{

    static navigationOptions({ navigation, screenProps }) {
        const { state } = navigation;
        return {
            header: BotStoreScreen.renderHeader(state)
        }
    }

    static renderHeaderTitle() {
        return <Text style = {styles.headerTitleStyle} >{headerConfig.headerTitle}</Text>;
    }

    static renderLeftIcon(state) {
        return (
            <HeaderBack
                onPress={state.params.onBack ? () => { Actions.pop(); state.params.onBack() } : Actions.pop } />
        );
    }

    static renderRightIcon(state) {
        if (state.params.selectedIndex === 2) {
            return ( <Icon
                type={rightIconConfig.type}
                name={rightIconConfig.name}
                size={rightIconConfig.size}
                underlayColor={rightIconConfig.underlayColor}
                color={rightIconConfig.color}
                fontWeight={rightIconConfig.fontWeight}
                onPress={state.params.handleSearchClick}
            />)
        }
    }

    static renderHeader(state) {
        if (state.params.showSearchBar) {
            return ( <Header
                innerContainerStyles={styles.headerInnerContainerForSearch}
                outerContainerStyles={styles.headerOuterContainerStyles}
                backgroundColor={GlobalColors.accent}>

                {/* <SearchBar
                    lightTheme
                    ref={search => { this.search = search }}
                    onSubmitEditing={state.params.handleSearchSubmit}
                    inputStyle={{backgroundColor: GlobalColors.white }}
                    containerStyle={styles.searchBar}
                /> */}

            </Header>);

        } else {
            return ( <Header
                innerContainerStyles={styles.headerInnerContainerStyles}
                outerContainerStyles={styles.headerOuterContainerStyles}
                backgroundColor={GlobalColors.accent}
                centerComponent={BotStoreScreen.renderHeaderTitle()}
                leftComponent={BotStoreScreen.renderLeftIcon(state)}
            />);
        }
    }

    constructor(props) {
        super(props);
        this.state = {
            showSearchBar: false,
            selectedIndex: 0,
            catalogData: Bot.getDefaultCatalog(),
            catalogLoaded: false,
            networkError: false
        };
    }

    async componentDidMount() {
        try {
            let catalog = await Bot.getCatalog();
            this.setState({ showSearchBar: false, selectedIndex: 0, catalogData: catalog, catalogLoaded: true, networkError: false });

            if (this.props.navigation) {
                this.props.navigation.setParams({
                    handleSearchClick: this.handleSearchClick.bind(this),
                    handleSearchSubmit: this.handleSearchSubmit.bind(this)
                });
            }
        } catch (error) {
            console.log('Error occurred during componentWillMount getting catalogData; ', error, error instanceof NetworkError);
            if (error instanceof NetworkError) {
                this.setState({ showSearchBar: false, selectedIndex: 0, catalogLoaded: false, networkError: true });
            }
        }
    }

    handleSearchClick() {
        this.setState({showSearchBar: true});
        if (this.props.navigation) {
            this.props.navigation.setParams({ showSearchBar: true });
        }
    }

    handleSearchSubmit() {
        this.setState({showSearchBar : false});
        if (this.props.navigation) {
            this.props.navigation.setParams({ showSearchBar: false });
        }
    }

    onIndexChange(index) {
        this.setState({ selectedIndex: index });
        if (this.props.navigation) {
            this.props.navigation.setParams({ selectedIndex: index });
        }
    }

    botStoreList() {
        if (this.state.selectedIndex === 2) {
            return (<DeveloperTab developerData={this.state.catalogData.developer} botsData = {this.state.catalogData.bots}/>)
        } if (this.state.selectedIndex === 1) {
            return (<CategoriesTab categoriesData={this.state.catalogData.categories} botsData = {this.state.catalogData.bots}/>)
        } if (this.state.selectedIndex === 0) {
            let featuredBots = (this.state.catalogData.bots.filter((bot) => {return this.state.catalogData.featured.indexOf(bot.botId) >= 0}))
            return (<FeaturedTab featuredBots={featuredBots}/>)
        }
    }

    segmentedControlTab() {
        return (
            <View style = {styles.segmentedControlTab}>
                <SegmentedControlTab
                    tabsContainerStyle={styles.tabsContainerStyle}
                    tabStyle = {styles.tabStyle}
                    tabTextStyle = {styles.tabTextStyle}
                    activeTabStyle = {styles.activeTabStyle}
                    activeTabTextStyle = {styles.activeTabTextStyle}
                    values={tabConfig.tabeNames}
                    selectedIndex={this.state.selectedIndex}
                    onTabPress={this.onIndexChange.bind(this)} />
            </View>
        );
    }

    render() {
        if (this.state.networkError) {
            return (
                <ErrorMessage onPress={() => {
                    Actions.pop();
                    Actions.botStore();
                }} />
            );
        }

        if (!this.state.catalogLoaded) {
            return (
                <View style={styles.loading}>
                    <ActivityIndicator size="large" />
                </View>
            );
        }

        return (
            <View>
                {this.segmentedControlTab()}
                {this.botStoreList()}
            </View>
        );
    }
}
