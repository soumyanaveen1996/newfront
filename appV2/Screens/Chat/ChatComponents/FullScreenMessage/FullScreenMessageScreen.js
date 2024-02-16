import React from 'react';
import { HeaderTitle } from '../../../../widgets/Header';
import FullScreenMessage from './FullScreenMessage';
export default class FullScreenMessageScreen extends React.Component {
    constructor(props) {
        super(props);
    }

    setTitle = (title) => {
        this.props.navigation.setParams({ title: title });
    };
    render() {
        return (
            <FullScreenMessage
                {...this.props.route.params}
                navigation={this.props.navigation}
                setTitle={this.setTitle}
            />
        );
    }
}
