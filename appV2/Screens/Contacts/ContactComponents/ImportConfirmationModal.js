import { Text, TouchableOpacity, View } from 'react-native';
import Modal from 'react-native-modal';
import React from 'react';
import styles from '../styles';
import Icons from '../../../config/icons';

export const ImportConfirmModal = ({ isModalVisible, toggleModal }) => (
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
                    Are you sure you want to go back?
                </Text>
                <Text style={[styles.redMsg]}>
                    You will cancel your selection
                </Text>
                <View style={styles.confirmBtnContainer}>
                    <TouchableOpacity
                        style={styles.cancelModalBtn}
                        onPress={() => toggleModal(false)}
                    >
                        <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        title="Yes"
                        style={styles.confirmImportBtn}
                        onPress={() => toggleModal(true)}
                    >
                        <Text style={styles.confirmText}>Yes</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    </Modal>
);
