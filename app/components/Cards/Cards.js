import React from 'react';
import {
    FlatList,
    Text,
    View,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    Image
} from 'react-native';
import styles from './styles';
import _ from 'lodash';
import { Icons } from '../../config/icons';
import Modal from 'react-native-modal';
import { ModalCardSize } from './config';

export default class Cards extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isModalVisible: false
        };
    }

    card = ({ item, index }) => {
        return (
            <TouchableOpacity
                style={styles.bigCard}
                key={index}
                onPress={this.onCardSelected.bind(this)}
            >
                <View style={styles.verticalContainer}>
                    <Image
                        style={{ flex: 1 }}
                        source={{ uri: item.imageUrl }}
                    />
                    <Text
                        style={[
                            styles.description,
                            { marginTop: 5, marginHorizontal: 15 }
                        ]}
                        numberOfLines={2}
                        ellipsizeMode={'tail'}
                    >
                        {item.title}
                    </Text>
                </View>
                <Text
                    style={[
                        styles.footer,
                        { marginHorizontal: 15, marginBottom: 20 }
                    ]}
                    numberOfLines={1}
                    ellipsizeMode={'tail'}
                >
                    {item.description}
                </Text>
                <Text
                    style={[
                        styles.footer,
                        { marginHorizontal: 15, marginBottom: 20 }
                    ]}
                    numberOfLines={1}
                    ellipsizeMode={'tail'}
                >
                    {item.action}
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

    onCardSelected(initialIndex) {
        this.props.onCardSelected(this.renderModalSlideshow(initialIndex));
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

    renderModalSlideshow(initialIndex) {
        return (
            <View style={styles.slideshowContainer}>
                <FlatList
                    style={styles.modalSlideshow}
                    data={this.props.datacardList}
                    renderItem={this.renderModalContent.bind(this)}
                    horizontal={true}
                    snapToInterval={
                        ModalCardSize.WIDTH + ModalCardSize.MARGIN * 2
                    }
                    snapToAlignment="center"
                    decelerationRate="fast"
                    ListFooterComponent={
                        <View style={styles.emptyFooterModal} />
                    }
                    initialScrollIndex={initialIndex}
                    getItemLayout={(data, index) => ({
                        length: ModalCardSize.WIDTH + ModalCardSize.MARGIN * 2,
                        offset:
                            (ModalCardSize.WIDTH + ModalCardSize.MARGIN * 2) *
                            index,
                        index
                    })}
                />
            </View>
        );
    }

    render() {
        return (
            <View>
                <FlatList
                    data={this.props.cards}
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
