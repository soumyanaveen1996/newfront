import React from 'react';
import { Text, StyleSheet } from 'react-native';
import I18n from '../config/i18n/i18n';
import { Card, Button } from '@rneui/themed';
import GlobalColors from '../config/styles';

export default class extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Card
                title={
                    this.props.title
                        ? this.props.title
                        : I18n.t('Network_Error_Title')
                }
            >
                <Text style={Styles.textStyle}>
                    {this.props.message
                        ? this.props.message
                        : I18n.t('Network_Error_Content')}
                </Text>
                <Button
                    icon={{ name: 'refresh' }}
                    buttonStyle={Styles.buttonStyle}
                    title={I18n.t('Retry_Now')}
                    onPress={this.props.onPress}
                />
            </Card>
        );
    }
}
const Styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: GlobalColors.transparent
    },
    titleStyle: {
        color: GlobalColors.red
    },
    textStyle: {
        marginBottom: 30
    },
    buttonStyle: {
        borderRadius: 0,
        marginLeft: 0,
        marginRight: 0,
        marginBottom: 0,
        backgroundColor: GlobalColors.primaryColor
    }
});
