import React from 'react';
import { View, Modal, ActivityIndicator } from 'react-native';
import styles from './styles';
import { headerConfig } from './config';

const Loader = props => {
    const { loading, ...attributes } = props;

    return (
        <Modal
            transparent={true}
            animationType={'none'}
            visible={loading}
            onRequestClose={() => {
                console.log('close modal');
            }}
        >
            <View style={styles.modalBackground}>
                <View style={styles.activityIndicatorWrapper}>
                    <ActivityIndicator animating={loading} />
                </View>
            </View>
        </Modal>
    );
};

export default Loader;
