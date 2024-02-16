import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { Icon } from '@rneui/themed';
import GlobalColors from '../../../../../config/styles';
import images from '../../../../../images';
import utils from '../../../../../lib/utils';
import ProfileImage from '../../../../../widgets/ProfileImage';
import Files from './Files';
import Gallery from './Gallery';
import Survey from './Survey';
import TextPost from './TextPost';
import LinearGradient from 'react-native-linear-gradient';
import { Image } from 'react-native';
import AppFonts from '../../../../../config/fontConfig';

const POST_TYPE = {
    text: 'text',
    link: 'link',
    gallery: 'gallery',
    location: 'location',
    file: 'file',
    survey: 'survey'
};

const getNewPostIndicators = (showAuthor, isViewed, newIndicator) => {
    if (isViewed === false)
        return (
            <LinearGradient
                colors={[
                    showAuthor
                        ? GlobalColors.primaryColor + '77'
                        : GlobalColors.primaryColor + '44',
                    GlobalColors.primaryColor + '00'
                ]}
                style={{
                    position: 'absolute',
                    width: '100%',
                    height: showAuthor ? 56 : 40
                }}
            />
        );
    return null;
};
const customComparator = (prevProps, nextProps) => {
    if (
        prevProps.showAuthor !== nextProps.showAuthor ||
        prevProps.newIndicator !== nextProps.newIndicator ||
        prevProps.isViewed !== nextProps.isViewed
    ) {
        return false;
    } else {
        return true;
    }
};

React.memo(getNewPostIndicators, customComparator);

function areEqual(prevProps, nextProps) {
    return prevProps === nextProps;
    /*
    return true if passing nextProps to render would return
    the same result as passing prevProps to render,
    otherwise return false
    */
}

const SocialPost = (props) => {
    const {
        item,
        toggleBookmark,
        startSurvey,
        surveyStatusMap,
        showAuthor = true
    } = props;
    const [newIndicator, setNewIndicator] = useState(
        item.isViewed == true ? false : true
    );

    useEffect(() => {
        if (item.isViewed != true) {
            setTimeout(() => {
                setNewIndicator(false);
            }, 3000);
        }
    }, []);

    return (
        <View>
            <View style={styles.socialPostContainer}>
                {getNewPostIndicators(showAuthor, item.isViewed, newIndicator)}
                <View style={styles.headerContainer}>
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center'
                        }}
                    >
                        {showAuthor && (
                            <View
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center'
                                }}
                            >
                                <ProfileImage
                                    // uuid={item.publisherId}
                                    placeholder={images.user_image}
                                    style={styles.profileImage}
                                    placeholderStyle={styles.profileImage}
                                    resizeMode="cover"
                                />
                                <Text style={styles.autherName}>
                                    {item?.publisherData?.name}
                                </Text>
                                <Icon
                                    name="circle"
                                    size={6}
                                    style={{ padding: 0, marginLeft: 8 }}
                                    color={GlobalColors.descriptionText}
                                />
                            </View>
                        )}
                        <Text style={styles.postTime}>
                            {utils.formattedDate(item.publishedOn)}
                        </Text>
                    </View>
                    {item.isViewed != true && newIndicator && (
                        <Image
                            source={images.newPost_incicator}
                            style={{ marginRight: 8 }}
                        />
                    )}
                </View>

                <View style={styles.postContainer}>
                    {getBody(item, startSurvey, surveyStatusMap)}
                </View>
                <View style={styles.PostFooter}>
                    <TouchableOpacity>
                        <Icon
                            onPress={() => {
                                toggleBookmark(item);
                            }}
                            name={
                                item.isBookmarked
                                    ? 'bookmark'
                                    : 'bookmark-outline'
                            }
                            color={
                                item.isBookmarked
                                    ? GlobalColors.primaryColor
                                    : GlobalColors.socialPostTime
                            }
                        />
                    </TouchableOpacity>
                    {/* <Text style={styles.bookmarkCountText}>
                    {item.bookmarkedCount}
                </Text> */}
                </View>
            </View>
        </View>
    );
};

const getBody = (item, startSurvey, surveyStatusMap) => {
    if (item.contentListView === POST_TYPE.text)
        return <TextPost text={item.text} />;
    if (item.contentListView === POST_TYPE.gallery)
        return <Gallery gallery={item.gallery} text={item.text} />;
    if (item.contentListView === POST_TYPE.link)
        return <TextPost text={item.text} />;
    if (item.contentListView === POST_TYPE.file)
        return <Files files={item.files} text={item.text} />;
    if (item.contentListView === POST_TYPE.survey)
        return (
            <Survey
                survey={item.survey}
                startSurvey={startSurvey}
                surveyStatusMap={surveyStatusMap}
            />
        );
};

const styles = StyleSheet.create({
    bookmarkCountText: {
        color: GlobalColors.socialPostTime,
        fontSize: 12,
        marginLeft: 8
    },
    postContainer: {
        marginVertical: 10
    },
    PostFooter: {
        paddingHorizontal: 10,
        flex: 1,
        paddingBottom: 10,
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        flexDirection: 'row',
        alignItems: 'center'
    },
    TextDescription: {
        paddingHorizontal: 12,
        fontSize: 14,
        color: GlobalColors.socialAuther
    },
    postTime: {
        color: GlobalColors.descriptionText,
        alignItems: 'center',
        fontSize: 12,
        marginLeft: 8
    },
    autherName: {
        fontSize: 14,
        color: GlobalColors.primaryTextColor,
        fontWeight: AppFonts.NORMAL
    },
    profileImage: {
        height: 30,
        width: 30,
        marginHorizontal: 10,
        borderRadius: 15
    },
    headerContainer: {
        flexDirection: 'row',
        paddingVertical: 8,
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    socialPostContainer: {
        flex: 1,
        padding: 0,
        margin: 0,
        overflow: 'visible',
        backgroundColor: GlobalColors.timelineMessageItem
    }
});

export default React.memo(SocialPost, areEqual);
