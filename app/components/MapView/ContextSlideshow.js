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
import { Actions } from 'react-native-router-flux';
import _ from 'lodash';

export default class ContextSlideshow extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.testData = [
            {
                cardId: 1234,
                cardType: MapCardType.DATA_CARD,
                design: 'small', //small or big
                title: 'Title',
                description: 'description',
                imageUrl: '',
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
                cardId: 1235,
                cardType: MapCardType.URL_CARD,
                design: 'small', //small or big
                title:
                    'url title small url title small url title small url title small',
                description:
                    'Sesame snaps bear claw biscuit croissant chupa chups halvah tootsie roll tootsie roll. Tart sugar plum danish liquorice dessert chocolate jujubes sweet toffee. Gummi bears sweet pudding carrot cake. Biscuit pastry caramels marshmallow jelly beans. Jujubes carrot cake cotton candy candy canes jelly cookie candy canes. Lemon drops tootsie roll brownie tiramisu bonbon. Chupa chups chocolate cake chupa chups caramels liquorice jujubes brownie sweet oat cake. Sesame snaps dessert sugar plum toffee marshmallow pudding cupcake chupa chups pie. Macaroon',
                imageUrl:
                    'http://likeafishinwater.com/wp-content/uploads/2012/10/20121014-k2-2.jpg',
                seeMoreUrl: 'www.frontm.com'
            },
            {
                cardId: 1236,
                cardType: MapCardType.URL_CARD,
                design: 'big', //small or big
                title:
                    'url title big url title big url title big url title big url title big',
                description:
                    'Sesame snaps bear claw biscuit croissant chupa chups halvah tootsie roll tootsie roll. Tart sugar plum danish liquorice dessert chocolate jujubes sweet toffee. Gummi bears sweet pudding carrot cake. Biscuit pastry caramels marshmallow jelly beans. Jujubes carrot cake cotton candy candy canes jelly cookie candy canes. Lemon drops tootsie roll brownie tiramisu bonbon. Chupa chups chocolate cake chupa chups caramels liquorice jujubes brownie sweet oat cake. Sesame snaps dessert sugar plum toffee marshmallow pudding cupcake chupa chups pie. Macaroon',
                imageUrl:
                    'http://likeafishinwater.com/wp-content/uploads/2012/10/20121014-k2-2.jpg',
                seeMoreUrl: 'http://www.cupcakeipsum.com'
            },
            {
                cardId: 1237,
                cardType: MapCardType.ACTION_CARD,
                design: 'small', //small or big
                title:
                    'Small action card Small action card Small action card Small action card Small action card Small action card ',
                description:
                    'Sesame snaps bear claw biscuit croissant chupa chups halvah tootsie roll tootsie roll. Tart sugar plum danish liquorice dessert chocolate jujubes sweet toffee. Gummi bears sweet pudding carrot cake. Biscuit pastry caramels marshmallow jelly beans. Jujubes carrot cake cotton candy candy canes jelly cookie candy canes. Lemon drops tootsie roll brownie tiramisu bonbon. Chupa chups chocolate cake chupa chups caramels liquorice jujubes brownie sweet oat cake. Sesame snaps dessert sugar plum toffee marshmallow pudding cupcake chupa chups pie. Macaroon',
                imageUrl:
                    'http://likeafishinwater.com/wp-content/uploads/2012/10/20121014-k2-2.jpg',
                seeMoreUrl: ''
            },
            {
                cardId: 1238,
                cardType: MapCardType.ACTION_CARD,
                design: 'big', //small or big
                title:
                    'Big action card Big action card Big action card Big action card Big action card Big action card ',
                description:
                    'Sesame snaps bear claw biscuit croissant chupa chups halvah tootsie roll tootsie roll. Tart sugar plum danish liquorice dessert chocolate jujubes sweet toffee. Gummi bears sweet pudding carrot cake. Biscuit pastry caramels marshmallow jelly beans. Jujubes carrot cake cotton candy candy canes jelly cookie candy canes. Lemon drops tootsie roll brownie tiramisu bonbon. Chupa chups chocolate cake chupa chups caramels liquorice jujubes brownie sweet oat cake. Sesame snaps dessert sugar plum toffee marshmallow pudding cupcake chupa chups pie. Macaroon',
                imageUrl:
                    'http://likeafishinwater.com/wp-content/uploads/2012/10/20121014-k2-2.jpg',
                seeMoreUrl: ''
            },
            {
                cardId: 1239,
                cardType: MapCardType.DATA_CARD,
                design: 'small', //small or big
                title: 'Title',
                description: 'description',
                imageUrl: '',
                seeMoreUrl: ''
            },
            {
                cardId: 1239,
                cardType: MapCardType.URL_CARD,
                design: 'big', //small or big
                title: 'Title',
                description: 'description',
                imageUrl: '',
                seeMoreUrl: 3
            },
            {
                cardId: 1239,
                cardType: MapCardType.DATA_CARD,
                design: 'small', //small or big
                title: 'Title',
                description: 'description',
                imageUrl: '',
                seeMoreUrl: ''
            }
        ];
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
                    <Text style={styles.seeMore}>See more</Text>
                </View>
                <Image style={{ flex: 1 }} source={{ uri: item.imageUrl }} />
            </View>
        );
        const action = () => Actions.webview({ url: item.seeMoreUrl });
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
        const action = () => null; //Will implement actions later
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
        const action = () => null; //Will implement actions later
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
                <Text style={styles.seeMore} numberOfLines={1}>
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
                    <Text style={styles.dataTitle}>{cardData.title}</Text>
                    {fields}
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
