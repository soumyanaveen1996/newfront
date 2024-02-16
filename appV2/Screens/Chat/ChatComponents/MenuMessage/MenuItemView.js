import React, { useState } from 'react';
import {
    FlatList,
    View,
    TouchableOpacity,
    Text,
    StyleSheet,
    Image
} from 'react-native';

import { Icon } from '@rneui/themed';
import GlobalColors from '../../../../config/styles';

const MenuItemView = (props) => {
    const {
        label,
        description,
        color,
        titleColor,
        icon,
        subMenuAvailable,
        isExpanded
    } = props;
    return (
        <View key={id}>
            <TouchableOpacity style={styles.subMenuContanier} onPress={action}>
                <Image
                    style={styles.remoteIcon}
                    source={{ uri: icon }}
                    resizeMode="stretch"
                />
                <View style={styles.textContainer}>
                    <Text style={styles.entryText}>{label}</Text>
                    {description && (
                        <Text style={styles.descriptionText}>
                            {description}
                        </Text>
                    )}
                </View>
                {subMenuAvailable && (
                    <Icon
                        name={
                            isExpanded
                                ? 'keyboard-arrow-up'
                                : 'keyboard-arrow-down'
                        }
                        type="material"
                        color={GlobalColors.formText}
                        size={20}
                    />
                )}
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    textContainer: {
        flex: 1,
        alignContent: 'center',
        marginLeft: 15
    },
    subMenuContanier: {
        alignItems: 'center',
        flexDirection: 'row',
        paddingHorizontal: 15
    },
    remoteIcon: {
        height: 50,
        width: 50,
        justifyContent: 'center'
    },
    touchContainer: {
        alignItems: 'center',
        flexDirection: 'row',
        paddingHorizontal: 15,
        backgroundColor: 'blue',
        borderRadius: 20
    },
    entryText: {
        fontSize: 14,
        color: GlobalColors.formText
    },
    descriptionText: {
        fontSize: 12,
        opacity: 0.5,
        color: GlobalColors.formText
    }
});

export { MenuItemView };
