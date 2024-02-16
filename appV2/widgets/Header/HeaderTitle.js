import React from 'react';

import { View, Text, Platform, Dimensions } from 'react-native';
import GlobalColors from '../../config/styles';
import styles from './styles';
const width = Dimensions.get('screen').width;
export default class HeaderTitle extends React.Component {
    render() {
        return (
            <Text
                style={[
                    styles.headerTitleTxtStyle,
                    { maxWidth: width > 240 ? 220 : width - 60 }
                ]}
                ellipsizeMode="head"
                numberOfLines={
                    this.props.title
                        ? this.props.title.length > 22
                            ? 2
                            : 1
                        : 1
                }
                adjustsFontSizeToFit={true}
                maxFontSizeMultiplier={1}
                allowFontScaling={true}
            >
                {this.props.title}
            </Text>
        );
    }
}
