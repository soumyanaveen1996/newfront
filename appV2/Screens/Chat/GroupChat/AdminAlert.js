import { Text, TouchableOpacity, View } from 'react-native';
import Modal from 'react-native-modal';
import React from 'react';
import styles from './styles';
import Icons from '../../../config/icons';

 const AdminAlert = ({ isModalVisible, toggleModal,msgTitle,msgDescription }) => (
    <Modal isVisible={isModalVisible}>
        <View style={styles.groupConfirm}>
            <TouchableOpacity
                style={styles.closeModalContainer}
                onPress={() => toggleModal(false)}
            >
                {Icons.close({
                    color: '#9c9ea7',
                    size: 35
                })}
            </TouchableOpacity>
            <View style={styles.groupModalInnerContainer}>
                {/* eslint-disable-next-line max-len */}
                <Text style={styles.groupConfirmText}>
                    {msgTitle}
                </Text>
                <Text style={[styles.adminSubMsg]}>
                    {msgDescription}
                </Text>
                <TouchableOpacity
                    title="Yes"
                    style={styles.adminConfirmBtn}
                    onPress={() => toggleModal(false)}
                >
                    <Text style={styles.confirmText}>Ok</Text>
                </TouchableOpacity>
            </View>
        </View>
    </Modal>
);

export default AdminAlert;
