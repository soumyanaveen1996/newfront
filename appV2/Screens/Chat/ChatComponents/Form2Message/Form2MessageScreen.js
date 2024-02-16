import React from 'react';
import Form2 from './Form2';
export default class Form2MessageScreen extends React.Component {
    constructor(props) {
        super(props);
    }

    setTitle = (title) => {
        this.props.navigation.setOptions({ headerTitle: title });
    };
    render() {
        return <Form2 {...this.props.route.params} setTitle={this.setTitle} />;
    }
}
