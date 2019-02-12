import React from 'react';
import { WebView, Image, TouchableOpacity, SafeAreaView } from 'react-native';
import { Actions } from 'react-native-router-flux';
import images from '../../config/images';
import styles from './styles';

export default class WebViewScreen extends React.Component {
    constructor(props) {
        super(props);
    }

    onCloseSlider = () => {
        Actions.pop();
    };

    render() {
        console.log('GGGGGGGGG');
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
                <TouchableOpacity
                    style={styles.closeButton}
                    onPress={this.onCloseSlider.bind(this)}
                >
                    <Image source={images.btn_close} style={styles.closeImg} />
                </TouchableOpacity>
                <WebView
                    scalesPageToFit={true}
                    source={{
                        uri: this.props.url,
                        html: this.props.htmlString
                    }}
                />
            </SafeAreaView>
        );
    }
}
