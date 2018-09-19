import React from 'react';
import { Icon } from 'react-native-elements';
import { View, TouchableOpacity } from 'react-native';
import Camera from 'react-native-camera';
import styles from './styles';
import { closeIconConfig } from './config';
import { Actions } from 'react-native-router-flux';

export default class BarcodeScanner extends React.Component {
    state = {
        type: Camera.constants.Type.back
    };

    cancel = () => {
        if (this.props.onCancel) {
            this.props.onCancel();
        }
        this.close();
    };

    close = () => {
        this.camera.stopCapture();
        Actions.pop();
    };

    componentWillUnmount() {
        this.camera.stopCapture();
    }

    onBarcodeRead = result => {
        if (!this.alreadyRead) {
            this.alreadyRead = true;
            if (this.props.onBarcodeRead) {
                this.props.onBarcodeRead(result);
            }
            this.close();
        }
    };

    render() {
        return (
            <View style={styles.container}>
                <Camera
                    ref={cam => {
                        this.camera = cam;
                    }}
                    type={this.state.type}
                    style={styles.preview}
                    audio={true}
                    onBarCodeRead={this.onBarcodeRead.bind(this)}
                    aspect={Camera.constants.Aspect.fill}
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
