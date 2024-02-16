import React from 'react';
import { Icon } from '@rneui/themed';
import { View, TouchableOpacity } from 'react-native';
import { RNCamera as Camera } from 'react-native-camera';

import styles from './styles';
import { closeIconConfig } from './config';
import NavigationAction from '../../navigation/NavigationAction';

export default class BarcodeScanner extends React.Component {
    state = {
        type: Camera.Constants.Type.back
    };

    cancel = () => {
        const {
            route: {
                params: { onCancel }
            }
        } = this.props;
        if (onCancel) {
            onCancel();
        }
        this.close();
    };

    close = () => {
        this.camera.stopRecording();
        NavigationAction.pop();
    };

    componentWillUnmount() {
        this.camera.stopRecording();
    }

    onBarcodeRead = (result) => {
        if (!this.alreadyRead) {
            this.alreadyRead = true;
            const {
                route: {
                    params: { onBarcodeRead }
                }
            } = this.props;
            if (onBarcodeRead) {
                onBarcodeRead(result);
            }
            this.close();
        }
    };

    render() {
        return (
            <View style={styles.container}>
                <Camera
                    ref={(cam) => {
                        this.camera = cam;
                    }}
                    type={this.state.type}
                    style={styles.preview}
                    audio
                    onBarCodeRead={this.onBarcodeRead.bind(this)}
                />
                <TouchableOpacity
                    style={styles.closeButton}
                    onPress={this.cancel.bind(this)}
                >
                    <Icon
                        type={closeIconConfig.type}
                        name={closeIconConfig.name}
                        size={closeIconConfig.size}
                        underlayColor={closeIconConfig.underlayColor}
                        color={closeIconConfig.color}
                        fontWeight={closeIconConfig.fontWeight}
                    />
                </TouchableOpacity>
            </View>
        );
    }
}
