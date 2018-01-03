import React from 'react';
import { View, Text, WebView, ListView } from 'react-native';
import { Actions } from 'react-native-router-flux';
import { PopupDialog } from '../PopupDialog';
import Styles from './styles';

export default class extends React.Component {
    constructor(props) {
        super(props);
        this.onClose = this.onClose.bind(this);
    }

    onClose() {
        Actions.pop()
    }

    infoWebView(url) {
        return (
            <WebView
                source={{ uri: url }}
                startInLoadingState
                scalesPageToFit
                javaScriptEnabled
                style={Styles.webView}
            />
        );
    }

    renderInfoListRow(row) {
        return (
            <View style={Styles.infoListRowContainer}>
                <Text style={Styles.infoListRowTitle}>{row.key}</Text>
                <Text style={Styles.infoListRowSubTitle}>{row.value}</Text>
            </View>
        );
    }

    renderInfoListSection() {
        if (this.props.noSections) {
            return;
        }
        return (
            <View style={Styles.sectionDivider} />
        );
    }

    infoListView(dataList) {
        const ds = new ListView.DataSource({
            rowHasChanged: (r1, r2) => r1.key !== r2.key || r1.value !== r2.value,
            sectionHeaderHasChanged: (r1, r2) => true,

        });
        const dataSource = ds.cloneWithRowsAndSections(dataList);
        return (
            <ListView
                style={Styles.listView}
                dataSource={dataSource}
                renderRow={ this.renderInfoListRow.bind(this) }
                renderSeparator={ (sectionId, rowId) => <View key={rowId} style={Styles.separator} />}
                renderSectionHeader={this.renderInfoListSection.bind(this)}
                stickySectionHeadersEnabled={false} />
        );
    }

    mainView() {
        const payload = this.props.data;
        if (payload.data) {
            return this.infoListView(payload.data);
        } else if (payload.url) {
            return this.infoWebView(payload.url);
        }
    }

    render(){
        return (
            <View style={Styles.container}>
                <PopupDialog mainView={ this.mainView() }
                    onClose={this.onClose}
                    width={this.props.width}
                    height={this.props.height}
                    title={this.props.data.title}/>
            </View>
        );
    }
}
