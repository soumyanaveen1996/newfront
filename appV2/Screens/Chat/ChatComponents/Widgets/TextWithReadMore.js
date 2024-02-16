import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import GlobalColors from '../../../../config/styles';
import RenderHTML from 'react-native-render-html';
import utils from '../../../../lib/utils';
import AppFonts from '../../../../config/fontConfig';

const SCREEN_WIDTH = Dimensions.get('window').width;

const MIN_HEIGHT = 100;

const TextLessMoreView = ({ text }) => {
    const [layoutHeight, setLayoutHeight] = useState(-1);
    const [showMore, setShowMore] = useState(false);
    const [lengthMore, setLengthMore] = useState(false); //to show the "Read more & Less Line"

    const urilifiedMessage = text;
    const renderersProps = {
        img: {
            enableExperimentalPercentWidth: true
        },
        a: {
            onPress: (e, href) => {
                utils.openURL(href);
            }
        }
    };

    const toggleShowMore = () => {
        setShowMore(!showMore);
    };

    const heightOfInnerView = () => {
        if (layoutHeight === -1) return undefined;
        if (!showMore && lengthMore) {
            return Math.min(MIN_HEIGHT, layoutHeight);
        }
        return undefined;
    };

    const tagsStyles = React.useMemo(
        () => ({
            html: {
                color: GlobalColors.chatTextColor,
                fontFamily: 'Figtree-Light',
                position: 'relative',
                padding: 0,
                marginTop: 0
            },
            body: {
                padding: 0,
                margin: 0
            },
            p: {
                color: GlobalColors.chatTextColor,
                fontFamily: 'Figtree-Light',
                position: 'relative'
            },
            sub: {
                fontSize: 8,
                position: 'relative',
                textAlignVertical: 'bottom'
            },
            sup: {
                position: 'relative',
                fontSize: 8,
                textAlignVertical: 'top'
            },
            ol: {
                color: GlobalColors.chatTextColor
            },
            strong: {
                color: GlobalColors.chatTextColor
            },
            pre: {
                color: 'pink'
            },
            ul: {
                color: GlobalColors.chatTextColor
            },
            li: {
                color: GlobalColors.chatTextColor
            },
            code: {
                color: 'pink'
            },
            span: {
                color: 'white'
            },
            br: {
                color: GlobalColors.chatTextColor
            }
        }),
        [GlobalColors.chatTextColor]
    );
    const overflowForInnerView = () => {
        if (layoutHeight === -1) return undefined;
        if (!showMore) {
            return 'hidden';
        } else {
            return 'visible';
        }
    };

    const onLayout = (event) => {
        const { height } = event.nativeEvent.layout;
        if (layoutHeight !== -1 && height > 0) return;

        setLengthMore(height > MIN_HEIGHT);
        setLayoutHeight(height);
    };

    console.log('HTML Text');
    // need to add memo
    return (
        <View
            style={{
                width: '100%',
                padding: 0
            }}
        >
            <View
                style={{
                    width: '100%',
                    height: heightOfInnerView(),
                    padding: 0,
                    overflow: overflowForInnerView()
                }}
                onLayout={onLayout}
            >
                <RenderHTML
                    contentWidth={SCREEN_WIDTH - 50}
                    systemFonts={['Figtree-Light']}
                    renderersProps={renderersProps}
                    baseStyle={{
                        fontFamily: 'Figtree-Light',
                        fontSize: 14,
                        color: GlobalColors.chatTextColor,
                        fontWeight: AppFonts.LIGHT
                    }}
                    tagsStyles={{
                        html: {
                            color: GlobalColors.chatTextColor,
                            fontFamily: 'Figtree-Light',
                            position: 'relative',
                            padding: 0,
                            marginTop: 0
                        },
                        body: {
                            padding: 0,
                            margin: 0
                        },
                        p: {
                            color: GlobalColors.chatTextColor,
                            fontFamily: 'Figtree-Light',
                            position: 'relative'
                        },
                        sub: {
                            fontSize: 8,
                            position: 'relative',
                            textAlignVertical: 'bottom'
                        },
                        sup: {
                            position: 'relative',
                            fontSize: 8,
                            textAlignVertical: 'top'
                        },
                        ol: {
                            color: GlobalColors.chatTextColor
                        },
                        strong: {
                            color: GlobalColors.chatTextColor
                        },
                        pre: {
                            color: 'pink'
                        },
                        ul: {
                            color: GlobalColors.chatTextColor
                        },
                        li: {
                            color: GlobalColors.chatTextColor
                        },
                        code: {
                            color: 'pink'
                        },
                        span: {
                            color: 'white'
                        },
                        br: {
                            color: GlobalColors.chatTextColor
                        }
                    }}
                    source={{
                        html: `<html><body>${urilifiedMessage}</body></html>`
                    }}
                />
            </View>
            {lengthMore ? (
                <Text onPress={toggleShowMore} style={styles.lessMoreStyle}>
                    {showMore ? 'Show less' : 'Read more'}
                </Text>
            ) : null}
        </View>
    );
};
const styles = StyleSheet.create({
    txtStyle: {
        fontSize: 14,
        color: GlobalColors.primaryTextColor,
        flex: 1,
        lineHeight: 18
    },
    lessMoreStyle: {
        marginTop: 12,
        fontSize: 14,
        color: GlobalColors.primaryButtonColor
    }
});

function customComparator(prevProps, nextProps) {
    if (prevProps.text !== nextProps.text) {
        return false;
    } else {
        return true;
    }
}
export default React.memo(TextLessMoreView, customComparator);
