import React, { useState } from 'react';
import { View, Dimensions } from 'react-native';
import Carousel, { Pagination } from 'react-native-snap-carousel';
import BotImageView from '../Chat/ChatComponents/Widgets/BotImageView';
import { SafeAreaView } from 'react-native-safe-area-context';
import GlobalColors from '../../config/styles';
import BotVideoView from '../Chat/ChatComponents/Widgets/BotVideoView';
const sliderWidth = Dimensions.get('window').width;

export default GalleryImageViewer = ({ route }) => {
    const { gallery, curretnIndex = 0 } = route.params;
    const [curretnItem, setCurrentItem] = useState(curretnIndex);

    const renderiTem = ({ item, index }) => {
        if (item.type === 'image')
            return (
                <View
                    style={{
                        flex: 1
                    }}
                >
                    <BotImageView
                        source={{
                            fileName: item.imageFileUrl.value,
                            scope: item.imageFileUrl.fileScope,
                            displayName: item.imageFileUrl.fileName
                        }}
                        style={{ width: '100%', height: '100%' }}
                        aspectRatio={1}
                        resizeMode="contain"
                    />
                </View>
            );
        else if (item.type === 'video')
            return (
                <View
                    style={{
                        flex: 1,
                        justifyContent: 'center',
                        backgroundColor: GlobalColors.translucentDark
                    }}
                >
                    <BotVideoView
                        source={{
                            fileName: item.imageFileUrl.value,
                            scope: item.imageFileUrl.fileScope,
                            displayName: item.imageFileUrl.fileName
                        }}
                    />
                </View>
            );
    };
    return (
        <SafeAreaView
            style={{ flex: 1, backgroundColor: GlobalColors.translucentDark }}
        >
            <Carousel
                data={gallery}
                renderItem={renderiTem}
                sliderWidth={sliderWidth}
                itemWidth={sliderWidth}
                firstItem={curretnItem}
                onSnapToItem={(index) => setCurrentItem(index)}
            />
            <Pagination
                dotsLength={gallery.length}
                activeDotIndex={curretnItem}
                containerStyle={{
                    margin: 0,
                    paddingVertical: 4
                }}
                dotStyle={{
                    width: 8,
                    height: 8,
                    borderRadius: 8,
                    marginHorizontal: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.75)'
                }}
                inactiveDotOpacity={0.4}
                inactiveDotScale={0.6}
            />
        </SafeAreaView>
    );
};
