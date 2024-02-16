import React from 'react';
import {
    TouchableOpacity,
    Text,
    View,
    FlatList,
    SafeAreaView,
    Modal
} from 'react-native';
import _ from 'lodash';
import { Actions } from 'react-native-router-flux';
import styles from './styles';
import Icons from '../../../../config/icons';
import GlobalColors from '../../../../config/styles';
import modalStyle from '../styles';

import { HeaderTitle } from '../../../../widgets/Header';

export default class LookupResults extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            lookupModalInfo: {},
            showModal: false
        };
    }

    componentDidMount() {
        const { navigation, title, onBack } = this.props;
        this.props.navigation.setParams({
            title,
            onBack: () => {
                onBack();
                Actions.pop();
            }
        });
    }

    renderInfoModal() {
        const { lookupModalInfo } = this.state;
        let keys = Object.keys(lookupModalInfo);
        keys = keys.slice(1, keys.length);
        const fields = _.map(keys, (key) => (
            <View style={[modalStyle.fieldModal, { paddingHorizontal: 20 }]}>
                <Text style={modalStyle.fieldLabelModal}>{`${key}: `}</Text>
                {this.renderModalInfoValue(lookupModalInfo[key], true)}
            </View>
        ));
        return (
            <TouchableOpacity
                style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '100%',
                    height: '100%'
                }}
                activeOpacity={1}
                onPress={() => {
                    this.setState({ showModal: false });
                }}
            >
                <FlatList
                    style={{
                        width: '80%',
                        maxHeight: '70%',
                        backgroundColor: GlobalColors.appBackground,
                        borderRadius: 10,
                        opacity: 1,
                        flexGrow: 0
                    }}
                    data={keys}
                    renderItem={({ item, index }) => (
                        <TouchableOpacity
                            style={[
                                modalStyle.fieldModal,
                                { paddingHorizontal: 20 }
                            ]}
                            activeOpacity={1}
                        >
                            <Text style={modalStyle.fieldLabelModal}>
                                {`${item}: `}
                            </Text>
                            {this.renderModalInfoValue(
                                lookupModalInfo[item],
                                true
                            )}
                        </TouchableOpacity>
                    )}
                />
            </TouchableOpacity>
        );
    }

    renderModalInfoValue(value, isModal) {
        if (value === null || value === undefined) {
            return <Text style={modalStyle.fieldText}>-</Text>;
        }
        if (typeof value === 'boolean') {
            if (value) {
                return Icons.cardsTrue();
            }
            return Icons.cardsFalse();
        }
        if (isModal) {
            return <Text style={modalStyle.fieldText}>{value.toString()}</Text>;
        }
        return (
            <Text
                style={[modalStyle.fieldText, { textAlign: 'left' }]}
                numberOfLines={1}
                ellipsizeMode="tail"
            >
                {value.toString()}
            </Text>
        );
    }

    renderInfo = (info) => {
        if (info && info.length > 0) {
            return (
                <TouchableOpacity
                    onPress={() => {
                        this.setState({
                            lookupModalInfo: item.info,
                            showModal: true
                        });
                    }}
                >
                    {Icons.info({ size: 24 })}
                </TouchableOpacity>
            );
        }
    };

    renderLookupEntry({ item }) {
        const { onSelect, onBack } = this.props;
        return (
            <TouchableOpacity
                style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    width: '100%',
                    alignItems: 'center',
                    paddingHorizontal: 30,
                    paddingVertical: 15
                }}
                onPress={() => {
                    onBack();
                    onSelect(item);
                }}
            >
                <Text
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={styles.resultText}
                >
                    {item.text}
                </Text>
                {this.renderInfo(item.info)}
            </TouchableOpacity>
        );
    }

    render() {
        const { results } = this.props;
        const { showModal, lookupModalInfo } = this.state;

        return (
            // <View style={styles.lookUpModalResults}>
            <SafeAreaView>
                <FlatList
                    data={results}
                    keyboardShouldPersistTaps="handled"
                    renderItem={this.renderLookupEntry.bind(this)}
                    ItemSeparatorComponent={() => (
                        <View
                            style={{
                                height: 1,
                                backgroundColor: GlobalColors.disabledGray
                            }}
                        />
                    )}
                />
                {showModal && <View style={styles.modalBackground} />}
                <Modal animationType="fade" visible={showModal} transparent>
                    {this.renderInfoModal()}
                </Modal>
            </SafeAreaView>
            // </View>
        );
    }
}
