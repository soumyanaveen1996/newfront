import React, { useState } from 'react';
import { View, StyleSheet, Image, Text, TouchableOpacity } from 'react-native';
import GlobalColors from '../../../../config/styles';
import { getAction, getCustomAction } from '../TableMessage/TableHelper';
import BottomSheet from '../Widgets/BottomSheet';
import { Button } from 'react-native-paper';
import { getImageUrlForBot } from '../../../../lib/utils/ImageUtils';
import _ from 'lodash';
import AppFonts from '../../../../config/fontConfig';

/**
 * Shows the selected pin as bottomsheet
 */
const SelectedMapPin = (props) => {
    const {
        selectedCard,
        selectedMarker,
        slectedPinAction,
        onRowActionClick,
        visible = false,
        selectedTableRow,
        onClose,
        onMenuPress
    } = props;
    const [imageUrl, setImageUrl] = useState(null);

    if (!visible) return null;
    getImageUrlForBot(selectedCard.imageUrl, 'bot').then((url) => {
        console.log('MAP:  URL', url);
        setImageUrl(url);
    });

    return (
        <BottomSheet
            visible={visible}
            transparent
            hideSlider
            onPressOutside={onClose}
            onDismiss={onClose}
        >
            <View style={{ paddingBottom: 16 }}>
                {imageUrl && (
                    <Image
                        style={stylesLocal.coverImage}
                        source={{
                            uri: imageUrl
                        }}
                    />
                )}
                <View
                    style={{
                        padding: 30,
                        paddingTop: 22
                    }}
                >
                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between'
                        }}
                    >
                        <Text style={stylesLocal.popUpItemTitle}>
                            {selectedCard.title}
                        </Text>
                        {selectedTableRow.rowMenu?.length > 0 && (
                            <Button
                                compact
                                color={GlobalColors.menuSubLable}
                                icon="dots-vertical"
                                onPress={() => {
                                    onMenuPress(selectedTableRow);
                                }}
                            />
                        )}
                    </View>

                    {selectedCard?.info &&
                        _.orderBy(selectedCard.info, ['title'], ['desc']).map(
                            (item) => {
                                const action = getAction(item);
                                const customAction = getCustomAction(item);
                                if (action) {
                                    return (
                                        <View
                                            key={item.id}
                                            style={{
                                                flexDirection: 'row',
                                                marginTop: 15,
                                                alignItems: 'center',
                                                justifyContent: 'space-between'
                                            }}
                                        >
                                            <Text
                                                style={{
                                                    fontSize: 12,
                                                    fontWeight: AppFonts.NORMAL,
                                                    fontStyle: 'normal',
                                                    lineHeight: 16,
                                                    letterSpacing: 0,
                                                    color: GlobalColors.formLable,
                                                    textTransform: 'capitalize'
                                                }}
                                            >
                                                {item.title}
                                            </Text>

                                            {/* <Text style={{ fontWeight: 'normal',
                                            fontStyle: 'normal',
                                            lineHeight: 16,
                                            marginTop: 5,
                                            letterSpacing: 0,
                                            color: GlobalColors.formText }}
                                        >
                                            {selectedCard.data[key]}
                                        </Text> */}
                                            <TouchableOpacity
                                                onPress={() => {
                                                    onRowActionClick(action);
                                                }}
                                            >
                                                <Image source={action.image} />
                                            </TouchableOpacity>
                                        </View>
                                    );
                                }
                                if (customAction) {
                                    return (
                                        <View
                                            key={item.id}
                                            style={{
                                                flexDirection: 'row',
                                                marginTop: 15,
                                                alignItems: 'center',
                                                justifyContent: 'space-between'
                                            }}
                                        >
                                            <Text
                                                style={{
                                                    fontSize: 12,
                                                    fontWeight: AppFonts.NORMAL,
                                                    fontStyle: 'normal',
                                                    lineHeight: 16,
                                                    letterSpacing: 0,
                                                    color: GlobalColors.formLable,
                                                    textTransform: 'capitalize'
                                                }}
                                            >
                                                {item.title}
                                            </Text>
                                            <TouchableOpacity
                                                onPress={() => {
                                                    onRowActionClick(
                                                        customAction
                                                    );
                                                }}
                                            >
                                                <Image
                                                    source={customAction.image}
                                                />
                                            </TouchableOpacity>
                                        </View>
                                    );
                                }
                                return (
                                    <View
                                        key={item.id}
                                        style={{
                                            marginTop: 15,
                                            flexDirection: 'row',
                                            alignItems: 'center'
                                        }}
                                    >
                                        <Text
                                            style={stylesLocal.filedLableText}
                                        >
                                            {item.title + ' : '}
                                        </Text>
                                        <Text
                                            style={stylesLocal.filedvalueText}
                                            onPress={action}
                                        >
                                            {item.value}
                                        </Text>
                                    </View>
                                );
                            }
                        )}
                    {/* <View
                        style={{
                            height: 1,
                            backgroundColor: GlobalColors.formDevider,
                            marginVertical: 12
                        }}
                    /> */}
                    {/* <Button
                        icon="map"
                        color={GlobalColors.primaryButtonColor}
                        onPress={() => {
                            slectedPinAction(selectedMarker);
                        }}
                    >
                        <Text style={stylesLocal.filterModalCreateButtonText}>
                            Show on map
                        </Text>
                    </Button> */}
                </View>
            </View>
        </BottomSheet>
    );
};

const stylesLocal = StyleSheet.create({
    coverImage: {
        height: 240,
        width: '100%',
        resizeMode: 'cover'
    },
    filedvalueText: {
        fontWeight: AppFonts.NORMAL,
        fontStyle: 'normal',
        lineHeight: 16,
        letterSpacing: 0,
        color: GlobalColors.menuSubLable
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
        fontSize: 16,
        fontWeight: AppFonts.BOLD,
        fontStyle: 'normal',
        letterSpacing: 0,
        color: GlobalColors.primaryTextColor
    },
    imageButtonSelected: {
        height: 38,
        width: 42,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: GlobalColors.formSelectedItem
    },
    imageButtonNonSelected: {
        height: 38,
        width: 42,
        backgroundColor: GlobalColors.white,
        alignItems: 'center',
        justifyContent: 'center'
    },
    rightButtonContainer: {
        flexDirection: 'row',
        borderRadius: 4,
        borderWidth: 1,
        overflow: 'hidden',
        borderColor: GlobalColors.formDevider
    },
    filterModalCreateButtonText: {
        fontSize: 14,
        color: GlobalColors.frontmLightBlue,
        textTransform: 'capitalize'
    },
    customActionData: {
        flexDirection: 'row'
    },
    actionValueText: {
        fontWeight: AppFonts.NORMAL,
        fontStyle: 'normal',
        lineHeight: 16,
        letterSpacing: 0,
        color: GlobalColors.menuSubLable,
        marginLeft: 10
    }
});

export default SelectedMapPin;
