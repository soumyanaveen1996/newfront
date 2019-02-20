import React from 'react';
import {
    FlatList,
    Text,
    View,
    TouchableOpacity,
    ScrollView,
    Dimensions
} from 'react-native';
import styles from './styles';
import _ from 'lodash';
import { Icons } from '../../config/icons';
import Modal from 'react-native-modal';

export default class Datacard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isModalVisible: false
        };
    }

    card = ({ item, index }) => {
        return (
            <TouchableOpacity
                key={index}
                onPress={() => this.onCardSelected(item)}
                style={styles.card}
            >
                <View style={styles.topArea}>
                    <Text
                        style={styles.cardTitle}
                        ellipsizeMode={'tail'}
                        numberOfLines={1}
                    >
                        {item.title}
                    </Text>
                    {this.renderFields(item)}
                </View>
                <Text style={styles.info} numberOfLines={1}>
                    More info
                </Text>
            </TouchableOpacity>
        );
    };

    renderFields(cardData) {
        let keys = Object.keys(cardData);
        keys = keys.slice(1, 3);
        return _.map(keys, key => {
            return (
                <View style={styles.field}>
                    <Text
                        style={styles.fieldLabel}
                        numberOfLines={1}
                        ellipsizeMode={'tail'}
                    >
                        {key + ': '}
                    </Text>
                    {this.renderValue(cardData[key], false)}
                </View>
            );
        });
    }

    renderValue(value, isModal) {
        if (value === null || value === undefined) {
            return <Text style={styles.fieldText}>-</Text>;
        } else if (typeof value === 'boolean') {
            if (value) {
                return Icons.cardsTrue();
            } else {
                return Icons.cardsFalse();
            }
        } else {
            if (isModal) {
                return <Text style={styles.fieldText}>{value.toString()}</Text>;
            } else {
                return (
                    <Text
                        style={[styles.fieldText, { textAlign: 'left' }]}
                        numberOfLines={1}
                        ellipsizeMode={'tail'}
                    >
                        {value.toString()}
                    </Text>
                );
            }
        }
    }

    onCardSelected(cardData) {
        this.props.onCardSelected(this.renderModalSlideshow());
    }

    renderModalContent({ item }) {
        let keys = Object.keys(item);
        keys = keys.slice(1, keys.length);
        const fields = _.map(keys, key => {
            return (
                <View style={styles.fieldModal}>
                    <Text style={styles.fieldLabelModal}>{key + ': '}</Text>
                    {this.renderValue(item[key], true)}
                </View>
            );
        });
        return (
            <View style={styles.modalCard}>
                <ScrollView>
                    <View style={styles.topArea}>
                        <Text style={styles.cardTitle}>{item.title}</Text>
                        {fields}
                    </View>
                </ScrollView>
            </View>
        );
    }

    renderModalSlideshow() {
        return (
            <View style={styles.slideshowContainer}>
                <FlatList
                    style={styles.modalSlideshow}
                    data={this.props.datacardList}
                    renderItem={this.renderModalContent.bind(this)}
                    horizontal={true}
                    snapToInterval={Dimensions.get('window').width * 0.8 + 20}
                    snapToAlignment="center"
                    decelerationRate="fast"
                    ListFooterComponent={
                        <View style={styles.emptyFooterModal} />
                    }
                />
            </View>
        );
    }

    render() {
        return (
            <View>
                <FlatList
                    data={this.props.datacardList}
                    renderItem={this.card.bind(this)}
                    horizontal={true}
                    style={styles.dataCards}
                    showsHorizontalScrollIndicator={false}
                    decelerationRate="fast"
                    ListFooterComponent={<View style={styles.emptyFooter} />}
                />
            </View>
        );
    }
}
