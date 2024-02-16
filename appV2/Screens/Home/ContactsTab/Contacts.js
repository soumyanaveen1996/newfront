import React from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Loader } from '../../../widgets';
import styles from './styles';

export default class Contacts extends React.Component {
    render() {
        return (
            <SafeAreaView style={styles.container}>
                <Loader loading={mainLoading} />
            </SafeAreaView>
        );
    }
}
