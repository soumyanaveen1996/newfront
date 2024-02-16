// original source: https://gist.github.com/pedrocunha/dbecbbf0223e1aff48aaebea5461d30e 🙇
import React, { useEffect, useRef } from 'react';
import {
    TouchableOpacity,
    Animated,
    Dimensions,
    Modal,
    PanResponder,
    StyleSheet,
    View
} from 'react-native';

import GlobalColors from '../../../../config/styles';
/**
 * Displays a bottomsheet.
 * @param onDismiss use this callback to set visisbility to false.
 *                  Triggered when used swipes down and closes the sheet.
 * @param onPressOutside  use this to close the bottomsheet if required.
 *                   Triggered when pressed putside the display.
 * @param visible bottomsheet is displayed if true
 */
export default (props) => {
    const screenHeight = Dimensions.get('screen').height;
    const panY = useRef(new Animated.Value(screenHeight)).current;

    const resetPositionAnim = Animated.timing(panY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true
    });

    const closeAnim = Animated.timing(panY, {
        toValue: screenHeight,
        duration: 500,
        useNativeDriver: true
    });

    const translateY = panY.interpolate({
        inputRange: [-1, 0, 1],
        outputRange: [0, 0, 1]
    });

    const handleDismiss = () => closeAnim.start(props.onDismiss);

    useEffect(() => {
        resetPositionAnim.start();
    }, [resetPositionAnim]);

    const panResponders = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => false,
            onPanResponderMove: Animated.event([null, { dy: panY }], {
                useNativeDriver: false
            }),
            onPanResponderRelease: (_, gs) => {
                if (gs.dy > 0 && gs.vy > 2) {
                    return handleDismiss();
                }
                return resetPositionAnim.start();
            }
        })
    ).current;

    return (
        <Modal
            animated
            animationType="fade"
            visible={props.visible}
            transparent
            onRequestClose={handleDismiss}
        >
            <View style={styles.overlay}>
                <TouchableOpacity
                    style={{ flex: 1 }}
                    onPress={() => {
                        props.onPressOutside?.();
                    }}
                >
                    <View style={{ flex: 1 }} />
                </TouchableOpacity>
                <Animated.View
                    style={[
                        {
                            ...styles.container,
                            transform: [{ translateY }]
                        },
                        props.hideSlider && { paddingTop: 0 }
                    ]}
                    {...panResponders.panHandlers}
                >
                    {!props.hideSlider && (
                        <View style={styles.sliderIndicatorRow}>
                            <View style={styles.sliderIndicator} />
                        </View>
                    )}
                    {props.children}
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        backgroundColor: '#00000080',
        flex: 1,
        justifyContent: 'flex-end'
    },
    container: {
        backgroundColor: GlobalColors.appBackground,
        paddingTop: 12,
        borderTopRightRadius: 12,
        borderTopLeftRadius: 12,
        minHeight: 200,
        overflow: 'hidden'
    },
    sliderIndicatorRow: {
        flexDirection: 'row',
        marginBottom: 4,
        alignItems: 'center',
        justifyContent: 'center'
    },
    sliderIndicator: {
        backgroundColor: '#CECECE',
        height: 4,
        width: 45
    }
});
