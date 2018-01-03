import React from 'react';
import styles from './styles';
import { TouchableOpacity } from 'react-native';
import Icons from '../../config/icons';

export default class HeaderRightIcon extends React.Component {
    render() {
        var { config } = this.props;
        return (
            <TouchableOpacity style={styles.defaultHeaderRightIcon} onPress={this.props.onPress}>
                {Icons.renderIcon(config.name, config.type, config.size, config.color, config.underlayColor, config.fontWeight)}
            </TouchableOpacity>
        );
    }
}
