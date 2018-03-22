import React from 'react';
//import TransformableImage from 'react-native-transformable-image';
import { CameraRoll, TouchableOpacity, View } from 'react-native';
import styles from './styles';
import Icons from '../../config/icons';
import Toast, { DURATION } from 'react-native-easy-toast';
import I18n from '../../config/i18n/i18n';
import { HeaderBack } from '../Header';
import { Actions } from 'react-native-router-flux';

export default class ImageViewer extends React.Component {

    static navigationOptions({ navigation, screenProps }) {
        return {
            headerLeft: <HeaderBack onPress={Actions.pop} />,
        }
    }

    constructor(props) {
        super(props);
        this.state = {
            saveDisabled: false
        };
    }

    onImageSave() {
        this.setState({ saveDisabled: true });
        CameraRoll.saveToCameraRoll(this.props.uri, 'photo')
            .then((result) => {
                if (result) {
                    this.refs.toast.show(I18n.t('Image_Save_Success'), DURATION.LENGTH_SHORT);
                } else {
                    this.refs.toast.show(I18n.t('Image_Save_Failure'), DURATION.LENGTH_SHORT);
                }
                this.setState({ saveDisabled: false });
            })
    }

    // TODO(expo): Remove Transformable Image
    render() {
        return (
            <View style={styles.container}>
                <View style={styles.toolbar}>
                    <TouchableOpacity disabled={this.state.saveDisabled} onPress={this.onImageSave.bind(this)}>
                        {this.state.saveDisabled ? Icons.toolbarSaveDisbled({style: styles.saveIcon}) : Icons.toolbarSave({style: styles.saveIcon}) }
                    </TouchableOpacity>
                </View>
                <Toast ref="toast"/>
            </View>
        )
    }

    /*
    render() {
        return (
            <View style={styles.container}>
                <TransformableImage style={styles.image}
                    source={{ uri: this.props.uri, headers: this.props.headers }}
                />
                <View style={styles.toolbar}>
                    <TouchableOpacity disabled={this.state.saveDisabled} onPress={this.onImageSave.bind(this)}>
                        {this.state.saveDisabled ? Icons.toolbarSaveDisbled({style: styles.saveIcon}) : Icons.toolbarSave({style: styles.saveIcon}) }
                    </TouchableOpacity>
                </View>
                <Toast ref="toast"/>
            </View>
        )
    } */
}

