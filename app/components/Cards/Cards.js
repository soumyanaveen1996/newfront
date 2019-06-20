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
import { Actions } from 'react-native-router-flux';
import CardImage from './CardImage';

export default class Cards extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isModalVisible: false
        };
    }

    card = ({ item, index }) => {
        const title = (
            <Text style={styles.title} numberOfLines={2} ellipsizeMode={'tail'}>
                {item.title}
            </Text>
        );
        return (
            <TouchableOpacity
                style={styles.bigCard}
                key={index}
                onPress={this.onCardSelected.bind(this, index)}
            >
                <View style={styles.verticalContainer}>
                    <CardImage
                        style={styles.image}
                        source={{ uri: item.pictureUrl }}
                        alternativeSource={{
                            uri: item.defaultPictureUrl
                        }}
                        resizeMode="contain"
                        placeholder={title}
                    />
                    <Text
                        style={styles.description}
                        ellipsizeMode={'tail'}
                        numberOfLines={3}
                    >
                        {item.description}
                    </Text>
                </View>
                <Text
                    style={styles.action}
                    numberOfLines={1}
                    ellipsizeMode={'tail'}
                    onPress={this.fireAction.bind(this, item.action)}
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
                return <Text style={styles.fieldText}>Yes</Text>;
            } else {
                return <Text style={styles.fieldText}>No</Text>;
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
        if (
            (!this.props.cards[initialIndex].data ||
                this.props.cards[initialIndex].data === []) &&
            this.props.cards[initialIndex].url
        ) {
            Actions.webview({ url: this.props.cards[initialIndex].url });
        } else {
            this.props.onCardSelected(this.renderModalSlideshow(initialIndex));
        }
    }

    renderModalContent({ item, index }) {
        let fields;
        if (item.data) {
            let keys = Object.keys(item.data);
            fields = _.map(keys, key => {
                return (
                    <View style={styles.fieldModal}>
                        <Text style={styles.fieldLabelModal}>{key + ': '}</Text>
                        {this.renderValue(item.data[key], true)}
                    </View>
                );
            });
        }
        return (
            <View style={styles.modalCard}>
                <CardImage
                    style={styles.imageModal}
                    source={{ uri: item.pictureUrl }}
                    alternativeSource={{
                        uri: item.defaultPictureUrl
                    }}
                    resizeMode="contain"
                    placeholder={null}
                />
                <ScrollView>
                    <View style={styles.fieldsModal}>
                        <Text style={styles.titleModal}>{item.title}</Text>
                        {!this.props.cards[index].data ||
                        this.props.cards[index].data === [] ? (
                                <Text style={styles.descriptionModal}>
                                    {item.description + '\n'}
                                    <Text
                                        style={styles.urlModal}
                                        ellipsizeMode={'tail'}
                                        numberOfLines={1}
                                        onPress={() => {
                                            Actions.webview({ url: item.url });
                                            this.props.hideModal();
                                        }}
                                    >
                                        {item.url}
                                    </Text>
                                </Text>
                            ) : (
                                fields
                            )}
                    </View>
                </ScrollView>
                <Text
                    style={styles.action}
                    numberOfLines={1}
                    ellipsizeMode={'tail'}
                    onPress={this.fireAction.bind(this, item.action)}
                >
                    {item.action}
                </Text>
            </View>
        );
    }

    renderModalSlideshow(initialIndex) {
        return (
            <View style={styles.slideshowContainer}>
                <FlatList
                    style={styles.modalSlideshow}
                    data={this.props.cards}
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

    fireAction(action) {
        this.props.hideModal();
        this.props.sendCardAction(action);
    }

    render() {
        return (
            <View>
                <FlatList
                    data={this.props.cards}
                    renderItem={this.card.bind(this)}
                    keyboardShouldPersistTaps="handled"
                    horizontal={true}
                    style={styles.cards}
                    showsHorizontalScrollIndicator={false}
                    decelerationRate="fast"
                    ListFooterComponent={<View style={styles.emptyFooter} />}
                />
            </View>
        );
    }
}
