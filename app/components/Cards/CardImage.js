import React from 'react';
import { Image } from 'react-native';
export default class CardImage extends React.Component {
    constructor(props) {
        super(props);
        let showPlaceholder = false;
        if (!this.props.source.uri) {
            showPlaceholder = true;
        }
        this.state = {
            showPlaceholder: showPlaceholder
        };
    }

    render() {
        if (this.state.showPlaceholder) {
            return this.props.placeholder;
        } else {
            return (
                <Image
                    {...this.props}
                    onError={() => {
                        this.setState({ showPlaceholder: true });
                    }}
                />
            );
        }
    }
}
