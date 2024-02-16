import React from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
import GlobalColors from '../../../../config/styles';
import images from '../../../../images';

export default LeftHeaderButton = (props) => {
    return (
        <View style={stylesLocal.rightButtonContainer}>
            <TouchableOpacity
                onPress={props.onMapButtonPress}
                style={
                    this.state.mapView
                        ? stylesLocal.imageButtonSelected
                        : stylesLocal.imageButtonNonSelected
                }
            >
                <Image
                    source={
                        props.mapView
                            ? images.switch_to_map_active
                            : images.switch_to_map_inactive
                    }
                />
            </TouchableOpacity>
            <View
                style={{ width: 1, backgroundColor: GlobalColors.formDevider }}
            />
            {this.state.options?.table && (
                <TouchableOpacity
                    onPress={props.onTableButtonPress}
                    style={
                        this.state.mapView
                            ? stylesLocal.imageButtonNonSelected
                            : stylesLocal.imageButtonSelected
                    }
                    background={GlobalColors.formNonSelectedItem}
                >
                    <Image
                        source={
                            props.mapView
                                ? images.switch_to_table_inactive
                                : images.switch_to_table_active
                        }
                    />
                </TouchableOpacity>
            )}
        </View>
    );
};
