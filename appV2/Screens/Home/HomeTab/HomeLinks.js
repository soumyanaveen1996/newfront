import React, { useState } from 'react';
import {
    Text,
    View,
    Image,
    TouchableOpacity,
    Dimensions,
    StyleSheet,
    Platform
} from 'react-native';
import { Card } from 'react-native-paper';
import NavigationAction from '../../../navigation/NavigationAction';
import Carousel, { Pagination } from 'react-native-snap-carousel';
import GlobalColors from '../../../config/styles';
import Store from '../../../redux/store/configureStore';
import images from '../../../config/images';
import Bot from '../../../lib/bot';
import configToUse from '../../../config/config';
import { CachedImage } from '../../../widgets';
import { useSelector } from 'react-redux';
const SCREEN_WIDTH = Dimensions.get('window').width;
//maintain 320:120
const ITEM_WIDTH = Dimensions.get('window').width * 0.8;
const ITEM_HEIGHT = (120 * Dimensions.get('window').width * 0.8) / 320;
const ITEM_HEIGHT_FULL = Dimensions.get('window').height - 200;

const links = configToUse.homeBannerlinks; //Temporary till we have API. supports dev and prod config.
export const handleBannerClicks = (item) => {
    if (item.type === 'screen') {
        NavigationAction.push(item.data);
    } else if (item.type === 'bot') {
        Bot.getInstalledBots().then((bots) => {
            const targetBot = bots.find((bot) => bot.botId === item.data);
            NavigationAction.goToBotChat({
                bot: targetBot,
                botName: targetBot.botName,
                otherUserId: false,
                botLogoUrl: targetBot.logoUrl
            });
        });
    }
};
export default HomeLinks = (props) => {
    const [curretnItem, setCurrentItem] = useState(0);
    const list = links[Store.getState().user.currentDomain] || links['onship'];
    const renderItem = ({ item }) => {
        return (
            <View style={{ padding: 6 }}>
                <Card
                    onPress={() => {
                        handleBannerClicks(item);
                    }}
                    style={[
                        styles.bannerCard,
                        {
                            height: props.fullScreen
                                ? ITEM_HEIGHT_FULL
                                : ITEM_HEIGHT + 12
                        }
                    ]}
                >
                    <CachedImage
                        imageTag={item.info}
                        source={{ uri: item.image }}
                        style={styles.bannerImage}
                        resizeMode="cover"
                    />
                </Card>
            </View>
        );
    };
    return (
        <View
            style={{
                backgroundColor: GlobalColors.appBackground,
                paddingTop: 8,
                overflow: 'visible'
            }}
        >
            <Carousel
                style={{ overflow: 'visible', backgroundColor: 'red' }}
                sliderWidth={SCREEN_WIDTH}
                itemWidth={ITEM_WIDTH + 12} //Adding extra for shdow
                itemHeight={
                    props.fullScreen ? ITEM_HEIGHT_FULL : ITEM_HEIGHT + 12
                }
                data={list}
                layoutCardOffset={50}
                renderItem={renderItem}
                onSnapToItem={(index) => setCurrentItem(index)}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    dotStyle: {
        width: 8,
        height: 8,
        borderRadius: 8,
        marginHorizontal: -20,
        backgroundColor: 'rgba(0, 0, 0, 0.75)'
    },
    bannerImage: { height: '100%', width: '100%', borderRadius: 6 },
    bannerCard: {
        padding: 0,
        ...Platform.select({
            ios: {},
            android: { elevation: 5 }
        }),
        marginLeft: -12,
        borderRadius: 6,
        // height: ITEM_HEIGHT,
        justifyContent: 'center',
        alignContent: 'center',
        margin: 4
    }
});
