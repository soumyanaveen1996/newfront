import { StyleSheet, Dimensions } from 'react-native';
import GlobalColors from '../../../config/styles';

const SCREEN_WIDTH = Dimensions.get('window').width;

export const BotListItemColors = {
    titleColor: 'rgba(74,74,74,1)',
    subTitleColor: 'rgba(153,153,153,1)',
    dateColor: 'rgb(142, 142, 142)',
    backgroundColor: GlobalColors.white,
    countColor: 'rgb(62,137,252)',
    openButton: 'rgba(0,189,242,1)',
    installBorder: 'rgba(0,167,214,1)',
    countTextColor: GlobalColors.white,
    button: GlobalColors.iosBlue
};

export default StyleSheet.create({
    topContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 5
    },
    midContainer: {
        position: 'relative',
        borderTopColor: GlobalColors.borderBottom,
        borderTopWidth: 1,
        flex: 1,
        alignItems: 'center',
        padding: 10,
        flexDirection: 'column'
    },
    bottomContainer: {
        borderTopColor: GlobalColors.borderBottom,
        borderTopWidth: 1,
        flex: 1,
        padding: 10,
        flexDirection: 'column'
    },
    container: {
        flex: 1,
        flexDirection: 'row',
        paddingHorizontal: 10,
        paddingVertical: 12,
        alignItems: 'stretch',
        backgroundColor: 'transparent'
    },
    image: {
        height: 80,
        width: 80,
        marginTop: 5
    },
    textContainer: {
        flex: 1,
        paddingVertical: 5,
        marginHorizontal: 10
    },
    title: {
        color: BotListItemColors.titleColor,
        fontSize: 18,
        fontFamily: 'SF Pro Text',
        fontWeight: '500'
    },
    subTitle: {
        color: BotListItemColors.subTitleColor,
        fontSize: 14,
        fontFamily: 'Roboto',
        fontWeight: '300',
        marginTop: 5
    },
    rightContainer: {
        flexDirection: 'row-reverse',
        alignItems: 'flex-start',
        alignContent: 'center',
        justifyContent: 'flex-start'
    },
    installButton: {
        borderRadius: 6,
        borderColor: BotListItemColors.installBorder,
        borderWidth: 1,
        height: 30,
        width: 70,
        alignItems: 'center'
    },
    openButton: {
        borderRadius: 6,
        backgroundColor: BotListItemColors.openButton,
        height: 30,
        width: 70,
        alignItems: 'center',
        justifyContent: 'center'
    },
    installButtonText: {
        color: BotListItemColors.installBorder,
        fontFamily: 'SF Pro Text',
        fontSize: 16,
        padding: 3
    },
    openButtonText: {
        color: BotListItemColors.backgroundColor,
        fontFamily: 'SF Pro Text',
        fontSize: 16,
        padding: 3
    },
    reviewContainer: {
        position: 'absolute',
        bottom: 15
    },
    allReviewText: {
        color: 'rgba(0, 189, 242, 1)',
        fontFamily: 'SF Pro Text',
        fontSize: 16
    },
    reviewText: {
        color: 'rgba(74, 74, 74, 1)',
        fontFamily: 'SF Pro Text',
        fontSize: 16,
        fontWeight: '500',
        flex: 1
    },
    starsImage: {
        flex: 1,
        alignItems: 'flex-end'
    },
    commentContainer: {
        width: '100%',
        height: 120,
        borderRadius: 10,
        backgroundColor: 'rgba(244,244,244,1)',
        padding: 10,
        flexDirection: 'column'
    },
    reviewTitle: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10
    },
    reviewTitleText: {
        color: 'rgba(74, 74, 74, 1)',
        fontFamily: 'SF Pro Text',
        fontWeight: 'bold',
        fontSize: 14,
        flex: 1
    },
    reviewStars: {
        flex: 1,
        alignItems: 'flex-end'
    },
    reviewComment: {
        color: 'rgba(102, 102, 102, 1)',
        fontFamily: 'SF Pro Text',
        fontSize: 14
    },
    informationHeader: {
        height: 20,
        alignItems: 'flex-start'
    },
    headerInfoText: {
        color: 'rgba(74, 74, 74, 1)',
        fontFamily: 'SF Pro Text',
        fontSize: 16,
        fontWeight: '500'
    },
    infoTable: {
        width: '100%',
        height: 120,
        padding: 10,
        flexDirection: 'column'
    },
    rowView: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        paddingVertical: 5,
        borderBottomColor: GlobalColors.borderBottom
    },
    textInfoTitle: {
        color: 'rgba(174, 174, 174, 1)',
        fontFamily: 'SF Pro Text',
        fontSize: 14
    }
});
