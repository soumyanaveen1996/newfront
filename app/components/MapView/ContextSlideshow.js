import React from 'react';
import {
    FlatList,
    View,
    SafeAreaView,
    TouchableOpacity,
    Text,
    Image,
    ScrollView,
    Platform
} from 'react-native';
import { styles } from './styles';
import { BlurView } from 'react-native-blur';
import Icons from '../../config/icons';
import { MapCardType, MapCardDesign } from './config';
import { Actions } from 'react-native-router-flux';
import _ from 'lodash';
import { Message } from '../../lib/capability';
import GlobalColors from '../../config/styles';

export default class ContextSlideshow extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    renderCard({ item }) {
        let bottomButton;
        if (item.seeMoreUrl) {
            bottomButton = (
                <Text
                    style={styles.seeMore}
                    onPress={() => Actions.webview({ url: item.seeMoreUrl })}
                >
                    See more
                </Text>
            );
        } else if (item.data) {
            bottomButton = (
                <Text
                    style={styles.seeMore}
                    onPress={() =>
                        this.props.openModalWithContent(
                            this.renderModalContent(item)
                        )
                    }
                >
                    More info
                </Text>
            );
        } else if (item.action) {
            bottomButton = (
                <Text
                    style={styles.seeMore}
                    onPress={() => this.props.onActionSelected(item.cardId)}
                >
                    {item.action}
                </Text>
            );
        } else {
            bottomButton = (
                <Text
                    style={styles.seeMore}
                    onPress={() =>
                        this.props.openModalWithContent(
                            this.renderModalContent(item)
                        )
                    }
                >
                    More info
                </Text>
            );
        }
        return (
            <TouchableOpacity
                style={styles.bigCard}
                onPress={() => this.focusOnMarker(item)}
            >
                <View style={styles.horizontalContainer}>
                    <View
                        style={[
                            styles.verticalContainer,
                            { paddingVertical: 20, paddingHorizontal: 15 }
                        ]}
                    >
                        <View>
                            <Text
                                style={styles.title}
                                numberOfLines={1}
                                ellipsizeMode={'tail'}
                            >
                                {item.title}
                            </Text>
                            <Text
                                style={styles.description}
                                numberOfLines={4}
                                ellipsizeMode={'tail'}
                            >
                                {item.description}
                            </Text>
                        </View>
                        {bottomButton}
                    </View>
                    <Image
                        style={{ flex: 1 }}
                        source={{ uri: item.imageUrl }}
                    />
                </View>
            </TouchableOpacity>
        );
    }

    focusOnMarker(card) {
        const markerFound = this.props.focusOnMarker(card.cardId);
        if (!markerFound) {
            this.props.openModalWithContent(this.renderModalContent(card));
        }
    }

    renderModalContent(card) {
        let dataFields;
        if (card.data) {
            let keys = Object.keys(card.data);
            keys = keys.slice(1, keys.length);
            dataFields = _.map(keys, key => {
                return (
                    <View style={styles.fieldModal}>
                        <Text style={styles.fieldLabelModal}>{key + ': '}</Text>
                        {this.renderDataCardValue(card.data[key])}
                    </View>
                );
            });
        }
        return (
            <View style={styles.modal}>
                {card.imageUrl ? (
                    <Image
                        style={styles.imageModal}
                        source={{ uri: card.imageUrl }}
                        resizeMode="cover"
                    />
                ) : null}
                <ScrollView>
                    <View style={styles.fieldsModal}>
                        <Text style={styles.titleModal}>{card.title}</Text>
                        <Text style={styles.descriptionModal}>
                            {card.description + '\n'}
                        </Text>
                        {dataFields}
                    </View>
                </ScrollView>
                <Text
                    style={styles.action}
                    numberOfLines={1}
                    ellipsizeMode={'tail'}
                    onPress={() => this.props.onActionSelected(card.cardId)}
                >
                    {card.action}
                </Text>
            </View>
        );
    }

    renderDataCardValue(value) {
        if (value === null || value === undefined) {
            return <Text style={styles.fieldText}>-</Text>;
        } else if (typeof value === 'boolean') {
            if (value) {
                return Icons.cardsTrue();
            } else {
                return Icons.cardsFalse();
            }
        } else {
            return <Text style={styles.fieldText}>{value.toString()}</Text>;
        }
    }

    renderErrorCard(error) {
        const content = (
            <View>
                <Text style={[styles.smallCardTitle, { color: 'red' }]}>
                    ERROR:
                </Text>
                <Text style={[styles.smallCardTitle, { color: 'red' }]}>
                    {error}
                </Text>
            </View>
        );
        const action = () => null;
        return {
            action: action,
            content: content
        };
    }

    renderFlatList() {
        if (this.props.isOpen) {
            return (
                <FlatList
                    ref={ref => {
                        this.list = ref;
                    }}
                    data={this.props.contentData || []}
                    // data={this.testData}
                    renderItem={this.renderCard.bind(this)}
                    extraData={this.props}
                    horizontal={true}
                    decelerationRate="fast"
                    style={{ paddingHorizontal: 15 }}
                />
            );
        }
    }

    scrollToIndex(index) {
        if (this.list) {
            this.list.scrollToIndex({ index: index, viewOffset: 0 });
        }
    }

    scrollToCard(id) {
        const index = _.findIndex(this.props.contentData, card => {
            return card.cardId === id;
        });
        if (index >= 0) {
            this.scrollToIndex(index);
        }
    }

    renderBlur() {
        return (
            <BlurView
                blurType="xlight"
                blurAmount={10}
                style={styles.blurContent}
            />
        );
    }

    render() {
        let bottomForSlideshow;
        if (this.props.isOpen) {
            bottomForSlideshow = 0;
        } else {
            bottomForSlideshow = -210;
        }
        return (
            <View
                style={
                    Platform.OS === 'ios'
                        ? [styles.CSContainer, { bottom: bottomForSlideshow }]
                        : [
                            styles.CSContainer,
                            {
                                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                                bottom: bottomForSlideshow
                            }
                        ]
                }
            >
                {Platform.OS === 'ios' ? this.renderBlur() : null}
                <SafeAreaView style={{ flex: 1 }}>
                    <TouchableOpacity
                        onPress={this.props.closeAndOpenSlideshow}
                        style={{ paddingVertical: 10 }}
                    >
                        {this.props.isOpen
                            ? Icons.arrowDown({
                                color: GlobalColors.headerBlack
                            })
                            : Icons.arrowUp()}
                    </TouchableOpacity>
                    {this.renderFlatList()}
                </SafeAreaView>
            </View>
        );
    }
}
