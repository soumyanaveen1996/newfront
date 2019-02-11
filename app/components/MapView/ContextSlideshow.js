import React from 'react';
import {
    FlatList,
    View,
    SafeAreaView,
    TouchableOpacity,
    Text,
    Image,
    ScrollView
} from 'react-native';
import { styles } from './styles';
import { BlurView } from 'react-native-blur';
import Icons from '../../config/icons';
import { MapCardType, MapCardDesign } from './config';
import Actions from 'react-native-router-flux';

export default class ContextSlideshow extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.testData = [
            {
                cardId: 1234,
                cardType: 'Type',
                design: 'small', //small or big
                title: 'Title',
                description: 'description',
                imageurl: '',
                seeMoreUrl: '',
                data: {
                    title: 'field1 contact',
                    field2: 12345,
                    field3: true,
                    field4: 'etc',
                    field5: 'etc'
                }
            },
            {
                content: 'TEST COMMAND',
                type: MapCardType.COMMAND_CARD
            },
            {
                content: 'TEST COMMAND',
                type: MapCardType.COMMAND_CARD
            },
            {
                content: 'TEST COMMAND',
                type: MapCardType.COMMAND_CARD
            },
            {
                content: 'TEST COMMAND',
                type: MapCardType.COMMAND_CARD
            },
            {
                content: 'TEST COMMAND',
                type: MapCardType.COMMAND_CARD
            }
        ];
    }

    renderUrlBigCard(item) {
        const content = (
            <View>
                <View>
                    <Text>{item.title}</Text>
                    <Text>{item.description}</Text>
                    <Text>See more</Text>
                </View>
                <Image />
            </View>
        );
        const action = () => {
            Actions.webview(item.seeMoreUrl);
        };
        return {
            action: action,
            content: content
        };
    }

    renderUrlSmallCard(item) {
        const content = (
            <View>
                <Text
                    style={styles.smallCardTitle}
                    numberOfLines={3}
                    ellipsizeMode={'tail'}
                >
                    {item.title}
                </Text>
                <Text>{item.seeMoreUrl}</Text>
            </View>
        );
        const action = () => {
            Actions.webview(item.seeMoreUrl);
        };
        return {
            action: action,
            content: content
        };
    }

    renderActionBigCard(item) {
        const content = (
            <View>
                <Image />
                <Text>{item.title}</Text>
                <Text>{item.description}</Text>
            </View>
        );
        const action = () => null; //Will implement actions later
        return {
            action: action,
            content: content
        };
    }

    renderActionSmallCard(item) {
        const content = (
            <View>
                <Text
                    style={styles.smallCardTitle}
                    numberOfLines={3}
                    ellipsizeMode={'tail'}
                >
                    {item.title}
                </Text>
            </View>
        );
        const action = () => null; //Will implement actions later
        return {
            action: action,
            content: content
        };
    }

    renderDataCard(item) {
        const content = (
            <View>
                <View>
                    <Text
                        style={styles.smallCardTitle}
                        numberOfLines={3}
                        ellipsizeMode={'tail'}
                    >
                        {item.title}
                    </Text>
                </View>
                <Text style={styles.info} numberOfLines={1}>
                    More info
                </Text>
            </View>
        );
        const action = () =>
            this.props.onDataCardSelected(this.renderModalContent(item.data));
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
                    {this.renderDataCardValue(cardData[key], true)}
                </View>
            );
        });
        return (
            <View style={styles.modal}>
                <ScrollView>
                    <View style={styles.topArea}>
                        <Text style={styles.cardTitle}>{cardData.title}</Text>
                        {fields}
                    </View>
                </ScrollView>
            </View>
        );
    }

    renderDataCardValue(value, isModal) {
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
                        style={styles.fieldText}
                        numberOfLines={1}
                        ellipsizeMode={'tail'}
                    >
                        {value.toString()}
                    </Text>
                );
            }
        }
    }

    renderErrorCard(error) {
        const content = (
            <View>
                <Text>ERROR:</Text>
                <Text>{error}</Text>
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
        if (item.type === MapCardType.URL_CARD) {
            card = this.renderUrlBigCard(item);
        } else if (item.type === MapCardType.ACTION_CARD) {
            card = this.renderActionBigCard(item);
        } else if (item.type === MapCardType.DATA_CARD) {
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
        if (item.type === MapCardType.URL_CARD) {
            card = this.renderUrlSmallCard(item);
        } else if (item.type === MapCardType.ACTION_CARD) {
            card = this.renderActionSmallCard(item);
        } else if (item.type === MapCardType.DATA_CARD) {
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
                    // data={this.props.contentData}
                    data={this.testData}
                    renderItem={this.renderItem.bind(this)}
                    extraData={this.props.contentData}
                    horizontal={true}
                    style={{ paddingHorizontal: 15 }}
                />
            );
        }
    }

    render() {
        return (
            <BlurView
                blurType="xlight"
                blurAmount={10}
                style={styles.CSContainer}
            >
                <SafeAreaView>
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
            </BlurView>
        );
    }
}
