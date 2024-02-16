import React from 'react';
import {
    Image,
    TouchableOpacity,
    SafeAreaView,
    Platform,
    ActivityIndicator,
    Linking
} from 'react-native';
import { WebView } from 'react-native-webview';
import images from '../../config/images';
import NavigationAction from '../../navigation/NavigationAction';
import styles from './styles';
import GlobalColors from '../../config/styles';

export default class WebViewScreen extends React.Component {
    constructor(props) {
        super(props);
        this.url = props.route.params.url;
        this.state = {
            openExternalWeb: this.shouldDisplayExternally(),
            hideCloseButton: props.route.params.hideCloseButton ? true : false
        };
    }

    onCloseSlider = () => {
        NavigationAction.pop();
    };

    componentDidMount() {
        if (this.state.openExternalWeb) {
            Linking.openURL(this.props.route.params.url).catch((err) => {
                console.error('An error occurred', err);
                Linking.canOpenURL(
                    'http://docs.google.com/gview?embedded=true&url=' +
                        this.props.route.params.url
                );
            });
            NavigationAction.pop();
        }
    }

    renderLoadingView = () => {
        return (
            <ActivityIndicator
                animating={true}
                color="#0076BE"
                size="large"
                hidesWhenStopped={true}
            />
        );
    };

    render() {
        return (
            <SafeAreaView
                style={{ flex: 1, backgroundColor: GlobalColors.appBackground }}
            >
                {!this.state.hideCloseButton && (
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={this.onCloseSlider.bind(this)}
                    >
                        <Image
                            source={images.btn_close}
                            style={styles.closeImg}
                        />
                    </TouchableOpacity>
                )}
                {!this.openExternalWeb && (
                    <WebView
                        renderLoading={this.renderLoadingView}
                        scalesPageToFit={true}
                        source={{
                            uri: this.url,
                            html: this.props.route.params?.htmlString
                        }}
                    />
                )}
                {this.state.openExternalWeb && (
                    <ActivityIndicator
                        animating={true}
                        color="#0076BE"
                        size="large"
                        style={{
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            top: 0,
                            bottom: 0,
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    />
                )}
            </SafeAreaView>
        );
    }

    shouldDisplayExternally() {
        if (
            this.props.route?.params?.url.endsWith('.pdf') &&
            Platform.OS === 'android'
        ) {
            return true;
        } else {
            return false;
        }
    }
}
