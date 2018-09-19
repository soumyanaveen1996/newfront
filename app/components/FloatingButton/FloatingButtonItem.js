import React from 'react';
import PropTypes from 'prop-types';
import { Text, View, Animated, TouchableOpacity, Image } from 'react-native';
import { FloatingButtonItemConfig } from './config';
import styles, { itemAnimatedViewStyle } from './styles';

export default class FloatingButtonItem extends React.Component {
    static get defaultProps() {
        return FloatingButtonItemConfig.defaultProps;
    }

    static get propTypes() {
        return {
            active: PropTypes.bool
        };
    }

    render() {
        if (!this.props.active) {
            return undefined;
        }

        return (
            <Animated.View
                pointerEvents="box-none"
                style={[
                    itemAnimatedViewStyle(this.props.anim),
                    styles.itemContainer
                ]}
            >
                <TouchableOpacity onPress={this.props.onPress}>
                    <View style={[styles.itemButton]}>
                        <Image
                            source={this.props.image}
                            style={styles.itemImage}
                        />
                    </View>
                </TouchableOpacity>
                {this.renderTitle()}
            </Animated.View>
        );
    }

    renderTitle() {
        if (!this.props.title) {
            return undefined;
        }

        return (
            <TouchableOpacity onPress={this.props.onPress}>
                <View style={styles.itemTextContainer}>
                    <Text style={[styles.itemText]}>{this.props.title}</Text>
                </View>
            </TouchableOpacity>
        );
    }
}
