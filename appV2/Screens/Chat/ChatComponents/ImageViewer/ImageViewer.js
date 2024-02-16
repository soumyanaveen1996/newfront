import React from 'react';
import {
    TouchableOpacity,
    View,
    SafeAreaView,
    StatusBar,
    Platform,
    PermissionsAndroid
} from 'react-native';
import CameraRoll from '@react-native-community/cameraroll';
import Image from './TransformableImage';
import styles from './styles';
import Icons from '../../../../config/icons';
import I18n from '../../../../config/i18n/i18n';
import { HeaderBack } from '../../../../widgets/Header';
import ImageCache from '../../../../lib/image_cache';
import { Toast } from 'react-native-toast-message/lib/src/Toast';

export default class ImageViewer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            saveDisabled: false,
            uri: this.props.route.params.uri
        };
    }

    async componentDidMount() {}

    async hasAndroidPermission() {
        console.log('Amal image URL permission :');
        const permission =
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;

        const hasPermission = await PermissionsAndroid.check(permission);
        console.log('Amal image URL permission :', hasPermission);
        if (hasPermission) {
            return true;
        }

        const status = await PermissionsAndroid.request(permission);
        return status === 'granted';
    }

    // TODO : When updating targetSdkVersion to 11, we should upgrade the CameraRoll library or
    // we use a new library.
    async onImageSave() {
        if (Platform.OS === 'android' && !(await this.hasAndroidPermission())) {
            return;
        }
        this.setState({ saveDisabled: true });
        CameraRoll.saveToCameraRoll(this.state.uri, 'photo')
            .then((result) => {
                if (result) {
                    Toast.show({
                        text1: I18n.t('Image_Save_Success'),
                        type: 'success'
                    });
                } else {
                    Toast.show({
                        text1: I18n.t('Image_Save_Failure')
                    });
                }
                this.setState({ saveDisabled: false });
            })
            .catch((error) => {
                Toast.show({
                    text1: I18n.t('Image_Save_Failure')
                });
            });
    }

    async getImagePathFromCache(uri) {
        return ImageCache.imageCacheManager.getImagePathFromCache(uri);
    }

    render() {
        return (
            <SafeAreaView style={styles.container}>
                <Image
                    style={styles.image}
                    source={{ uri: this.props.route.params.uri }}
                    pixels={{ width: 1920, height: 1080 }}
                />
                <View style={styles.toolbar}>
                    <TouchableOpacity
                        disabled={this.state.saveDisabled}
                        onPress={this.onImageSave.bind(this)}
                        style={styles.saveIcon}
                    >
                        {this.state.saveDisabled
                            ? Icons.toolbarSaveDisbled()
                            : Icons.toolbarSave()}
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }
}
