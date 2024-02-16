import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Image } from 'react-native';
import Collapsible from 'react-native-collapsible';

import { Card, Icon } from '@rneui/themed';
import { SubMenuEntry } from './SubMenuEntry';
import GlobalColors from '../../../../config/styles';
import AppFonts from '../../../../config/fontConfig';

const MenuEntry = (props) => {
    const [isExpanded, setExpanded] = useState(false);

    const { item, onSelectEntry } = props;

    const {
        label,
        description,
        id,
        color,
        icon,
        titleColor,
        descriptionColor
    } = item;
    const action = () => {
        if (item.submenu) {
            setExpanded(!isExpanded);
        } else onSelectEntry?.(id);
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={action} key={id} activeOpacity={0.8}>
                <View
                    style={styles.touchContainer(
                        color,
                        label ? undefined : 'center'
                    )}
                >
                    {icon ? (
                        <Image
                            style={styles.remoteCcon(
                                label ? undefined : '100%'
                            )}
                            source={{ uri: icon }}
                            resizeMode="contain"
                        />
                    ) : (
                        <Icon
                            containerStyle={styles.icon}
                            name="perm-identity"
                            type="material"
                            color={GlobalColors.white}
                            size={35}
                        />
                    )}

                    {label && (
                        <View style={styles.textContainer}>
                            <Text style={styles.entryText(titleColor)}>
                                {label}
                            </Text>
                            {description && (
                                <Text
                                    style={styles.entryDescription(
                                        descriptionColor
                                    )}
                                >
                                    {description}
                                </Text>
                            )}
                        </View>
                    )}

                    {item.submenu && (
                        <Icon
                            name={
                                isExpanded
                                    ? 'keyboard-arrow-up'
                                    : 'keyboard-arrow-down'
                            }
                            type="material"
                            color={GlobalColors.white}
                            size={20}
                        />
                    )}
                </View>
                {isExpanded && <View style={styles.triangle(color)} />}
            </TouchableOpacity>

            {item.submenu && (
                <Collapsible collapsed={!isExpanded}>
                    <Card containerStyle={styles.subMenucard}>
                        <SubMenuEntry
                            color={color || GlobalColors.tableItemBackground}
                            submenu={item.submenu}
                            onSelectEntry={onSelectEntry}
                        />
                    </Card>
                </Collapsible>
            )}
        </View>
    );
};
export { MenuEntry };

const styles = StyleSheet.create({
    subMenucard: {
        margin: 0,
        borderRadius: 6,
        borderWidth: 0,
        backgroundColor: GlobalColors.contentBackgroundColor
    },
    textContainer: {
        flex: 1,
        alignContent: 'center',
        marginLeft: 15
    },
    icon: {
        height: 60,
        width: 60,
        borderRadius: 30,
        justifyContent: 'center',
        backgroundColor: GlobalColors.menuDefaultColor
    },
    remoteCcon: (width) => ({
        height: 60,
        width: width || 60,
        borderRadius: 6,
        justifyContent: 'center'
    }),
    container: { flex: 1, margin: 12, marginBottom: 0 },
    touchContainer: (color, flex) => ({
        alignItems: 'center',
        flexDirection: 'row',
        padding: 20,
        justifyContent: flex || 'flex-start',
        backgroundColor: color || GlobalColors.menuDefaultColor,
        borderRadius: 20
    }),
    entryText: (color) => ({
        fontSize: 18,
        marginVertical: 3,
        fontWeight: AppFonts.BOLD,
        justifyContent: 'center',
        color: color || GlobalColors.white
    }),
    entryDescription: (color) => ({
        fontSize: 14,
        marginVertical: 3,
        color: color || GlobalColors.white
    }),
    triangle: (color) => ({
        marginTop: -2,
        alignSelf: 'center',
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: 5,
        borderRightWidth: 5,
        borderTopWidth: 10,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: color || GlobalColors.menuDefaultColor
    })
});
