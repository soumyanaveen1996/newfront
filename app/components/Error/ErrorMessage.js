import React from 'react';
import { Text, } from 'react-native';
import Styles from './styles';
import I18n from '../../config/i18n/i18n';
import { Card, Button } from 'react-native-elements'

export default class extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Card title={I18n.t('Network_Error_Title')}>
                <Text style={Styles.textStyle}>
                    {I18n.t('Network_Error_Content')}
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
