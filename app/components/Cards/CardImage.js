import React from 'react';
import { Image } from 'react-native';
export default class CardImage extends React.Component {
    constructor(props) {
        super(props);
        let showPlaceholder = false;
        let showAlternative = false;
        if (!this.props.source.uri) {
            if (this.props.alternativeSource.uri) {
                showAlternative = true;
            } else {
                showPlaceholder = true;
            }
        }
        this.state = {
            showPlaceholder: showPlaceholder,
            showAlternative: showAlternative
        };
    }

    render() {
        if (this.state.showPlaceholder) {
            return this.props.placeholder;
        } else if (this.state.showAlternative) {
            return (
                <Image
                    {...this.props}
                    source={this.props.alternativeSource}
                    onError={() => {
                        this.setState({
                            showPlaceholder: true,
                            showAlternative: false
                        });
                    }}
                />
            );
        } else {
            return (
                <Image
                    {...this.props}
                    onError={() => {
                        this.setState({ showAlternative: true });
                    }}
                />
            );
        }
    }
}
