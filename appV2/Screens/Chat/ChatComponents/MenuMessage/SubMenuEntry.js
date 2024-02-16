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

const SubMenuEntry = (props) => {
    const [isExpanded, setExpanded] = useState(false);

    const { submenu, onSelectEntry, color } = props;

    const renderEntry = ({ item, index }) => {
        const { label, id, description, icon, titleColor, descriptionColor } =
            item;
        const action = () => {
            if (item.submenu) {
                setExpanded(!isExpanded);
            } else onSelectEntry?.(id);
        };

        return (
            <View key={id}>
                <TouchableOpacity
                    style={styles.subMenuContanier}
                    onPress={action}
                >
                    {icon ? (
                        <Image
                            style={styles.remoteIcon}
                            source={{ uri: icon }}
                            resizeMode="contain"
                        />
                    ) : (
                        <Icon
                            name="perm-identity"
                            type="material"
                            color={color || '#0363b8'}
                            size={30}
                        />
                    )}
                    <View style={styles.textContainer}>
                        <Text style={styles.entryText(titleColor)}>
                            {label}
                        </Text>
                        {description && (
                            <Text
                                style={styles.descriptionText(descriptionColor)}
                            >
                                {description}
                            </Text>
                        )}
                    </View>
                    {item.submenu && (
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
                {item.submenu && isExpanded && (
                    <View>
                        <SubMenuEntry submenu={item.submenu} />
                    </View>
                )}
            </View>
        );
    };

    renderDevider = () => {
        return <View style={{ height: 12 }} />;
    };
    return (
        <FlatList
            style={styles.menu}
            contentContainerStyle={styles.menuContentContainer}
            renderItem={renderEntry}
            keyExtractor={(item) => item.id}
            data={submenu}
            ItemSeparatorComponent={renderDevider}
            bounces={false}
        />
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
    entryText: (color) => ({
        fontSize: 14,
        color: color || GlobalColors.formText
    }),
    descriptionText: (color) => ({
        fontSize: 12,
        opacity: 0.5,
        color: color || GlobalColors.formText
    })
});

export { SubMenuEntry };
