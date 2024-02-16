import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Text } from 'react-native';
import GlobalColors from '../../../../config/styles';
import { TableMessage, TablesActions } from '../TableMessage/TableMessageV2';
import MapView from '../MapView/MapView';
import { configureMap } from './MapHelper';
import images from '../../../../images';

import SelectedMapPin from './SlectedMapPin';
import AppFonts from '../../../../config/fontConfig';

export class MapMessage extends TableMessage {
    // renderHeaderButtons = () => {
    //     if (this.state.mapView) return null;
    //     else super();
    // };
    renderHeaderLeftButton = () => (
        <View style={stylesLocal.leftButtonContainer}>
            <View style={stylesLocal.mapToggleButtonContainer}>
                <TouchableOpacity
                    onPress={() => {
                        this.setState({ mapView: true });
                    }}
                    style={
                        this.state.mapView
                            ? stylesLocal.imageButtonSelected
                            : stylesLocal.imageButtonNonSelected
                    }
                >
                    <Image
                        source={
                            this.state.mapView
                                ? images.switch_to_map_active
                                : images.switch_to_map_inactive
                        }
                    />
                </TouchableOpacity>
                <View
                    style={{
                        width: 1,
                        backgroundColor: GlobalColors.formDevider
                    }}
                />
                {!this.state.options?.table && (
                    <TouchableOpacity
                        onPress={() => {
                            if (this.state.mapView) {
                                this.setState({ mapView: false });
                            }
                        }}
                        style={
                            this.state.mapView
                                ? stylesLocal.imageButtonNonSelected
                                : stylesLocal.imageButtonSelected
                        }
                        background={GlobalColors.formNonSelectedItem}
                    >
                        <Image
                            source={
                                this.state.mapView
                                    ? images.switch_to_table_inactive
                                    : images.switch_to_table_active
                            }
                        />
                    </TouchableOpacity>
                )}
            </View>
            {this.state.mapActions.confirmAction && (
                <TouchableOpacity
                    onPress={this.sendConfirmActionMessage}
                    style={stylesLocal.confirmButton}
                >
                    <Text style={stylesLocal.confirmButtonText}>
                        {this.state.mapActions.confirmAction}
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );

    generatetableData = (data, options) => {
        const tableData = configureMap(data, options);
        // console.log('~~~~~~ map data generated', tableData);
        this.setState({ ...tableData, mapView: true });
    };

    handleMarkerSelect = (id) => {
        const { mapData, tableData } = this.state;
        const selectedMarker = mapData.markers.find((d) => d.id === id);
        const selectedTableRow = tableData.find((d) => d.entryId === id);
        // console.log('~~~~ selected marker', selectedMarker);
        this.setState({
            showSelectedItem: true,
            selectedCard: selectedMarker.card,
            selectedTableRow,
            selectedMarker: id
        });
    };

    showOnMap = (card) => {
        // console.log('~~~ show on map:', card);
        const { data } = this.state;
        const selectedMarker = data?.markers?.find(
            (marker) => marker.id === card.cardId
        );
        this.setState({ mapView: true });
        this.sendActionMessage(selectedMarker);
    };

    renderContent = () => {
        const {
            data,
            options,
            showSelectedItem,
            mapView,
            mapOptions,
            mapData,
            selectedCard,
            selectedMarker,
            selectedTableRow
        } = this.state;
        return (
            <View style={{ flex: 1, margin: 4 }}>
                {mapView && mapData?.region ? (
                    <MapView
                        ref={(ref) => {
                            this.mapViewRef = ref;
                        }}
                        mapData={mapData}
                        mapId={options.controlId}
                        sendMessage={() => {}}
                        userId="userId"
                        onClosing={() => {}}
                        renderLeftIcons={this.renderLeftIcons}
                        renderRightIcons={this.renderRightIcons}
                        onMarkerSelect={this.handleMarkerSelect}
                        botId={this.props.botId}
                    />
                ) : (
                    this.renderDataList()
                )}
                <SelectedMapPin
                    visible={showSelectedItem}
                    selectedCard={selectedCard}
                    selectedTableRow={selectedTableRow}
                    selectedMarker={selectedMarker}
                    slectedPinAction={this.slectedPinAction}
                    onRowActionClick={this.onRowActionClick}
                    onClose={this.onMarkerClose}
                    onMenuPress={this.onRowActionClickFromPin}
                />
            </View>
        );
    };

    onRowActionClickFromPin = (item) => {
        const { options } = this.state;
        this.setState({ showSelectedItem: false }, () => {
            this.showRowActionSheet(item, options);
        });
    };

    renderLeftIcons = () => {
        return <View>{this.renderHeaderLeftButton()}</View>;
    };
    renderRightIcons = () => {
        const { mapActions } = this.state;
        return (
            <View>
                {this.renderHeaderRightButtons(
                    mapActions,
                    null,
                    'outlined',
                    stylesLocal.headerButtonStyles
                )}
            </View>
        );
    };

    slectedPinAction = (item) => {
        this.setState({ showSelectedItem: false });
        this.sendActionMessage(item);
    };

    // overrrides table implemetation
    sendActionMessage = (item) => {
        // console.log('~~~~ sendActionMessage MapMessage', item);
        const { options } = this.state;
        const { nonConvOnAction, conversational } = this.props;
        const msg = {
            tabId: this.parentTabId ? this.parentTabId : options.tabId,
            controlId: options.controlId,
            action: TablesActions.ON_ACTION
            // content: item //TODO: should check
        };
        this.sendMessage(msg);
        if (conversational === false) {
            nonConvOnAction?.();
        }
    };

    onRowActionClick = (action) => {
        this.setState({ showSelectedItem: false }, () => {
            action.callToAction();
        });
    };

    onMarkerClose = () => {
        this.setState({ showSelectedItem: false });
    };
}

const stylesLocal = StyleSheet.create({
    filedvalueText: {
        fontWeight: AppFonts.NORMAL,
        fontStyle: 'normal',
        lineHeight: 16,
        letterSpacing: 0,
        color: GlobalColors.menuSubLable
    },
    headerButtonStyles: {
        width: 42,
        height: 40,
        justifyContent: 'center',
        backgroundColor: 'white',
        marginHorizontal: 2
    },
    filedLableText: {
        fontSize: 12,
        fontWeight: AppFonts.NORMAL,
        fontStyle: 'normal',
        lineHeight: 16,
        letterSpacing: 0,
        color: GlobalColors.tableDeatilKey,
        textTransform: 'capitalize'
    },
    popUpItemSubTitle: {
        fontSize: 12,
        fontWeight: AppFonts.NORMAL,
        fontStyle: 'normal',
        letterSpacing: 0,
        marginTop: 5,
        color: GlobalColors.menuSubLable
    },
    popUpItemTitle: {
        fontSize: 14,
        fontWeight: AppFonts.BOLD,
        fontStyle: 'normal',
        letterSpacing: 0,
        color: GlobalColors.menuSubLable
    },
    imageButtonSelected: {
        height: 38,
        width: 42,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#dff4fa'
    },
    imageButtonNonSelected: {
        height: 38,
        width: 42,
        backgroundColor: GlobalColors.white,
        alignItems: 'center',
        justifyContent: 'center'
    },
    leftButtonContainer: {
        flexDirection: 'row',
        borderRadius: 4,
        overflow: 'hidden'
    },
    mapToggleButtonContainer: {
        flexDirection: 'row',
        borderRadius: 4,
        borderWidth: 1,
        overflow: 'hidden',
        borderColor: GlobalColors.formDevider
    },
    confirmButton: {
        backgroundColor: GlobalColors.frontmLightBlue,
        marginLeft: 2,
        height: 38,
        borderRadius: 4,
        justifyContent: 'center',
        paddingHorizontal: 20
    },
    confirmButtonText: {
        fontSize: 14,
        color: GlobalColors.white,
        alignSelf: 'center'
    }
});
