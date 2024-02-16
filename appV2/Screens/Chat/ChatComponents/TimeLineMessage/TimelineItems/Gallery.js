import React, { useEffect, useState } from 'react';
import { View, Dimensions } from 'react-native';
import Carousel, { Pagination } from 'react-native-snap-carousel';

import GlobalColors from '../../../../../config/styles';
import TextLessMoreView from '../../Widgets/TextWithReadMore';
import BotImageView from '../../Widgets/BotImageView';
import BotVideoView from '../../Widgets/BotVideoView';
import NavigationAction from '../../../../../navigation/NavigationAction';
const sliderWidth = Dimensions.get('window').width;

export default Gallery = ({ gallery, text = null }) => {
    const [curretnItem, setCurrentItem] = useState(0);

    const onImageSelected = (index) => {
        NavigationAction.push(NavigationAction.SCREENS.GalleryImageViewer, {
            gallery: gallery,
            curretnIndex: index
        });
    };

    const renderiTem = ({ item, index }) => {
        if (item.type === 'image')
            return (
                <View style={{ flex: 1 }}>
                    <BotImageView
                        style={{ height: sliderWidth }}
                        source={{
                            fileName: item.imageFileUrl.value,
                            scope: item.imageFileUrl.fileScope,
                            displayName: item.imageFileUrl.fileName
                        }}
                        aspectRatio={1}
                        // onPress={() => onImageSelected(index)}
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
        <View style={{ flex: 1 }}>
            {text ? (
                <View style={{ paddingHorizontal: 10, marginBottom: 4 }}>
                    <TextLessMoreView text={text} targetLines={2} />
                </View>
            ) : null}
            {/* )} */}
            <Carousel
                data={gallery}
                renderItem={renderiTem}
                sliderWidth={sliderWidth}
                itemWidth={sliderWidth}
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
                    backgroundColor: GlobalColors.primaryTextColor
                }}
                inactiveDotOpacity={0.4}
                inactiveDotScale={0.6}
            />
        </View>
    );
};
