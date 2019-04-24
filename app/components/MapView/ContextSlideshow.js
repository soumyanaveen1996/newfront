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

export default class ContextSlideshow extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    renderUrlBigCard(item) {
        if (
            !item.seeMoreUrl ||
            typeof item.seeMoreUrl !== 'string' ||
            item.seeMoreUrl === ''
        ) {
            return this.renderErrorCard('url missing');
        }
        const content = (
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
                    <Text
                        style={styles.seeMore}
                        onPress={() =>
                            Actions.webview({ url: item.seeMoreUrl })
                        }
                    >
                        See more
                    </Text>
                </View>
                <Image style={{ flex: 1 }} source={{ uri: item.imageUrl }} />
            </View>
        );
        const action = () => this.props.focusOnMarker(item.cardId);
        return {
            action: action,
            content: content
        };
    }

    renderUrlSmallCard(item) {
        if (
            !item.seeMoreUrl ||
            typeof item.seeMoreUrl !== 'string' ||
            item.seeMoreUrl === ''
        ) {
            return this.renderErrorCard('url missing');
        }
        const content = (
            <View style={styles.verticalContainer}>
                <Text
                    style={styles.smallCardTitle}
                    numberOfLines={3}
                    ellipsizeMode={'tail'}
                >
                    {item.title}
                </Text>
                <Text
                    style={styles.footer}
                    numberOfLines={1}
                    ellipsizeMode={'tail'}
                >
                    {item.seeMoreUrl}
                </Text>
            </View>
        );
        const action = () => Actions.webview({ url: item.seeMoreUrl });
        return {
            action: action,
            content: content
        };
    }

    renderActionBigCard(item) {
        const content = (
            <View style={styles.verticalContainer}>
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
            </View>
        );
        const action = () => this.props.onCardSelected(item.cardId);
        return {
            action: action,
            content: content
        };
    }

    renderActionSmallCard(item) {
        const content = (
            <View style={styles.verticalContainer}>
                <Text
                    style={styles.smallCardTitle}
                    numberOfLines={3}
                    ellipsizeMode={'tail'}
                >
                    {item.title}
                </Text>
            </View>
        );
        const action = () => this.props.onCardSelected(item.cardId);
        return {
            action: action,
            content: content
        };
    }

    renderDataCard(item) {
        if (
            !item.data ||
            typeof item.data !== 'object' ||
            item.data.length < 1
        ) {
            return this.renderErrorCard('data not found');
        }
        const content = (
            <View style={styles.verticalContainer}>
                <View>
                    <Text
                        style={styles.smallCardTitle}
                        numberOfLines={3}
                        ellipsizeMode={'tail'}
                    >
                        {item.title}
                    </Text>
                </View>
                <Text
                    style={styles.seeMore}
                    numberOfLines={1}
                    onPress={() =>
                        this.props.onDataCardSelected(
                            this.renderModalContent(item.data)
                        )
                    }
                >
                    More info
                </Text>
            </View>
        );
        const action = () => this.props.focusOnMarker(item.cardId);
        return {
            action: action,
            content: content
        };
    }

    renderModalContent(cardData) {
        let keys = Object.keys(cardData);
        keys = keys.slice(1, keys.length);
        const fields = _.map(keys, key => {
            return (
                <View style={styles.fieldModal}>
                    <Text style={styles.fieldLabelModal}>{key + ': '}</Text>
                    {this.renderDataCardValue(cardData[key])}
                </View>
            );
        });
        return (
            <View style={styles.modal}>
                <ScrollView>
                    <Text style={styles.dataTitle}>{cardData.title}</Text>
                    {fields}
                </ScrollView>
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

    renderBigCard(item) {
        let card;
        if (item.cardType === MapCardType.URL_CARD) {
            card = this.renderUrlBigCard(item);
        } else if (item.cardType === MapCardType.ACTION_CARD) {
            card = this.renderActionBigCard(item);
        } else if (item.cardType === MapCardType.DATA_CARD) {
            card = this.renderDataCard(item);
        } else {
            card = this.renderErrorCard('Card type not found');
        }
        return (
            <TouchableOpacity style={styles.bigCard} onPress={card.action}>
                {card.content}
            </TouchableOpacity>
        );
    }

    renderSmallCard(item) {
        let card;
        if (item.cardType === MapCardType.URL_CARD) {
            card = this.renderUrlSmallCard(item);
        } else if (item.cardType === MapCardType.ACTION_CARD) {
            card = this.renderActionSmallCard(item);
        } else if (item.cardType === MapCardType.DATA_CARD) {
            card = this.renderDataCard(item);
        } else {
            card = this.renderErrorCard('Card type not found');
        }
        return (
            <TouchableOpacity style={styles.smallCard} onPress={card.action}>
                {card.content}
            </TouchableOpacity>
        );
    }

    renderItem({ item }) {
        if (item.design === MapCardDesign.BIG) {
            return this.renderBigCard(item);
        } else {
            return this.renderSmallCard(item);
        }
    }

    renderFlatList() {
        if (this.props.isOpen) {
            return (
                <FlatList
                    data={this.props.contentData || []}
                    // data={this.testData}
                    renderItem={this.renderItem.bind(this)}
                    extraData={this.props}
                    horizontal={true}
                    decelerationRate="fast"
                    style={{ paddingHorizontal: 15 }}
                />
            );
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
                            ? Icons.contextSlideshowButtonDown()
                            : Icons.contextSlideshowButtonUp()}
                    </TouchableOpacity>
                    {this.renderFlatList()}
                </SafeAreaView>
            </View>
        );
    }
}
